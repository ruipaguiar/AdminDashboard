# Deploy — AdminDashboard

Passos para fazer deploy do projeto no servidor Ubuntu.

## Pré-requisitos no servidor

- Ubuntu Server (já tens)
- Docker e Docker Compose (já tens)
- Postgres acessível via rede Docker (`postgres-server` na `melresin-net`)
- Cloudflare Tunnel (`cloudflared`) configurado (já tens)
- Domínio `raguiar.pt` na Cloudflare (já tens)

---

## Passo 1 — Clonar o repositório

```bash
cd ~/projetos
git clone git@github.com:<teu-user>/AdminDashboard.git
cd AdminDashboard
```

---

## Passo 2 — Base de dados

A BD `AdmindashBoard` e o user `printpro` já existem no servidor. Não é necessário correr o `setup-db.sql` novamente.

Se precisares de recriar do zero (novo servidor), edita `scripts/setup-db.sql` com as credenciais corretas e executa:

```bash
docker exec -i postgres-server psql -U postgres < scripts/setup-db.sql
```

---

## Passo 3 — Criar a rede Docker

```bash
docker network create admin-net
```

Verifica:

```bash
docker network ls | grep admin-net
```

---

## Passo 4 — Configurar variáveis de ambiente

```bash
cp .env.example .env.prod
nano .env.prod
```

Preenche:

- `POSTGRES_HOST` → `postgres-server` (nome do container na rede Docker)
- `POSTGRES_PORT` → `5432`
- `POSTGRES_DB` → `AdmindashBoard`
- `POSTGRES_USER` → `printpro`
- `POSTGRES_PASSWORD` → a password real
- `JWT_SECRET` → `openssl rand -base64 64`
- `NEXTAUTH_SECRET` → `openssl rand -base64 64`
- `NEXTAUTH_URL` → `https://admin.raguiar.pt`
- `BINANCE_API_KEY` e `BINANCE_API_SECRET` → criados em binance.com (apenas Reading!)
- `ANTHROPIC_API_KEY` → criado em console.anthropic.com

---

## Passo 5 — Build e arrancar

```bash
docker compose --env-file .env.prod up -d --build
```

Ver logs:

```bash
docker compose logs -f
```

Confirmar containers saudáveis:

```bash
docker compose ps
```

Devias ver `admin-api` e `admin-web` ambos com status `Up (healthy)`.

**Nota:** As migrations (incluindo o seed do utilizador admin) são aplicadas automaticamente na startup da API.

---

## Passo 6 — Configurar rota no Cloudflare Tunnel

Painel Cloudflare → Zero Trust → Networks → Tunnels → o teu tunnel → Public Hostname → Add:

- **Subdomain:** `admin`
- **Domain:** `raguiar.pt`
- **Service:** Type `HTTP`, URL `localhost:3003`
- **HTTP Settings → HTTP Host Header:** `admin.raguiar.pt`

---

## Passo 7 — Testar

```bash
# No servidor:
curl http://localhost:3003
curl http://localhost:5001/api/health/ping

# De qualquer lado:
curl https://admin.raguiar.pt/api/health/ping
```

Vai ao browser: `https://admin.raguiar.pt` deve mostrar a página de login.

Login com `ruipaguiar@gmail.com` / `Password123!` — **muda esta password depois do primeiro login** (quando houver UI de settings ou diretamente na BD).

---

## Comandos úteis

```bash
# Ver logs em tempo real
docker compose logs -f api
docker compose logs -f web

# Restart de um serviço
docker compose restart api

# Rebuild após alterações
docker compose up -d --build api

# Parar tudo
docker compose down

# Backup da BD
docker exec postgres-server pg_dump -U printpro -d AdmindashBoard > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i postgres-server psql -U printpro -d AdmindashBoard < backup.sql
```

---

## Atualizações

```bash
cd ~/projetos/AdminDashboard
git pull
docker compose --env-file .env.prod up -d --build
```

As novas migrations são aplicadas automaticamente na startup.

---

## Troubleshooting

**API não arranca:** `docker compose logs api`. Causa mais comum: connection string errada.

**Web não comunica com API:** verifica `API_URL_INTERNAL` em `docker-compose.yml` (deve ser `http://api:8080`).

**Postgres não acessível:** `docker network inspect melresin-net` deve listar `postgres-server` e `admin-api`.

**Cloudflare 502:** serviço local parado ou porta errada. `docker compose ps` para verificar.
