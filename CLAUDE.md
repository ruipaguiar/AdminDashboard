# CLAUDE.md — Memória do projeto AdminDashboard

> Este ficheiro é a **memória persistente** do projeto. Qualquer Claude (chat ou Claude Code) deve ler isto **primeiro** para perceber o contexto antes de qualquer tarefa.
>
> Se algo no projeto mudar (decisão, biblioteca, módulo novo), **atualiza este ficheiro**. É a fonte de verdade.

---

## 1. Quem sou eu (o developer)

Sou developer com experiência sólida em **C# / .NET**. Não tenho experiência prévia em Next.js / React — vou aprender enquanto construo, com ajuda do Claude Code.

Tenho **20h/semana** disponíveis para este projeto. Já tenho outro projeto em produção chamado **MelResin** (e-commerce: API C# + Next.js storefront/backoffice + Postgres) por isso já domino:

- Docker e docker-compose
- Cloudflare (DNS + Tunnel)
- Self-hosting num servidor Ubuntu em casa
- Padrões de deploy com containers

O servidor de casa corre **Ubuntu Server** com Docker. O `cloudflared` (Cloudflare Tunnel) já está configurado e a correr para outros projetos. Não há portas abertas no router — todo o tráfego entra via tunnel.

---

## 2. O que é o AdminDashboard

Dashboard pessoal **modular** para uso próprio (login obrigatório). Não é um SaaS público — é uma plataforma pessoal que vai crescer ao longo do tempo com módulos novos.

### Domínio público

`https://admin.raguiar.pt` (subdomínio do meu domínio principal `raguiar.pt` que está na Cloudflare).

### Repositório

Privado, no GitHub, chamado **`AdminDashboard`**.

### Visão de longo prazo

- **Hoje:** módulo `crypto` (portfolio Binance, alertas, notícias, chat IA)
- **Médio prazo (3-6 meses):** app mobile iOS + Android (provavelmente .NET MAUI) que consome a mesma API
- **Longo prazo:** módulos para finanças pessoais não-crypto, smart home, notas, gestão pessoal

A escolha de ter backend separado em C# (em vez de tudo em Next.js full-stack) foi **deliberadamente** feita para suportar a futura app mobile com a mesma API.

---

## 3. Stack final (decidida e fechada)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Backend** | ASP.NET Core | **.NET 10** (LTS, suporte até Nov 2028) |
| **Frontend** | Next.js + React + TypeScript | **Next.js 16.2 + React 19** |
| **Styling** | Tailwind CSS + shadcn/ui + Tremor | Tailwind 4 |
| **Auth (frontend)** | NextAuth (Auth.js v5) | beta 25 |
| **Auth (backend)** | JWT Bearer | nativo .NET |
| **Base de dados** | PostgreSQL | **18** (existente, partilhado) |
| **ORM** | Entity Framework Core + Npgsql | 10 |
| **Background jobs** | Hangfire (storage Postgres) | 1.8 |
| **Logging** | Serilog | 9 |
| **Validação** | FluentValidation + Zod | — |
| **OpenAPI** | Scalar (não Swagger UI) | 2 |
| **Binance SDK** | Binance.Net | 11 |
| **Anthropic SDK** | Anthropic.SDK | 5 |
| **Container** | Docker + Compose | — |
| **Reverse proxy** | **Nenhum** — Next.js trata via rewrites | — |
| **Acesso externo** | Cloudflare Tunnel (já existente) | — |
| **Servidor** | Ubuntu Server (em casa) | — |

### Modelo Anthropic a usar

Configurado em `.env.prod` na variável `ANTHROPIC_MODEL`. Default: `claude-opus-4-7`. Se quiseres mais barato, considerar `claude-sonnet-4-6`.

---

## 4. Decisões arquiteturais importantes

### 4.1 — Backend separado, não monolito Next.js

A API C# é **a fonte de verdade**. Tanto o frontend Next.js como a futura app mobile vão consumi-la. Isto justifica a complexidade extra de ter dois projetos.

### 4.2 — Tudo num subdomínio único (não `admin.` + `api.`)

Considerei separar em `admin.raguiar.pt` + `api.raguiar.pt`, mas decidi **manter tudo em `admin.raguiar.pt`** com a API em `/api/*`. Razão: evita CORS, cookies cross-origin, e mais um Cloudflare Tunnel. Quando a app mobile vier, vai bater em `admin.raguiar.pt/api/*` sem problemas.

### 4.3 — Sem reverse proxy interno (Caddy/Nginx)

O **Next.js faz o routing** via `rewrites` no `next.config.ts`: pedidos para `/api/*` vão para o container `api:8080` dentro da rede Docker. Resultado: 2 containers em vez de 4, zero CORS, cookies "simplesmente funcionam".

### 4.4 — PostgreSQL existente reutilizado

Não vou criar Postgres novo — vou usar o `postgres-server` que já corre na rede `melresin-net`. Para isolamento:

- Base de dados **dedicada**: `admindashboard_db`
- User **dedicado**: `admindashboard_app` (sem privilégios noutras BDs)
- Permissões só sobre a sua BD
- A `admin-api` junta-se à rede `melresin-net` para chegar ao Postgres

### 4.5 — Arquitetura modular

Tanto no backend como no frontend, cada **módulo de domínio** tem a sua pasta. Adicionar um módulo novo é só criar uma pasta, não mexer em arquitetura.

**Backend:** `Modules/{Auth,Crypto,News,Chat,Users}/` dentro de `AdminDashboard.Api/`
**Frontend:** `app/(dashboard)/{crypto,news,chat,settings}/`

### 4.6 — Camadas no backend (Clean-ish Architecture)

```
AdminDashboard.Api    → Web layer (HTTP, controllers, DI, middleware)
AdminDashboard.Core   → Domínio puro (entities, interfaces, DTOs) — sem dependências de infra
AdminDashboard.Infra  → Implementações concretas (EF, Binance, Claude, Hangfire jobs)
```

**Regra de ouro:** `Core` não depende de nada. `Infra` depende de `Core`. `Api` depende de ambos.

### 4.7 — Segurança das ports

Todas as ports do Docker usam prefixo `127.0.0.1:` — só o próprio servidor (e portanto o `cloudflared`) consegue acedê-las. Mesmo que o firewall esteja mal configurado, ninguém de fora chega aos containers.

### 4.8 — Binance: APENAS read-only

API keys da Binance criadas com **somente** "Enable Reading" ativo. Nunca Withdrawals, nunca Trading. Restrição por IP do servidor sempre que possível.

### 4.9 — Frontend único (não storefront + backoffice)

No MelResin tenho `storefront` (público) e `backoffice` (admin). Aqui é diferente: **um único frontend** com login obrigatório. Não há "área pública".

---

## 5. Infraestrutura existente que vou reutilizar

### 5.1 — Postgres

```
Container:  postgres-server
Versão:     PostgreSQL 18.1
Rede:       melresin-net (e bridge default)
```

Verificado com:
```bash
docker exec postgres-server psql --version
# psql (PostgreSQL) 18.1 (Debian 18.1-1.pgdg13+2)

docker network ls
# bridge
# host
# melresin-net
# none
```

### 5.2 — Cloudflare Tunnel

Já está configurado e a correr (usado por outros projetos). Para adicionar o admin é só ir ao painel Zero Trust → Networks → Tunnels → adicionar Public Hostname novo:

```
Subdomain: admin
Domain:    raguiar.pt
Service:   HTTP → localhost:3003
```

Não criar daemon `cloudflared` novo.

### 5.3 — Padrão de docker-compose existente (do MelResin)

Sigo o mesmo padrão estilístico do MelResin (que está em produção e funciona):

- `image:` nomeada (`admin-api:latest`)
- `env_file: .env.prod` para valores reais
- `environment:` para documentar variáveis
- `networks: external: true` (rede gerida fora do compose)
- Containers usam `restart: unless-stopped`

**Diferenças vs MelResin:**

- **Ports com prefix `127.0.0.1:`** (segurança extra)
- Frontend único em vez de storefront + backoffice
- Postgres é externo (reutilizado), não num container deste compose

---

## 6. Estrutura do repositório

```
AdminDashboard/
├── CLAUDE.md                    ← este ficheiro
├── README.md                    ← visão geral do projeto
├── docker-compose.yml           ← orquestração (api + web)
├── .env.example                 ← template das variáveis
├── .env.prod                    ← valores reais (NÃO em git)
├── .gitignore
│
├── backend/                     ← API ASP.NET Core .NET 10
│   ├── Dockerfile               ← multi-stage, user não-root, healthcheck
│   ├── AdminDashboard.sln
│   └── src/
│       ├── AdminDashboard.Api/        ← Web layer
│       │   ├── Program.cs             ← JWT, Serilog, Scalar OpenAPI
│       │   ├── appsettings.json
│       │   ├── Controllers/           ← HealthController e outros transversais
│       │   ├── Modules/               ← Auth, Crypto, News, Chat, Users
│       │   ├── Common/                ← middleware, filtros, helpers
│       │   ├── Migrations/            ← EF Core migrations
│       │   └── Properties/launchSettings.json
│       ├── AdminDashboard.Core/       ← Domínio puro
│       │   ├── Entities/              ← User, AlertRule, PriceSnapshot
│       │   ├── Interfaces/            ← IBinanceService, IClaudeService, etc.
│       │   └── DTOs/
│       └── AdminDashboard.Infra/      ← Implementações concretas
│           ├── Persistence/           ← AppDbContext, configurations
│           ├── External/              ← BinanceService, ClaudeService, NewsAggregator
│           └── Jobs/                  ← Hangfire jobs
│
├── apps/
│   └── web/                     ← Frontend Next.js 16.2
│       ├── Dockerfile           ← multi-stage standalone, user não-root
│       ├── package.json
│       ├── next.config.ts       ← rewrite /api/* → API interna
│       ├── tsconfig.json
│       ├── postcss.config.mjs
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx           ← redirect para /login ou /crypto
│           │   ├── globals.css        ← Tailwind 4 + variáveis shadcn
│           │   ├── (auth)/
│           │   │   ├── login/
│           │   │   └── register/
│           │   ├── (dashboard)/
│           │   │   ├── layout.tsx     ← sidebar + main
│           │   │   ├── crypto/
│           │   │   ├── news/
│           │   │   ├── chat/
│           │   │   └── settings/
│           │   └── api/               ← API routes do Next (NextAuth callbacks)
│           ├── components/
│           │   ├── ui/                ← componentes shadcn
│           │   ├── layout/            ← Sidebar, Header, ThemeProvider
│           │   └── modules/           ← componentes específicos por módulo
│           ├── lib/
│           │   ├── api.ts             ← cliente axios
│           │   ├── utils.ts           ← cn() helper
│           │   └── auth.ts            ← config NextAuth (a criar)
│           ├── hooks/
│           └── types/
│
├── docs/
│   ├── ROADMAP.md               ← plano semana-a-semana
│   ├── SECURITY.md              ← checklist de segurança multi-camada
│   ├── DEPLOY.md                ← passos exatos do deploy no servidor
│   └── ARCHITECTURE.md          ← decisões e diagramas
│
├── prompts/                     ← prompts prontos para Claude Code
│   ├── 00-overview.md
│   ├── 01-setup-api.md
│   ├── 02-setup-web.md
│   ├── 03-auth-jwt.md           (a criar)
│   ├── 04-binance-module.md     (a criar)
│   ├── 05-alerts-system.md      (a criar)
│   ├── 06-news-module.md        (a criar)
│   ├── 07-chat-ai-module.md     (a criar)
│   └── 08-design-system.md      (a criar)
│
└── scripts/
    ├── setup-db.sql             ← cria BD e user no Postgres existente
    └── generate-secrets.sh      ← gera JWT secrets
```

---

## 7. Roadmap

### Semana 1 — Fundações
Setup base, primeira migration, "Hello World" web ↔ api ↔ db.
**Crítério:** `https://admin.raguiar.pt/api/health/ping` devolve `{"message":"pong"}`.

### Semana 2 — Auth
JWT + NextAuth + login obrigatório em rotas `(dashboard)`.
**Critério:** Tentar aceder a `/crypto` sem login redireciona para `/login`.

### Semana 3 — Módulo Crypto
Integração Binance read-only, portfolio na UI, gráficos com Tremor.
**Critério:** `/crypto` mostra portfolio real com valores em EUR.

### Semana 4 — Alertas
Hangfire + entity `AlertRule` + background job a cada 5min.
**Critério:** Criar regra "BTC abaixo de X€" e ver alerta a aparecer.

### Semana 5 — News
Feed de notícias (CryptoPanic ou RSS) com cache.
**Critério:** `/news` mostra últimas 30 notícias.

### Semana 6 — Chat IA
Integração Anthropic Claude com contexto da conta (portfolio, alertas).
**Critério:** "Como está o meu portfolio?" → Claude responde com contexto real.

### Semana 7+ — Polimento
Design system, dark mode, mobile responsive, PWA, backups automáticos.

### Marcos longos
- Mês 4-6: app mobile (.NET MAUI provável)
- Mês 6+: módulo finanças não-crypto
- Mês 9+: módulo smart home

---

## 8. Variáveis de ambiente principais

Ficheiro `.env.prod` (nunca em git). Template em `.env.example`:

```
APP_ENV=production

# Ports (só localhost via Cloudflare Tunnel)
API_PORT=5001
WEB_PORT=3003

# Postgres (existente)
POSTGRES_HOST=postgres-server
POSTGRES_PORT=5432
POSTGRES_DB=admindashboard_db
POSTGRES_USER=admindashboard_app
POSTGRES_PASSWORD=<openssl rand -base64 32>

# JWT
JWT_SECRET=<openssl rand -base64 64>
JWT_ISSUER=AdminDashboard
JWT_AUDIENCE=AdminDashboard
JWT_EXPIRY_MINUTES=1440

# NextAuth
NEXTAUTH_URL=https://admin.raguiar.pt
NEXTAUTH_SECRET=<openssl rand -base64 64>

# Binance (APENAS Reading!)
BINANCE_API_KEY=
BINANCE_API_SECRET=

# Anthropic
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-opus-4-7

# CORS
CORS_ALLOWED_ORIGINS=https://admin.raguiar.pt,http://localhost:3003
```

---

## 9. Convenções de código (importantes para Claude)

### C# / .NET

- **Nullable reference types** ativos (`<Nullable>enable</Nullable>`)
- **Implicit usings** ativos
- **`Core` NÃO depende de EF, Binance, Anthropic** — só DTOs, entities, interfaces
- **Toda a comunicação externa** (HTTP, BD, APIs) fica em `Infra`
- **Logs sempre via `ILogger<T>`** (Serilog por baixo)
- **Tratamento de erros** via middleware global, não try/catch em cada controller
- **Validação** com FluentValidation (não data annotations)
- **Naming:** PascalCase para tipos/membros públicos, camelCase para locais/parâmetros
- **Records** quando o tipo é imutável (DTOs, value objects)

### TypeScript / Next.js

- **Server Components por defeito** — só usar `"use client"` quando necessário (estado, eventos, hooks browser-only)
- **Validação Zod** em todos os formulários
- **Nunca `localStorage` para JWT** — sempre cookies HTTP-only via NextAuth
- **`@/`** é alias para `src/`
- **Tailwind 4** usa `@import "tailwindcss"` (não `@tailwind base/components/utilities`)
- **Naming:** camelCase para funções/variáveis, PascalCase para componentes/types
- **Imports absolutos** com `@/` em vez de `../../../`

### Geral

- Inglês para nomes de código (variáveis, tipos, comentários técnicos)
- Português para comentários explicativos longos e documentação para mim
- Commits em inglês, no estilo Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)

---

## 10. Segurança — princípios não-negociáveis

A primeira coisa é **API keys da Binance APENAS com Reading ativo**. Nunca, em nenhuma circunstância, ativar Withdrawals ou Trading sem confirmação explícita minha.

A segunda é **secrets nunca em código**. Tudo via `.env.prod` que não está em git. `.gitignore` já bloqueia.

A terceira é **user Postgres dedicado** com permissões só na sua BD. Nunca usar o user `postgres` (superuser) na aplicação.

A quarta é **passwords com BCrypt** (work factor 12+). Nunca SHA, MD5, ou hashes simples.

A quinta é **JWT secret rotacionável** — pelo menos 64 bytes random.

A sexta é **headers de segurança** em todas as respostas (`X-Frame-Options`, `X-Content-Type-Options`, etc.).

A sétima é **ports só em `127.0.0.1`** no docker-compose. Nunca expor diretamente à rede.

A oitava é **HTTPS obrigatório** em produção (Cloudflare trata).

---

## 11. Como interagir comigo

### Quando estiver a fazer perguntas de clarificação

Sou developer experiente — não preciso de explicações de "o que é X". Mas pergunta-me sempre:

- Antes de adicionar dependências novas (NuGet ou npm)
- Antes de mudar a estrutura de pastas
- Antes de tomar decisões de arquitetura não cobertas neste documento
- Quando há trade-offs reais entre duas abordagens

### Quando estiver a implementar

- **Uma tarefa de cada vez.** Não despejes 10 ficheiros novos sem eu testar entre eles.
- **Mostra-me o que vais fazer antes de fazer mudanças grandes.**
- **Avisa-me sobre warnings de segurança específicos** (especialmente em código que mexe com API keys, BD, ou autenticação).
- **Não inventes** — se não sabes, diz "não sei" e procura a documentação.
- **Lê o código existente antes de adicionar código novo.** Há padrões a seguir.

### Tom

Direto, técnico, sem encher linguiça. Posso aceitar discordância se for fundamentada — não quero "yes-man".

---

## 12. Estado atual

A estrutura completa do projeto já está criada (todos os ficheiros base, Dockerfiles, `Program.cs`, entities, layouts, páginas placeholder). Falta **implementar** as funcionalidades fase a fase.

**Próximo passo:** Semana 1 do roadmap — usar `prompts/01-setup-api.md` e `prompts/02-setup-web.md` para finalizar o setup e ter o "Hello World" a correr.

---

## 13. Notas sobre este ficheiro

- Este `CLAUDE.md` deve ficar **na raiz do repositório**.
- O Claude Code lê automaticamente ficheiros chamados `CLAUDE.md` ao iniciar uma sessão no projeto.
- Para conversas no chat (claude.ai) **fora** do Claude Code, cola este ficheiro como primeira mensagem para dar contexto.
- **Atualiza este ficheiro sempre que houver decisões novas.** É a memória do projeto.

---

_Última atualização: 25 de Abril de 2026_
