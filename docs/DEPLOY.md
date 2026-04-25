# Deploy — AdminDashboard

Passos para fazer deploy do projeto no teu servidor Ubuntu.

## Pré-requisitos no servidor

- Ubuntu Server (já tens)
- Docker e Docker Compose (já tens)
- Container `postgres-server` a correr na rede `melresin-net` (já tens)
- Cloudflare Tunnel (`cloudflared`) configurado (já tens)
- Domínio `raguiar.pt` na Cloudflare (já tens)

## Passo 1 — Clonar o repositório

```bash
cd ~/projetos    # ou onde tens os teus projetos
git clone git@github.com:<teu-user>/AdminDashboard.git
cd AdminDashboard
```

## Passo 2 — Configurar a base de dados

Edita primeiro `scripts/setup-db.sql` e troca `ALTERA_PARA_PASSWORD_FORTE` por uma password gerada com:

```bash
openssl rand -base64 32 | tr -d '/+=' | head -c 32
```

Guarda essa password — vais precisar no próximo passo.

Executa o script no Postgres existente:

```bash
docker exec -i postgres-server psql -U postgres < scripts/setup-db.sql
```

Confirmar que a BD foi criada:

```bash
docker exec -it postgres-server psql -U postgres -l | grep admindashboard
```

## Passo 3 — Criar a rede Docker

```bash
docker network create admin-net
```

Verifica:

```bash
docker network ls | grep admin-net
```

## Passo 4 — Configurar variáveis de ambiente

```bash
cp .env.example .env.prod
```

Gera os secrets:

```bash
bash scripts/generate-secrets.sh
```

Edita `.env.prod`:

```bash
nano .env.prod
```

Preenche:

- `POSTGRES_PASSWORD` ← a mesma do passo 2
- `JWT_SECRET` ← do gerador
- `NEXTAUTH_SECRET` ← do gerador
- `BINANCE_API_KEY` e `BINANCE_API_SECRET` ← criados em https://www.binance.com/en/my/settings/api-management (apenas Reading!)
- `ANTHROPIC_API_KEY` ← criado em https://console.anthropic.com/settings/keys

## Passo 5 — Build e arrancar

```bash
docker compose --env-file .env.prod up -d --build
```

Vê os logs:

```bash
docker compose logs -f
```

Confirma que ambos os containers estão saudáveis:

```bash
docker compose ps
```

Devias ver `admin-api` e `admin-web` ambos com status `Up (healthy)`.

## Passo 6 — Configurar rota no Cloudflare Tunnel

Vai a https://one.dash.cloudflare.com/ → Networks → Tunnels → o teu tunnel existente → Public Hostname → Add a public hostname.

Preenche:

- **Subdomain:** `admin`
- **Domain:** `raguiar.pt`
- **Service:** Type `HTTP`, URL `localhost:3003`
- **Additional application settings → HTTP Settings:**
  - **HTTP Host Header:** `admin.raguiar.pt`
  - **Origin Server Name:** (deixar vazio)

Save.

## Passo 7 — Testar

```bash
# No servidor:
curl http://localhost:3003                                # Next.js responde
curl http://localhost:5001/api/health/ping                # API responde

# De qualquer lado:
curl https://admin.raguiar.pt                              # via Cloudflare
curl https://admin.raguiar.pt/api/health/ping              # rewrite via Next.js
```

Se tudo OK, vai ao browser: `https://admin.raguiar.pt` deve mostrar a página de login.

## Passo 8 — Criar primeiro utilizador

Como ainda não tens UI de registo, cria diretamente na BD:

```bash
# Gera hash BCrypt da password (instala bcrypt-cli ou usa Node):
docker run --rm -e PASSWORD='a-tua-password' node:22-alpine \
  sh -c 'npm i -g bcryptjs-cli >/dev/null 2>&1; echo "import bcrypt from \"bcryptjs\"; console.log(bcrypt.hashSync(process.env.PASSWORD, 12));" | node --input-type=module'
```

Inserir na BD:

```bash
docker exec -it postgres-server psql -U admindashboard_app -d admindashboard_db
```

```sql
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "DisplayName", "CreatedAt", "IsActive", "Role")
VALUES (gen_random_uuid(), 'eu@raguiar.pt', '<hash-bcrypt-aqui>', 'Ricardo', NOW(), true, 'Admin');
```

(Este passo só é necessário enquanto a UI de registo não existir — Semana 2.)

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
docker exec postgres-server pg_dump -U admindashboard_app -d admindashboard_db > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i postgres-server psql -U admindashboard_app -d admindashboard_db < backup.sql
```

## Atualizações

Quando quiseres deploy de uma nova versão:

```bash
cd ~/projetos/AdminDashboard
git pull
docker compose --env-file .env.prod up -d --build
```

## Troubleshooting

**API não arranca:** ver logs com `docker compose logs api`. Causa mais comum: connection string errada (host, password, BD).

**Web não comunica com API:** verifica `API_URL_INTERNAL` em `docker-compose.yml` (deve ser `http://api:8080`). Containers têm de estar na mesma rede `admin-net`.

**`postgres-server` não acessível:** `docker network inspect melresin-net` deve listar tanto `postgres-server` como `admin-api`.

**Cloudflare 502:** o serviço local está parado ou em porta errada. `docker compose ps` para verificar.

**Cloudflare 1014 (CNAME flattening):** tens de usar tunnel, não CNAME — confirma que adicionaste como "Public Hostname" do tunnel.
