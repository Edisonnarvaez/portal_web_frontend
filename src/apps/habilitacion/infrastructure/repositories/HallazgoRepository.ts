import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Hallazgo, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos } from '../../domain/entities';
import type { IHallazgoRepository } from '../../domain/repositories';

export class HallazgoRepository implements IHallazgoRepository {
  async getAll(filters?: Record<string, any>): Promise<Hallazgo[]> {
    const response = await axiosInstance.get('/habilitacion/hallazgos/', { params: filters });
    return response.data;
  }

  async getById(id: number): Promise<Hallazgo> {
    const response = await axiosInstance.get(`/habilitacion/hallazgos/${id}/`);
    return response.data;
  }

  async getByAutoevaluacion(autoevaluacionId: number): Promise<Hallazgo[]> {
    const response = await axiosInstance.get('/habilitacion/hallazgos/', {
      params: { autoevaluacion: autoevaluacionId }
    });
    return response.data;
  }

  async create(data: HallazgoCreate): Promise<Hallazgo> {
    const response = await axiosInstance.post('/habilitacion/hallazgos/', data);
    return response.data;
  }

  async update(id: number, data: HallazgoUpdate): Promise<Hallazgo> {
    const response = await axiosInstance.patch(`/habilitacion/hallazgos/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/hallazgos/${id}/`);
  }

  async getEstadisticas(autoevaluacionId: number): Promise<EstadisticasHallazgos> {
    const response = await axiosInstance.get(`/habilitacion/hallazgos/estadisticas/${autoevaluacionId}/`);
    return response.data;
  }

  async getAbiertos(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get('/habilitacion/hallazgos/', {
      params: { estado: 'ABIERTO' }
    });
    return response.data;
  }

  async getCriticos(): Promise<Hallazgo[]> {
    const response = await axiosInstance.get('/habilitacion/hallazgos/', {
      params: { severidad: 'CRÍTICA' }
    });
    return response.data;
  }
}
