import React from "react";

type FacturaElectronicaDetalle = {
  descripcionFactura?: string;
  observacionesGestion?: string;
  observacionesInconsistencias?: string;
  observacionesConformidad?: string;
  observacionesPago?: string;
  observacionesContabilidad?: string;
  observacionesRevision?: string;
  observacionesImpuestos?: string;
  observacionesContraloria?: string;
};

export type RegistroFactura = {
  factura_id: number;
  factura_id_factura_electronica?: string;
  factura_etapa?: string;
  factura_fecha?: string;
  factura_numero_autorizacion?: string;
  factura_concepto?: string;
  factura_razon_social_proveedor?: string;
  factura_razon_social_adquiriente?: string;
  factura_valor?: string;
  factura_centro_operaciones?: string;
  factura_centro_operaciones_nombre?: string;
  factura_centro_costo?: string;
  factura_centro_costo_nombre?: string;
  factura_estado_factura?: {
    estado_id: number;
    nombre: string;
  };
  causal_anulacion?: string;
  causal_anulacion_nombre?: string;
  causal_contabilidad?: string;
  causal_contabilidad_nombre?: string;
  causal_revision?: string;
  causal_revision_nombre?: string;
  causal_impuestos?: string;
  causal_impuestos_nombre?: string;
  detalles?: FacturaElectronicaDetalle[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  registroFactura: RegistroFactura | null;
};

const fieldLabels: Record<string, string> = {
  descripcionFactura: "Descripción Factura",
  observacionesGestion: "Observaciones Gestión",
  observacionesInconsistencias: "Observaciones Inconsistencias",
  observacionesConformidad: "Observaciones Conformidad",
  observacionesPago: "Observaciones Pago",
  observacionesContabilidad: "Observaciones Contabilidad",
  observacionesRevision: "Observaciones Revisión",
  observacionesImpuestos: "Observaciones Impuestos",
  observacionesContraloria: "Observaciones Contraloría",
};

const Highlighted: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-green-200 text-green-900 font-semibold px-1 rounded">
    {children}
  </span>
);

const VerRegistroFacturaModal: React.FC<Props> = ({
  open,
  onClose,
  registroFactura,
}) => {
  if (!open || !registroFactura) return null;

  const renderField = (
    label: string,
    value?: string | number | boolean,
    highlight = true
  ) => (
    <div>
      <span className="text-gray-800 dark:text-gray-200 inline-block">
        {label}:{" "}
        {highlight ? (
          <Highlighted>{value || "-"}</Highlighted>
        ) : (
          <span>{value || "-"}</span>
        )}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
          Factura Electrónica, Ver registro{" "}
          <span className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
            [ID: {registroFactura.factura_id}]
          </span>
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {renderField(
            "Centro de operaciones",
            registroFactura.factura_centro_operaciones_nombre,
            false
          )}
          {renderField("ID", registroFactura.factura_id)}
          {renderField("Etapa", registroFactura.factura_etapa)}
          {renderField(
            "Factura Autorizada",
            registroFactura.factura_numero_autorizacion
          )}
          {renderField(
            "Estado de la Factura",
            registroFactura.factura_estado_factura?.nombre
          )}
          {renderField(
            "Razon Social Adquiriente",
            registroFactura.factura_razon_social_adquiriente
          )}
          {renderField(
            "Razon Social Proveedor",
            registroFactura.factura_razon_social_proveedor
          )}
          {renderField(
            "Centro de costos",
            registroFactura.factura_centro_costo_nombre,
            false
          )}
          {renderField("Valor", registroFactura.factura_valor)}
          {renderField("Concepto", registroFactura.factura_concepto)}
          {renderField(
            "Causal Devolución y/o Anulación",
            registroFactura.causal_anulacion_nombre,
            false
          )}
          {renderField(
            "Causal Devolución Revisión",
            registroFactura.causal_revision_nombre,
            false
          )}
          {renderField("Fecha Factura", registroFactura.factura_fecha)}
          {renderField(
            "Causal Devolución Impuestos",
            registroFactura.causal_impuestos_nombre,
            false
          )}
          {renderField(
            "Causal Devolución Contabilidad",
            registroFactura.causal_contabilidad_nombre,
            false
          )}
        </div>

        {registroFactura.detalles?.length ? (
          registroFactura.detalles.map((detalle, index) => (
            <table
              key={index}
              className="w-full mb-6 border border-gray-300 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200"
            >
              <tbody>
                {Object.entries(detalle)
                  .filter(([key]) => !["id", "factura", "estado"].includes(key))
                  .map(([key, val]) => (
                    <React.Fragment key={key}>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <td className="p-3 font-semibold">
                          {fieldLabels[key] || key}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <td className="p-3">{val || "-"}</td>
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            No hay detalles registrados.
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerRegistroFacturaModal;
