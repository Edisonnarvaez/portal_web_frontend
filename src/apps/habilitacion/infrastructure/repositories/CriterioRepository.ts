import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type {
  Criterio,
  CriterioCreate,
  CriterioUpdate,
  CriterioEvaluacion,
  CriterioEvaluacionCreate,
  CriterioEvaluacionUpdate,
} from '../../domain/entities';
import type { ICriterioRepository, ICriterioEvaluacionRepository } from '../../domain/repositories';
import type { CriterioEvaluacionFilters, CriterioFilters } from '../../domain/types';
import { parseListResponse } from '../../shared/utils/apiResponse';

export class CriterioRepository implements ICriterioRepository {
  async getAll(filters?: CriterioFilters): Promise<Criterio[]> {
    const response = await axiosInstance.get('/normativity/criterios/', { params: filters });
    return parseListResponse<Criterio>(response.data);
  }

  async getById(id: number): Promise<Criterio> {
    const response = await axiosInstance.get(`/normativity/criterios/${id}/`);
    return response.data;
  }

  async create(data: CriterioCreate): Promise<Criterio> {
    const response = await axiosInstance.post('/normativity/criterios/', data);
    return response.data;
  }

  async update(id: number, data: CriterioUpdate): Promise<Criterio> {
    const response = await axiosInstance.patch(`/normativity/criterios/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/normativity/criterios/${id}/`);
  }

  async getByCategoria(categoria: string): Promise<Criterio[]> {
    const response = await axiosInstance.get('/normativity/criterios/', {
      params: { categoria }
    });
    return parseListResponse<Criterio>(response.data);
  }
}

export class CriterioEvaluacionRepository implements ICriterioEvaluacionRepository {
  async getAll(filters?: CriterioEvaluacionFilters): Promise<CriterioEvaluacion[]> {
    const response = await axiosInstance.get('/normativity/criterios/', { params: filters });
    return parseListResponse<CriterioEvaluacion>(response.data);
  }

  async getByAutoevaluacion(autoevaluacionId: number): Promise<CriterioEvaluacion[]> {
    const response = await axiosInstance.get('/normativity/criterios/', {
      params: { autoevaluacion: autoevaluacionId }
    });
    return parseListResponse<CriterioEvaluacion>(response.data);
  }

  async create(data: CriterioEvaluacionCreate): Promise<CriterioEvaluacion> {
    const response = await axiosInstance.post('/normativity/criterios/', data);
    return response.data;
  }

  async update(id: number, data: CriterioEvaluacionUpdate): Promise<CriterioEvaluacion> {
    const response = await axiosInstance.patch(`/normativity/criterios/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/normativity/criterios/${id}/`);
  }
}
