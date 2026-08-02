import { useParams } from "react-router-dom";
import { PlaceholderPage } from "../../components/PlaceholderPage";

export function ComandaDetalhe() {
  const { id } = useParams<{ id: string }>();

  return (
    <PlaceholderPage
      title="Comanda"
      description={`Aqui o garçom vai lançar os pedidos da comanda ${id}. Em construção (PED-17).`}
    />
  );
}
