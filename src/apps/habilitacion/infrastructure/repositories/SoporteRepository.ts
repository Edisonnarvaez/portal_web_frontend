import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type {
  CategoriaSoporte,
  TipoDocumentoSoporte,
  SoporteDocumental,
  SoporteRequerido,
} from '../../domain/entities/SoporteDocumental';
import type { ISoporteRepository } from '../../domain/repositories/ISoporteRepository';
import type { NivelSoporte } from '../../domain/types/SoporteTypes';
import { parseListResponse } from '../../shared/utils/apiResponse';

/**
 * SoporteRepository
 * HTTP implementation for supporting documents and evidence management
 * Handles all API calls to backend soportes endpoints
 */
export class SoporteRepository implements ISoporteRepository {
  private baseUrl = '/soportes';

  // ========== CATEGORIA SOPORTE ==========

  async getAllCategorias(): Promise<CategoriaSoporte[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/categorias/`);
    return parseListResponse<CategoriaSoporte>(response.data);
  }

  async getCategoria(id: number): Promise<CategoriaSoporte> {
    const response = await axiosInstance.get(`${this.baseUrl}/categorias/${id}/`);
    return response.data;
  }

  async createCategoria(data: Partial<CategoriaSoporte>): Promise<CategoriaSoporte> {
    const response = await axiosInstance.post(`${this.baseUrl}/categorias/`, data);
    return response.data;
  }

  async updateCategoria(id: number, data: Partial<CategoriaSoporte>): Promise<CategoriaSoporte> {
    const response = await axiosInstance.patch(`${this.baseUrl}/categorias/${id}/`, data);
    return response.data;
  }

  async deleteCategoria(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/categorias/${id}/`);
  }

  // ========== TIPO DOCUMENTO SOPORTE ==========

  async getAllTipos(): Promise<TipoDocumentoSoporte[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/tipos-documento/`);
    return parseListResponse<TipoDocumentoSoporte>(response.data);
  }

  async getTipo(id: number): Promise<TipoDocumentoSoporte> {
    const response = await axiosInstance.get(`${this.baseUrl}/tipos-documento/${id}/`);
    return response.data;
  }

  async getTiposByCategoria(categoriaId: number): Promise<TipoDocumentoSoporte[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/tipos-documento/`, {
      params: { categoria_id: categoriaId },
    });
    return parseListResponse<TipoDocumentoSoporte>(response.data);
  }

  async getTiposByNivel(nivel: NivelSoporte): Promise<TipoDocumentoSoporte[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/tipos-documento/`, {
      params: { nivel },
    });
    return parseListResponse<TipoDocumentoSoporte>(response.data);
  }

  async createTipo(data: Partial<TipoDocumentoSoporte>): Promise<TipoDocumentoSoporte> {
    const response = await axiosInstance.post(`${this.baseUrl}/tipos-documento/`, data);
    return response.data;
  }

  async updateTipo(id: number, data: Partial<TipoDocumentoSoporte>): Promise<TipoDocumentoSoporte> {
    const response = await axiosInstance.patch(`${this.baseUrl}/tipos-documento/${id}/`, data);
    return response.data;
  }

  async deleteTipo(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/tipos-documento/${id}/`);
  }

  // ========== SOPORTE DOCUMENTAL ==========

  async getAllSoportes(): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/`);
    return parseListResponse<SoporteDocumental>(response.data);
  }

  // ✅ NUEVO: Filtrar por prestador (aislamiento de datos)
  async getSoportesByPrestador(prestadorId: number): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/`, {
      params: { prestador_id: prestadorId },
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async getSoporte(id: number): Promise<SoporteDocumental> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/${id}/`);
    return response.data;
  }

  async getSoportesByEmpresa(empresaId: number): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/`, {
      params: { empresa_id: empresaId, nivel: 'EMPRESA' },
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async getSoportesBySede(sedeId: number): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/`, {
      params: { sede_id: sedeId, nivel: 'SEDE' },
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async getSoportesByServicio(servicioId: number): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/`, {
      params: { servicio_id: servicioId, nivel: 'SERVICIO' },
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async getSoportesByNivel(nivel: NivelSoporte): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/`, {
      params: { nivel },
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async createSoporte(data: any): Promise<SoporteDocumental> {
    // For non-file uploads, send as regular JSON
    const response = await axiosInstance.post(`${this.baseUrl}/documentos/`, data);
    return response.data;
  }

  /**
   * ✅ NUEVO: Create soporte with FormData (multipart/form-data) for file uploads
   * Removes the default JSON Content-Type header to allow proper multipart encoding
   */
  async createSoporteFormData(formData: FormData): Promise<SoporteDocumental> {
    // When sending FormData, the browser must set Content-Type with multipart boundary
    // Remove the default 'application/json' header by setting it to undefined
    const response = await axiosInstance.post(`${this.baseUrl}/documentos/`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    } as any);
    return response.data;
  }

  async updateSoporte(id: number, data: any): Promise<SoporteDocumental> {
    const response = await axiosInstance.patch(`${this.baseUrl}/documentos/${id}/`, data);
    return response.data;
  }

  async deleteSoporte(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/documentos/${id}/`);
  }

  async getSoporteVersions(tipoDocumentoId: number): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/versions/`, {
      params: { tipo_documento_id: tipoDocumentoId },
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async getSoporteLatestVersion(tipoDocumentoId: number): Promise<SoporteDocumental | null> {
    try {
      const response = await axiosInstance.get(
        `${this.baseUrl}/documentos/latest/${tipoDocumentoId}/`
      );
      return response.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getSoportesVencidos(): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/vencidos/`);
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async getSoportesProximosAVencer(diasAdelante: number = 30): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/proximos_a_vencer/`, {
      params: { dias: diasAdelante },
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async searchSoportes(criteria: any): Promise<SoporteDocumental[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/documentos/buscar/`, {
      params: criteria,
    });
    return parseListResponse<SoporteDocumental>(response.data);
  }

  async filterByCriteria(criteria: any): Promise<SoporteDocumental[]> {
    return this.searchSoportes(criteria);
  }

  // ========== SOPORTE REQUERIDO ==========

  async getAllRequeridos(): Promise<SoporteRequerido[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/requeridos/`);
    return parseListResponse<SoporteRequerido>(response.data);
  }

  async getRequerido(id: number): Promise<SoporteRequerido> {
    const response = await axiosInstance.get(`${this.baseUrl}/requeridos/${id}/`);
    return response.data;
  }

  async getRequeridosByNivel(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/requeridos/`, {
      params: { nivel },
    });
    return parseListResponse<SoporteRequerido>(response.data);
  }

  async getRequeridosPendientes(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/requeridos/pendientes/`, {
      params: { nivel },
    });
    return parseListResponse<SoporteRequerido>(response.data);
  }

  async getRequeridosCargados(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/requeridos/cargados/`, {
      params: { nivel },
    });
    return parseListResponse<SoporteRequerido>(response.data);
  }

  async getRequeridosVencidos(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/requeridos/vencidos/`, {
      params: { nivel },
    });
    return parseListResponse<SoporteRequerido>(response.data);
  }

  async createRequerido(data: Partial<SoporteRequerido>): Promise<SoporteRequerido> {
    const response = await axiosInstance.post(`${this.baseUrl}/requeridos/`, data);
    return response.data;
  }

  async updateRequerido(id: number, data: Partial<SoporteRequerido>): Promise<SoporteRequerido> {
    const response = await axiosInstance.patch(`${this.baseUrl}/requeridos/${id}/`, data);
    return response.data;
  }

  async deleteRequerido(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/requeridos/${id}/`);
  }

  async generarChecklistAutomatico(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    const response = await axiosInstance.post(`${this.baseUrl}/requeridos/generar_checklist/`, {
      nivel,
    });
    return parseListResponse<SoporteRequerido>(response.data);
  }

  async getEstadisticas(nivel?: NivelSoporte): Promise<any> {
    const response = await axiosInstance.get(`${this.baseUrl}/estadisticas/`, {
      params: nivel ? { nivel } : {},
    });
    return response.data;
  }
}
