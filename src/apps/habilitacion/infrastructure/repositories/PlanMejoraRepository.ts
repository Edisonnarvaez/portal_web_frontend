import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { PlanMejora, PlanMejoraDetail, PlanMejoraCreate, PlanMejoraUpdate, PlanMejoraResumen, PlanMejoraPorOrigen, SoportePlan } from '../../domain/entities';
import type { IPlanMejoraRepository } from '../../domain/repositories';
import type { PlanMejoraFilters } from '../../domain/types';
import { parseListResponse } from '../../shared/utils/apiResponse';

export class PlanMejoraRepository implements IPlanMejoraRepository {
  private baseUrl = '/mejoras/planes-mejora';

  async getAll(filters?: PlanMejoraFilters): Promise<PlanMejora[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, { params: filters });
    return parseListResponse<PlanMejora>(response.data);
  }

  async getById(id: number): Promise<PlanMejoraDetail> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  async getByAutoevaluacion(autoevaluacionId: number): Promise<PlanMejora[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/`, {
      params: { autoevaluacion: autoevaluacionId }
    });
    return parseListResponse<PlanMejora>(response.data);
  }

  async create(data: PlanMejoraCreate): Promise<PlanMejora> {
    const response = await axiosInstance.post(`${this.baseUrl}/`, data);
    return response.data;
  }

  async update(id: number, data: PlanMejoraUpdate): Promise<PlanMejora> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}/`);
  }

  async getVencidos(): Promise<PlanMejora[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/vencidos/`);
    return parseListResponse<PlanMejora>(response.data);
  }

  async getResumen(filters?: PlanMejoraFilters): Promise<PlanMejoraResumen> {
    const response = await axiosInstance.get(`${this.baseUrl}/resumen/`, { params: filters });
    return response.data;
  }

  async getProximosAVencer(dias: number = 30): Promise<PlanMejora[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/proximos-vencer/`, {
      params: { dias }
    });
    return parseListResponse<PlanMejora>(response.data);
  }

  async getPorOrigen(): Promise<PlanMejoraPorOrigen[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/por-origen/`);
    return response.data;
  }

  // Soportes / Archivos adjuntos
  async getSoportes(planId: number): Promise<SoportePlan[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/${planId}/soportes/`);
    return response.data;
  }

  async uploadSoporte(planId: number, formData: FormData): Promise<SoportePlan> {
    const response = await axiosInstance.post(`${this.baseUrl}/${planId}/soportes/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async deleteSoporte(planId: number, soporteId: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${planId}/soportes/${soporteId}/`);
  }
}
