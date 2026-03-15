import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type {
  Cumplimiento,
  CumplimientoCreate,
  CumplimientoUpdate,
  ServiciosDeAutoevaluacionResponse,
} from '../../domain/entities';
import type { ICumplimientoRepository } from '../../domain/repositories';
import type { CumplimientoFilters } from '../../domain/types';
import { parseListResponse } from '../../shared/utils/apiResponse';

export class CumplimientoRepository implements ICumplimientoRepository {
  private normalizePayload<T extends CumplimientoCreate | CumplimientoUpdate>(data: T): T {
    const evidencias = (data as CumplimientoCreate).documentos_evidencia;
    if (!Array.isArray(evidencias)) return data;

    return {
      ...data,
      documentos_evidencia: evidencias,
      documentos_evidencia_ids: evidencias,
    } as T;
  }

  async getAll(filters?: CumplimientoFilters): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/', { params: filters });
    return parseListResponse<Cumplimiento>(response.data);
  }

  async getById(id: number): Promise<Cumplimiento> {
    const response = await axiosInstance.get(`/habilitacion/cumplimientos/${id}/`);
    return response.data;
  }

  async create(data: CumplimientoCreate): Promise<Cumplimiento> {
    const response = await axiosInstance.post('/habilitacion/cumplimientos/', this.normalizePayload(data));
    return response.data;
  }

  async update(id: number, data: CumplimientoUpdate): Promise<Cumplimiento> {
    const response = await axiosInstance.patch(`/habilitacion/cumplimientos/${id}/`, this.normalizePayload(data));
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/cumplimientos/${id}/`);
  }

  async getSinCumplir(): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/sin_cumplir/');
    return parseListResponse<Cumplimiento>(response.data);
  }

  async getConPlanMejora(): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/con_plan_mejora/');
    return parseListResponse<Cumplimiento>(response.data);
  }

  async getMejorasVencidas(): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get('/habilitacion/cumplimientos/mejoras_vencidas/');
    return parseListResponse<Cumplimiento>(response.data);
  }

  /**
   * Obtener servicios disponibles para una autoevaluación específica
   * GET /api/habilitacion/cumplimientos/servicios_de_autoevaluacion/?autoevaluacion_id={id}
   * Retorna: { autoevaluacion, prestador, servicios, total_servicios }
   */
  async getServiciosDeAutoevaluacion(autoevaluacionId: number): Promise<ServiciosDeAutoevaluacionResponse> {
    const response = await axiosInstance.get<ServiciosDeAutoevaluacionResponse>(
      '/habilitacion/cumplimientos/servicios_de_autoevaluacion/',
      { params: { autoevaluacion_id: autoevaluacionId } }
    );
    return response.data;
  }
}
