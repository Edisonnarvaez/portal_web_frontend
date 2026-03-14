import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Estandar, EstandarCreate, EstandarDetail, EstandarUpdate } from '../../domain/entities';
import type { Criterio } from '../../domain/entities/Criterio';
import type { IEstandarRepository } from '../../domain/repositories';
import type { EstandarFilters } from '../../domain/types';
import { parseListResponse } from '../../shared/utils/apiResponse';

export class EstandarRepository implements IEstandarRepository {
  /**
   * Get all standards (simplified list)
   * GET /api/normativity/estandares/
   */
  async getAll(filters?: EstandarFilters): Promise<Estandar[]> {
    const response = await axiosInstance.get('/normativity/estandares/', { params: filters });
    return parseListResponse<Estandar>(response.data);
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
    return parseListResponse<Estandar>(response.data);
  }

  /**
   * Get criterios for a specific standard
   * GET /api/normativity/estandares/{id}/criterios/
   */
  async getCriteriosByEstandar(estandarId: number): Promise<Criterio[]> {
    const response = await axiosInstance.get(`/normativity/estandares/${estandarId}/criterios/`);
    return parseListResponse<Criterio>(response.data);
  }

  async create(data: EstandarCreate): Promise<Estandar> {
    const response = await axiosInstance.post('/normativity/estandares/', data);
    return response.data;
  }

  async update(id: number, data: EstandarUpdate): Promise<Estandar> {
    const response = await axiosInstance.patch(`/normativity/estandares/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/normativity/estandares/${id}/`);
  }
}
