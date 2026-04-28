using AdminDashboard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdminDashboard.Api.Modules.Crypto;

[ApiController]
[Route("api/crypto")]
[Authorize]
public class CryptoController(IBinanceService binanceService) : ControllerBase
{
    [HttpGet("portfolio")]
    public async Task<IActionResult> GetPortfolio(CancellationToken ct)
    {
        var portfolio = await binanceService.GetPortfolioAsync(ct);
        return Ok(portfolio);
    }

    [HttpGet("prices")]
    public async Task<IActionResult> GetPrices(
        [FromQuery] string symbols = "BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT",
        CancellationToken ct = default)
    {
        var symbolList = symbols
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();

        var prices = await binanceService.GetPricesAsync(symbolList, ct);
        return Ok(prices);
    }
}
