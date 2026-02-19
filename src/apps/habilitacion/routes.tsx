import { Route, Routes } from "react-router-dom";
import HabilitacionPage from "./presentation/pages/HabilitacionPage";
import DashboardHabilitacionPage from "./presentation/pages/DashboardHabilitacionPage";

const HabilitacionRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={<DashboardHabilitacionPage />} />
    <Route path="/" element={<HabilitacionPage />} />
    <Route path="/*" element={<HabilitacionPage />} />
  </Routes>
);

export default HabilitacionRoutes;
