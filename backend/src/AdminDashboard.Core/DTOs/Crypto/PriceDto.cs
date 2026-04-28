namespace AdminDashboard.Core.DTOs.Crypto;

public record PriceDto(
    string Symbol,
    decimal Price,
    decimal PriceChangePercent24h);
