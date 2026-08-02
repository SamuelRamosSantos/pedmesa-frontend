import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ComandaFechamento } from "./pages/caixa/ComandaFechamento";
import { MapaMesas } from "./pages/caixa/MapaMesas";
import { Kds } from "./pages/cozinha/Kds";
import { ComandaDetalhe } from "./pages/garcom/ComandaDetalhe";
import { Mesas } from "./pages/garcom/Mesas";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Unauthorized } from "./pages/Unauthorized";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/garcom/mesas"
        element={
          <ProtectedRoute allowedRoles={["garcom", "admin"]}>
            <Mesas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/garcom/comanda/:id"
        element={
          <ProtectedRoute allowedRoles={["garcom", "admin"]}>
            <ComandaDetalhe />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cozinha/kds"
        element={
          <ProtectedRoute allowedRoles={["cozinha", "admin"]}>
            <Kds />
          </ProtectedRoute>
        }
      />

      <Route
        path="/caixa/mapa-mesas"
        element={
          <ProtectedRoute allowedRoles={["caixa", "admin"]}>
            <MapaMesas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/caixa/comanda/:id/fechamento"
        element={
          <ProtectedRoute allowedRoles={["caixa", "admin"]}>
            <ComandaFechamento />
          </ProtectedRoute>
        }
      />

      <Route path="/nao-autorizado" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
