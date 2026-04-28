namespace AdminDashboard.Core.DTOs.Crypto;

public record PortfolioDto(
    IReadOnlyList<PortfolioAssetDto> Assets,
    decimal TotalValueUsdt,
    decimal TotalValueEur,
    DateTime LastUpdated);
