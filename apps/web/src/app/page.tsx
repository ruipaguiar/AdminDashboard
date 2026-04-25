import { redirect } from "next/navigation";

export default function HomePage() {
  // TODO: quando NextAuth estiver setup, verificar sessão aqui.
  // Se autenticado → redirect para /crypto (módulo default).
  // Se não → redirect para /login.
  redirect("/login");
}
