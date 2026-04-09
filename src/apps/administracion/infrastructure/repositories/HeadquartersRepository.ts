import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Headquarters, HeadquartersCreate, HeadquartersUpdate } from '../../domain/entities/Headquarters';

/**
 * HeadquartersRepository
 * Gestiona todas las llamadas HTTP para sedes
 * Endpoints: /api/companies/headquarters/
 */
export class HeadquartersRepository {
  /**
   * Obtener sede por ID
   * GET /api/companies/headquarters/{id}/
   */
  async getHeadquarter(id: number): Promise<Headquarters> {
    const response = await axiosInstance.get<Headquarters>(`/companies/headquarters/${id}/`);
    return response.data;
  }

  /**
   * Obtener todas las sedes
   * GET /api/companies/headquarters/
   */
  async getAllHeadquarters(): Promise<Headquarters[]> {
    const response = await axiosInstance.get<{ results?: Headquarters[] } | Headquarters[]>('/companies/headquarters/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Obtener sedes de una empresa específica
   * GET /api/companies/headquarters/?company={id}
   */
  async getHeadquartersByCompany(companyId: number): Promise<Headquarters[]> {
    const response = await axiosInstance.get<{ results?: Headquarters[] } | Headquarters[]>(
      '/companies/headquarters/',
      { params: { company: companyId } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Crear nueva sede
   * POST /api/companies/headquarters/
   */
  async createHeadquarter(data: HeadquartersCreate): Promise<Headquarters> {
    const response = await axiosInstance.post<Headquarters>('/companies/headquarters/', data);
    return response.data;
  }

  /**
   * Actualizar sede
   * PATCH /api/companies/headquarters/{id}/
   */
  async updateHeadquarter(id: number, data: HeadquartersUpdate): Promise<Headquarters> {
    const response = await axiosInstance.patch<Headquarters>(`/companies/headquarters/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar sede
   * DELETE /api/companies/headquarters/{id}/
   */
  async deleteHeadquarter(id: number): Promise<void> {
    await axiosInstance.delete(`/companies/headquarters/${id}/`);
  }

  /**
   * Cambiar estado de una sede
   * PATCH /api/companies/headquarters/{id}/
   */
  async toggleHeadquarterStatus(id: number, status: boolean): Promise<Headquarters> {
    return this.updateHeadquarter(id, { id, status } as HeadquartersUpdate);
  }
}
