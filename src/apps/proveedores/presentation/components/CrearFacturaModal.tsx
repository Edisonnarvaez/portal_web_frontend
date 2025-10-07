import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import type { RegistroFactura } from "./VerRegistroFacturaModal";
import { FacturaDetalleRepository } from "../../infrastructure/repositories/FacturaDetalleRepository";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const CrearFacturaModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [factura, setFactura] = useState<
    Partial<RegistroFactura> & { factura_estado_factura_id?: number }
  >({});

  const [centrosOperaciones, setCentrosOperaciones] = useState([]);
  const [estadosFactura, setEstadosFactura] = useState([]);
  const [causales, setCausales] = useState([]);
  const [detalle, setDetalle] = useState({
    descripcionFactura: "",
    observacionesGestion: "",
    observacionesInconsistencias: "",
    observacionesConformidad: "",
    observacionesPago: "",
    observacionesContabilidad: "",
    observacionesRevision: "",
    observacionesImpuestos: "",
    observacionesContraloria: "",
    estado: "Pendiente",
  });

  useEffect(() => {
    if (open) {
      axiosInstance
        .get("/gestionProveedores/centro_operaciones/")
        .then((res) => setCentrosOperaciones(res.data));
      axiosInstance
        .get("/gestionProveedores/estado_facturas/")
        .then((res) => setEstadosFactura(res.data));
      axiosInstance
        .get("/gestionProveedores/causales_devolucion/")
        .then((res) => setCausales(res.data));
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFactura((prev) => ({
      ...prev,
      [name]: name === "factura_estado_factura_id" ? Number(value) : value,
    }));
  };

  const handleDetalleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDetalle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const facturaResponse = await axiosInstance.post(
        "/gestionProveedores/factura/",
        factura
      );

      const detalleData = new FormData();
      Object.entries(detalle).forEach(([key, val]) =>
        detalleData.append(key, val)
      );
      detalleData.append("factura", String(facturaResponse.data.factura_id));

      const detalleRepo = new FacturaDetalleRepository();
      await detalleRepo.create(detalleData);

      alert("Factura y detalle creados exitosamente");
      onCreated();
      onClose();
    } catch (error: any) {
      console.error("ERROR DETALLADO:", error?.response?.data || error.message);
      alert(
        "Error creando factura o detalle. Ver consola para más información."
      );
    }
  };

  if (!open) return null;

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto px-6 py-4 pb-20 bg-white dark:bg-[#1e293b] border border-blue-200 dark:border-blue-800 text-black dark:text-white">
      <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
        Nueva Factura
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          name="factura_id_factura_electronica"
          placeholder="ID factura electrónica"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          name="factura_etapa"
          placeholder="Etapa"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          name="factura_fecha"
          type="date"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          name="factura_numero_autorizacion"
          placeholder="Nro Autorización"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          name="factura_concepto"
          placeholder="Concepto"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          name="factura_razon_social_proveedor"
          placeholder="Razón Social Proveedor"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          name="factura_razon_social_adquiriente"
          placeholder="Razón Social Adquiriente"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          name="factura_valor"
          placeholder="Valor"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado de la Factura
          </label>
          <div className="flex justify-end gap-4 mt-4">
            {estadosFactura.map((estado: any) => (
              <label
                key={estado.estado_id}
                className="flex items-center gap-2 text-sm text-black dark:text-white"
              >
                <input
                  type="radio"
                  name="factura_estado_factura_id"
                  value={estado.estado_id}
                  checked={
                    factura.factura_estado_factura_id === estado.estado_id
                  }
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span>{estado.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <select
          name="factura_centro_operaciones"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        >
          <option value="">Seleccione centro operaciones</option>
          {centrosOperaciones.map((c: any) => (
            <option key={c.operaciones_id} value={c.operaciones_id}>
              {c.operaciones_nombre}
            </option>
          ))}
        </select>

        <select
          name="causal_anulacion"
          onChange={handleChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        >
          <option value="">Causal Anulación</option>
          {causales.map((c: any) => (
            <option key={c.causalid} value={c.causalid}>
              {c.causal_nombre}
            </option>
          ))}
        </select>

        <div className="col-span-2 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
            Detalle de la Factura
          </h3>
          {Object.entries(detalle).map(([key, val]) =>
            key !== "estado" ? (
              <textarea
                key={key}
                name={key}
                value={val ?? ""}
                placeholder={key}
                onChange={handleDetalleChange}
                className="w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            ) : null
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default CrearFacturaModal;
