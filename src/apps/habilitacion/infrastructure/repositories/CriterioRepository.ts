import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Criterio, CriterioCreate, CriterioUpdate, CriterioEvaluacion } from '../../domain/entities';
import type { ICriterioRepository, ICriterioEvaluacionRepository } from '../../domain/repositories';

export class CriterioRepository implements ICriterioRepository {
  async getAll(filters?: Record<string, any>): Promise<Criterio[]> {
    const response = await axiosInstance.get('/normativity/criterios/', { params: filters });
    return response.data.results || response.data;
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
    return response.data.results || response.data;
  }
}

export class CriterioEvaluacionRepository implements ICriterioEvaluacionRepository {
  async getAll(filters?: Record<string, any>): Promise<CriterioEvaluacion[]> {
    const response = await axiosInstance.get('/normativity/criterios-evaluacion/', { params: filters });
    return response.data;
  }

  async getByAutoevaluacion(autoevaluacionId: number): Promise<CriterioEvaluacion[]> {
    const response = await axiosInstance.get('/normativity/criterios-evaluacion/', {
      params: { autoevaluacion: autoevaluacionId }
    });
    return response.data;
  }

  async create(data: any): Promise<CriterioEvaluacion> {
    const response = await axiosInstance.post('/normativity/criterios-evaluacion/', data);
    return response.data;
  }

  async update(id: number, data: any): Promise<CriterioEvaluacion> {
    const response = await axiosInstance.patch(`/normativity/criterios-evaluacion/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/normativity/criterios-evaluacion/${id}/`);
  }
}
