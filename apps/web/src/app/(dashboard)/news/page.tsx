import { Rss } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-normal">News</h1>
        <p className="text-sm text-muted-foreground">
          Feed de notícias e contexto de mercado.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Últimas notícias</CardTitle>
            <CardDescription>Fontes crypto e mercado global.</CardDescription>
          </div>
          <Rss className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex h-56 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            Sem notícias carregadas
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
