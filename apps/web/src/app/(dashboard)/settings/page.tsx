import { ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-normal">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Conta, segurança e integrações.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Estado inicial das integrações sensíveis.
            </CardDescription>
          </div>
          <ShieldCheck className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Binance</span>
            <span className="text-sm text-muted-foreground">Read-only</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Autenticação</span>
            <span className="text-sm text-muted-foreground">JWT + NextAuth</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Base de dados</span>
            <span className="text-sm text-muted-foreground">PostgreSQL</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
