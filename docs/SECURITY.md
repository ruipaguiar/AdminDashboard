# Segurança — AdminDashboard

Este documento lista os controlos de segurança implementados e os que precisas de manter ativos. **Lê isto antes de ir para produção.**

## Princípios

A primeira é **defense in depth**: múltiplas camadas de defesa. Mesmo que uma falhe, outras protegem.

A segunda é **least privilege**: cada componente tem só as permissões mínimas que precisa.

A terceira é **never expose secrets**: API keys, passwords e JWT secrets nunca aparecem em código, logs ou commits.

A quarta é **assume breach**: parte do princípio que algo eventualmente vai falhar e desenha o sistema para minimizar dano nesse cenário.

---

## Camada 1 — Cloudflare

A Cloudflare é a porta de entrada. Não chega tráfego ao servidor sem passar por aqui.

- ✅ **Cloudflare Tunnel** em vez de portas abertas no router → IP de casa nunca é exposto
- ✅ **WAF** (Web Application Firewall) gratuito → bloqueia ataques comuns (SQLi, XSS, etc.)
- ✅ **DDoS protection** automática
- ✅ **SSL Mode: Full (strict)** → encriptação end-to-end
- 🔧 **Cloudflare Access** (opcional, recomendado) → camada extra de auth com Google/email antes de chegar ao site

**Ação:** No painel Cloudflare → SSL/TLS → confirmar que está em "Full (strict)".
**Ação:** No painel Cloudflare → Zero Trust → considerar configurar Access policies.

---

## Camada 2 — Servidor / Docker

- ✅ **Ports só em `127.0.0.1`** → mesmo se firewall mal configurado, ninguém na rede local acede
- ✅ **Containers correm como user não-root** (UID 1001)
- ✅ **Rede Docker isolada** entre projetos (`admin-net` separada de `melresin-net`)
- 🔧 **Firewall UFW** ativo: `sudo ufw enable`, `sudo ufw allow 22`, `sudo ufw default deny incoming`
- 🔧 **Atualizações automáticas** do Ubuntu: `sudo apt install unattended-upgrades`
- 🔧 **SSH key-only** (sem password): `PasswordAuthentication no` em `/etc/ssh/sshd_config`

**Ação:** Verifica `sudo ufw status` no servidor.

---

## Camada 3 — Aplicação

### JWT

- ✅ Secret de pelo menos 64 bytes random (`openssl rand -base64 64`)
- ✅ Expiração de 24h por defeito (configurável)
- ✅ Validação de Issuer e Audience
- 🔧 **Rotação periódica** do secret (a cada 6 meses ideal)

### Autenticação

- ✅ Passwords hashed com **BCrypt** (work factor 12+)
- ✅ Login obrigatório em todas as páginas exceto `/login`
- 🔧 **Rate limiting** em `/api/auth/login` (TODO)
- 🔧 **2FA** (TODO, opcional mas recomendado para produção)

### Headers HTTP

- ✅ `X-Frame-Options: DENY` (anti-clickjacking)
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy` restrita

---

## Camada 4 — Base de dados

- ✅ **User dedicado** (`admindashboard_app`) com permissões só na BD própria
- ✅ **Sem porta exposta** ao host (`postgres-server` está só na rede Docker)
- 🔧 **Password forte** (32+ chars random)
- 🔧 **Backups regulares** (TODO: configurar `pg_dump` automático)
- ⚠ **NUNCA** usar o user `postgres` (superuser) na aplicação

**Ação:** Confirma que `POSTGRES_PASSWORD` no `.env.prod` foi gerada com `openssl rand -base64 32`.

---

## Camada 5 — APIs externas

### Binance

- ⚠ **CRÍTICO**: ativar **APENAS** "Enable Reading" nas API keys
- ⚠ **NUNCA** ativar "Enable Withdrawals"
- ⚠ **NUNCA** ativar "Enable Spot & Margin Trading" (a não ser que decidas mesmo executar ordens)
- 🔧 **Restringir por IP**: descobrir IP do servidor com `curl ifconfig.me` e adicionar nas configurações Binance
- 🔧 **Rotação** das keys a cada 6 meses

### Anthropic / Claude

- ✅ API key em variável de ambiente (não em código)
- 🔧 **Limite de gasto** definido na console Anthropic (ex: 20€/mês)
- 🔧 **Rate limiting** no endpoint de chat (TODO) para evitar consumo excessivo

---

## Camada 6 — Código e dependências

- ✅ `.env*` em `.gitignore`
- ✅ Secrets nunca em código
- 🔧 **Dependabot/Renovate** para atualizações automáticas (TODO)
- 🔧 **`npm audit` / `dotnet list package --vulnerable`** mensalmente

---

## Checklist antes de "ir para produção"

- [ ] Passwords e secrets gerados com `openssl rand` (não usar valores default)
- [ ] `.env.prod` não está em git (`git status` confirma)
- [ ] Binance API keys com **APENAS** Reading
- [ ] Cloudflare SSL Mode: Full (strict)
- [ ] Cloudflare Tunnel a funcionar (IP do servidor não exposto)
- [ ] UFW ativo no servidor
- [ ] SSH só por chave (sem password)
- [ ] Backup do Postgres automático configurado
- [ ] Anthropic spending limit definido
- [ ] User Postgres `admindashboard_app` confirmado sem permissões fora da sua BD

---

## Em caso de incidente

Se suspeitas que algo foi comprometido:

A primeira ação é **revogar tudo**: API keys (Binance, Anthropic), JWT secret, password do Postgres user.

A segunda é **regenerar** todos os secrets (`bash scripts/generate-secrets.sh`).

A terceira é **ver logs**: `docker compose logs api --since 7d | grep -i error` e `docker exec postgres-server tail /var/log/postgresql/postgresql.log`.

A quarta é **forçar logout de todos os utilizadores**: rotação do JWT secret invalida todos os tokens.

A quinta, se for grave, é **levantar a app**: `docker compose down` e investigar antes de voltar a subir.
