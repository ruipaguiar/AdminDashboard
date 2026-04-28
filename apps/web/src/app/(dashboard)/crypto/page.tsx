"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ── Types ────────────────────────────────────────────────
interface PortfolioAsset {
  asset: string;
  free: number;
  locked: number;
  total: number;
  priceUsdt: number;
  priceEur: number;
  valueUsdt: number;
  valueEur: number;
  portfolioPercent: number;
}

interface Portfolio {
  assets: PortfolioAsset[];
  totalValueUsdt: number;
  totalValueEur: number;
  lastUpdated: string;
}

// ── Helpers ───────────────────────────────────────────────
const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("pt-PT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const fmtEur = (n: number) =>
  n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

const CHART_COLORS = [
  "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981",
  "#ef4444", "#06b6d4", "#f97316", "#84cc16",
];

// ── Component ─────────────────────────────────────────────
export default function CryptoPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Portfolio>("/crypto/portfolio")
      .then((res) => setPortfolio(res.data))
      .catch(() => setError("Não foi possível carregar o portfolio. Verifica as API keys da Binance."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        A carregar portfolio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-destructive/40 bg-destructive/5 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!portfolio || portfolio.assets.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem activos na conta Binance.
      </div>
    );
  }

  const chartData = portfolio.assets
    .filter((a) => a.valueEur > 0.01)
    .slice(0, 8)
    .map((a) => ({ name: a.asset, value: a.valueEur }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-normal">Crypto</h1>
        <p className="text-sm text-muted-foreground">
          Portfolio Binance — última actualização:{" "}
          {new Date(portfolio.lastUpdated).toLocaleTimeString("pt-PT")}
        </p>
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total (EUR)</CardTitle>
            <WalletCards className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-normal">
              {fmtEur(portfolio.totalValueEur)}
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ {fmt(portfolio.totalValueUsdt)} USDT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-normal">
              {portfolio.assets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              com saldo positivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior posição</CardTitle>
            <TrendingDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-normal">
              {portfolio.assets[0]?.asset ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolio.assets[0]
                ? `${portfolio.assets[0].portfolioPercent}% do portfolio`
                : ""}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Portfolio table + chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Todos os activos ordenados por valor</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Activo</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Saldo</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço (EUR)</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor (EUR)</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.assets.map((asset, i) => (
                    <tr
                      key={asset.asset}
                      className="border-b transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          <span className="font-medium">{asset.asset}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {fmt(asset.total, 6)}
                        {asset.locked > 0 && (
                          <span className="ml-1 text-muted-foreground">
                            ({fmt(asset.locked, 6)} locked)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {fmtEur(asset.priceEur)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {fmtEur(asset.valueEur)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {asset.portfolioPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Donut chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição</CardTitle>
            <CardDescription>Por valor em EUR</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [fmtEur(Number(value)), "Valor"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <ul className="mt-2 space-y-1">
              {chartData.map((entry, i) => (
                <li key={entry.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    {entry.name}
                  </span>
                  <span className="text-muted-foreground">{fmtEur(entry.value)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
