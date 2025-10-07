import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import type { RegistroFactura } from "./VerRegistroFacturaModal";
import type { EstadoFactura } from "../../domain/entities/EstadoFactura";
import { FacturaDetalleRepository } from "../../infrastructure/repositories/FacturaDetalleRepository";

type DetalleFactura = {
  id?: number;
  observacionesGestion: string | null;
  factura?: number;
  [key: string]: any;
};

type Props = {
  open: boolean;
  factura: RegistroFactura;
  onClose: () => void;
  onUpdated: () => void;
};

const EditarFacturaModal: React.FC<Props> = ({
  open,
  factura,
  onClose,
  onUpdated,
}) => {
  const [form, setForm] = useState<Partial<RegistroFactura>>({});
  const [detalle, setDetalle] = useState<DetalleFactura>({
    observacionesGestion: "",
  });
  const [centrosOperaciones, setCentrosOperaciones] = useState([]);
  const [estadosFactura, setEstadosFactura] = useState<EstadoFactura[]>([]);
  const [causales, setCausales] = useState([]);

  useEffect(() => {
    if (open && factura?.factura_id) {
      setForm(factura);

      axiosInstance
        .get("/gestionProveedores/centro_operaciones/")
        .then((res) => {
          setCentrosOperaciones(res.data);
          if (!factura.factura_centro_operaciones && res.data.length > 0) {
            setForm((prev) => ({
              ...prev,
              factura_centro_operaciones: res.data[0].operaciones_id,
            }));
          }
        });

      axiosInstance
        .get("/gestionProveedores/estado_facturas/")
        .then((res) => setEstadosFactura(res.data));

      axiosInstance
        .get("/gestionProveedores/causales_devolucion/")
        .then((res) => {
          setCausales(res.data);
          if (!factura.causal_anulacion && res.data.length > 0) {
            setForm((prev) => ({
              ...prev,
              causal_anulacion: res.data[0].causalid,
            }));
          }
        });

      const detalleRepo = new FacturaDetalleRepository();
      detalleRepo
        .getByFacturaId(factura.factura_id)
        .then((res) => {
          const correcto = res.find(
            (d: any) => d.factura === factura.factura_id
          );
          if (correcto) setDetalle(correcto);
          else setDetalle({ observacionesGestion: "" });
        })
        .catch((err) => console.error("Error cargando detalle:", err));
    }
  }, [open, factura?.factura_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetalleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetalle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        factura_estado_factura_id: (
          form.factura_estado_factura as EstadoFactura
        )?.estado_id,
      };
      delete payload.factura_estado_factura;

      await axiosInstance.put(
        `/gestionProveedores/factura/${factura.factura_id}/`,
        payload
      );

      const detalleRepo = new FacturaDetalleRepository();
      const detalleData = new FormData();
      detalleData.append(
        "observacionesGestion",
        detalle.observacionesGestion ?? ""
      );
      detalleData.append("factura", String(factura.factura_id));

      if (detalle.id && detalle.factura === factura.factura_id) { 
        await detalleRepo.update(detalle.id, detalleData); // ✅
      } else {
        await detalleRepo.create(detalleData);
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error actualizando factura o detalle", error);
      alert("Error actualizando factura o detalle");
    }
  };

  if (!open) return null;

  return (
    <div className="w-full h-full px-6 py-4 bg-white dark:bg-[#1e293b] border border-blue-200 dark:border-blue-800 overflow-y-auto text-black dark:text-white">
      <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">
        Editar Factura [ID: {factura.factura_id}]
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado de la Factura
          </label>
          <div className="flex flex-wrap gap-4">
            {estadosFactura.map((estado) => (
              <label
                key={estado.estado_id}
                className="flex items-center gap-2 text-sm text-black dark:text-white"
              >
                <input
                  type="radio"
                  name="factura_estado_factura"
                  value={estado.estado_id}
                  checked={
                    (form.factura_estado_factura as EstadoFactura)
                      ?.estado_id === estado.estado_id
                  }
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      factura_estado_factura: estado,
                    }))
                  }
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span>{estado.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Centro de Operaciones
          </label>
          <select
            name="factura_centro_operaciones"
            value={form.factura_centro_operaciones || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="">Seleccione centro operaciones</option>
            {centrosOperaciones.map((c: any) => (
              <option key={c.operaciones_id} value={c.operaciones_id}>
                {c.operaciones_nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Causal de Devolución y/o Anulación
          </label>
          <select
            name="causal_anulacion"
            value={form.causal_anulacion || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="">Seleccione causal</option>
            {causales.map((c: any) => (
              <option key={c.causalid} value={c.causalid}>
                {c.causal_nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observaciones de Gestión
          </label>
          <textarea
            name="observacionesGestion"
            value={detalle.observacionesGestion ?? ""}
            onChange={handleDetalleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          />
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

export default EditarFacturaModal;
