import { useId } from "react";
import type { ChangeEvent } from "react";

interface CurrencyInputProps {
  label: string;
  valueCents: number;
  onChangeCents: (cents: number) => void;
  error?: string;
  id?: string;
  autoFocus?: boolean;
}

const LIMITE_CENTS = 99_999_999_99;

// Máscara "xx,xx" no estilo de digitação bancária: cada dígito novo entra pela
// direita e empurra os anteriores, então o valor exibido nunca fica num estado
// inválido (sem múltiplas vírgulas, sem letras, sempre com 2 casas decimais).
export function CurrencyInput({ label, valueCents, onChangeCents, error, id, autoFocus }: CurrencyInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const somenteDigitos = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    const cents = somenteDigitos === "" ? 0 : Number.parseInt(somenteDigitos, 10);
    onChangeCents(Math.min(cents, LIMITE_CENTS));
  }

  const reais = Math.floor(valueCents / 100);
  const centavos = String(valueCents % 100).padStart(2, "0");
  const displayValue = `${reais.toLocaleString("pt-BR")},${centavos}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400 dark:text-slate-500">
          R$
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          value={displayValue}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:ring-2 dark:bg-slate-800 dark:text-white ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/60"
              : "border-slate-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-slate-700"
          }`}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
