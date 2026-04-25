namespace AdminDashboard.Core.Entities;

/// <summary>
/// Regra de alerta sobre uma cripto. Avaliada periodicamente
/// pelo background worker (Hangfire).
/// </summary>
public class AlertRule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }

    /// <summary>Símbolo na Binance, ex: "BTCUSDT", "ETHUSDT".</summary>
    public string Symbol { get; set; } = string.Empty;

    /// <summary>Tipo de condição: PriceAbove, PriceBelow, PercentChange24h, RsiBelow, etc.</summary>
    public AlertType Type { get; set; }

    /// <summary>Valor de referência (preço, percentagem, RSI, etc.).</summary>
    public decimal Threshold { get; set; }

    public bool IsEnabled { get; set; } = true;
    public bool TriggeredOnce { get; set; } // se true, só dispara uma vez
    public DateTime? LastTriggeredAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}

public enum AlertType
{
    PriceAbove = 0,
    PriceBelow = 1,
    PercentChange24hAbove = 2,
    PercentChange24hBelow = 3,
    RsiBelow = 4,
    RsiAbove = 5
}
