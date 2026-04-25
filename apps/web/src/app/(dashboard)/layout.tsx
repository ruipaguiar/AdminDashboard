import Link from "next/link";

/**
 * Layout do dashboard. Sidebar lista os módulos disponíveis.
 * Adicionar módulos novos é só adicionar entradas em `modules`.
 */
const modules = [
  { href: "/crypto", label: "Crypto", icon: "₿" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/chat", label: "Chat IA", icon: "💬" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-bold">Admin</h1>
        </div>
        <nav className="space-y-1 p-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="text-lg">{m.icon}</span>
              {m.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
