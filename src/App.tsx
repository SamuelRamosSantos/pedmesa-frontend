import { Navigate, Route, Routes } from "react-router-dom";
import { ImpersonationBanner } from "./components/ImpersonationBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SuperAdminProtectedRoute } from "./components/SuperAdminProtectedRoute";
import { ConfiguracoesEmpresa } from "./pages/admin/ConfiguracoesEmpresa";
import { DashboardProprietario } from "./pages/admin/DashboardProprietario";
import { Produtos } from "./pages/admin/Produtos";
import { Usuarios } from "./pages/admin/Usuarios";
import { ComandaFechamento } from "./pages/caixa/ComandaFechamento";
import { MapaMesas } from "./pages/caixa/MapaMesas";
import { PreContaImpressao } from "./pages/caixa/PreContaImpressao";
import { Kds } from "./pages/cozinha/Kds";
import { ComandaDetalhe } from "./pages/garcom/ComandaDetalhe";
import { Mesas } from "./pages/garcom/Mesas";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { SelecionarVisao } from "./pages/SelecionarVisao";
import { PainelLeads } from "./pages/superadmin/PainelLeads";
import { PainelSuperAdmin } from "./pages/superadmin/PainelSuperAdmin";
import { Unauthorized } from "./pages/Unauthorized";

function App() {
  return (
    <>
      <ImpersonationBanner />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/selecionar-visao"
          element={
            <ProtectedRoute>
              <SelecionarVisao />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <SuperAdminProtectedRoute>
              <PainelSuperAdmin />
            </SuperAdminProtectedRoute>
          }
        />

        <Route
          path="/admin/leads"
          element={
            <SuperAdminProtectedRoute>
              <PainelLeads />
            </SuperAdminProtectedRoute>
          }
        />

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

        <Route
          path="/caixa/comanda/:id/preconta"
          element={
            <ProtectedRoute allowedRoles={["caixa", "admin"]}>
              <PreContaImpressao />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardProprietario />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Produtos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/configuracoes"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ConfiguracoesEmpresa />
            </ProtectedRoute>
          }
        />

        <Route path="/nao-autorizado" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
