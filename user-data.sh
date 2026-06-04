#!/bin/bash
set -e
exec > /var/log/user-data.log 2>&1

echo "=== Iniciando setup Telematica — $(date) ==="

# Actualizar sistema
apt-get update -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Instalar PM2 globalmente
npm install -g pm2

# Obtener identidad de esta instancia desde el metadata service de AWS
# 169.254.169.254 es una IP interna especial — solo EC2s pueden accederla
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

echo "Instance ID: $INSTANCE_ID"
echo "Instance IP: $INSTANCE_IP"

# Crear directorio de la app
mkdir -p /app
cd /app

# IMPORTANTE: reemplaza TU_USUARIO con tu usuario de GitHub
# antes de actualizar el Launch Template
git clone https://github.com/TU_USUARIO/telematica-infra.git .

# Crear el .env con credenciales RDS + identidad de esta instancia
# Este archivo NO va a GitHub
cat > /app/.env << EOF
DB_HOST=telematica-rds.culqegkq4tq5.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=telematica_db
DB_USER=teleSQL
DB_PASSWORD=J50911711n-telematica
PORT=3000
AWS_REGION=us-east-1
LAMBDA_BIENVENIDA=telematica-bienvenida
INSTANCE_ID=$INSTANCE_ID
INSTANCE_IP=$INSTANCE_IP
EOF

# Instalar dependencias
npm install --production

# Arrancar la app con PM2
pm2 start ecosystem.config.js
pm2 save

# Configurar PM2 para arranque automatico si reinicia la EC2
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root 2>/dev/null || true

echo "=== Setup completado — $(date) ==="
