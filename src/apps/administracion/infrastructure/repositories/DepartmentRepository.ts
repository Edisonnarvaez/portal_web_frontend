import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Department, DepartmentCreate, DepartmentUpdate } from '../../domain/entities/Department';

/**
 * DepartmentRepository
 * Gestiona todas las llamadas HTTP para departamentos/áreas
 * Endpoints: /api/companies/departments/
 */
export class DepartmentRepository {
  /**
   * Obtener departamento por ID
   * GET /api/companies/departments/{id}/
   */
  async getDepartment(id: number): Promise<Department> {
    const response = await axiosInstance.get<Department>(`/companies/departments/${id}/`);
    return response.data;
  }

  /**
   * Obtener todos los departamentos
   * GET /api/companies/departments/
   */
  async getAllDepartments(): Promise<Department[]> {
    const response = await axiosInstance.get<{ results?: Department[] } | Department[]>('/companies/departments/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Obtener departamentos de una empresa
   * GET /api/companies/departments/?company={id}
   */
  async getDepartmentsByCompany(companyId: number): Promise<Department[]> {
    const response = await axiosInstance.get<{ results?: Department[] } | Department[]>(
      '/companies/departments/',
      { params: { company: companyId } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Crear nuevo departamento
   * POST /api/companies/departments/
   */
  async createDepartment(data: DepartmentCreate): Promise<Department> {
    const response = await axiosInstance.post<Department>('/companies/departments/', data);
    return response.data;
  }

  /**
   * Actualizar departamento
   * PATCH /api/companies/departments/{id}/
   */
  async updateDepartment(id: number, data: DepartmentUpdate): Promise<Department> {
    const response = await axiosInstance.patch<Department>(`/companies/departments/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar departamento
   * DELETE /api/companies/departments/{id}/
   */
  async deleteDepartment(id: number): Promise<void> {
    await axiosInstance.delete(`/companies/departments/${id}/`);
  }

  /**
   * Cambiar estado de un departamento
   * PATCH /api/companies/departments/{id}/
   */
  async toggleDepartmentStatus(id: number, status: boolean): Promise<Department> {
    return this.updateDepartment(id, { id, status } as DepartmentUpdate);
  }
}
