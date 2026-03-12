import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Hallazgo, HallazgoDetail, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos, HallazgoPorOrigen } from '../../domain/entities';
import type { IHallazgoRepository } from '../../domain/repositories';

export class HallazgoRepository implements IHallazgoRepository {
  private baseUrl = '/mejoras/hallazgos';

  async getAll(filters?: Record<string, any>): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, { params: filters });
    if (Array.isArray(response.data)) return response.data;
    if (response.data.results && Array.isArray(response.data.results)) return response.data.results;
    return [];
  }

  async getById(id: number): Promise<HallazgoDetail> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  async getByAutoevaluacion(autoevaluacionId: number): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, {
      params: { autoevaluacion: autoevaluacionId }
    });
    if (Array.isArray(response.data)) return response.data;
    if (response.data.results && Array.isArray(response.data.results)) return response.data.results;
    return [];
  }

  async create(data: HallazgoCreate): Promise<Hallazgo> {
    const response = await axiosInstance.post(`${this.baseUrl}/`, data);
    return response.data;
  }

  async update(id: number, data: HallazgoUpdate): Promise<Hallazgo> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}/`);
  }

  async getEstadisticas(filters?: Record<string, any>): Promise<EstadisticasHallazgos> {
    const response = await axiosInstance.get(`${this.baseUrl}/estadisticas/`, { params: filters });
    return response.data;
  }

  async getAbiertos(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, {
      params: { estado: 'ABIERTO' }
    });
    if (Array.isArray(response.data)) return response.data;
    if (response.data.results && Array.isArray(response.data.results)) return response.data.results;
    return [];
  }

  async getCriticos(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, {
      params: { severidad: 'CRÍTICA' }
    });
    return response.data.results || response.data;
  }

  async getPorOrigen(): Promise<HallazgoPorOrigen[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/por-origen/`);
    return response.data;
  }

  async getSinPlan(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/sin-plan/`);
    return response.data.results || response.data;
  }
}
