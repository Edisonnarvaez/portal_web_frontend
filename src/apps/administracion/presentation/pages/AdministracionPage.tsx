import { useState } from "react";
import InformacionEmpresa from "../components/InformacionEmpresa";
import SedesEmpresa from "../components/SedesEmpresa";
import AreasEmpresa from "../components/AreasEmpresa";
import TiposProceso from "../components/TiposProceso";
import Procesos from "../components/Procesos";

const TABS = [
  { label: "Empresa", value: "empresa" },
  { label: "Sedes", value: "sedes" },
  { label: "Áreas", value: "areas" },
  { label: "Tipos de Proceso", value: "tipos-proceso" },
  { label: "Procesos", value: "procesos" },
  // { label: "Usuarios", value: "usuarios" }, // Ejemplo para futuro
];

export default function AdministracionPage() {
  const [tab, setTab] = useState("empresa");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Administración General
      </h1>
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              tab === t.value
                ? "border-blue-600 text-blue-600 dark:text-blue-300"
                : "border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {tab === "empresa" && <InformacionEmpresa />}
        {tab === "sedes" && <SedesEmpresa />}
        {tab === "areas" && <AreasEmpresa />}
        {tab === "tipos-proceso" && <TiposProceso />}
        {tab === "procesos" && <Procesos />}
        {/* {tab === "usuarios" && <UsuariosGlobales />} */}
      </div>
    </div>
  );
}