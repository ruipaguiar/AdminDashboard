# Dockerfile multi-stage para AdminDashboard.Api (.NET 10)
# Imagem final é pequena (sem SDK) e corre como user não-root.

# ═══════════════ Build stage ═══════════════
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore: copiar primeiro só os .csproj para aproveitar cache
COPY ["src/AdminDashboard.Api/AdminDashboard.Api.csproj", "AdminDashboard.Api/"]
COPY ["src/AdminDashboard.Core/AdminDashboard.Core.csproj", "AdminDashboard.Core/"]
COPY ["src/AdminDashboard.Infra/AdminDashboard.Infra.csproj", "AdminDashboard.Infra/"]
RUN dotnet restore "AdminDashboard.Api/AdminDashboard.Api.csproj"

# Copia o resto e publica
COPY src/ .
WORKDIR "/src/AdminDashboard.Api"
RUN dotnet publish "AdminDashboard.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ═══════════════ Runtime stage ═══════════════
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Criar user não-root (boa prática de segurança)
RUN groupadd --system --gid 1001 dotnetgroup \
 && useradd --system --uid 1001 --gid dotnetgroup --create-home --shell /usr/sbin/nologin dotnetuser \
 && chown -R dotnetuser:dotnetgroup /app

USER dotnetuser

COPY --from=build --chown=dotnetuser:dotnetgroup /app/publish .

# Healthcheck para o docker-compose saber se a API está saudável
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl --fail --silent http://localhost:8080/health || exit 1

EXPOSE 8080

ENTRYPOINT ["dotnet", "AdminDashboard.Api.dll"]
