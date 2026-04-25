# Dockerfile multi-stage para Next.js 16.2 (standalone build)
# Imagem final é minúscula (~150MB) e corre como user não-root.

# ═══════════════ Deps stage ═══════════════
FROM node:22-alpine AS deps
WORKDIR /app

# Instalar dependências (libc6-compat por causa de bibliotecas nativas)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ═══════════════ Build stage ═══════════════
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args (passados pelo docker-compose)
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_API_VERSION
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}
ENV NEXT_PUBLIC_API_VERSION=${NEXT_PUBLIC_API_VERSION}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ═══════════════ Runtime stage ═══════════════
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# User não-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copiar standalone output do Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck para o docker-compose
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
