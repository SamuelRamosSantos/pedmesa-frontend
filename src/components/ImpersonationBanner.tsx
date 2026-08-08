import { ShieldAlert } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSuperAdminAuth } from "../contexts/SuperAdminAuthContext";

// Um super-admin "impersonando" um tenant tem as DUAS sessões ativas ao
// mesmo tempo (a própria + a do tenant que ele acessou) — nunca limpamos a
// sessão do super-admin ao entrar como tenant, exatamente pra permitir
// voltar sem precisar logar de novo. Login normal de tenant ou de
// super-admin nunca deixa as duas populadas simultaneamente.
export function ImpersonationBanner() {
  const { isAuthenticated: isTenantAuthenticated, logout: logoutTenant } = useAuth();
  const { isAuthenticated: isSuperAdminAuthenticated } = useSuperAdminAuth();

  const estaImpersonando = isTenantAuthenticated && isSuperAdminAuthenticated;

  if (!estaImpersonando) {
    return null;
  }

  function handleVoltar() {
    // Navegação de página cheia (não client-side) de propósito: limpar a
    // sessão do tenant e navegar via router no mesmo tick cria uma corrida
    // com o redirect próprio do ProtectedRoute da rota atual (que também
    // reage à sessão do tenant ter sumido) — o full reload elimina essa
    // corrida e sempre parte de um estado limpo.
    logoutTenant();
    window.location.href = "/admin";
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      <span>Modo Impersonation —</span>
      <button type="button" onClick={handleVoltar} className="underline underline-offset-2 hover:no-underline">
        Voltar ao Painel Admin
      </button>
    </div>
  );
}
