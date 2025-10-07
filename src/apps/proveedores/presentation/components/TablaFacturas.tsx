import { useEffect, useState } from "react";
import { FaFileInvoice } from "react-icons/fa";
import type { Factura } from "../../domain/entities/Factura";
import type { CentroOperaciones } from "../../domain/entities/CentroOperaciones";
import FacturaRow from "./FacturaRow";
import { EstadoFacturaRepository } from "../../infrastructure/repositories/EstadoFacturaRepository";
import type { EstadoFactura } from "../../domain/entities/EstadoFactura";
import { HiOutlineDocumentText } from "react-icons/hi";
import axiosInstance from "../../infrastructure/repositories/axiosInstance";

interface TablaFacturasProps {
  facturas: Factura[];
  onEdit: (factura: Factura) => void;
  onView: (factura: Factura) => void;
  onAdd: () => void;
  onDisable: (factura: Factura) => void;
  loading?: boolean;
}

export default function TablaFacturas({
  facturas,
  onEdit,
  onView,
  onAdd,
  onDisable,
  loading = false,
}: TablaFacturasProps) {
  const [estadosFactura, setEstadosFactura] = useState<EstadoFactura[]>([]);
  const [centrosDeOperaciones, setCentrosDeOperaciones] = useState<
    CentroOperaciones[]
  >([]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const repo = new EstadoFacturaRepository();
        const data = await repo.getAll();
        setEstadosFactura(data);
      } catch (error) {
        console.error("Error cargando estados de factura", error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        const res = await axiosInstance.get(
          "/gestionProveedores/centro_operaciones/"
        );
        setCentrosDeOperaciones(res.data);
      } catch (error) {
        console.error("Error cargando centros:", error);
      }
    };
    fetchCentros();
  }, []);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <HiOutlineDocumentText className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold dark:text-white">
            Facturas Electrónicas
          </h1>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          + Nueva Factura
        </button>
      </div>

      <div className="rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-700 dark:bg-[#0f172a] dark:text-blue-300 font-semibold">
            <tr>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                ID
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Centro de operaciones
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Etapa
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Fecha
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Estado factura
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Factura autorizada
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Concepto
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Razón social proveedor
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Razón social adquiriente
              </th>
              <th className="p-2 border border-blue-200 dark:border-blue-800">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => (
              <FacturaRow
                key={factura.factura_id}
                factura={factura}
                centros={centrosDeOperaciones}
                estadosFactura={estadosFactura}
                onEdit={onEdit}
                onView={onView}
                onDisable={onDisable}
              />
            ))}
          </tbody>
        </table>
      </div>

      {facturas.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-600 dark:text-gray-400">
          <FaFileInvoice className="w-10 h-10 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-base font-medium">No se encontraron facturas</p>
        </div>
      )}
    </div>
  );
}
