# Roadmap — AdminDashboard

Plano de desenvolvimento por fases. Cada fase tem objetivos claros e referências aos prompts do Claude Code.

---

## Semana 1 — Fundações (10-15h)

**Objetivo:** ter o esqueleto a correr no servidor com web ↔ api ↔ db a comunicarem.

**Tarefas:**

A primeira é configurar o ambiente local: instalar .NET 10 SDK, Node 22, Docker. Validar com `dotnet --version`, `node --version`, `docker --version`.

A segunda é correr o `scripts/setup-db.sql` no `postgres-server` para criar a BD e user. Atualizar a password no `.env.prod` para o mesmo valor.

A terceira é criar a rede Docker partilhada: `docker network create admin-net`.

A quarta é fazer o primeiro `docker compose up -d --build` e confirmar que API responde em `http://localhost:5001/api/health/ping` e web responde em `http://localhost:3003`.

A quinta é configurar a rota no Cloudflare Tunnel: `admin.raguiar.pt` → `http://localhost:3003`. Confirmar que `https://admin.raguiar.pt` carrega.

A sexta é commit inicial no GitHub e ligar ao Claude Code no VS Code.

**Prompt principal:** `prompts/01-setup-api.md` e `prompts/02-setup-web.md`.

**Critério de sucesso:** ao aceder a `https://admin.raguiar.pt/api/health/ping` (via browser) deve devolver JSON com `{"message":"pong"}`.

---

## Semana 2 — Autenticação (10-15h)

**Objetivo:** login obrigatório a funcionar end-to-end.

**Tarefas:**

A primeira é criar tabela `Users` (migration EF Core) e seed do utilizador admin (email + password hash com BCrypt).

A segunda é criar endpoints na API: `POST /api/auth/login` (devolve JWT), `POST /api/auth/refresh`, `GET /api/auth/me`.

A terceira é configurar middleware JWT na API (já está em `Program.cs`, falta só atributos `[Authorize]` nos controllers).

A quarta é configurar NextAuth no frontend com Credentials provider que chama a API. Páginas `/login` e proteção de rotas `(dashboard)/*`.

A quinta é testar fluxo completo: login → token → chamada autenticada → logout.

**Prompt principal:** `prompts/03-auth-jwt.md`.

**Critério de sucesso:** Tentar aceder a `/crypto` sem login redireciona para `/login`. Após login, fica na página.

---

## Semana 3 — Módulo Crypto / Binance (15-20h)

**Objetivo:** ver o portfolio Binance no dashboard.

**Tarefas:**

A primeira é criar API keys na Binance (apenas Reading, restringidas por IP). Pôr em `.env.prod`.

A segunda é integrar `Binance.Net` no projeto Infra. Service `BinanceService` com métodos para `GetAccountInfo`, `GetPrice`, `GetPriceHistory`.

A terceira é criar endpoints: `GET /api/crypto/portfolio`, `GET /api/crypto/prices`, `GET /api/crypto/symbol/{symbol}/history`.

A quarta é criar UI no frontend: tabela do portfolio (com Tremor), gráfico de evolução, distribuição em donut chart.

A quinta é cache de preços (Memory cache) para não bater na Binance a cada request.

**Prompt principal:** `prompts/04-binance-module.md`.

**Critério de sucesso:** Página `/crypto` mostra o teu portfolio real com valores em EUR/USD.

---

## Semana 4 — Sistema de Alertas (10-15h)

**Objetivo:** receber alertas no site quando uma cripto bate condição definida.

**Tarefas:**

A primeira é configurar Hangfire com Postgres como storage.

A segunda é criar entity `AlertRule` (já está) + CRUD endpoints + UI para gerir alertas.

A terceira é criar background job que corre a cada 5 minutos: lê preços, avalia regras, regista alertas disparados em `TriggeredAlerts`.

A quarta é criar página `/crypto/alerts` com lista de regras + histórico de alertas disparados. Badge no menu lateral com contagem de alertas não lidos.

A quinta (opcional) é integrar bot Telegram para receber alertas no telemóvel — biblioteca `Telegram.Bot`.

**Prompt principal:** `prompts/05-alerts-system.md`.

**Critério de sucesso:** Criar regra "BTC abaixo de X" e ver alerta a aparecer quando bater.

---

## Semana 5 — Módulo News (8-12h)

**Objetivo:** feed de atualidade no dashboard.

**Tarefas:**

A primeira é integrar APIs de notícias: CryptoPanic (free tier, 50 req/dia), CryptoCompare News, ou RSS feeds (CoinDesk, Cointelegraph).

A segunda é criar endpoint `GET /api/news/feed` com cache (5min) e suporte a filtros.

A terceira é UI: lista de notícias com thumbnails, fonte, timestamp relativo, link.

A quarta é background job para pré-fetch periódico em vez de fetch on-demand.

**Prompt principal:** `prompts/06-news-module.md`.

**Critério de sucesso:** Página `/news` mostra últimas 30 notícias relevantes com auto-refresh.

---

## Semana 6 — Chat com IA (10-15h)

**Objetivo:** chat com Claude que conhece o contexto da tua conta.

**Tarefas:**

A primeira é integrar `Anthropic.SDK` no projeto Infra. Service `ClaudeService` com `Chat(messages, systemPrompt)`.

A segunda é criar entity `ChatConversation` + `ChatMessage` para persistir conversas.

A terceira é criar endpoints: `GET /api/chat/conversations`, `POST /api/chat/conversations`, `POST /api/chat/conversations/{id}/messages` (streaming SSE).

A quarta é system prompt que injeta contexto: portfolio atual, alertas ativos, top movers do dia, etc. Cuidado: não injetar API keys nem dados sensíveis.

A quinta é UI de chat com markdown, histórico, e indicador "Claude is typing".

**Prompt principal:** `prompts/07-chat-ai-module.md`.

**Critério de sucesso:** Perguntar "como está o meu portfolio?" e Claude responder com contexto real.

---

## Semana 7+ — Polimento

**Objetivo:** UX, performance e robustez.

**Possíveis melhorias:**

- Design system completo (ver `prompts/08-design-system.md`)
- Dark mode toggle (já está semi-pronto via CSS variables)
- Mobile responsive
- PWA (instalável no telemóvel como app)
- Backups automáticos da BD
- Monitoring (Uptime Kuma, Grafana, etc.)
- Error tracking (Sentry self-hosted ou similar)
- Testes unitários nos services críticos
- CI/CD com GitHub Actions

---

## Marcos de longo prazo

| Marco | Estado |
|-------|--------|
| MVP funcional | Semana 6 |
| App mobile (.NET MAUI) | Mês 4-6 |
| Módulo Finanças (não-crypto) | Mês 6+ |
| Módulo Smart Home | Mês 9+ |

A arquitetura modular permite adicionar estes sem refactoring profundo.
