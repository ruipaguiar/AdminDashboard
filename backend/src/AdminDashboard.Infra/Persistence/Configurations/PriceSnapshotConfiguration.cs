using AdminDashboard.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdminDashboard.Infra.Persistence.Configurations;

public class PriceSnapshotConfiguration : IEntityTypeConfiguration<PriceSnapshot>
{
    public void Configure(EntityTypeBuilder<PriceSnapshot> builder)
    {
        builder.ToTable("PriceSnapshots");

        builder.HasKey(priceSnapshot => priceSnapshot.Id);

        builder.HasIndex(priceSnapshot => priceSnapshot.Symbol);

        builder.HasIndex(priceSnapshot => new { priceSnapshot.Symbol, priceSnapshot.CapturedAt });

        builder.Property(priceSnapshot => priceSnapshot.Symbol)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(priceSnapshot => priceSnapshot.Price)
            .HasPrecision(28, 10)
            .IsRequired();

        builder.Property(priceSnapshot => priceSnapshot.Volume24h)
            .HasPrecision(28, 10)
            .IsRequired();

        builder.Property(priceSnapshot => priceSnapshot.PercentChange24h)
            .HasPrecision(12, 6)
            .IsRequired();

        builder.Property(priceSnapshot => priceSnapshot.CapturedAt)
            .IsRequired();
    }
}
