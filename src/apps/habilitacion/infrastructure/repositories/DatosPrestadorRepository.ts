import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { DatosPrestador, DatosPrestadorCreate, DatosPrestadorUpdate } from '../../domain/entities';
import type { ServicioSede } from '../../domain/entities/ServicioSede';
import type { Autoevaluacion } from '../../domain/entities/Autoevaluacion';
import type { IDatosPrestadorRepository } from '../../domain/repositories';

export class DatosPrestadorRepository implements IDatosPrestadorRepository {
  async getAll(filters?: Record<string, any>): Promise<DatosPrestador[]> {
    const response = await axiosInstance.get('/habilitacion/prestadores/', { params: filters });
    return response.data.results || response.data;
  }

  async getById(id: number): Promise<DatosPrestador> {
    const response = await axiosInstance.get(`/habilitacion/prestadores/${id}/`);
    return response.data;
  }

  async create(data: DatosPrestadorCreate): Promise<DatosPrestador> {
    const response = await axiosInstance.post('/habilitacion/prestadores/', data);
    return response.data;
  }

  async update(id: number, data: DatosPrestadorUpdate): Promise<DatosPrestador> {
    const response = await axiosInstance.patch(`/habilitacion/prestadores/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/prestadores/${id}/`);
  }

  async getProximosAVencer(dias: number = 90): Promise<DatosPrestador[]> {
    const response = await axiosInstance.get('/habilitacion/prestadores/proximos_a_vencer/', {
      params: { dias }
    });
    return response.data.results || response.data;
  }

  async getVencidos(): Promise<DatosPrestador[]> {
    const response = await axiosInstance.get('/habilitacion/prestadores/vencidas/');
    return response.data.results || response.data;
  }

  async iniciarRenovacion(id: number): Promise<DatosPrestador> {
    const response = await axiosInstance.post(`/habilitacion/prestadores/${id}/iniciar_renovacion/`);
    return response.data;
  }

  async getServicios(id: number): Promise<ServicioSede[]> {
    const response = await axiosInstance.get(`/habilitacion/prestadores/${id}/servicios/`);
    return response.data.results || response.data;
  }

  async getAutoevaluaciones(id: number): Promise<Autoevaluacion[]> {
    const response = await axiosInstance.get(`/habilitacion/prestadores/${id}/autoevaluaciones/`);
    return response.data.results || response.data;
  }
}
