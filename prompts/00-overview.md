# Prompts para Claude Code — Overview

Esta pasta contém prompts prontos a usar no Claude Code para acelerar o desenvolvimento.

## Como usar

A primeira coisa a fazer é abrir o projeto no VS Code com Claude Code ativo.

A segunda é, antes de cada fase, abrir o prompt correspondente, copiar **tudo** e colar no Claude Code dentro do contexto do projeto. Claude Code lê o repositório todo, percebe a estrutura, e implementa.

A terceira é **ler antes de aceitar**. Os prompts são template, não dogma. Adapta a tua realidade. Recusa sugestões que não percebas — pergunta primeiro o que faz aquela dependência ou padrão.

A quarta é **uma tarefa de cada vez**. Não chames o Claude Code com 5 prompts seguidos sem testar entre eles. Ritmo: prompt → Claude implementa → testas → commit → próximo prompt.

## Ordem recomendada

1. `01-setup-api.md` — finalizar setup da API .NET 10 com primeira migration
2. `02-setup-web.md` — finalizar setup do Next.js com shadcn/ui instalado
3. `03-auth-jwt.md` — autenticação completa (API + frontend)
4. `04-binance-module.md` — portfolio Binance read-only
5. `05-alerts-system.md` — alertas + Hangfire
6. `06-news-module.md` — feed de notícias
7. `07-chat-ai-module.md` — chat com Claude
8. `08-design-system.md` — polimento visual

## Princípios para os prompts

Os prompts seguem alguns princípios para gerarem código de qualidade:

A primeira é **contexto explícito**: cada prompt começa por descrever o estado atual, a stack, e os ficheiros existentes relevantes.

A segunda é **objetivos claros**: o que se pretende implementar, não só "faz X". Inclui critérios de sucesso.

A terceira é **convenções**: lembra ao Claude Code os padrões do projeto (camadas, naming, tratamento de erros).

A quarta é **avisos de segurança** específicos quando relevantes (ex: nunca logar API keys, sempre validar input do user).

A quinta é **incremental**: prompts pequenos com critérios de teste, em vez de "faz a app toda".
