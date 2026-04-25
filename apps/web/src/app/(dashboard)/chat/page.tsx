import { MessageSquareText } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-normal">Chat IA</h1>
        <p className="text-sm text-muted-foreground">
          Conversa com contexto do portfolio e alertas.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Assistente</CardTitle>
            <CardDescription>
              Análise contextual do dashboard pessoal.
            </CardDescription>
          </div>
          <MessageSquareText className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            Sem conversas
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
