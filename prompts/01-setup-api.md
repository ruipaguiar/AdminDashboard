# Prompt 01 — Setup da API .NET 10

## Contexto

Estou a desenvolver o projeto **AdminDashboard**, um dashboard pessoal modular. Já tenho a estrutura inicial criada:

- **Stack:** ASP.NET Core .NET 10 (LTS), PostgreSQL 18 (existente, partilhado), EF Core, Hangfire, Serilog
- **Estrutura:** 3 projetos — `AdminDashboard.Api`, `AdminDashboard.Core`, `AdminDashboard.Infra`
- **Arquitetura:** modular (Auth, Crypto, News, Chat, Users)
- **Localização:** `backend/` na raiz do repositório

Os `.csproj`, `Program.cs`, entities iniciais (User, AlertRule, PriceSnapshot) e DbContext já existem. Lê-os antes de começares.

## Objetivo desta fase

Deixar a API a arrancar localmente e em Docker, com a primeira migration aplicada à BD `admindashboard_db`.

## Tarefas

A primeira é validar que `dotnet build` funciona em `backend/`. Resolver erros de compilação se houver.

A segunda é criar `IEntityTypeConfiguration<T>` para `User`, `AlertRule` e `PriceSnapshot` em `AdminDashboard.Infra/Persistence/Configurations/`. Definir índices úteis (Email único em User, Symbol indexado em PriceSnapshot, Symbol+UserId em AlertRule).

A terceira é criar a primeira migration:
```bash
cd backend/src/AdminDashboard.Api
dotnet ef migrations add InitialCreate --project ../AdminDashboard.Infra --startup-project .
```

A quarta é testar que a API arranca: `dotnet run --project backend/src/AdminDashboard.Api`. Confirmar `http://localhost:5001/api/health/ping` responde.

A quinta é testar Docker build: `docker compose --env-file .env.prod build api`. Resolver erros se houver.

A sexta é confirmar que `http://localhost:5001/docs` mostra o Scalar OpenAPI UI.

## Critério de sucesso

- `dotnet build` sem warnings críticos
- Migration aplicada à BD (`docker exec -it postgres-server psql -U admindashboard_app -d admindashboard_db -c "\dt"` mostra tabelas)
- Endpoint `/api/health/ping` responde
- Endpoint `/docs` mostra Scalar UI

## Notas importantes

- **Não** alterar a estrutura de pastas sem me consultares.
- **Não** adicionar dependências NuGet sem me explicares porquê.
- Manter `AdminDashboard.Core` puro (sem dependências de EF, Binance, etc.).
- Toda a comunicação com o exterior (Binance, Anthropic) fica em `AdminDashboard.Infra`.
- Logs sempre via Serilog (`ILogger<T>`).
- Tratamento de erros: usar middleware de exception handling, não try/catch em cada controller.
