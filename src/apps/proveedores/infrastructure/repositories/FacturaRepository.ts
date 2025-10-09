import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import type { Factura } from "../../domain/entities/Factura";

export class FacturaRepository {
  async getAll(): Promise<Factura[]> {
    // Prefer the filtered/paginated endpoint to keep behavior consistent
    try {
      const data = await this.getAllWithFilters();
      // Normalize: if paginated object returned, extract results
      if (Array.isArray(data)) return data;
      return (data && (data as any).results) ? (data as any).results : [];
    } catch (err) {
      // Fallback to the legacy singular endpoint
      const response = await axiosInstance.get("/gestionProveedores/factura/");
      return response.data;
    }
  }

  /**
   * New: fetch from the OpenAPI 'facturas' plural endpoint with optional filters.
   * Keeps backward compatibility with existing getAll().
   */
  async getAllWithFilters(params?: { page?: number; page_size?: number; etapa?: string; estado?: number; fecha_desde?: string; fecha_hasta?: string; centro?: number }): Promise<any> {
    const query: Record<string, any> = {};
    if (params) {
      if (params.page) query.page = params.page;
      if (params.page_size) query.page_size = params.page_size;
      if (params.etapa) query.etapa = params.etapa;
      if (params.estado !== undefined) query.estado = params.estado;
      if (params.fecha_desde) query.fecha_desde = params.fecha_desde;
      if (params.fecha_hasta) query.fecha_hasta = params.fecha_hasta;
      if (params.centro !== undefined) query.centro = params.centro;
    }

    // Deployment observed the singular `factura/` list endpoint. Try it first
    // (it returns a paginated object), and fall back to the plural path if needed.
    try {
      const response = await axiosInstance.get(`/gestionProveedores/factura/`, { params: query });
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get(`/gestionProveedores/facturas/`, { params: query });
      return response.data; // expected paginated shape per OpenAPI
    }
  }

  /**
   * Etapa options mapping: key used by the UI -> backend route to call.
   * These are sensible defaults that can be adjusted later if your backend
   * exposes different stage routes.
   */
  getEtapaOptions() {
    return [
      // Map friendly keys to the concrete stage endpoints observed on the backend
      { key: "pendiente", label: "Pendiente (Etapa 1)", route: "/gestionProveedores/etapa1/", useQueryParam: false },
      { key: "en_revision", label: "En revisión (Etapa 2)", route: "/gestionProveedores/etapa2/", useQueryParam: false },
      { key: "reconocimiento_contable", label: "Reconocimiento contable (Etapa 3)", route: "/gestionProveedores/etapa3/", useQueryParam: false },
      { key: "revision_impuestos", label: "Revisión impuestos (Etapa 4)", route: "/gestionProveedores/etapa4/", useQueryParam: false },
      { key: "revision_contraloria", label: "Revisión contraloría (Etapa 5)", route: "/gestionProveedores/etapa5/", useQueryParam: false },
      { key: "pendiente_pago", label: "Pendiente de pago (Etapa 6)", route: "/gestionProveedores/etapa6/", useQueryParam: false },
      // Generic fallbacks: plural endpoint (expects ?etapa=key) and singular list endpoint
      { key: "all_by_etapa", label: "Todas (por etapa) - gen", route: "/gestionProveedores/facturas/", useQueryParam: true },
      { key: "single", label: "Endpoint singular", route: "/gestionProveedores/factura/", useQueryParam: false },
    ];
  }

  /**
   * Fetch invoices by etapa using several fallback strategies.
   * Returns normalized shape: { data: Factura[], meta?: any }
   */
  async getAllByEtapa(etapaKey: string, params: Record<string, any> = {}): Promise<{ data: Factura[]; meta?: any }> {
    const etapaOptions = this.getEtapaOptions();
    const found = etapaOptions.find((e: any) => e.key === etapaKey);

    const buildQuery = (p: Record<string, any>) => {
      const qs = new URLSearchParams();
      Object.entries(p || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) qs.append(k, String(v));
      });
      return qs.toString() ? `?${qs.toString()}` : "";
    };

    const tryAxiosGet = async (routeWithQuery: string) => {
      const response = await axiosInstance.get(routeWithQuery);
      return response.data;
    };

    // 1) If the etapa option exists, use its route. If it indicates useQueryParam,
    //    call the plural endpoint with the etapa as query param.
    if (found) {
      try {
        if (found.useQueryParam) {
          const q = buildQuery({ ...params, etapa: etapaKey });
          const json = await tryAxiosGet(`${found.route}${q}`);
          if (Array.isArray(json)) return { data: json };
          if (json && Array.isArray((json as any).results)) return { data: (json as any).results, meta: { count: (json as any).count, next: (json as any).next, previous: (json as any).previous } };
        } else {
          const q = buildQuery(params);
          const json = await tryAxiosGet(`${found.route}${q}`);
          if (Array.isArray(json)) return { data: json };
          if (json && Array.isArray((json as any).results)) return { data: (json as any).results, meta: { count: (json as any).count, next: (json as any).next, previous: (json as any).previous } };
        }
      } catch (err) {
        // ignore and continue to other fallbacks
      }
    }

    // 2) Try plural endpoint with ?etapa= as a general fallback
    try {
      const q = buildQuery({ ...params, etapa: etapaKey });
      const json = await tryAxiosGet(`/gestionProveedores/facturas/${q}`);
      if (Array.isArray(json)) return { data: json };
      if (json && Array.isArray((json as any).results)) return { data: (json as any).results, meta: { count: (json as any).count, next: (json as any).next, previous: (json as any).previous } };
    } catch (err) {
      // continue
    }

    // 3) Try singular endpoint as final fallback
    try {
      const q = buildQuery(params);
      const json = await tryAxiosGet(`/gestionProveedores/factura/${q}`);
      if (Array.isArray(json)) return { data: json };
      if (json && Array.isArray((json as any).results)) return { data: (json as any).results, meta: { count: (json as any).count, next: (json as any).next, previous: (json as any).previous } };
    } catch (err) {
      // final fallback
    }

    return { data: [] };
  }

  async create(data: FormData): Promise<Factura> {
    const response = await axiosInstance.post(
      "/gestionProveedores/factura/",
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async update(id: number, data: any): Promise<Factura> {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }
    const response = await axiosInstance.patch(
      `/gestionProveedores/factura/${id}/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/gestionProveedores/factura/${id}/`);
  }

  async download(id: number): Promise<Blob> {
    // Try plural path first (matches OpenAPI), fallback to singular if missing
    const pluralPath = `/gestionProveedores/facturas/${id}/download/`;
    const singularPath = `/gestionProveedores/factura/${id}/download/`;

    try {
      const response = await axiosInstance.get(pluralPath, { responseType: 'blob' });
      return response.data;
    } catch (err) {
      // fallback to singular path
      try {
        const response = await axiosInstance.get(singularPath, { responseType: 'blob' });
        return response.data;
      } catch (err2) {
        // rethrow original for visibility
        throw err;
      }
    }
  }

  async preview(id: number): Promise<Blob> {
    // Try plural path first (matches OpenAPI), fallback to singular if missing
    const pluralPath = `/gestionProveedores/facturas/${id}/preview/`;
    const singularPath = `/gestionProveedores/factura/${id}/preview/`;

    try {
      const response = await axiosInstance.get(pluralPath, { responseType: 'blob' });
      return response.data;
    } catch (err) {
      // fallback to singular path
      try {
        const response = await axiosInstance.get(singularPath, { responseType: 'blob' });
        return response.data;
      } catch (err2) {
        // rethrow original for visibility
        throw err;
      }
    }
  }
}
