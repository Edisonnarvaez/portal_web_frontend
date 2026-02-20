import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Autoevaluacion, AutoevaluacionCreate, AutoevaluacionUpdate, AutoevaluacionResumen } from '../../domain/entities';
import type { IAutoevaluacionRepository } from '../../domain/repositories';

export class AutoevaluacionRepository implements IAutoevaluacionRepository {
  async getAll(filters?: Record<string, any>): Promise<Autoevaluacion[]> {
    const response = await axiosInstance.get('/habilitacion/autoevaluaciones/', { params: filters });
    return response.data.results || response.data;
  }

  async getById(id: number): Promise<Autoevaluacion> {
    const response = await axiosInstance.get(`/habilitacion/autoevaluaciones/${id}/`);
    return response.data;
  }

  async create(data: AutoevaluacionCreate): Promise<Autoevaluacion> {
    const response = await axiosInstance.post('/habilitacion/autoevaluaciones/', data);
    return response.data;
  }

  async update(id: number, data: AutoevaluacionUpdate): Promise<Autoevaluacion> {
    const response = await axiosInstance.patch(`/habilitacion/autoevaluaciones/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/autoevaluaciones/${id}/`);
  }

  async getResumen(id: number): Promise<AutoevaluacionResumen> {
    const response = await axiosInstance.get(`/habilitacion/autoevaluaciones/${id}/resumen/`);
    return response.data;
  }

  async validar(id: number): Promise<Autoevaluacion> {
    const response = await axiosInstance.post(`/habilitacion/autoevaluaciones/${id}/validar/`);
    return response.data;
  }

  async duplicar(id: number): Promise<Autoevaluacion> {
    const response = await axiosInstance.post(`/habilitacion/autoevaluaciones/${id}/duplicar/`);
    return response.data;
  }

  async getPorCompletar(): Promise<Autoevaluacion[]> {
    const response = await axiosInstance.get('/habilitacion/autoevaluaciones/por_completar/');
    return response.data.results || response.data;
  }
}
