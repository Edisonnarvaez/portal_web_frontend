import { Route, Routes } from "react-router-dom";
import ProcesosPage from "./presentation/pages/ProcesosPage";
import DashboardProcesosPage from "./presentation/pages/DashboardProcesosPage";

const ProcesosRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={<DashboardProcesosPage />} />
    <Route path="/" element={<ProcesosPage />} />
    <Route path="/*" element={<ProcesosPage />} />
  </Routes>
);

export default ProcesosRoutes;