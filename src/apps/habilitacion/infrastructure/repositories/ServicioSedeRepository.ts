import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate, ServicioSedeListResponse } from '../../domain/entities';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';
import type { IServicioSedeRepository } from '../../domain/repositories';

/**
 * ServicioSedeRepository
 * Implementa la interfaz de repositorio para ServicioSede
 * Comunica con los endpoints: /api/habilitacion/servicios/
 */
export class ServicioSedeRepository implements IServicioSedeRepository {
  
  /**
   * Obtener todos los servicios con filtros opcionales
   * GET /api/habilitacion/servicios/
   * Parámetros soportados: prestador, modalidad, complejidad, estado_habilitacion
   */
  async getAll(filters?: Record<string, any>): Promise<ServicioSede[]> {
    const response = await axiosInstance.get<ServicioSedeListResponse>('/habilitacion/servicios/', {
      params: filters
    });
    return response.data.results || response.data;
  }

  /**
   * Obtener un servicio por su ID
   * GET /api/habilitacion/servicios/{id}/
   */
  async getById(id: number): Promise<ServicioSede> {
    const response = await axiosInstance.get<ServicioSede>(`/habilitacion/servicios/${id}/`);
    return response.data;
  }

  /**
   * Crear un nuevo servicio
   * POST /api/habilitacion/servicios/
   */
  async create(data: ServicioSedeCreate): Promise<ServicioSede> {
    const response = await axiosInstance.post<ServicioSede>('/habilitacion/servicios/', data);
    return response.data;
  }

  /**
   * Actualizar un servicio existente
   * PATCH /api/habilitacion/servicios/{id}/
   */
  async update(id: number, data: ServicioSedeUpdate): Promise<ServicioSede> {
    const response = await axiosInstance.patch<ServicioSede>(
      `/habilitacion/servicios/${id}/`,
      data
    );
    return response.data;
  }

  /**
   * Eliminar un servicio
   * DELETE /api/habilitacion/servicios/{id}/
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/habilitacion/servicios/${id}/`);
  }

  /**
   * Obtener servicios de un prestador específico
   * GET /api/habilitacion/servicios/?prestador={prestadorId}
   */
  async getByPrestador(prestadorId: number): Promise<ServicioSede[]> {
    const response = await axiosInstance.get<ServicioSedeListResponse>('/habilitacion/servicios/', {
      params: { prestador: prestadorId }
    });
    return response.data.results || response.data;
  }

  /**
   * Obtener servicios próximos a vencer (próximos 90 días por defecto)
   * GET /api/habilitacion/servicios/proximos_a_vencer/
   */
  async getProximosAVencer(dias?: number): Promise<ServicioSede[]> {
    const response = await axiosInstance.get<ServicioSedeListResponse>(
      '/habilitacion/servicios/proximos_a_vencer/'
    );
    return response.data.results || response.data;
  }

  /**
   * Obtener cumplimientos de un servicio específico
   * GET /api/habilitacion/servicios/{id}/cumplimientos/
   */
  async getCumplimientos(id: number): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get<{ results: Cumplimiento[] }>(
      `/habilitacion/servicios/${id}/cumplimientos/`
    );
    return response.data.results || response.data;
  }

  /**
   * Obtener servicios filtrados por complejidad
   * GET /api/habilitacion/servicios/por_complejidad/?complejidad={BAJA|MEDIA|ALTA}
   */
  async getPorComplejidad(complejidad: string): Promise<ServicioSede[]> {
    const response = await axiosInstance.get<ServicioSedeListResponse>(
      '/habilitacion/servicios/por_complejidad/',
      {
        params: { complejidad }
      }
    );
    return response.data.results || response.data;
  }

  /**
   * Método legado para compatibilidad hacia atrás
   * @deprecated Usar getByPrestador() en su lugar
   */
  async getByHeadquarters(headquartersId: number): Promise<ServicioSede[]> {
    // En el backend, los servicios se vinculan a prestador (DatosPrestador),
    // no directamente a headquarters. Este método mantiene compatibilidad.
    return this.getAll({ prestador_id: headquartersId });
  }
}
