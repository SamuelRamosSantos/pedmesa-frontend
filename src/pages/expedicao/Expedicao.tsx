import { Menu, Truck } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell";

// Página provisória da visão de expedição (PED-113): existe para o papel novo ter um
// destino válido no login e no menu. O painel Kanban de verdade chega no PED-110.
export function Expedicao() {
  return (
    <AppShell>
      {({ openSidebar }) => (
        <>
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Abrir menu"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Expedição</p>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Painel de expedição</h1>
            </div>
          </header>

          <main
            data-testid="expedicao-em-breve"
            className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center"
          >
            <Truck className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            <p className="font-semibold text-slate-900 dark:text-white">O painel de expedição está em construção.</p>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Aqui vão aparecer os pedidos de delivery em produção, prontos para envio e em rota.
            </p>
          </main>
        </>
      )}
    </AppShell>
  );
}
