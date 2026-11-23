import type { ComponentType } from "react";
import { NumeroDestaque } from "../../../components/ui/NumeroDestaque";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-600 dark:bg-marca-950/40 dark:text-marca-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <NumeroDestaque>{value}</NumeroDestaque>
        <p className="text-corpo text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}
