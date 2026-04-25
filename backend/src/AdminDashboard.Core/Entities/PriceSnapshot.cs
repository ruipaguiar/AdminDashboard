namespace AdminDashboard.Core.Entities;

/// <summary>
/// Snapshot de preço guardado periodicamente para histórico
/// e cálculo de indicadores (RSI, médias móveis, etc.).
/// </summary>
public class PriceSnapshot
{
    public long Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Volume24h { get; set; }
    public decimal PercentChange24h { get; set; }
    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;
}
