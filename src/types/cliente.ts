// Espelho de cliente.mapper.ts do backend (PED-105).

export interface EnderecoCliente {
  id: string;
  // Só dígitos (8); a máscara é aplicada na tela.
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  referencia: string | null;
  principal: boolean;
  criado_em: string;
}

export interface Cliente {
  id: string;
  nome: string;
  // Só dígitos com DDD (10 ou 11); a máscara é aplicada na tela.
  telefone: string;
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  enderecos: EnderecoCliente[];
}

// GET /clientes?busca=&pagina=&por_pagina= (PED-122).
export interface ListaClientes {
  clientes: Cliente[];
  total: number;
  pagina: number;
  por_pagina: number;
}
