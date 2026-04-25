using AdminDashboard.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdminDashboard.Infra.Persistence.Configurations;

public class AlertRuleConfiguration : IEntityTypeConfiguration<AlertRule>
{
    public void Configure(EntityTypeBuilder<AlertRule> builder)
    {
        builder.ToTable("AlertRules");

        builder.HasKey(alertRule => alertRule.Id);

        builder.HasIndex(alertRule => new { alertRule.Symbol, alertRule.UserId });

        builder.Property(alertRule => alertRule.Symbol)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(alertRule => alertRule.Type)
            .IsRequired();

        builder.Property(alertRule => alertRule.Threshold)
            .HasPrecision(28, 10)
            .IsRequired();

        builder.Property(alertRule => alertRule.IsEnabled)
            .IsRequired();

        builder.Property(alertRule => alertRule.TriggeredOnce)
            .IsRequired();

        builder.Property(alertRule => alertRule.CreatedAt)
            .IsRequired();

        builder.Property(alertRule => alertRule.Notes)
            .HasMaxLength(1000);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(alertRule => alertRule.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
