// Endereço encontrado pelo CEP, independente do provedor (hoje o ViaCEP). As telas só
// conhecem este tipo, então trocar de provedor não mexe em tela (PED-106).
// Campos vazios ("") quando o provedor não tem o dado: CEP geral de cidade pequena vem sem
// logradouro e bairro, e o atendente preenche à mão.
export interface EnderecoCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}
