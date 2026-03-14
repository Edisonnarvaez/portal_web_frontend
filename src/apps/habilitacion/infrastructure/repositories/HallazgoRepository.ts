import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Hallazgo, HallazgoDetail, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos, HallazgoPorOrigen } from '../../domain/entities';
import type { IHallazgoRepository } from '../../domain/repositories';
import type { HallazgoFilters } from '../../domain/types';
import { parseListResponse } from '../../shared/utils/apiResponse';

export class HallazgoRepository implements IHallazgoRepository {
  private baseUrl = '/mejoras/hallazgos';

  async getAll(filters?: HallazgoFilters): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, { params: filters });
    return parseListResponse<Hallazgo>(response.data);
  }

  async getById(id: number): Promise<HallazgoDetail> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  async getByAutoevaluacion(autoevaluacionId: number): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, {
      params: { autoevaluacion: autoevaluacionId }
    });
    return parseListResponse<Hallazgo>(response.data);
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

  async getEstadisticas(filters?: HallazgoFilters): Promise<EstadisticasHallazgos> {
    const response = await axiosInstance.get(`${this.baseUrl}/estadisticas/`, { params: filters });
    return response.data;
  }

  async getAbiertos(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, {
      params: { estado: 'ABIERTO' }
    });
    return parseListResponse<Hallazgo>(response.data);
  }

  async getCriticos(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, {
      params: { severidad: 'CRÍTICA' }
    });
    return parseListResponse<Hallazgo>(response.data);
  }

  async getPorOrigen(): Promise<HallazgoPorOrigen[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/por-origen/`);
    return response.data;
  }

  async getSinPlan(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/sin-plan/`);
    return parseListResponse<Hallazgo>(response.data);
  }
}
