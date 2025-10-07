import { Route, Routes } from "react-router-dom";
import ProcesosPage from "./presentation/pages/ProcesosPage";

const ProcesosRoutes = () => (
  <Routes>
    <Route path="/*" element={<ProcesosPage />} />
  </Routes>
);

export default ProcesosRoutes;