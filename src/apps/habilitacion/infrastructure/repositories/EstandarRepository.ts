import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Estandar, EstandarDetail } from '../../domain/entities';
import type { IEstandarRepository } from '../../domain/repositories';

export class EstandarRepository implements IEstandarRepository {
  /**
   * Get all standards (simplified list)
   * GET /api/normativity/estandares/
   */
  async getAll(filters?: Record<string, any>): Promise<Estandar[]> {
    const response = await axiosInstance.get('/normativity/estandares/', { params: filters });
    return response.data.results || response.data;
  }

  /**
   * Get a specific standard by ID with full details
   * GET /api/normativity/estandares/{id}/
   */
  async getById(id: number): Promise<EstandarDetail> {
    const response = await axiosInstance.get(`/normativity/estandares/${id}/`);
    return response.data;
  }

  /**
   * Get all standards with all criterios nested
   * GET /api/normativity/estandares/todos/
   */
  async getAllWithCriterios(): Promise<Estandar[]> {
    const response = await axiosInstance.get('/normativity/estandares/todos/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  }

  /**
   * Get criterios for a specific standard
   * GET /api/normativity/estandares/{id}/criterios/
   */
  async getCriteriosByEstandar(estandarId: number): Promise<any[]> {
    const response = await axiosInstance.get(`/normativity/estandares/${estandarId}/criterios/`);
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  }
}
