import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { PlanMejora, PlanMejoraCreate, PlanMejoraUpdate, PlanMejoraResumen } from '../../domain/entities';
import type { IPlanMejoraRepository } from '../../domain/repositories';

export class PlanMejoraRepository implements IPlanMejoraRepository {
  async getAll(filters?: Record<string, any>): Promise<PlanMejora[]> {
    const response = await axiosInstance.get('/habilitacion/planes-mejora/', { params: filters });
    return response.data;
  }

  async getById(id: number): Promise<PlanMejora> {
    const response = await axiosInstance.get(`/habilitacion/planes-mejora/${id}/`);
    return response.data;
  }

  async getByAutoevaluacion(autoevaluacionId: number): Promise<PlanMejora[]> {
    const response = await axiosInstance.get('/habilitacion/planes-mejora/', {
      params: { autoevaluacion: autoevaluacionId }
    });
    return response.data;
  }

  async create(data: PlanMejoraCreate): Promise<PlanMejora> {
    const response = await axiosInstance.post('/habilitacion/planes-mejora/', data);
    return response.data;
  }

  async update(id: number, data: PlanMejoraUpdate): Promise<PlanMejora> {
    const response = await axiosInstance.patch(`/habilitacion/planes-mejora/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/planes-mejora/${id}/`);
  }

  async getVencidos(): Promise<PlanMejora[]> {
    const response = await axiosInstance.get('/habilitacion/planes-mejora/vencidos/');
    return response.data;
  }

  async getResumen(autoevaluacionId: number): Promise<PlanMejoraResumen> {
    const response = await axiosInstance.get(`/habilitacion/planes-mejora/resumen/${autoevaluacionId}/`);
    return response.data;
  }

  async getProximosAVencer(dias: number = 30): Promise<PlanMejora[]> {
    const response = await axiosInstance.get('/habilitacion/planes-mejora/proximos-vencer/', {
      params: { dias }
    });
    return response.data;
  }
}
