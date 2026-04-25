-- ════════════════════════════════════════════════════════════
-- AdminDashboard — Setup da base de dados
-- ════════════════════════════════════════════════════════════
-- Executa como superuser do Postgres existente (postgres-server):
--
--   docker exec -i postgres-server psql -U postgres < scripts/setup-db.sql
--
-- Ou interativamente:
--   docker exec -it postgres-server psql -U postgres
--   \i /caminho/para/setup-db.sql
--
-- ⚠ ANTES DE EXECUTAR:
--   1. Substitui 'ALTERA_PARA_PASSWORD_FORTE' por uma password forte
--      (a mesma que vais pôr em .env.prod como POSTGRES_PASSWORD)
--   2. Confirma que ainda não existe BD chamada admindashboard_db
-- ════════════════════════════════════════════════════════════

-- Criar utilizador dedicado (princípio do menor privilégio)
CREATE USER admindashboard_app WITH ENCRYPTED PASSWORD 'ALTERA_PARA_PASSWORD_FORTE';

-- Criar a base de dados (owned by admindashboard_app)
CREATE DATABASE admindashboard_db
    WITH OWNER = admindashboard_app
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TEMPLATE = template0;

-- Garantir que o user só vê a sua BD (revogar acesso a outras BDs default)
-- Nota: estas revogações são best-practice mas não bloqueiam tudo;
-- a separação real vem do facto de o user não ter privilégios noutras BDs.
REVOKE ALL ON DATABASE admindashboard_db FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE admindashboard_db TO admindashboard_app;

-- Conectar à BD nova para configurar o schema
\c admindashboard_db

-- Permissões no schema public
GRANT USAGE, CREATE ON SCHEMA public TO admindashboard_app;

-- Garantir que tabelas/sequências futuras pertencem ao user
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO admindashboard_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO admindashboard_app;

-- Confirmar
\du admindashboard_app
\l admindashboard_db

-- ✅ Pronto. As migrations do EF Core (dotnet ef database update) tratam do resto.
