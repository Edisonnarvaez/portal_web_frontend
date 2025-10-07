import { Route, Routes, Navigate } from "react-router-dom";

// Aquí deberías importar tus páginas reales de administracion
// import ProveedoresDashboard from "./presentation/pages/AdministracionDashboard";

const AdministracionRoutes = () => (
  <Routes>
    {/* Ejemplo de ruta protegida */}
    {/* <Route path="dashboard" element={<AdministracionDashboard />} /> */}
    <Route path="*" element={<div>Bienvenido al módulo de Administracion</div>} />
  </Routes>
);

export default AdministracionRoutes;