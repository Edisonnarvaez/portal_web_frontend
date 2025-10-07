import FuncionariosPage from "../../apps/menu/presentation/pages/FuncionariosPage";
import ReconocimientosPage from "./presentation/pages/ReconocimientosPage";
import FelicitacionesPage from "./presentation/pages/FelicitacionesPage";

// Agregar en las rutas:
const menuRoutes = [
  {
    path: "funcionarios",
    element: <FuncionariosPage />
  },
  {
    path: '/reconocimientos',
    element: <ReconocimientosPage />
  },
  {
    path: '/felicitaciones',
    element: <FelicitacionesPage />
  }
];

export default menuRoutes;