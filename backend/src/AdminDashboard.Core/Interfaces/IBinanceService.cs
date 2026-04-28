using AdminDashboard.Core.DTOs.Crypto;

namespace AdminDashboard.Core.Interfaces;

public interface IBinanceService
{
    Task<PortfolioDto> GetPortfolioAsync(CancellationToken ct = default);
    Task<IReadOnlyList<PriceDto>> GetPricesAsync(IReadOnlyList<string> symbols, CancellationToken ct = default);
}
