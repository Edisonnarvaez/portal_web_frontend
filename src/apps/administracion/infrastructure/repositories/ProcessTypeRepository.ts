import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { ProcessType, ProcessTypeCreate, ProcessTypeUpdate } from '../../domain/entities/ProcessType';

/**
 * ProcessTypeRepository
 * Gestiona todas las llamadas HTTP para tipos de procesos
 * Endpoints: /api/companies/process_types/
 */
export class ProcessTypeRepository {
  /**
   * Obtener tipo de proceso por ID
   * GET /api/companies/process_types/{id}/
   */
  async getProcessType(id: number): Promise<ProcessType> {
    const response = await axiosInstance.get<ProcessType>(`/companies/process_types/${id}/`);
    return response.data;
  }

  /**
   * Obtener todos los tipos de procesos
   * GET /api/companies/process_types/
   */
  async getAllProcessTypes(): Promise<ProcessType[]> {
    const response = await axiosInstance.get<{ results?: ProcessType[] } | ProcessType[]>('/companies/process_types/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Obtener tipos de procesos de una empresa
   * GET /api/companies/process_types/?company={id}
   */
  async getProcessTypesByCompany(companyId: number): Promise<ProcessType[]> {
    const response = await axiosInstance.get<{ results?: ProcessType[] } | ProcessType[]>(
      '/companies/process_types/',
      { params: { company: companyId } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Crear nuevo tipo de proceso
   * POST /api/companies/process_types/
   */
  async createProcessType(data: ProcessTypeCreate): Promise<ProcessType> {
    const response = await axiosInstance.post<ProcessType>('/companies/process_types/', data);
    return response.data;
  }

  /**
   * Actualizar tipo de proceso
   * PATCH /api/companies/process_types/{id}/
   */
  async updateProcessType(id: number, data: ProcessTypeUpdate): Promise<ProcessType> {
    const response = await axiosInstance.patch<ProcessType>(`/companies/process_types/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar tipo de proceso
   * DELETE /api/companies/process_types/{id}/
   */
  async deleteProcessType(id: number): Promise<void> {
    await axiosInstance.delete(`/companies/process_types/${id}/`);
  }

  /**
   * Cambiar estado de un tipo de proceso
   * PATCH /api/companies/process_types/{id}/
   */
  async toggleProcessTypeStatus(id: number, status: boolean): Promise<ProcessType> {
    return this.updateProcessType(id, { id, status } as ProcessTypeUpdate);
  }
}
