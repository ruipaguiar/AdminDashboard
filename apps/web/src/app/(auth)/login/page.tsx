export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm dark:bg-slate-900">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Entra na tua conta para continuar
          </p>
        </div>

        {/* TODO: implementar formulário de login com NextAuth (ver prompts/03-auth-jwt.md) */}
        <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          ⚠ Formulário de login a implementar.
          <br />
          Ver <code>prompts/03-auth-jwt.md</code> para instruções.
        </div>
      </div>
    </div>
  );
}
