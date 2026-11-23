// Navegação por teclado em formulários operados sem mouse (novo pedido delivery, PED-109).

type Campo = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const SELETOR_CAMPOS = "input:not([type='hidden']), select, textarea";

function navegavel(campo: Campo): boolean {
  // getClientRects vazio = campo oculto (display: none ou fora da tela montada).
  return !campo.disabled && campo.getClientRects().length > 0;
}

// Um grupo de radios conta como um campo só (como no Tab): o marcado, ou o primeiro.
function representaSeuGrupo(campo: Campo, campos: readonly Campo[]): boolean {
  if (
    !(campo instanceof HTMLInputElement) ||
    campo.type !== "radio" ||
    campo.name === ""
  ) {
    return true;
  }

  const grupo = campos.filter(
    (outro) =>
      outro instanceof HTMLInputElement &&
      outro.type === "radio" &&
      outro.name === campo.name,
  );
  const marcado = grupo.find(
    (radio) => radio instanceof HTMLInputElement && radio.checked,
  );

  return campo === (marcado ?? grupo[0]);
}

// Leva o foco ao próximo campo depois de `atual` dentro de `raiz` (botões ficam de fora:
// o Enter neles continua clicando). Devolve false quando não há próximo campo.
export function focarProximoCampo(raiz: HTMLElement, atual: Element): boolean {
  const todos = Array.from(raiz.querySelectorAll<Campo>(SELETOR_CAMPOS)).filter(
    navegavel,
  );
  const campos = todos.filter((campo) => representaSeuGrupo(campo, todos));
  const indiceAtual = todos.findIndex((campo) => campo === atual);
  const proximo = campos.find((campo) => todos.indexOf(campo) > indiceAtual);

  proximo?.focus();
  return proximo !== undefined;
}
