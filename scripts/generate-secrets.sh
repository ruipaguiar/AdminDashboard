#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════
# Gerar secrets para .env.prod
# ════════════════════════════════════════════════════════════
# Uso:
#   bash scripts/generate-secrets.sh
#
# Copia os valores gerados para o teu .env.prod

set -euo pipefail

echo "═══════════════════════════════════════════════════"
echo "  AdminDashboard — Secret Generator"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Copia estes valores para o teu .env.prod:"
echo ""

echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n/+=' | head -c 32)"
echo ""
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
echo ""
echo "NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
echo ""

echo "═══════════════════════════════════════════════════"
echo "⚠  ATENÇÃO:"
echo "  - Atualiza também a password no scripts/setup-db.sql"
echo "    se ainda não criaste a BD"
echo "  - NUNCA partilhes estes valores"
echo "  - NUNCA faças commit do .env.prod"
echo "═══════════════════════════════════════════════════"
