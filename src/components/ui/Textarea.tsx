import type { ReactNode, Ref, TextareaHTMLAttributes } from "react";
import { useId } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

// Campo <textarea> padronizado pelo guia visual (PED-132, PED-136): sempre em `text-campo`
// (16px, evitando zoom ao focar no Safari do iOS) e foco em `marca-*`.
export function Textarea({
  label,
  error,
  id,
  className = "",
  ref,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={textareaId}
        className="text-corpo font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-campo text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-2 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/60"
            : "border-slate-300 focus:border-marca-500 focus:ring-marca-500/20 dark:border-slate-700"
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-corpo text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
