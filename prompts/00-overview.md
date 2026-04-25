# Prompts para Claude Code — Overview

Esta pasta contém prompts para acelerar o desenvolvimento de módulos futuros.

## Estado

| Prompt | Módulo | Estado |
|--------|--------|--------|
| ~~01-setup-api.md~~ | Setup API .NET 10 | ✅ Done |
| ~~02-setup-web.md~~ | Setup Next.js + shadcn | ✅ Done |
| ~~03-auth-jwt.md~~ | Auth JWT + NextAuth | ✅ Done |
| 04-binance-module.md | Portfolio Binance | A criar |
| 05-alerts-system.md | Alertas + Hangfire | A criar |
| 06-news-module.md | Feed de notícias | A criar |
| 07-chat-ai-module.md | Chat com Claude | A criar |
| 08-design-system.md | Polimento visual | A criar |

## Como usar

Antes de cada fase, abre o prompt correspondente e cola no Claude Code. O Claude lê o repositório todo, percebe o estado atual, e implementa.

**Regra:** prompt → Claude implementa → testas → commit → próximo prompt. Uma fase de cada vez.

## Próximo

Semana 3 — criar `prompts/04-binance-module.md` antes de implementar o módulo Crypto.
