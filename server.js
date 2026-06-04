require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Identificador de instancia — viene del .env que escribe el user data
const INSTANCE_ID = process.env.INSTANCE_ID || os.hostname();
const INSTANCE_IP = process.env.INSTANCE_IP || '127.0.0.1';

// Pool de conexiones a RDS PostgreSQL
const pool = new Pool({
  host:                    process.env.DB_HOST,
  port:                    process.env.DB_PORT || 5432,
  database:                process.env.DB_NAME,
  user:                    process.env.DB_USER,
  password:                process.env.DB_PASSWORD,
  ssl:                     { rejectUnauthorized: false },
  max:                     10,
  connectionTimeoutMillis: 3000,  // falla rápido si no llega a RDS
  idleTimeoutMillis:       10000,
});

// Cliente Lambda
const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Crear tabla si no existe — corre al arrancar, idempotente
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id                  SERIAL PRIMARY KEY,
        nombre              VARCHAR(100) NOT NULL,
        apellido            VARCHAR(100) NOT NULL,
        cedula              VARCHAR(20)  UNIQUE NOT NULL,
        telefono            VARCHAR(20),
        carrera             VARCHAR(100),
        email               VARCHAR(100) NOT NULL,
        ultimo_acceso       TIMESTAMP DEFAULT NOW(),
        advertencia_enviada BOOLEAN DEFAULT FALSE,
        created_at          TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla usuarios lista');
  } catch (err) {
    console.error('⚠️  RDS no disponible (normal en local):', err.message);
  }
}

// Invocar Lambda de bienvenida (fire-and-forget, no bloquea la respuesta)
async function invocarBienvenida(usuario) {
  try {
    await lambdaClient.send(new InvokeCommand({
      FunctionName:   process.env.LAMBDA_BIENVENIDA,
      InvocationType: 'Event',
      Payload:        Buffer.from(JSON.stringify({
        email:    usuario.email,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
      })),
    }));
    console.log(`📧 Lambda bienvenida invocada → ${usuario.email}`);
  } catch (err) {
    console.error('⚠️  Lambda bienvenida falló (no crítico):', err.message);
  }
}

const CARRERAS = [
  'Ingeniería de Sistemas',
  'Ingeniería Electrónica',
  'Ingeniería de Telecomunicaciones',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Ciencias de la Computación',
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── RUTAS ────────────────────────────────────────────────────────────────────

// GET / — listar usuarios
app.get('/', async (req, res) => {
  try {
    const { rows: usuarios } = await pool.query(
      'SELECT * FROM usuarios ORDER BY created_at DESC'
    );
    res.render('index', {
      usuarios,
      carreras: CARRERAS,
      instanceId: INSTANCE_ID,
      instanceIp: INSTANCE_IP,
      editUser: null,
      error: null,
    });
  } catch (err) {
    res.render('index', {
      usuarios: [],
      carreras: CARRERAS,
      instanceId: INSTANCE_ID,
      instanceIp: INSTANCE_IP,
      editUser: null,
      error: 'Error de base de datos: ' + err.message,
    });
  }
});

// POST /usuarios — crear usuario
app.post('/usuarios', async (req, res) => {
  const { nombre, apellido, cedula, telefono, carrera, email } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, cedula, telefono, carrera, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, apellido, cedula, telefono, carrera, email]
    );
    invocarBienvenida(rows[0]);
    res.redirect('/');
  } catch (err) {
    const { rows: usuarios } = await pool.query(
      'SELECT * FROM usuarios ORDER BY created_at DESC'
    );
    res.render('index', {
      usuarios,
      carreras: CARRERAS,
      instanceId: INSTANCE_ID,
      instanceIp: INSTANCE_IP,
      editUser: null,
      error: err.code === '23505'
        ? 'Ya existe un usuario con esa cédula o email.'
        : 'Error al crear usuario: ' + err.message,
    });
  }
});

// GET /usuarios/:id/editar
app.get('/usuarios/:id/editar', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1', [req.params.id]
    );
    if (!rows.length) return res.redirect('/');
    const { rows: usuarios } = await pool.query(
      'SELECT * FROM usuarios ORDER BY created_at DESC'
    );
    res.render('index', {
      usuarios,
      carreras: CARRERAS,
      instanceId: INSTANCE_ID,
      instanceIp: INSTANCE_IP,
      editUser: rows[0],
      error: null,
    });
  } catch (err) {
    res.redirect('/');
  }
});

// POST /usuarios/:id/actualizar
app.post('/usuarios/:id/actualizar', async (req, res) => {
  const { nombre, apellido, cedula, telefono, carrera, email } = req.body;
  try {
    await pool.query(
      `UPDATE usuarios
       SET nombre=$1, apellido=$2, cedula=$3, telefono=$4,
           carrera=$5, email=$6, ultimo_acceso=NOW(), advertencia_enviada=FALSE
       WHERE id=$7`,
      [nombre, apellido, cedula, telefono, carrera, email, req.params.id]
    );
    res.redirect('/');
  } catch (err) {
    res.redirect('/');
  }
});

// POST /usuarios/:id/eliminar
app.post('/usuarios/:id/eliminar', async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.redirect('/');
  }
});

// Estado del stress — persiste en memoria del proceso
const { spawn } = require('child_process');
const { Worker } = require('worker_threads');
let stressState = { running: false, endTime: null };

// GET /stress — página
app.get('/stress', (req, res) => {
  res.render('stress', { instanceId: INSTANCE_ID, instanceIp: INSTANCE_IP });
});

// GET /stress/status — estado actual (el cliente lo consulta cada segundo)
app.get('/stress/status', (req, res) => {
  const remaining = stressState.endTime
    ? Math.max(0, Math.ceil((stressState.endTime - Date.now()) / 1000))
    : 0;
  if (remaining === 0) stressState.running = false;
  res.json({ running: stressState.running, remaining, instanceId: INSTANCE_ID, instanceIp: INSTANCE_IP });
});

// POST /stress/start — inicia stress en background
app.post('/stress/start', (req, res) => {
  const segundos = Math.min(parseInt(req.body.segundos) || 120, 300);
  const ms = segundos * 1000;
  stressState = { running: true, endTime: Date.now() + ms };
  setTimeout(() => { stressState = { running: false, endTime: null }; }, ms + 2000);

  const cpus = os.cpus().length;

  // stress-ng: satura CPU al 90% en todos los cores
  const proc = spawn('stress-ng', [
    '--cpu', String(cpus),
    '--cpu-load', '90',
    '--timeout', `${segundos}s`,
    '--metrics-brief'
  ], { detached: true, stdio: 'ignore' });

  proc.on('error', () => {
    // Fallback si stress-ng no está instalado: worker threads agresivos
    for (let i = 0; i < cpus; i++) {
      new Worker(`
        const end = Date.now() + ${ms};
        let x = Math.random() + 1;
        while (Date.now() < end) {
          for (let j = 0; j < 500000; j++) {
            x = Math.sin(x + 1.1) * Math.cos(x - 0.9) + Math.sqrt(Math.abs(x) + 0.01);
          }
        }
      `, { eval: true });
    }
  });
  proc.unref();

  res.json({ ok: true, endTime: stressState.endTime, segundos, instanceId: INSTANCE_ID });
});

// GET /health — para el ALB health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status:     'ok',
    instanceId: INSTANCE_ID,
    instanceIp: INSTANCE_IP,
  });
});

// ─── ARRANQUE ─────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Puerto: ${PORT} | Instancia: ${INSTANCE_ID} | IP: ${INSTANCE_IP}`);
  await initDB();
});
