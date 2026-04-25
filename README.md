# AdminDashboard

Dashboard pessoal modular com integração de cryptocurrencies, feed de notícias e chat com IA.

**Domínio:** [admin.raguiar.pt](https://admin.raguiar.pt)
**Servidor:** Self-hosted (Ubuntu + Docker)
**Acesso:** Cloudflare Tunnel (sem portas abertas no router)

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | Next.js + TypeScript + Tailwind + shadcn/ui + Tremor | 16.2 |
| **Backend** | ASP.NET Core | .NET 10 (LTS) |
| **Base de dados** | PostgreSQL (existente, partilhado) | 18 |
| **Reverse proxy** | (Next.js trata via rewrites) | — |
| **Acesso externo** | Cloudflare Tunnel | — |
| **Container** | Docker Compose | — |

## Arquitetura

```
Internet
   │
   ▼
[Cloudflare]  ──→  DNS + WAF + Tunnel
   │
   │ (túnel encriptado, zero portas abertas)
   ▼
[Servidor Ubuntu]  (cloudflared já existente)
   │
   ▼  127.0.0.1:3003
[admin-web]   Next.js 16.2
   │
   ├── /api/* (rewrite) ──→ admin-api:8080
   │
   ▼
[admin-api]   ASP.NET Core .NET 10
   │
   ├──→ Binance API (read-only)
   ├──→ Anthropic API (Claude)
   └──→ postgres-server  (BD: admindashboard_db)
        (rede partilhada melresin-net)
```

## Módulos

O projeto tem arquitetura modular. Hoje apenas `crypto` está planeado, mas a estrutura suporta adição de novos módulos sem refatoring profundo.

| Módulo | Estado | Descrição |
|--------|--------|-----------|
| `auth` | Planeado | Login obrigatório, JWT, sessões |
| `crypto` | Planeado | Portfolio Binance + alertas + indicadores |
| `news` | Planeado | Feed de atualidade (RSS + APIs) |
| `chat` | Planeado | Chat com Claude com contexto da conta |
| _(futuros)_ | — | Finanças pessoais, smart home, notas, etc. |

## Quick start

**Pré-requisitos:**
- Servidor Ubuntu com Docker e Docker Compose
- PostgreSQL 18 a correr (no nosso caso, container `postgres-server` na rede `melresin-net`)
- Cloudflare Tunnel já configurado
- API keys da Binance (apenas Reading) e Anthropic Console

**Setup inicial (uma única vez):**

```bash
# 1. Clonar repositório no servidor
git clone <url-repo> AdminDashboard
cd AdminDashboard

# 2. Criar BD e user no Postgres existente
docker exec -i postgres-server psql -U postgres < scripts/setup-db.sql

# 3. Criar rede Docker dedicada
docker network create admin-net

# 4. Configurar variáveis de ambiente
cp .env.example .env.prod
nano .env.prod   # preencher tudo

# 5. Build e arrancar
docker compose --env-file .env.prod up -d --build

# 6. Adicionar rota no Cloudflare Tunnel:
#    admin.raguiar.pt → http://localhost:3003
```

Ver `docs/DEPLOY.md` para detalhes completos.

## Estrutura

```
AdminDashboard/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── backend/                      # API ASP.NET Core .NET 10
│   ├── Dockerfile
│   ├── AdminDashboard.sln
│   └── src/
│       ├── AdminDashboard.Api/   # Web layer (controllers, DI, middleware)
│       ├── AdminDashboard.Core/  # Entities, interfaces, DTOs
│       └── AdminDashboard.Infra/ # EF Core, integrações externas, jobs
│
├── apps/
│   └── web/                      # Frontend Next.js 16.2
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── app/              # App Router
│           ├── components/
│           ├── lib/
│           └── hooks/
│
├── docs/
│   ├── ROADMAP.md                # Plano semana-a-semana
│   ├── SECURITY.md               # Checklist de segurança
│   ├── DEPLOY.md                 # Deploy detalhado
│   └── ARCHITECTURE.md           # Decisões arquiteturais
│
├── prompts/                      # Prompts prontos para Claude Code
│   ├── 00-overview.md
│   ├── 01-setup-api.md
│   ├── 02-setup-web.md
│   ├── 03-auth-jwt.md
│   ├── 04-binance-module.md
│   ├── 05-alerts-system.md
│   ├── 06-news-module.md
│   ├── 07-chat-ai-module.md
│   └── 08-design-system.md
│
└── scripts/
    ├── setup-db.sql              # Criar BD e user no Postgres
    └── generate-secrets.sh       # Gerar JWT secrets
```

## Roadmap resumido

- **Semana 1:** Setup base, "Hello World" web ↔ api ↔ db
- **Semana 2:** Auth (login JWT), proteger rotas, layout dashboard
- **Semana 3:** Módulo crypto: portfolio Binance read-only
- **Semana 4:** Sistema de alertas + background workers (Hangfire)
- **Semana 5:** Módulo news (RSS feeds + CryptoPanic)
- **Semana 6:** Módulo chat IA (Claude com contexto)
- **Semana 7+:** Polimento, design, mobile-ready API

Ver `docs/ROADMAP.md` para detalhes.

## Segurança

Ver `docs/SECURITY.md` — checklist completo. Pontos-chave:

- API keys Binance: **apenas Reading**, nunca Withdrawals
- User Postgres dedicado e isolado por BD
- Portas Docker em `127.0.0.1` apenas (não expostas à rede)
- Cloudflare Tunnel à frente (zero portas abertas no router)
- JWT com secret forte rotacionável
- HTTPS obrigatório (tratado pela Cloudflare)

## Licença

Privado. Uso pessoal.
