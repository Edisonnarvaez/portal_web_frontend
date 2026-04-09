import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Company, CompanyCreate, CompanyUpdate } from '../../domain/entities/Company';

/**
 * CompanyRepository
 * Gestiona todas las llamadas HTTP para empresas
 * Endpoints: /api/companies/companies/
 */
export class CompanyRepository {
  /**
   * Obtener empresa por ID
   * GET /api/companies/companies/{id}/
   */
  async getCompany(id: number): Promise<Company> {
    const response = await axiosInstance.get<Company>(`/companies/companies/${id}/`);
    return response.data;
  }

  /**
   * Obtener todas las empresas
   * GET /api/companies/companies/
   */
  async getAllCompanies(): Promise<Company[]> {
    const response = await axiosInstance.get<{ results?: Company[] } | Company[]>('/companies/companies/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Actualizar una empresa
   * PATCH /api/companies/companies/{id}/
   */
  async updateCompany(id: number, data: CompanyUpdate | FormData): Promise<Company> {
    // Si es FormData, no establecer Content-Type (el navegador lo hará)
    if (data instanceof FormData) {
      const response = await axiosInstance.patch<Company>(`/companies/companies/${id}/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // Si es un objeto JSON normal
    const response = await axiosInstance.patch<Company>(`/companies/companies/${id}/`, data);
    return response.data;
  }

  /**
   * Crear una nueva empresa
   * POST /api/companies/companies/
   */
  async createCompany(data: CompanyCreate): Promise<Company> {
    const response = await axiosInstance.post<Company>('/companies/companies/', data);
    return response.data;
  }

  /**
   * Eliminar una empresa
   * DELETE /api/companies/companies/{id}/
   */
  async deleteCompany(id: number): Promise<void> {
    await axiosInstance.delete(`/companies/companies/${id}/`);
  }
}
