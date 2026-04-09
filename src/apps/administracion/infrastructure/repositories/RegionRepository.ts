import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Region, RegionCreate, RegionUpdate } from '../../domain/entities/Region';

/**
 * RegionRepository
 * Gestiona todas las llamadas HTTP para regiones
 * Endpoints: /api/companies/regions/
 */
export class RegionRepository {
  /**
   * Obtener región por ID
   * GET /api/companies/regions/{id}/
   */
  async getRegion(id: number): Promise<Region> {
    const response = await axiosInstance.get<Region>(`/companies/regions/${id}/`);
    return response.data;
  }

  /**
   * Obtener todas las regiones
   * GET /api/companies/regions/
   */
  async getAllRegions(): Promise<Region[]> {
    const response = await axiosInstance.get<{ results?: Region[] } | Region[]>('/companies/regions/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Crear nueva región
   * POST /api/companies/regions/
   */
  async createRegion(data: RegionCreate): Promise<Region> {
    const response = await axiosInstance.post<Region>('/companies/regions/', data);
    return response.data;
  }

  /**
   * Actualizar región
   * PATCH /api/companies/regions/{id}/
   */
  async updateRegion(id: number, data: RegionUpdate): Promise<Region> {
    const response = await axiosInstance.patch<Region>(`/companies/regions/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar región
   * DELETE /api/companies/regions/{id}/
   */
  async deleteRegion(id: number): Promise<void> {
    await axiosInstance.delete(`/companies/regions/${id}/`);
  }
}
