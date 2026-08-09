import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

const SIDEBAR_EXPANDED_STORAGE_KEY = "pedmesa-sidebar-expanded";

function getStoredExpanded(): boolean {
  return localStorage.getItem(SIDEBAR_EXPANDED_STORAGE_KEY) !== "false";
}

interface AppShellHelpers {
  openSidebar: () => void;
}

interface AppShellProps {
  children: (helpers: AppShellHelpers) => ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(getStoredExpanded);

  function toggleDesktop() {
    setIsDesktopExpanded((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_EXPANDED_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className={`min-h-svh bg-slate-50 dark:bg-slate-950 ${isDesktopExpanded ? "lg:pl-64" : "lg:pl-20"}`}>
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isDesktopExpanded={isDesktopExpanded}
        onToggleDesktop={toggleDesktop}
      />
      {children({ openSidebar: () => setIsMobileOpen(true) })}
    </div>
  );
}
