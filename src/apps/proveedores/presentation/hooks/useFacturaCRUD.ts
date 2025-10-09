import { useState, useEffect } from "react";
import type { Factura } from "../../domain/entities/Factura";
import { FacturaService } from "../../application/services/FacturaService";
import { FacturaRepository } from "../../infrastructure/repositories/FacturaRepository";
import { CentroOperacionesRepository } from "../../infrastructure/repositories/CentroOperacionesRepository";
import { EstadoFacturaRepository } from "../../infrastructure/repositories/EstadoFacturaRepository";
import { CausalDevolucionRepository } from "../../infrastructure/repositories/CausalDevolucionRepository";

export const useFacturaCRUD = () => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ count: number; next: string | null; previous: string | null; page?: number; page_size?: number } | null>(null);

  const facturaService = new FacturaService(
    new FacturaRepository(),
    new CentroOperacionesRepository(),
    new EstadoFacturaRepository(),
    new CausalDevolucionRepository()
  );

  // repository instance for etapa-specific calls and obtaining options
  const facturaRepo = new FacturaRepository();

  const etapaOptions = facturaRepo.getEtapaOptions();

  const fetchFacturas = async (params?: { page?: number; page_size?: number; etapa?: string; estado?: number; fecha_desde?: string; fecha_hasta?: string; centro?: number }) => {
    try {
      setLoading(true);
      if (params && Object.keys(params).length > 0) {
        // Use paginated filtered endpoint
        const paginated = await facturaService.getFacturasWithFilters(params);
        // If backend returns paginated object with results
        const results = Array.isArray(paginated) ? paginated : (paginated as any).results || [];
        const activas = results.filter((f: Factura) => f.factura_estado === true);
        setFacturas(activas);
        // set pagination metadata if available
        if (paginated && typeof paginated === 'object' && !Array.isArray(paginated)) {
          const p: any = paginated;
          setPagination({
            count: p.count || activas.length,
            next: p.next || null,
            previous: p.previous || null,
            page: params.page,
            page_size: params.page_size,
          });
        } else {
          setPagination(null);
        }
      } else {
        const data = await facturaService.getFacturas();
        const activas = data.filter((f: Factura) => f.factura_estado === true);
        setFacturas(activas);
        setPagination(null);
      }
      setError(null);
    } catch (err: any) {
      setError("No se pudieron cargar las facturas");
      console.error("Error al cargar facturas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacturasByEtapa = async (etapa?: string, page?: number, page_size?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (page_size) params.page_size = page_size;

    if (!etapa) return fetchFacturas(Object.keys(params).length ? params : undefined);

    try {
      setLoading(true);
      // Prefer service-level method if implemented; otherwise use repository
      if ((facturaService as any).getFacturasByEtapa) {
        const resp = await (facturaService as any).getFacturasByEtapa(etapa, params);
        const results = Array.isArray(resp) ? resp : (resp && resp.results) ? resp.results : [];
        const activas = results.filter((f: Factura) => f.factura_estado === true);
        setFacturas(activas);
        if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
          setPagination({ count: resp.count || activas.length, next: resp.next || null, previous: resp.previous || null, page, page_size });
        } else {
          setPagination(null);
        }
      } else {
        // direct repository call with fallbacks
        const resp = await facturaRepo.getAllByEtapa(etapa, params);
        const results = resp.data || [];
        const activas = results.filter((f: Factura) => f.factura_estado === true);
        setFacturas(activas);
        setPagination(resp.meta ? { count: resp.meta.count || activas.length, next: resp.meta.next || null, previous: resp.meta.previous || null, page, page_size } : null);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching facturas by etapa:", err);
      setError("No se pudieron cargar las facturas por etapa");
    } finally {
      setLoading(false);
    }
  };

  const updateFactura = async (id: number, data: any) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key].toString());
        }
      }
      const updated = await facturaService.updateFactura(id, formData);
      setFacturas((prev) =>
        prev.map((f) => (f.factura_id === id ? updated : f))
      );
      return updated;
    } catch (error) {
      console.error("Error actualizando factura:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  return {
    facturas,
    loading,
    error,
    fetchFacturas,
    updateFactura,
    facturaService,
    pagination,
    fetchFacturasByEtapa,
    etapaOptions,
  };
};
