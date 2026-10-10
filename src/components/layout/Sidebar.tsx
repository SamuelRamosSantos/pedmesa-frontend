import {
  Building2,
  ChefHat,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Truck,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logoIcon from "../../assets/logo-icon.svg";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_VIEW_INFO } from "../../lib/role-routes";
import type { UserRole } from "../../types/auth";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

const ROLE_ICON: Record<UserRole, LucideIcon> = {
  admin: LayoutDashboard,
  garcom: UtensilsCrossed,
  cozinha: ChefHat,
  caixa: Building2,
  expedicao: Truck,
};

const ADMIN_SUBITENS: { label: string; route: string; icon: LucideIcon }[] = [
  { label: "Produtos", route: "/admin/produtos", icon: Package },
  { label: "Usuários", route: "/admin/usuarios", icon: Users },
  { label: "Configurações", route: "/admin/configuracoes", icon: Settings },
];

type SidebarMode = "mobile" | "expanded" | "collapsed";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDesktopExpanded: boolean;
  onToggleDesktop: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile, isDesktopExpanded, onToggleDesktop }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return null;
  }

  function podeAcessar(role: UserRole) {
    return user!.roles.includes(role) || user!.roles.includes("admin");
  }

  const itensTrocarVisao = Object.values(ROLE_VIEW_INFO).filter((item) => podeAcessar(item.role));
  const ehAdmin = user.roles.includes("admin");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function navItemClass(ativo: boolean, collapsed: boolean) {
    return `flex items-center rounded-lg text-sm font-medium transition-colors ${
      collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
    } ${
      ativo
        ? "bg-orange-600 text-white"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;
  }

  function renderContent(mode: SidebarMode) {
    const collapsed = mode === "collapsed";
    const onNavigated = mode === "mobile" ? onCloseMobile : () => {};

    return (
      <div className="flex h-full flex-col bg-white dark:bg-slate-900">
        <div
          className={`flex items-center border-b border-slate-200 py-5 dark:border-slate-800 ${
            collapsed ? "justify-center px-2" : "gap-3 px-5"
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleDesktop}
              aria-label="Expandir menu"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : (
            <>
              <img src={logoIcon} alt="PedMesa" className="h-10 w-10 rounded-xl" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">PedMesa</span>
              <button
                type="button"
                onClick={mode === "mobile" ? onCloseMobile : onToggleDesktop}
                aria-label={mode === "mobile" ? "Fechar menu" : "Recolher menu"}
                className="ml-auto rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
          {!collapsed && (
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Trocar visão
            </p>
          )}
          <div className={`flex flex-col gap-1 ${collapsed ? "" : "mt-2"}`}>
            {itensTrocarVisao.map((item) => {
              const Icon = ROLE_ICON[item.role];
              const ativo = location.pathname === item.route;

              return (
                <button
                  key={item.route}
                  type="button"
                  title={collapsed ? item.label : undefined}
                  onClick={() => {
                    navigate(item.route);
                    onNavigated();
                  }}
                  className={navItemClass(ativo, collapsed)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </button>
              );
            })}
          </div>

          {ehAdmin && (
            <>
              {collapsed ? (
                <div className="my-3 border-t border-slate-200 dark:border-slate-800" />
              ) : (
                <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Administração
                </p>
              )}
              <div className={`flex flex-col gap-1 ${collapsed ? "" : "mt-2"}`}>
                {ADMIN_SUBITENS.map((item) => {
                  const Icon = item.icon;
                  const ativo = location.pathname === item.route;

                  return (
                    <button
                      key={item.route}
                      type="button"
                      title={collapsed ? item.label : undefined}
                      onClick={() => {
                        navigate(item.route);
                        onNavigated();
                      }}
                      className={navItemClass(ativo, collapsed)}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && item.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        <div
          className={`border-t border-slate-200 dark:border-slate-800 ${
            collapsed ? "flex flex-col items-center gap-2 p-3" : "p-4"
          }`}
        >
          {collapsed ? (
            <>
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sair"
                title="Sair"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user!.nome}</p>
              <div className="mt-3 flex items-center gap-2">
                <ThemeToggle />
                <Button variant="secondary" onClick={handleLogout} className="flex-1">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:border-r lg:border-slate-200 dark:lg:border-slate-800 ${
          isDesktopExpanded ? "lg:w-64" : "lg:w-20"
        }`}
      >
        {renderContent(isDesktopExpanded ? "expanded" : "collapsed")}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onCloseMobile} aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 z-50 w-72 shadow-xl">{renderContent("mobile")}</div>
        </div>
      )}
    </>
  );
}
