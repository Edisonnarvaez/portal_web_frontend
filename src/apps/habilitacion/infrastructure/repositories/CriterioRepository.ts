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

const normalizeCriterio = (item: any): Criterio => {
  const estandarId = item.estandar_id ?? (typeof item.estandar === 'number' ? item.estandar : item.estandar?.id);
  return {
    ...item,
    estandar_id: estandarId,
  };
};

const toBackendCriterioPayload = (data: CriterioCreate | CriterioUpdate) => {
  const payload: any = { ...data };
  if (payload.estandar_id !== undefined) {
    payload.estandar = payload.estandar_id;
    delete payload.estandar_id;
  }
  return payload;
};

export class CriterioRepository implements ICriterioRepository {
  async getAll(filters?: CriterioFilters): Promise<Criterio[]> {
    const response = await axiosInstance.get('/normativity/criterios/', { params: filters });
    return parseListResponse<any>(response.data).map(normalizeCriterio);
  }

  async getById(id: number): Promise<Criterio> {
    const response = await axiosInstance.get(`/normativity/criterios/${id}/`);
    return normalizeCriterio(response.data);
  }

  async create(data: CriterioCreate): Promise<Criterio> {
    const response = await axiosInstance.post('/normativity/criterios/', toBackendCriterioPayload(data));
    return normalizeCriterio(response.data);
  }

  async update(id: number, data: CriterioUpdate): Promise<Criterio> {
    const response = await axiosInstance.patch(`/normativity/criterios/${id}/`, toBackendCriterioPayload(data));
    return normalizeCriterio(response.data);
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/normativity/criterios/${id}/`);
  }

  async getByCategoria(categoria: string): Promise<Criterio[]> {
    const response = await axiosInstance.get('/normativity/criterios/', {
      params: { categoria }
    });
    return parseListResponse<any>(response.data).map(normalizeCriterio);
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
