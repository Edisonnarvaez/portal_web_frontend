// FacturasPage.tsx
import { useState } from "react";
import { useEffect } from "react";
import { FacturaService } from "../../application/services/FacturaService";
import { FacturaRepository } from "../../infrastructure/repositories/FacturaRepository";

import EditarFacturaModal from "../components/EditarFacturaModal";
import TablaFacturas from "../components/TablaFacturas";
import VerRegistroFacturaModal from "../components/VerRegistroFacturaModal";
import CrearFacturaModal from "../components/CrearFacturaModal";

import { useFacturaCRUD } from "../hooks/useFacturaCRUD";
import type { Factura } from "../../domain/types";
import type { RegistroFactura } from "../components/VerRegistroFacturaModal";
import axiosInstance from "../../infrastructure/repositories/axiosInstance";

export default function FacturasPage() {
  const { facturas, fetchFacturas, fetchFacturasByEtapa, loading, error, pagination, etapaOptions } = useFacturaCRUD();

  const [selectedEtapa, setSelectedEtapa] = useState<string | undefined>(undefined);
  const [selectedEstado, setSelectedEstado] = useState<number | undefined>(undefined);
  const [estadoOptions, setEstadoOptions] = useState<{ estado_id: number; nombre: string }[]>([]);
  const [selectedCentro, setSelectedCentro] = useState<number | undefined>(undefined);
  const [fechaDesde, setFechaDesde] = useState<string | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // load estados once
  useEffect(() => {
    const loadEstados = async () => {
      try {
        const service = new FacturaService(new FacturaRepository());
        const data = await service.getEstadosFactura();
        setEstadoOptions(Array.isArray(data) ? data.map((d: any) => ({ estado_id: d.estado_id || d.id || 0, nombre: d.nombre || d.label || String(d) })) : []);
      } catch (err) {
        console.error('Error cargando estados de factura', err);
      }
    };
    loadEstados();
  }, []);

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
      {/* Filters toolbar */}
  <div className="flex items-center gap-3 mb-4">
        <label className="text-sm">Etapa:</label>
        <select
          value={selectedEtapa}
          onChange={(e) => {
            const val = e.target.value || undefined;
            setSelectedEtapa(val);
            setPage(1);
            // fetch with etapa
            fetchFacturasByEtapa(val, 1, pageSize);
          }}
          className="px-2 py-1 border rounded"
        >
          <option value="">Todas</option>
          {etapaOptions.map((et: any) => (
            <option key={et.key} value={et.key}>
              {et.label}
            </option>
          ))}
        </select>
        <label className="text-sm">Estado:</label>
        <select
          value={selectedEstado ?? ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : undefined;
            setSelectedEstado(val);
            setPage(1);
            fetchFacturas({ etapa: selectedEtapa, estado: val, page: 1, page_size: pageSize, fecha_desde: fechaDesde, fecha_hasta: fechaHasta, centro: selectedCentro });
          }}
          className="px-2 py-1 border rounded"
        >
          <option value="">Todos</option>
          {estadoOptions.map((st) => (
            <option key={st.estado_id} value={st.estado_id}>{st.nombre}</option>
          ))}
        </select>

        <label className="text-sm">Centro:</label>
        <input
          type="number"
          value={selectedCentro ?? ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : undefined;
            setSelectedCentro(val);
            setPage(1);
            fetchFacturas({ etapa: selectedEtapa, estado: selectedEstado, page: 1, page_size: pageSize, fecha_desde: fechaDesde, fecha_hasta: fechaHasta, centro: val });
          }}
          placeholder="ID centro"
          className="px-2 py-1 border rounded w-28"
        />

        <label className="text-sm">Desde:</label>
        <input
          type="date"
          value={fechaDesde ?? ""}
          onChange={(e) => setFechaDesde(e.target.value || undefined)}
          className="px-2 py-1 border rounded"
        />

        <label className="text-sm">Hasta:</label>
        <input
          type="date"
          value={fechaHasta ?? ""}
          onChange={(e) => setFechaHasta(e.target.value || undefined)}
          className="px-2 py-1 border rounded"
        />

        <button
          onClick={() => {
            setPage(1);
            fetchFacturas({ etapa: selectedEtapa, estado: selectedEstado, page: 1, page_size: pageSize, fecha_desde: fechaDesde, fecha_hasta: fechaHasta, centro: selectedCentro });
          }}
          className="px-2 py-1 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Filtrando...' : 'Filtrar'}
        </button>

        <button
          onClick={() => {
            setSelectedEtapa(undefined);
            setSelectedEstado(undefined);
            setSelectedCentro(undefined);
            setFechaDesde(undefined);
            setFechaHasta(undefined);
            setPage(1);
            fetchFacturas();
          }}
          className="px-2 py-1 border rounded"
        >
          Limpiar
        </button>
        <button
          onClick={() => {
            // Export current visible facturas to CSV
            const rows = facturas.map(f => ({
              id: f.factura_id,
              fecha: f.factura_fecha,
              etapa: f.factura_etapa,
              concepto: f.factura_concepto,
              proveedor: f.factura_razon_social_proveedor,
              adquiriente: f.factura_razon_social_adquiriente,
            }));
            const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v || '')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facturas_export_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-2 py-1 border rounded"
        >
          Exportar CSV
        </button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Active filters summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>Filtros activos:</strong>{' '}
        {selectedEtapa ? `Etapa: ${etapaOptions.find(e => e.key === selectedEtapa)?.label || selectedEtapa}` : 'Etapa: Todas'}
        {selectedEstado ? ` • Estado ID: ${selectedEstado}` : ''}
        {selectedCentro ? ` • Centro ID: ${selectedCentro}` : ''}
        {fechaDesde ? ` • Desde: ${fechaDesde}` : ''}
        {fechaHasta ? ` • Hasta: ${fechaHasta}` : ''}
      </div>

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

      {/* Pagination controls (simple) */}
      {pagination && (
        <div className="mt-4 flex justify-center items-center gap-3">
          <button
            disabled={!pagination.previous}
            onClick={() => {
              const prevPage = (pagination.page || page) - 1;
              setPage(prevPage);
              if (selectedEtapa) {
                fetchFacturasByEtapa(selectedEtapa, prevPage, pageSize);
              } else {
                fetchFacturas({ page: prevPage, page_size: pageSize, etapa: selectedEtapa, estado: selectedEstado, fecha_desde: fechaDesde, fecha_hasta: fechaHasta, centro: selectedCentro });
              }
            }}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {pagination.page || page} • {pagination.count} items
          </span>
          <button
            disabled={!pagination.next}
            onClick={() => {
              const nextPage = (pagination.page || page) + 1;
              setPage(nextPage);
              if (selectedEtapa) {
                fetchFacturasByEtapa(selectedEtapa, nextPage, pageSize);
              } else {
                fetchFacturas({ page: nextPage, page_size: pageSize, etapa: selectedEtapa, estado: selectedEstado, fecha_desde: fechaDesde, fecha_hasta: fechaHasta, centro: selectedCentro });
              }
            }}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
