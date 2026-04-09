import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Municipality, MunicipalityCreate, MunicipalityUpdate } from '../../domain/entities/Municipality';

/**
 * MunicipalityRepository
 * Gestiona todas las llamadas HTTP para municipios
 * Endpoints: /api/companies/municipalities/
 */
export class MunicipalityRepository {
  /**
   * Obtener municipio por ID
   * GET /api/companies/municipalities/{id}/
   */
  async getMunicipality(id: number): Promise<Municipality> {
    const response = await axiosInstance.get<Municipality>(`/companies/municipalities/${id}/`);
    return response.data;
  }

  /**
   * Obtener todas los municipios
   * GET /api/companies/municipalities/
   */
  async getAllMunicipalities(): Promise<Municipality[]> {
    const response = await axiosInstance.get<{ results?: Municipality[] } | Municipality[]>('/companies/municipalities/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Obtener municipios de una región
   * GET /api/companies/municipalities/?region={id}
   */
  async getMunicipalitiesByRegion(regionId: number): Promise<Municipality[]> {
    const response = await axiosInstance.get<{ results?: Municipality[] } | Municipality[]>(
      '/companies/municipalities/',
      { params: { region: regionId } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Crear nuevo municipio
   * POST /api/companies/municipalities/
   */
  async createMunicipality(data: MunicipalityCreate): Promise<Municipality> {
    const response = await axiosInstance.post<Municipality>('/companies/municipalities/', data);
    return response.data;
  }

  /**
   * Actualizar municipio
   * PATCH /api/companies/municipalities/{id}/
   */
  async updateMunicipality(id: number, data: MunicipalityUpdate): Promise<Municipality> {
    const response = await axiosInstance.patch<Municipality>(`/companies/municipalities/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar municipio
   * DELETE /api/companies/municipalities/{id}/
   */
  async deleteMunicipality(id: number): Promise<void> {
    await axiosInstance.delete(`/companies/municipalities/${id}/`);
  }
}
