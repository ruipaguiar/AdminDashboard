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
| **Auth (frontend)** | NextAuth (Auth.js v5) | beta.31 |
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

Decidi **manter tudo em `admin.raguiar.pt`** com a API em `/api/*`. Razão: evita CORS, cookies cross-origin, e mais um Cloudflare Tunnel. Quando a app mobile vier, vai bater em `admin.raguiar.pt/api/*` sem problemas.

### 4.3 — Sem reverse proxy interno (Caddy/Nginx)

O **Next.js faz o routing** via `rewrites` no `next.config.ts`: pedidos para `/api/*` vão para o container `api:8080` dentro da rede Docker. Resultado: 2 containers em vez de 4, zero CORS, cookies "simplesmente funcionam".

### 4.4 — PostgreSQL existente reutilizado

Reutilizo o servidor Postgres que já existe. Não há container Postgres dedicado neste compose.

**Desenvolvimento local:**
- Host: `192.168.68.115` (IP do servidor na rede local)
- Base de dados: `AdmindashBoard`
- User: `printpro`
- Configurado em `appsettings.Development.json` (gitignored)

**Produção (Docker):**
- Container `postgres-server` na rede `melresin-net`
- Credenciais configuradas via `.env.prod`
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

Todas as ports do Docker usam prefixo `127.0.0.1:` — só o próprio servidor (e portanto o `cloudflared`) consegue acedê-las.

### 4.8 — Binance: APENAS read-only

API keys da Binance criadas com **somente** "Enable Reading" ativo. Nunca Withdrawals, nunca Trading. Restrição por IP do servidor sempre que possível.

### 4.9 — Frontend único (não storefront + backoffice)

No MelResin tenho `storefront` (público) e `backoffice` (admin). Aqui é diferente: **um único frontend** com login obrigatório. Não há "área pública".

### 4.10 — Next.js 16.2: proxy.ts em vez de middleware.ts

No Next.js 16.2, o ficheiro de middleware foi renomeado de `middleware.ts` para `proxy.ts`. O ficheiro de proteção de rotas é `src/proxy.ts`.

---

## 5. Infraestrutura existente que vou reutilizar

### 5.1 — Postgres

```
Servidor:   192.168.68.115 (rede local) / postgres-server (Docker produção)
Versão:     PostgreSQL 18.1
BD dev:     AdmindashBoard
User dev:   printpro
Rede prod:  melresin-net
```

### 5.2 — Cloudflare Tunnel

Já está configurado e a correr (usado por outros projetos). Para adicionar o admin:

```
Subdomain: admin
Domain:    raguiar.pt
Service:   HTTP → localhost:3003
```

Não criar daemon `cloudflared` novo.

### 5.3 — Padrão de docker-compose existente (do MelResin)

- `image:` nomeada (`admin-api:latest`)
- `env_file: .env.prod` para valores reais
- `environment:` para documentar variáveis
- `networks: external: true`
- `restart: unless-stopped`
- **Ports com prefix `127.0.0.1:`** (segurança extra)

---

## 6. Estrutura do repositório

```
AdminDashboard/
├── CLAUDE.md
├── README.md
├── docker-compose.yml
├── .env.example
├── .env.prod                    ← valores reais (NÃO em git)
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── AdminDashboard.sln
│   └── src/
│       ├── AdminDashboard.Api/
│       │   ├── Program.cs             ← JWT, Serilog, Scalar, FluentValidation
│       │   ├── appsettings.json
│       │   ├── appsettings.Development.json  ← credenciais locais (NÃO em git)
│       │   ├── Controllers/
│       │   │   └── HealthController.cs
│       │   ├── Modules/
│       │   │   └── Auth/
│       │   │       └── AuthController.cs     ← POST /login, GET /me
│       │   └── Common/
│       │       └── Middleware/
│       │           └── ExceptionHandlingMiddleware.cs
│       ├── AdminDashboard.Core/
│       │   ├── DTOs/Auth/             ← LoginRequest, LoginResponse, UserDto
│       │   ├── Entities/              ← User, AlertRule, PriceSnapshot
│       │   ├── Interfaces/            ← IAuthService (IBinanceService, etc. a criar)
│       │   └── Validators/            ← LoginRequestValidator
│       └── AdminDashboard.Infra/
│           ├── Persistence/
│           │   ├── AppDbContext.cs
│           │   ├── Configurations/    ← UserConfiguration, AlertRuleConfiguration, etc.
│           │   └── Migrations/        ← InitialCreate, SeedDefaultAdmin
│           └── External/
│               └── AuthService.cs    ← BCrypt + JWT
│
├── apps/
│   └── web/
│       ├── Dockerfile
│       ├── package.json
│       ├── next.config.ts             ← rewrite /api/* → API, security headers
│       └── src/
│           ├── proxy.ts               ← proteção de rotas (Next.js 16.2)
│           ├── app/
│           │   ├── layout.tsx         ← ThemeProvider + SessionProvider
│           │   ├── page.tsx           ← redirect /login ou /crypto
│           │   ├── globals.css
│           │   ├── api/auth/[...nextauth]/route.ts
│           │   ├── (auth)/login/page.tsx
│           │   └── (dashboard)/
│           │       ├── layout.tsx     ← auth() server-side check
│           │       ├── crypto/page.tsx
│           │       ├── news/page.tsx
│           │       ├── chat/page.tsx
│           │       └── settings/page.tsx
│           ├── components/
│           │   ├── ui/                ← componentes shadcn
│           │   └── layout/
│           │       ├── Sidebar.tsx
│           │       ├── Header.tsx     ← useSession, signOut
│           │       ├── ThemeProvider.tsx
│           │       ├── ThemeToggle.tsx
│           │       └── SessionProvider.tsx
│           ├── lib/
│           │   ├── api.ts             ← axios + interceptor JWT
│           │   ├── auth.ts            ← NextAuth v5 config
│           │   └── utils.ts
│           └── types/
│               └── next-auth.d.ts    ← augmentação de tipos
│
├── docs/
│   ├── ROADMAP.md
│   ├── SECURITY.md
│   ├── DEPLOY.md
│   └── ARCHITECTURE.md
│
├── prompts/                     ← prompts para Claude Code (módulos futuros)
│   ├── 00-overview.md
│   ├── 04-binance-module.md     (a criar)
│   ├── 05-alerts-system.md      (a criar)
│   ├── 06-news-module.md        (a criar)
│   ├── 07-chat-ai-module.md     (a criar)
│   └── 08-design-system.md      (a criar)
│
└── scripts/
    ├── setup-db.sql             ← referência para setup em produção
    └── generate-secrets.sh
```

---

## 7. Roadmap

### ✅ Semana 1 — Fundações
Setup base, migrations, health check, Docker builds.
`GET /api/health/ping` → `{"message":"pong"}`. Build frontend OK.

### ✅ Semana 2 — Auth
JWT + NextAuth v5 + login obrigatório. BCrypt passwords. Utilizador admin criado via migration seed.
`/crypto` sem login → redireciona para `/login`.

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

# Postgres
POSTGRES_HOST=postgres-server
POSTGRES_PORT=5432
POSTGRES_DB=AdmindashBoard
POSTGRES_USER=printpro
POSTGRES_PASSWORD=<password>

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

Para **desenvolvimento local**, as credenciais estão em `appsettings.Development.json` (gitignored).

---

## 9. Convenções de código (importantes para Claude)

### C# / .NET

- **Nullable reference types** ativos (`<Nullable>enable</Nullable>`)
- **Implicit usings** ativos
- **`Core` NÃO depende de EF, Binance, Anthropic** — só DTOs, entities, interfaces
- **Toda a comunicação externa** (HTTP, BD, APIs) fica em `Infra`
- **Logs sempre via `ILogger<T>`** (Serilog por baixo)
- **Tratamento de erros** via `ExceptionHandlingMiddleware`, não try/catch em cada controller
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
- **Next.js 16.2:** ficheiro de proxy é `src/proxy.ts` (não `middleware.ts`)

### Geral

- Inglês para nomes de código (variáveis, tipos, comentários técnicos)
- Português para comentários explicativos longos e documentação para mim
- Commits em inglês, no estilo Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)

---

## 10. Segurança — princípios não-negociáveis

A primeira coisa é **API keys da Binance APENAS com Reading ativo**. Nunca, em nenhuma circunstância, ativar Withdrawals ou Trading sem confirmação explícita minha.

A segunda é **secrets nunca em código**. Tudo via `.env.prod` que não está em git. `appsettings.Development.json` também está no `.gitignore`.

A terceira é **passwords com BCrypt** (work factor 12+). Nunca SHA, MD5, ou hashes simples.

A quarta é **JWT secret rotacionável** — pelo menos 64 bytes random.

A quinta é **headers de segurança** em todas as respostas (`X-Frame-Options`, `X-Content-Type-Options`, etc.) — configurados no `next.config.ts`.

A sexta é **ports só em `127.0.0.1`** no docker-compose. Nunca expor diretamente à rede.

A sétima é **HTTPS obrigatório** em produção (Cloudflare trata).

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

**Semanas 1 e 2 completas e a funcionar.**

O que está implementado:
- API .NET 10 com HealthController, AuthController, ExceptionHandlingMiddleware
- EF Core com migrations: `InitialCreate` (tabelas) + `SeedDefaultAdmin` (user `ruipaguiar@gmail.com` / `Password123!`)
- Frontend Next.js 16.2 com shadcn/ui, Tailwind 4, dark mode
- Auth completo: NextAuth v5 + JWT Bearer, login funcional, proteção de rotas via `proxy.ts`
- Utilizador admin criado via migration seed (aplicado automaticamente na startup)

**Próximo passo:** Semana 3 — Módulo Crypto. Criar API keys Binance (apenas Reading), implementar `BinanceService` em `Infra`, endpoints `/api/crypto/portfolio` e `/api/crypto/prices`, UI com Tremor.

---

## 13. Notas sobre este ficheiro

- Este `CLAUDE.md` deve ficar **na raiz do repositório**.
- O Claude Code lê automaticamente ficheiros chamados `CLAUDE.md` ao iniciar uma sessão no projeto.
- Para conversas no chat (claude.ai) **fora** do Claude Code, cola este ficheiro como primeira mensagem para dar contexto.
- **Atualiza este ficheiro sempre que houver decisões novas.** É a memória do projeto.

---

_Última atualização: 25 de Abril de 2026_
