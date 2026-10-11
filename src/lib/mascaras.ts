// Máscaras de digitação (PED-104): só formatam o que o atendente digita ou cola.
// Validar telefone e CEP é papel do backend, que normaliza tudo para só dígitos.

const CODIGO_PAIS_BRASIL = "55";
const DIGITOS_TELEFONE = 11;
const DIGITOS_CEP = 8;

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

// Mesmos prefixos que o backend aceita: "+55 …" e o zero de operadora ("(011) …").
// DDD 55 (ex.: Santa Maria) não é cortado: só remove com 12 ou 13 dígitos.
function semPrefixos(digitos: string): string {
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith(CODIGO_PAIS_BRASIL)) {
    return digitos.slice(CODIGO_PAIS_BRASIL.length);
  }

  if ((digitos.length === 11 || digitos.length === 12) && digitos.startsWith("0")) {
    return digitos.slice(1);
  }

  return digitos;
}

// "(11) 3456-7890" (fixo) ou "(11) 98765-4321" (celular), formatando enquanto digita.
export function mascararTelefone(valor: string): string {
  const digitos = semPrefixos(somenteDigitos(valor)).slice(0, DIGITOS_TELEFONE);

  if (digitos.length === 0) {
    return "";
  }

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);

  if (numero.length === 0) {
    return `(${ddd}`;
  }

  // Até 10 dígitos o hífen fica após o 4º número (fixo); com 11, após o 5º (celular).
  const tamanhoPrefixo = digitos.length === DIGITOS_TELEFONE ? 5 : 4;

  if (numero.length <= tamanhoPrefixo) {
    return `(${ddd}) ${numero}`;
  }

  return `(${ddd}) ${numero.slice(0, tamanhoPrefixo)}-${numero.slice(tamanhoPrefixo)}`;
}

// "01310-100", formatando enquanto digita.
export function mascararCep(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, DIGITOS_CEP);

  return digitos.length <= 5 ? digitos : `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}
