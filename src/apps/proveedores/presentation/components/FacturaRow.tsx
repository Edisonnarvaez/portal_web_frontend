import type { Factura } from "../../domain/entities/Factura";
import type { CentroOperaciones } from "../../domain/entities/CentroOperaciones";
import type { EstadoFactura } from "../../domain/entities/EstadoFactura";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

interface FacturaRowProps {
  factura: Factura;
  centros: CentroOperaciones[];
  estadosFactura: EstadoFactura[];
  onEdit: (factura: Factura) => void;
  onView: (factura: Factura) => void;
  onDisable: (factura: Factura) => void;
}

export default function FacturaRow({
  factura,
  centros,
  estadosFactura,
  onEdit,
  onView,
  onDisable,
}: FacturaRowProps) {
  const centroNombre =
    centros.find((c) => c.operaciones_id === factura.factura_centro_operaciones)
      ?.operaciones_nombre || "N/A";

  const estadoFacturaNombre = estadosFactura.find(
    (e) =>
      e.estado_id ===
      (typeof factura.factura_estado_factura === "object"
        ? (factura.factura_estado_factura as EstadoFactura).estado_id
        : factura.factura_estado_factura)
  );

  const cellStyle =
    "p-2 border border-blue-200 dark:border-blue-800 whitespace-nowrap text-gray-900 dark:text-white";

  return (
    <tr className="hover:bg-blue-50 dark:hover:bg-[#151f38] transition-colors text-sm">
      <td className={cellStyle}>{factura.factura_id}</td>

      <td
        className={cellStyle + " max-w-[200px] truncate"}
        title={centroNombre}
      >
        {centroNombre}
      </td>

      <td
        className={cellStyle + " max-w-[200px] truncate"}
        title={factura.factura_etapa ?? "N/A"}
      >
        {factura.factura_etapa || "N/A"}
      </td>

      <td className={cellStyle}>{factura.factura_fecha || "N/A"}</td>

      <td className="p-2 border border-blue-200 dark:border-blue-800 text-center">
        {estadoFacturaNombre ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap">
            {estadoFacturaNombre.nombre}
          </span>
        ) : (
          <span className="text-gray-900 dark:text-white">N/A</span>
        )}
      </td>

      <td className={cellStyle}>
        {factura.factura_numero_autorizacion ?? "N/A"}
      </td>

      <td
        className={cellStyle + " max-w-[200px] truncate"}
        title={factura.factura_concepto ?? "N/A"}
      >
        {factura.factura_concepto || "N/A"}
      </td>

      <td
        className={cellStyle + " max-w-[200px] truncate"}
        title={factura.factura_razon_social_proveedor ?? "N/A"}
      >
        {factura.factura_razon_social_proveedor || "N/A"}
      </td>

      <td
        className={cellStyle + " max-w-[200px] truncate"}
        title={factura.factura_razon_social_adquiriente ?? "N/A"}
      >
        {factura.factura_razon_social_adquiriente || "N/A"}
      </td>

      <td className="p-2 border border-blue-200 dark:border-blue-800 whitespace-nowrap text-center space-x-2">
        <button
          onClick={() => onView(factura)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          title="Ver"
        >
          <FaEye />
        </button>
        <button
          onClick={() => onEdit(factura)}
          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
          title="Editar"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDisable(factura)}
          className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
          title="Desactivar"
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
}
