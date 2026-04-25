# Prompt 02 — Setup do Next.js + shadcn/ui

## Contexto

Estou a desenvolver o frontend do **AdminDashboard** com Next.js 16.2 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Tremor.

Localização: `apps/web/` na raiz. Já existem `package.json`, `next.config.ts`, `tsconfig.json`, layout root, página home, layout do dashboard com sidebar, e páginas placeholder.

## Objetivo

Deixar o frontend a arrancar e instalar componentes shadcn/ui base.

## Tarefas

A primeira é correr `npm install` em `apps/web/`. Resolver conflitos se houver (talvez ajustar versões do `package.json`).

A segunda é inicializar shadcn/ui:
```bash
npx shadcn@latest init
```
Configurar:
- Style: New York
- Base color: Slate
- CSS variables: Yes
- Path: `@/components`

A terceira é instalar componentes base:
```bash
npx shadcn@latest add button card input label form toast dialog dropdown-menu avatar separator tabs
```

A quarta é criar componentes do layout em `src/components/layout/`:
- `Sidebar.tsx` — substitui o placeholder do `(dashboard)/layout.tsx`, mais bonito, com active state
- `Header.tsx` — barra superior com avatar, dropdown user menu, theme toggle
- `ThemeProvider.tsx` — usar `next-themes` para dark mode

A quinta é refazer a página `(auth)/login/page.tsx` com componentes shadcn (Card, Input, Button, Form com react-hook-form + zod).

A sexta é testar local: `npm run dev` → `http://localhost:3000` deve mostrar página de login bonita.

A sétima é testar Docker: `docker compose --env-file .env.prod build web`. Resolver erros se houver.

## Critério de sucesso

- `npm run dev` funciona sem erros
- `npm run build` funciona (importante para produção)
- `npm run typecheck` passa
- Página de login renderiza com componentes shadcn
- Dashboard layout tem sidebar bonita com hover states e active route

## Notas

- **Tailwind 4** tem sintaxe ligeiramente diferente do 3 — usar `@import "tailwindcss"` em vez de `@tailwind base/components/utilities`.
- Nunca usar `localStorage` para guardar JWT — usar cookies HTTP-only via NextAuth.
- Componentes pesados que dependem de browser-only APIs devem ser `"use client"`. Server Components sempre que possível para performance.
- Não criar formulários sem validação Zod — todos os inputs validados.
