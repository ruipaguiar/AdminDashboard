using System.Text;
using AdminDashboard.Api.Common.Middleware;
using AdminDashboard.Core.Interfaces;
using AdminDashboard.Core.Validators;
using AdminDashboard.Infra.External;
using AdminDashboard.Infra.Persistence;
using Binance.Net.Clients;
using CryptoExchange.Net.Authentication;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────
// Logging — Serilog
// ──────────────────────────────────────────────────────────
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

// ──────────────────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// EF Core + Postgres
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication — MapInboundClaims=false mantém "sub" como "sub" (sem mapping para URI)
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret não configurado");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AdminDashboard";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "AdminDashboard";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            NameClaimType = "sub",
            RoleClaimType = "role",
        };
    });

builder.Services.AddAuthorization();

// CORS
var allowedOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// FluentValidation — auto-valida models nos controllers
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

// Módulo Auth
builder.Services.AddScoped<IAuthService, AuthService>();

// Cache em memória (partilhado por todos os módulos)
builder.Services.AddMemoryCache();

// Módulo Crypto — Binance.Net
var binanceApiKey = builder.Configuration["Binance:ApiKey"] ?? "";
var binanceApiSecret = builder.Configuration["Binance:ApiSecret"] ?? "";

BinanceRestClient.SetDefaultOptions(options =>
{
    if (!string.IsNullOrWhiteSpace(binanceApiKey))
        options.ApiCredentials = new ApiCredentials(binanceApiKey, binanceApiSecret);
});

builder.Services.AddScoped<Binance.Net.Interfaces.Clients.IBinanceRestClient>(_ => new BinanceRestClient());
builder.Services.AddScoped<IBinanceService, BinanceService>();

var app = builder.Build();

// ──────────────────────────────────────────────────────────
// Pipeline
// ──────────────────────────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs", options =>
    {
        options.WithTitle("AdminDashboard API")
               .WithTheme(ScalarTheme.Purple);
    });
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
})).AllowAnonymous();

// Aplicar migrations na startup
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        logger.LogInformation("Migrations aplicadas com sucesso.");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Falha ao aplicar migrations na startup.");
        throw;
    }
}

app.Run();
