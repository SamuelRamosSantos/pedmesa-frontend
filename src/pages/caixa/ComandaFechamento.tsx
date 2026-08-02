import { useParams } from "react-router-dom";
import { PlaceholderPage } from "../../components/PlaceholderPage";

export function ComandaFechamento() {
  const { id } = useParams<{ id: string }>();

  return (
    <PlaceholderPage
      title="Fechamento de Conta"
      description={`Aqui o caixa vai ver o extrato e fechar a comanda ${id}. Em construção (PED-19).`}
    />
  );
}
