import { Bell, LineChart, WalletCards } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const summaryItems = [
  {
    title: "Portfolio",
    value: "A ligar",
    description: "Binance read-only",
    icon: WalletCards,
  },
  {
    title: "Alertas",
    value: "0 ativos",
    description: "Regras de preço e variação",
    icon: Bell,
  },
  {
    title: "Mercado",
    value: "Sem dados",
    description: "Snapshots e indicadores",
    icon: LineChart,
  },
];

export default function CryptoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-normal">Crypto</h1>
        <p className="text-sm text-muted-foreground">
          Portfolio Binance, alertas e análise.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-normal">
                  {item.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Atividade</CardTitle>
          <CardDescription>
            Últimos movimentos e snapshots do portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            Sem snapshots registados
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
