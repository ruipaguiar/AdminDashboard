namespace AdminDashboard.Core.DTOs.Crypto;

public record PortfolioAssetDto(
    string Asset,
    decimal Free,
    decimal Locked,
    decimal Total,
    decimal PriceUsdt,
    decimal PriceEur,
    decimal ValueUsdt,
    decimal ValueEur,
    decimal PortfolioPercent);
