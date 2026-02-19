import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate } from '../../domain/entities';
import type { IServicioSedeRepository } from '../../domain/repositories';

export class ServicioSedeRepository implements IServicioSedeRepository {
  async getAll(filters?: Record<string, any>): Promise<ServicioSede[]> {
    const response = await axiosInstance.get('/habilitacion/servicios/', { params: filters });
    return response.data;
  }

  async getById(id: number): Promise<ServicioSede> {
    const response = await axiosInstance.get(`/habilitacion/servicios/${id}/`);
    return response.data;
  }

  async create(data: ServicioSedeCreate): Promise<ServicioSede> {
    const response = await axiosInstance.post('/habilitacion/servicios/', data);
    return response.data;
  }

  async update(id: number, data: ServicioSedeUpdate): Promise<ServicioSede> {
    const response = await axiosInstance.patch(`/habilitacion/servicios/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/servicios/${id}/`);
  }

  async getByHeadquarters(headquartersId: number): Promise<ServicioSede[]> {
    const response = await axiosInstance.get('/habilitacion/servicios/', {
      params: { sede: headquartersId }
    });
    return response.data;
  }

  async getProximosAVencer(dias: number = 90): Promise<ServicioSede[]> {
    const response = await axiosInstance.get('/habilitacion/servicios/proximos_a_vencer/', {
      params: { dias }
    });
    return response.data;
  }
}
