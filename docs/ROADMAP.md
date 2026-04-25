# Roadmap — AdminDashboard

Plano de desenvolvimento por fases.

---

## ✅ Semana 1 — Fundações

**Objetivo:** esqueleto a correr com web ↔ api ↔ db a comunicarem.

- Estrutura de projetos (.NET 10 + Next.js 16.2)
- EF Core migration `InitialCreate` (tabelas Users, AlertRules, PriceSnapshots)
- `GET /api/health/ping` → `{"message":"pong"}`
- Scalar UI em `/docs`
- Frontend build OK, shadcn/ui instalado, Tailwind 4 configurado
- Docker builds funcionais

---

## ✅ Semana 2 — Autenticação

**Objetivo:** login obrigatório a funcionar end-to-end.

- `POST /api/auth/login` — valida credenciais BCrypt, devolve JWT
- `GET /api/auth/me` — devolve user autenticado
- `ExceptionHandlingMiddleware` — erro global sem try/catch em controllers
- FluentValidation — validação automática de request bodies
- NextAuth v5 (beta.31) — Credentials provider que chama a API C#
- `src/proxy.ts` — proteção de rotas (Next.js 16.2)
- Login page funcional com react-hook-form + Zod
- Header com nome real e logout funcional
- Migration `SeedDefaultAdmin` — user `ruipaguiar@gmail.com` / `Password123!` criado na startup

---

## Semana 3 — Módulo Crypto / Binance

**Objetivo:** ver o portfolio Binance no dashboard.

**Tarefas:**

1. Criar API keys na Binance (apenas Reading, restringidas por IP). Pôr em `.env.prod`.
2. Criar `IBinanceService` em `Core/Interfaces/` e `BinanceService` em `Infra/External/`.
3. Endpoints: `GET /api/crypto/portfolio`, `GET /api/crypto/prices`, `GET /api/crypto/symbol/{symbol}/history`.
4. UI: tabela do portfolio (Tremor), gráfico de evolução, distribuição em donut chart.
5. Cache de preços (IMemoryCache) — não bater na Binance a cada request.

**Critério de sucesso:** Página `/crypto` mostra portfolio real com valores em EUR/USD.

---

## Semana 4 — Sistema de Alertas

**Objetivo:** receber alertas quando uma cripto bate condição definida.

**Tarefas:**

1. Configurar Hangfire com Postgres como storage.
2. CRUD endpoints para `AlertRule` + UI para gerir alertas.
3. Background job a cada 5 minutos: lê preços, avalia regras, regista alertas disparados.
4. Página `/crypto/alerts` com lista de regras + histórico. Badge no menu lateral.
5. (Opcional) Bot Telegram para alertas no telemóvel.

**Critério de sucesso:** Criar regra "BTC abaixo de X" e ver alerta a aparecer quando bater.

---

## Semana 5 — Módulo News

**Objetivo:** feed de atualidade no dashboard.

**Tarefas:**

1. Integrar APIs: CryptoPanic (free tier) ou RSS feeds (CoinDesk, Cointelegraph).
2. `GET /api/news/feed` com cache (5min) e filtros.
3. UI: lista de notícias com fonte, timestamp relativo, link.
4. Background job para pré-fetch periódico.

**Critério de sucesso:** `/news` mostra últimas 30 notícias com auto-refresh.

---

## Semana 6 — Chat com IA

**Objetivo:** chat com Claude que conhece o contexto da conta.

**Tarefas:**

1. `IClaudeService` em `Core/Interfaces/` e `ClaudeService` em `Infra/External/`.
2. Entities `ChatConversation` + `ChatMessage` + migration.
3. Endpoints com streaming SSE: `GET /api/chat/conversations`, `POST /api/chat/conversations/{id}/messages`.
4. System prompt com contexto: portfolio atual, alertas ativos, top movers.
5. UI de chat com markdown, histórico, e indicador "a escrever".

**Critério de sucesso:** "Como está o meu portfolio?" → Claude responde com contexto real.

---

## Semana 7+ — Polimento

- Design system completo
- Dark mode toggle (semi-pronto via CSS variables)
- Mobile responsive
- PWA (instalável no telemóvel)
- Backups automáticos da BD
- Monitoring (Uptime Kuma ou similar)
- Testes unitários nos services críticos
- CI/CD com GitHub Actions

---

## Marcos de longo prazo

| Marco | Estimativa |
|-------|-----------|
| MVP funcional | Semana 6 |
| App mobile (.NET MAUI) | Mês 4-6 |
| Módulo Finanças (não-crypto) | Mês 6+ |
| Módulo Smart Home | Mês 9+ |
