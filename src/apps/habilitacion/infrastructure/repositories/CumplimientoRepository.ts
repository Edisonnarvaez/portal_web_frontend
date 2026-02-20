import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Cumplimiento, CumplimientoCreate, CumplimientoUpdate } from '../../domain/entities';
import type { ICumplimientoRepository } from '../../domain/repositories';

export class CumplimientoRepository implements ICumplimientoRepository {
  async getAll(filters?: Record<string, any>): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/', { params: filters });
    return response.data.results || response.data;
  }

  async getById(id: number): Promise<Cumplimiento> {
    const response = await axiosInstance.get(`/habilitacion/cumplimientos/${id}/`);
    return response.data;
  }

  async create(data: CumplimientoCreate): Promise<Cumplimiento> {
    const response = await axiosInstance.post('/habilitacion/cumplimientos/', data);
    return response.data;
  }

  async update(id: number, data: CumplimientoUpdate): Promise<Cumplimiento> {
    const response = await axiosInstance.patch(`/habilitacion/cumplimientos/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/cumplimientos/${id}/`);
  }

  async getSinCumplir(): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/sin_cumplir/');
    return response.data.results || response.data;
  }

  async getConPlanMejora(): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/con_plan_mejora/');
    return response.data.results || response.data;
  }

  async getMejorasVencidas(): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/mejoras_vencidas/');
    return response.data.results || response.data;
  }
}
