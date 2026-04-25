# Arquitetura — AdminDashboard

Decisões de design e justificações.

## Visão geral

O projeto é uma plataforma modular pessoal. **Não é um SaaS público** — é uso pessoal, com login obrigatório para 1-N utilizadores conhecidos.

Hoje tem o módulo `crypto` mas a estrutura permite adicionar módulos novos sem refactor profundo: notas, finanças pessoais, smart home, etc.

## Princípios

A primeira é **separação clara de camadas** no backend (Api / Core / Infra) — facilita testes, manutenção, e migração futura para outros frameworks.

A segunda é **modularidade**: cada feature de domínio (crypto, news, chat) tem a sua pasta tanto no backend (`Modules/Crypto/`) como no frontend (`(dashboard)/crypto/`).

A terceira é **API-first**: todas as funcionalidades são expostas como API REST. O frontend Next.js é **um cliente** dessa API. Mais tarde, app mobile (.NET MAUI ou React Native) será **outro cliente** da mesma API.

A quarta é **stateless backend**: a API não guarda sessão em memória. Tudo via JWT. Permite escalar horizontalmente se um dia for necessário.

## Stack — porquê estas escolhas

### Backend: ASP.NET Core .NET 10

Escolhido porque o developer principal já domina C#. .NET 10 é LTS (suporte até Nov 2028), tem integração nativa com Postgres via EF Core, e bibliotecas excelentes para Binance (`Binance.Net`) e Anthropic (`Anthropic.SDK`).

Alternativa rejeitada: Node.js / Python. Funcionariam, mas o tempo de produção seria maior por menos familiaridade.

### Frontend: Next.js 16.2

Escolhido porque é o stack mais flexível para "design e UX" (foco do projeto), com ecossistema rico (shadcn/ui, Tremor, Recharts) e bom suporte para AI agents via Claude Code (criação rápida de componentes).

App Router + Server Components + rewrites para a API simplificam a integração: o browser nunca chama a API diretamente, tudo passa por `/api/*` que o Next.js encaminha internamente. Resultado: zero CORS, cookies "simplesmente funcionam".

Alternativa considerada: Blazor. Rejeitada apesar de ser mais rápido para desenvolver — o foco em UX favorece Next.js.

### Base de dados: PostgreSQL 18 (partilhada)

Reutiliza o `postgres-server` existente. Decisão pragmática para servidor pessoal — menos overhead, menos containers a gerir.

Isolamento via:
- Base de dados dedicada (`admindashboard_db`)
- User dedicado (`admindashboard_app`) sem privilégios noutras BDs
- Permissões só sobre a sua BD

### Reverse proxy: nenhum

Em vez de Caddy/Nginx separado, o **Next.js trata do routing** via `rewrites` no `next.config.ts`. Isto:

- Reduz containers de 4 para 2 (api + web em vez de api + web + caddy + cloudflared)
- Elimina configuração extra
- O cloudflared (que já existe) é a única coisa a gerir externamente

Trade-off: se tivermos múltiplas APIs no futuro, podemos precisar de adicionar um proxy. Mas para 1 API + 1 web, é overkill.

### Acesso externo: Cloudflare Tunnel

Sem portas abertas no router. O `cloudflared` daemon que já corre estabelece um túnel saída para a Cloudflare. Vantagens:

- IP de casa nunca exposto publicamente
- WAF e DDoS protection da Cloudflare gratuitos
- Certificados SSL automáticos
- Cloudflare Access disponível como camada extra (opcional)

## Estrutura de pastas — backend

```
backend/src/
│
├── AdminDashboard.Api/          ← Web layer (HTTP, controllers, DI, middleware)
│   ├── Program.cs
│   ├── Controllers/             ← endpoints transversais (Health, etc.)
│   ├── Modules/
│   │   ├── Auth/
│   │   │   ├── AuthController.cs
│   │   │   ├── AuthService.cs       (interface em Core)
│   │   │   └── DTOs/
│   │   ├── Crypto/
│   │   │   ├── CryptoController.cs
│   │   │   └── ...
│   │   ├── News/
│   │   ├── Chat/
│   │   └── Users/
│   ├── Common/                  ← middleware, filtros, helpers transversais
│   └── Migrations/              ← EF Core migrations
│
├── AdminDashboard.Core/         ← Domínio puro, sem dependências de infra
│   ├── Entities/                ← User, AlertRule, etc.
│   ├── Interfaces/              ← IBinanceService, IClaudeService, etc.
│   └── DTOs/
│
└── AdminDashboard.Infra/        ← Implementações concretas
    ├── Persistence/
    │   ├── AppDbContext.cs
    │   └── Configurations/      ← IEntityTypeConfiguration<T>
    ├── External/
    │   ├── BinanceService.cs    ← implementa IBinanceService
    │   ├── ClaudeService.cs
    │   └── NewsAggregator.cs
    └── Jobs/                     ← Hangfire jobs (alertas, polling, etc.)
```

**Regra de ouro:** Core não depende de nada (puro domínio). Infra depende de Core. Api depende de Core e Infra.

## Estrutura de pastas — frontend

```
apps/web/src/
│
├── app/                         ← App Router do Next.js
│   ├── layout.tsx
│   ├── page.tsx                 (redirect para /login ou /crypto)
│   ├── globals.css
│   ├── (auth)/                  ← grupo: páginas sem layout do dashboard
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/             ← grupo: páginas com sidebar
│   │   ├── layout.tsx           (sidebar + main)
│   │   ├── crypto/
│   │   │   ├── page.tsx         (portfolio)
│   │   │   ├── alerts/
│   │   │   └── [symbol]/        (detalhe de uma cripto)
│   │   ├── news/page.tsx
│   │   ├── chat/page.tsx
│   │   └── settings/page.tsx
│   └── api/                     ← API routes do Next (auth callbacks etc.)
│
├── components/
│   ├── ui/                      ← componentes shadcn (Button, Card, etc.)
│   ├── layout/                  ← Sidebar, Header, etc.
│   └── modules/                 ← componentes específicos por módulo
│       ├── crypto/
│       ├── news/
│       └── chat/
│
├── lib/
│   ├── api.ts                   ← cliente axios
│   ├── utils.ts                 ← cn(), formatters, etc.
│   └── auth.ts                  ← config NextAuth
│
├── hooks/                       ← React hooks customizados
│
└── types/                       ← TypeScript types/interfaces
```

## Fluxo de autenticação

1. User submete login em `/login`
2. NextAuth (Credentials provider) chama `POST /api/auth/login` na API C#
3. API valida credenciais, devolve JWT
4. NextAuth guarda JWT em cookie HTTP-only
5. Pedidos seguintes do browser para `/api/*` são feitos pelo Next.js que adiciona o JWT no header `Authorization: Bearer ...`
6. API valida JWT em cada pedido protegido

## Fluxo de dados — exemplo: ver portfolio

1. User entra em `/crypto`
2. Componente faz `await api.get("/crypto/portfolio")`
3. Pedido vai para `https://admin.raguiar.pt/api/crypto/portfolio`
4. Cloudflare → tunnel → servidor → Next.js
5. Next.js, via `rewrites`, encaminha para `http://api:8080/api/crypto/portfolio` (rede Docker interna)
6. API valida JWT, chama `BinanceService.GetAccountInfo()`
7. `BinanceService` usa as keys (read-only) e chama API Binance
8. Resposta formatada → JSON → web → UI (Tremor table + chart)

## Background workers

Hangfire é a escolha. Razões:

- Storage no Postgres existente (sem Redis adicional)
- Dashboard web embutido (`/hangfire`, autenticado)
- Tipos de job: recurring (cron-like) e fire-and-forget
- Maturo, em produção em milhares de empresas

Jobs planeados:

- `PollPricesJob` — a cada 5 min, captura preços e regista snapshots
- `EvaluateAlertsJob` — a cada 5 min, avalia regras de alerta
- `RefreshNewsJob` — a cada 30 min, atualiza feed de notícias
- `CleanupOldSnapshotsJob` — diário, apaga snapshots > 90 dias
