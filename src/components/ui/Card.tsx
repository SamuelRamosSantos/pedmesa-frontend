import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgb(0_0_0_/0.06)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
