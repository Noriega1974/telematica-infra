# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

Generated: 2026-06-03
Project: proyecto telematica

---

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Any change that affects system boundaries, ownership, state flow, or cross-package responsibilities | engram-architecture-guardrails | C:\Users\Noriega\.claude\skills\architecture-guardrails\SKILL.md |
| Auditing open issues or PRs, triaging the backlog, reviewing contributor submissions as a maintainer, or applying triage to any GitHub repo | engram-backlog-triage | C:\Users\Noriega\.claude\skills\backlog-triage\SKILL.md |
| When creating a pull request, opening a PR, or preparing changes for review | branch-pr | C:\Users\Noriega\.claude\skills\branch-pr\SKILL.md |
| Any change that affects sync behavior, project controls, permissions, or memory semantics | engram-business-rules | C:\Users\Noriega\.claude\skills\business-rules\SKILL.md |
| When a PR would exceed 400 changed lines, when planning chained PRs, stacked PRs, or reviewable slices | chained-pr | C:\Users\Noriega\.claude\skills\chained-pr\SKILL.md |
| When writing guides, READMEs, RFCs, onboarding docs, architecture docs, or review-facing documentation | cognitive-doc-design | C:\Users\Noriega\.claude\skills\cognitive-doc-design\SKILL.md |
| When drafting or posting feedback, review comments, maintainer replies, Slack messages, or GitHub comments | comment-writer | C:\Users\Noriega\.claude\skills\comment-writer\SKILL.md |
| Any commit creation, review, or branch cleanup | engram-commit-hygiene | C:\Users\Noriega\.claude\skills\commit-hygiene\SKILL.md |
| Starting substantial work, reviewing changes, or defining team conventions | engram-cultural-norms | C:\Users\Noriega\.claude\skills\cultural-norms\SKILL.md |
| Any change to htmx attributes, partial updates, forms, or server-rendered browser UI | engram-dashboard-htmx | C:\Users\Noriega\.claude\skills\dashboard-htmx\SKILL.md |
| Any code or workflow change that affects user or contributor behavior | engram-docs-alignment | C:\Users\Noriega\.claude\skills\docs-alignment\SKILL.md |
| When editing Go files in installer/internal/tui/, working on TUI screens, or adding new UI features | gentleman-bubbletea | C:\Users\Noriega\.claude\skills\gentleman-bubbletea\SKILL.md |
| When writing Go tests, using teatest, or adding test coverage | go-testing | C:\Users\Noriega\.claude\skills\go-testing\SKILL.md |
| When creating a GitHub issue, reporting a bug, or requesting a feature | issue-creation | C:\Users\Noriega\.claude\skills\issue-creation\SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | judgment-day | C:\Users\Noriega\.claude\skills\judgment-day\SKILL.md |
| Decisions, bugfixes, discoveries, preferences, or session closure | engram-memory-protocol | C:\Users\Noriega\.claude\skills\memory-protocol\SKILL.md |
| Changes in plugin scripts/hooks for Claude, OpenCode, Gemini, or Codex | engram-plugin-thin | C:\Users\Noriega\.claude\skills\plugin-thin\SKILL.md |
| Reviewing any external or internal contribution before merge | engram-pr-review-deep | C:\Users\Noriega\.claude\skills\pr-review-deep\SKILL.md |
| Creating files, packages, handlers, templates, styles, or tests in this repo | engram-project-structure | C:\Users\Noriega\.claude\skills\project-structure\SKILL.md |
| Any route, handler, payload, or status code modification | engram-server-api | C:\Users\Noriega\.claude\skills\server-api\SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI | skill-creator | C:\Users\Noriega\.claude\skills\skill-creator\SKILL.md |
| When implementing behavior changes in any package | engram-testing-coverage | C:\Users\Noriega\.claude\skills\testing-coverage\SKILL.md |
| Changes in model, update, view, navigation, or rendering | engram-tui-quality | C:\Users\Noriega\.claude\skills\tui-quality\SKILL.md |
| Adding or changing dashboard UI components or connected browsing flows | engram-ui-elements | C:\Users\Noriega\.claude\skills\ui-elements\SKILL.md |
| Any dashboard styling, typography, spacing, or visual identity change | engram-visual-language | C:\Users\Noriega\.claude\skills\visual-language\SKILL.md |
| When implementing a change, preparing commits, splitting PRs, or planning chained or stacked PRs | work-unit-commits | C:\Users\Noriega\.claude\skills\work-unit-commits\SKILL.md |

---

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### engram-architecture-guardrails
- Local SQLite is source of truth; cloud is replication and shared access
- Keep plugin/adapter layers thin — real behavior belongs in Go packages
- Use explicit boundaries: store, cloudstore, server, dashboard, autosync
- New features must fit the local-first mental model before fitting the UI
- Never hide cross-system coupling inside helpers or templates
- Add regression tests for every boundary change

### engram-backlog-triage
- Assign exactly ONE disposition: MERGE, REQUEST CHANGES, CLOSE, NEEDS-DESIGN, APPROVE-ISSUE, or DEFER
- Filter every decision through product values: zero-config, local-first, single binary, terminal-first, thin adapters
- Reject scope-creep issues and PRs that expand surface area without compelling case
- Every PR must link a `status:approved` issue — no approved issue → no PR
- Prefer 50-line PRs solving one problem over 500-line PRs solving five

### branch-pr
- Every PR MUST link an approved issue: `Closes #N` / `Fixes #N` / `Resolves #N`
- Every PR MUST have exactly one `type:*` label
- Branch naming: `type/description` — lowercase, `a-z0-9._-` only
- PR body requires: linked issue, type checkbox, summary, changes table, test plan, checklist
- Never open a PR without `status:approved` on the linked issue

### engram-business-rules
- Sync behavior changes require explicit user consent — never silently start background sync
- Project-level rules override personal scope — never let personal scope leak into project artifacts
- Permission changes must be explicit, logged, and reversible
- Memory semantics are stable contracts — never change what a `type` or `scope` means without migration

### chained-pr
- Split when PR exceeds 400 changed lines (additions + deletions), unless `size:exception` approved
- Each chained PR must be autonomous: CI green, one scope, reasonable rollback, verification included
- Every child PR must include a chain diagram marking its position with 📍
- For chains >2 PRs, create a draft tracker PR before review starts
- Ask user to choose strategy: Stacked PRs to main OR Feature Branch Chain — do not mix them
- In Feature Branch Chain: each child targets its immediate parent branch, NOT main and NOT tracker

### cognitive-doc-design
- Lead with the answer — put the decision, action, or outcome first
- Progressive disclosure: start with the happy path, then details, edge cases, references
- Group related information into small sections; keep flat lists short
- Use tables, checklists, examples, and templates over prose that must be remembered
- Design docs so reviewers can verify intent without reconstructing the whole story

### comment-writer
- Start with the actionable point — do not recap the whole PR before giving feedback
- Sound like a thoughtful teammate, not a corporate bot
- Prefer 1-3 short paragraphs or a tight bullet list
- Give the technical reason when asking for a change
- No em dashes — use commas, periods, or parentheses
- Match thread language; if Spanish, use Rioplatense voseo: `podés`, `tenés`, `fijate`, `dale`

### engram-commit-hygiene
- Commit messages MUST follow Conventional Commits: `type(scope): description`
- Allowed types: feat, fix, docs, refactor, chore, style, perf, test, build, ci, revert
- Branch names: `type/description` — all lowercase, `a-z0-9._-` only
- NEVER include `Co-Authored-By` trailers
- Never commit secrets, .env files, generated/temp/local artifacts
- Keep one logical change per commit; message explains WHY, not just what

### engram-cultural-norms
- Product coherence beats local cleverness
- Prefer explicit decisions and documented rules over tribal knowledge
- Push back on fake UX and fake controls
- If a rule is organizational, enforce it on the server
- If a pattern repeats, capture it as a skill or project convention

### engram-dashboard-htmx
- Use `hx-boost` sparingly — only for full-page navigations, not partial updates
- Always specify `hx-target` explicitly; never rely on implicit default
- Partial responses from server must render standalone without layout wrappers
- Use `hx-swap: outerHTML` for element replacement; `innerHTML` for content slots
- Never include `<html>`, `<head>`, or `<body>` in partial responses

### engram-docs-alignment
- Update docs in the same PR as the behavior change — never split them
- If a workflow step changes, update every guide that references it
- Keep README and CONTRIBUTING.md in sync with current actual workflow
- Delete outdated docs rather than leaving them as alternatives

### gentleman-bubbletea
- Define all screens as `Screen` constants in `model.go`
- `Model` struct holds ALL application state — never store state outside the model
- All input handling goes through `Update()` with a type switch
- Each screen gets its own `handle{Screen}Keys()` function in `update.go`
- Reset `m.Cursor = 0` on every screen transition
- Use `m.PrevScreen` for back navigation

### go-testing
- Use table-driven tests for multiple cases: `tests := []struct{name, input, ...}{}`
- Test Bubbletea state transitions by calling `m.Update(msg)` directly
- Use `teatest.NewTestModel()` for full interactive flow tests
- Use golden file testing for visual output: compare `m.View()` against `testdata/*.golden`
- Test runner: `go test ./...` | Coverage: `go test -cover ./...`

### issue-creation
- MUST use a template — blank issues are disabled
- Every new issue gets `status:needs-review` automatically
- Maintainer MUST add `status:approved` before any PR can be opened
- Questions go to Discussions, NOT issues
- Search for duplicates before creating

### judgment-day
- Launch TWO sub-agents in parallel (never sequential); neither knows about the other
- Resolve skill registry first and inject compact rules into BOTH judge prompts
- Orchestrator synthesizes: Confirmed (both found) → fix immediately; Suspect (one found) → triage
- Apply fixes via a Fix Agent after synthesis, then re-judge until both pass or 2-iteration limit
- If no registry: warn user and proceed with generic review

### engram-memory-protocol
- Call `mem_save` immediately after: decision, bugfix, pattern/discovery, config/preference
- Use structured content: What, Why, Where, Learned
- Use stable `topic_key` for evolving topics to enable upserts
- On recall requests: `mem_context` first, then `mem_search`
- Before any session ends: call `mem_session_summary`

### engram-plugin-thin
- Plugin scripts (Claude, OpenCode, Gemini, Codex) are thin shims only
- Real logic belongs in Go core packages — never in plugin scripts
- Plugin scripts call `engram` CLI commands; they do NOT implement business logic
- Keep each plugin script under 50 lines; extract to core if it grows

### engram-pr-review-deep
- Review against the linked issue's requirements, not general preferences
- Flag: missing tests, boundary violations, scope creep, conventional commit violations
- Request changes with specific, actionable items — no vague "needs improvement"
- Check that PR has exactly one `type:*` label and links an approved issue

### engram-project-structure
- `internal/store` → local SQLite operations only
- `internal/cloud/cloudstore` → cloud materialization and org-wide data
- `internal/cloud/cloudserver` → HTTP routes and contract enforcement
- `internal/cloud/dashboard` → browser rendering and UX
- `internal/cloud/autosync` → background orchestration
- Never create files outside their designated package boundary

### engram-server-api
- Every route change requires updating the API contract docs
- Return consistent error envelopes: `{"error": "message", "code": "ERROR_CODE"}`
- Never change existing status codes — add new routes instead
- All handlers must be tested; no handler without at least a happy-path test
- Validate inputs at the boundary; never trust unvalidated payload deeper in the stack

### skill-creator
- Skills must have frontmatter: `name`, `description` (with Trigger), `license`, `metadata`
- Trigger text must be specific enough to match without false positives
- Include: When to Use, Critical Patterns/Rules, examples (only when materially helpful)
- Compact rules: 5-15 lines, actionable only — no motivation/purpose prose

### engram-testing-coverage
- TDD loop: write failing test → implement smallest code to pass → refactor green → add edge cases
- Cover happy path + error paths + edge cases
- Prefer deterministic tests over flaky integration paths
- Add seams only when branches are impossible to trigger naturally; keep runtime behavior unchanged
- Commands: `go test ./...` | `go test -cover ./...`

### engram-tui-quality
- Every model state transition must be testable by calling `Update()` directly
- Never render state in `Update()` — rendering belongs in `View()` only
- Navigation must be keyboard-complete; no mouse-only flows
- Handle `tea.WindowSizeMsg` in every model to support terminal resize

### engram-ui-elements
- Every dashboard component follows the card-metric-detail pattern
- Detail views are reachable from list/card views via consistent navigation
- New UI components must connect to server data via typed response structs
- Never inline styles — use Lipgloss style variables from `styles.go`

### engram-visual-language
- Use the established Lipgloss palette — never introduce new colors ad hoc
- Typography: consistent heading sizes via style variables, not magic numbers
- Spacing: use defined margin/padding tokens from `styles.go`
- Visual identity changes require updating the style guide alongside code

### work-unit-commits
- Each commit represents one deliverable behavior, fix, migration, or docs unit — NOT a file-type batch
- Tests belong in the same commit as the behavior they verify
- Docs belong with the user-visible change they explain
- Each commit must have one clear purpose; repo must make sense after applying this commit alone
- If PR approaches 400 changed lines, promote commits into chained PRs
- Commit message explains the outcome, not the file list

---

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| (none) | — | No CLAUDE.md, AGENTS.md, or .cursorrules found at project root |
