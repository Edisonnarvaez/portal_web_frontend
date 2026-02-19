import { Route, Routes } from "react-router-dom";
import HabilitacionPage from "./presentation/pages/HabilitacionPage";
import DashboardHabilitacionPage from "./presentation/pages/DashboardHabilitacionPage";
import DashboardHabilitacionPageEnhanced from "./presentation/pages/DashboardHabilitacionPageEnhanced";
import PrestadorDetailPage from "./presentation/pages/PrestadorDetailPage";
import AutoevaluacionEditorPage from "./presentation/pages/AutoevaluacionEditorPage";
import CumplimientoPanelPage from "./presentation/pages/CumplimientoPanelPage";
import PlanesMejoraPage from "./presentation/pages/PlanesMejoraPage";
import HallazgosPage from "./presentation/pages/HallazgosPage";
import ReporteCumplimientoPage from "./presentation/pages/ReporteCumplimientoPage";
import ComparativaPeriodosPage from "./presentation/pages/ComparativaPeriodosPage";
import AlertasHabilitacionPage from "./presentation/pages/AlertasHabilitacionPage";

const HabilitacionRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={<DashboardHabilitacionPageEnhanced />} />
    <Route path="/dashboard-basic" element={<DashboardHabilitacionPage />} />
    <Route path="/prestador/:id" element={<PrestadorDetailPage />} />
    <Route path="/autoevaluacion/:id" element={<AutoevaluacionEditorPage />} />
    <Route path="/cumplimientos" element={<CumplimientoPanelPage />} />
    <Route path="/planes-mejora" element={<PlanesMejoraPage />} />
    <Route path="/hallazgos" element={<HallazgosPage />} />
    <Route path="/reportes" element={<ReporteCumplimientoPage />} />
    <Route path="/comparativa" element={<ComparativaPeriodosPage />} />
    <Route path="/alertas" element={<AlertasHabilitacionPage />} />
    <Route path="/" element={<HabilitacionPage />} />
    <Route path="/*" element={<HabilitacionPage />} />
  </Routes>
);

export default HabilitacionRoutes;
