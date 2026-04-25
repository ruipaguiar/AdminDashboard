using AdminDashboard.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdminDashboard.Infra.Persistence;

/// <summary>
/// DbContext principal da aplicação.
/// Cada módulo deve ter o seu DbSet aqui (User, AlertRule, etc.).
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // ── Auth / Users ──
    public DbSet<User> Users => Set<User>();

    // ── Crypto module ──
    public DbSet<AlertRule> AlertRules => Set<AlertRule>();
    public DbSet<PriceSnapshot> PriceSnapshots => Set<PriceSnapshot>();

    // TODO: outros módulos (News, Chat) à medida que forem desenvolvidos.

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplica todas as IEntityTypeConfiguration<T> deste assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
