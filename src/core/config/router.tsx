import { Navigate, useRoutes } from "react-router-dom";
import { useAuthContext } from "../../apps/auth/presentation/context/AuthContext";
import AuthRoutes from "../../apps/auth/routes";
import { AuthGuard } from "./authGuard";
import MainLayout from "../presentation/layouts/MainLayout";
import MenuPage from "../../apps/menu/presentation/pages/MenuPage";
import ProfilePage from "../../apps/auth/presentation/pages/ProfilePage";
import AuditoriasPage from "../../apps/auditorias/presentation/pages/AuditoriasPage";
import AdministracionPage from "../../apps/administracion/presentation/pages/AdministracionPage";
import NoticiasPage from "../../apps/menu/presentation/pages/NoticiasPage";
import EventosPage from "../../apps/menu/presentation/pages/EventosPage";
import FuncionariosPage from "../../apps/menu/presentation/pages/FuncionariosPage";
import ReconocimientosPage from "../../apps/menu/presentation/pages/ReconocimientosPage";
import FelicitacionesPage from "../../apps/menu/presentation/pages/FelicitacionesPage";
import DashboardPage from "../../apps/indicadores/presentation/pages/DashboardPage";
import IndicadoresPage from "../../apps/indicadores/presentation/pages/IndicadoresPage";
import ResultadosPage from "../../apps/indicadores/presentation/pages/ResultadosPage";
import ProcesosRoutes from "../../apps/procesos/routes";
import About from "../../core/presentation/pages/About";

export default function AppRouter() {
  const { isAuthenticated} = useAuthContext();

  const routes = useRoutes([
    {
      path: "/auth/*",
      element: <AuthRoutes />,
    },
    
    {
      path: "/",
      element: (
        <AuthGuard isAuthenticated={isAuthenticated} redirectTo="/auth/login">
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: "/",
          element: <Navigate to="/menu" replace />,
        },
        { path: "menu", element: <MenuPage /> },
        { path: "eventos", element: <EventosPage /> },
        { path: "eventos/:id", element: <EventosPage /> },
        { path: "noticias", element: <NoticiasPage /> },
        { path: "noticias/:id", element: <NoticiasPage /> },
        { path: "funcionarios", element: <FuncionariosPage /> },
        { path: "reconocimientos", element: <ReconocimientosPage /> },
        { path: "felicitaciones", element: <FelicitacionesPage /> },
        { path: "profile", element: <ProfilePage /> },
        { path: "auditorias", element: <AuditoriasPage /> },
        { path: "dashboard", element: <DashboardPage /> },
        { path: "indicators", element: <IndicadoresPage /> },
        { path: "results", element: <ResultadosPage /> },
        { path: "procesos/*", element: <ProcesosRoutes /> },
        { path: "administracion", element: <AdministracionPage /> },
        { path: "acerca_de", element: <About /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/auth/login" replace />,
    },
  ]);

  return routes;
}