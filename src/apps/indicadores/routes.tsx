import { Routes, Route } from "react-router-dom";
import DashboardPage from "./presentation/pages/DashboardPage";
import IndicadoresPage from "./presentation/pages/IndicadoresPage";
import ResultadosPage from "./presentation/pages/ResultadosPage";
import Layout from "./presentation/components/Layout";

const IndicadoresRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/indicators" element={<IndicadoresPage />} />
      <Route path="/results" element={<ResultadosPage />} />
    </Routes>
  </Layout>
);

export default IndicadoresRoutes;