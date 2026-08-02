import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ComponentType } from "react";
import type { ToastMessage, ToastVariant } from "../../types/toast";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-slate-50 text-slate-800 border-slate-200",
};

const VARIANT_ICONS: Record<ToastVariant, ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm">
      {toasts.map((toast) => {
        const Icon = VARIANT_ICONS[toast.variant];

        return (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${VARIANT_STYLES[toast.variant]}`}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-0.5 hover:bg-black/5"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
