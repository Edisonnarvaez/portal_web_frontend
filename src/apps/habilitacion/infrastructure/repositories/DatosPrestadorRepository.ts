import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { DatosPrestador, DatosPrestadorCreate, DatosPrestadorUpdate } from '../../domain/entities';
import type { ServicioSede } from '../../domain/entities/ServicioSede';
import type { Autoevaluacion } from '../../domain/entities/Autoevaluacion';
import type { IDatosPrestadorRepository } from '../../domain/repositories';
import type { DatosPrestadorFilters } from '../../domain/types';
import { parseListResponse } from '../../shared/utils/apiResponse';

export class DatosPrestadorRepository implements IDatosPrestadorRepository {
  async getAll(filters?: DatosPrestadorFilters): Promise<DatosPrestador[]> {
    const response = await axiosInstance.get('/habilitacion/prestadores/', { params: filters });
    return parseListResponse<DatosPrestador>(response.data);
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
    return parseListResponse<DatosPrestador>(response.data);
  }

  async getVencidos(): Promise<DatosPrestador[]> {
    const response = await axiosInstance.get('/habilitacion/prestadores/vencidas/');
    return parseListResponse<DatosPrestador>(response.data);
  }

  async iniciarRenovacion(id: number): Promise<DatosPrestador> {
    const response = await axiosInstance.post(`/habilitacion/prestadores/${id}/iniciar_renovacion/`);
    return response.data;
  }

  async getServicios(id: number): Promise<ServicioSede[]> {
    const response = await axiosInstance.get(`/habilitacion/prestadores/${id}/servicios/`);
    return parseListResponse<ServicioSede>(response.data);
  }

  async getAutoevaluaciones(id: number): Promise<Autoevaluacion[]> {
    const response = await axiosInstance.get(`/habilitacion/prestadores/${id}/autoevaluaciones/`);
    return parseListResponse<Autoevaluacion>(response.data);
  }
}
