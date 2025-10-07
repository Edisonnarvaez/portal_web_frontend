// FacturasPage.tsx
import { useState } from "react";

import EditarFacturaModal from "../components/EditarFacturaModal";
import TablaFacturas from "../components/TablaFacturas";
import VerRegistroFacturaModal from "../components/VerRegistroFacturaModal";
import CrearFacturaModal from "../components/CrearFacturaModal";

import { useFacturaCRUD } from "../hooks/useFacturaCRUD";
import type { Factura } from "../../domain/types";
import type { RegistroFactura } from "../components/VerRegistroFacturaModal";
import axiosInstance from "../../infrastructure/repositories/axiosInstance";

export default function FacturasPage() {
  const { facturas, fetchFacturas, loading, error } = useFacturaCRUD();

  const [modals, setModals] = useState({
    isViewOpen: false,
    isAddOpen: false,
    isEditOpen: false,
  });

  const [registroFactura, setRegistroFactura] =
    useState<RegistroFactura | null>(null);
  const [facturaAEliminar, setFacturaAEliminar] = useState<Factura | null>(
    null
  );

  const handleDisable = (factura: Factura) => {
    setFacturaAEliminar(factura);
  };

  const confirmarEliminacion = async () => {
    if (!facturaAEliminar) return;

    try {
      const response = await axiosInstance.patch(
        `/gestionProveedores/factura/${facturaAEliminar.factura_id}/`,
        { factura_estado: false },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) throw new Error("Error al desactivar la factura");

      setFacturaAEliminar(null);
      await fetchFacturas();
    } catch (err) {
      console.error("Error al desactivar factura:", err);
      alert("No se pudo desactivar la factura.");
    }
  };

  const openModal = (type: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [type]: false }));
  };

  return (
    <div className="w-full h-full m-0 p-0 bg-transparent">
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {!modals.isAddOpen && !modals.isEditOpen ? (
        <TablaFacturas
          facturas={facturas}
          onEdit={async (factura) => {
            try {
              const res = await axiosInstance.get(
                `/gestionProveedores/factura/${factura.factura_id}/`
              );
              const data = res.data;
              setRegistroFactura(data);
              openModal("isEditOpen");
            } catch (err) {
              console.error("Error al cargar factura para editar:", err);
            }
          }}
          onView={async (factura) => {
            try {
              const res = await axiosInstance.get(
                `/gestionProveedores/factura/${factura.factura_id}/`
              );
              const data = res.data;
              setRegistroFactura(data);
              openModal("isViewOpen");
            } catch (err) {
              console.error("Error al obtener detalle de factura:", err);
            }
          }}
          onAdd={() => openModal("isAddOpen")}
          onDisable={handleDisable}
          loading={loading}
        />
      ) : modals.isAddOpen ? (
        <CrearFacturaModal
          open
          onClose={() => closeModal("isAddOpen")}
          onCreated={fetchFacturas}
        />
      ) : modals.isEditOpen && registroFactura ? (
        <EditarFacturaModal
          open
          factura={registroFactura}
          onClose={() => closeModal("isEditOpen")}
          onUpdated={fetchFacturas}
        />
      ) : null}

      {modals.isViewOpen && registroFactura && (
        <VerRegistroFacturaModal
          open={true}
          registroFactura={registroFactura}
          onClose={() => closeModal("isViewOpen")}
        />
      )}

      {/* Modal de confirmación visual */}
      {facturaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-red-600 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Confirmar eliminación
            </h2>
            <p className="text-gray-800 dark:text-gray-200 mb-6">
              ¿Realmente desea eliminar esta factura{" "}
              <strong>{facturaAEliminar.factura_id}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFacturaAEliminar(null)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
