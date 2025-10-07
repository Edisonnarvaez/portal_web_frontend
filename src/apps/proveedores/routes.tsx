import { Route, Routes, Navigate } from "react-router-dom";
import ProveedoresPage from "./presentation/pages/ProveedoresPage";
import FacturasPage from "./presentation/pages/FacturasPage";
import TercerosPage from "./presentation/pages/TercerosPage";

const ProveedoresRoutes = () => (
  <Routes>
    <Route path="/" element={<TercerosPage />} />
    <Route path="/terceros" element={<TercerosPage />} />
    <Route path="/proveedores" element={<ProveedoresPage />} />
    <Route path="/proveedores/facturas" element={<FacturasPage />} />
    <Route path="*" element={<div>Módulo de Terceros - Red Medicron IPS</div>} />
  </Routes>
);

export default ProveedoresRoutes;
