using AdminDashboard.Core.DTOs.Crypto;
using AdminDashboard.Core.Interfaces;
using Binance.Net.Interfaces.Clients;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace AdminDashboard.Infra.External;

public class BinanceService(
    IBinanceRestClient client,
    IMemoryCache cache,
    ILogger<BinanceService> logger) : IBinanceService
{
    private static readonly TimeSpan PortfolioCacheDuration = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan PriceCacheDuration = TimeSpan.FromSeconds(15);

    public async Task<PortfolioDto> GetPortfolioAsync(CancellationToken ct = default)
    {
        return await cache.GetOrCreateAsync("crypto:portfolio", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = PortfolioCacheDuration;
            return await FetchPortfolioAsync(ct);
        }) ?? throw new InvalidOperationException("Falha ao obter portfolio da Binance.");
    }

    public async Task<IReadOnlyList<PriceDto>> GetPricesAsync(IReadOnlyList<string> symbols, CancellationToken ct = default)
    {
        var cacheKey = $"crypto:prices:{string.Join(",", symbols.OrderBy(s => s))}";

        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = PriceCacheDuration;

            var result = await client.SpotApi.ExchangeData.GetTickersAsync(ct: ct);
            if (!result.Success)
            {
                logger.LogError("Binance GetTickers falhou: {Error}", result.Error?.Message);
                return (IReadOnlyList<PriceDto>)[];
            }

            return result.Data
                .Where(t => symbols.Contains(t.Symbol))
                .Select(t => new PriceDto(t.Symbol, t.LastPrice, (decimal)t.PriceChangePercent))
                .OrderBy(p => p.Symbol)
                .ToList();
        }) ?? [];
    }

    private async Task<PortfolioDto> FetchPortfolioAsync(CancellationToken ct)
    {
        // Balances da conta (requer autenticação)
        var accountResult = await client.SpotApi.Account.GetAccountInfoAsync(ct: ct);
        if (!accountResult.Success)
        {
            logger.LogError("Binance GetAccountInfo falhou: {Error}", accountResult.Error?.Message);
            throw new InvalidOperationException($"Erro Binance: {accountResult.Error?.Message}");
        }

        var balances = accountResult.Data.Balances
            .Where(b => b.Total > 0)
            .ToList();

        if (balances.Count == 0)
            return new PortfolioDto([], 0m, 0m, DateTime.UtcNow);

        // Todos os preços USDT em batch (chamada pública, sem auth)
        var pricesResult = await client.SpotApi.ExchangeData.GetPricesAsync(ct: ct);
        if (!pricesResult.Success)
        {
            logger.LogError("Binance GetPrices falhou: {Error}", pricesResult.Error?.Message);
            throw new InvalidOperationException($"Erro Binance preços: {pricesResult.Error?.Message}");
        }

        var priceMap = pricesResult.Data.ToDictionary(p => p.Symbol, p => p.Price);

        // Taxa EUR/USDT para conversão
        var eurUsdtRate = priceMap.GetValueOrDefault("EURUSDT", 1.08m);

        var assets = new List<PortfolioAssetDto>();

        foreach (var balance in balances)
        {
            decimal priceUsdt = balance.Asset switch
            {
                "USDT" => 1m,
                "USDC" or "BUSD" or "TUSD" or "FDUSD" => priceMap.GetValueOrDefault($"{balance.Asset}USDT", 1m),
                _ => priceMap.GetValueOrDefault($"{balance.Asset}USDT", 0m)
            };

            var priceEur = eurUsdtRate > 0 ? priceUsdt / eurUsdtRate : 0m;
            var valueUsdt = balance.Total * priceUsdt;
            var valueEur = balance.Total * priceEur;

            assets.Add(new PortfolioAssetDto(
                balance.Asset,
                balance.Available,
                balance.Locked,
                balance.Total,
                priceUsdt,
                priceEur,
                valueUsdt,
                valueEur,
                0m)); // percent calculado abaixo
        }

        var sorted = assets.OrderByDescending(a => a.ValueUsdt).ToList();
        var totalUsdt = sorted.Sum(a => a.ValueUsdt);
        var totalEur = sorted.Sum(a => a.ValueEur);

        // Calcular percentagem de cada asset no portfolio
        var withPercent = sorted.Select(a => a with
        {
            PortfolioPercent = totalUsdt > 0 ? Math.Round(a.ValueUsdt / totalUsdt * 100, 2) : 0m
        }).ToList();

        return new PortfolioDto(withPercent, totalUsdt, totalEur, DateTime.UtcNow);
    }
}
