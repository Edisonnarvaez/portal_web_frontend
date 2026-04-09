import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Process, ProcessCreate, ProcessUpdate } from '../../domain/entities/Process';

/**
 * ProcessRepository
 * Gestiona todas las llamadas HTTP para procesos
 * Endpoints: /api/companies/processes/
 */
export class ProcessRepository {
  /**
   * Obtener proceso por ID
   * GET /api/companies/processes/{id}/
   */
  async getProcess(id: number): Promise<Process> {
    const response = await axiosInstance.get<Process>(`/companies/processes/${id}/`);
    return response.data;
  }

  /**
   * Obtener todos los procesos
   * GET /api/companies/processes/
   */
  async getAllProcesses(): Promise<Process[]> {
    const response = await axiosInstance.get<{ results?: Process[] } | Process[]>('/companies/processes/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Obtener procesos de una empresa
   * GET /api/companies/processes/?company={id}
   */
  async getProcessesByCompany(companyId: number): Promise<Process[]> {
    const response = await axiosInstance.get<{ results?: Process[] } | Process[]>(
      '/companies/processes/',
      { params: { company: companyId } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Obtener procesos de un tipo específico
   * GET /api/companies/processes/?processType={id}
   */
  async getProcessesByProcessType(processTypeId: number): Promise<Process[]> {
    const response = await axiosInstance.get<{ results?: Process[] } | Process[]>(
      '/companies/processes/',
      { params: { process_type: processTypeId } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  }

  /**
   * Crear nuevo proceso
   * POST /api/companies/processes/
   */
  async createProcess(data: ProcessCreate): Promise<Process> {
    const response = await axiosInstance.post<Process>('/companies/processes/', data);
    return response.data;
  }

  /**
   * Actualizar proceso
   * PATCH /api/companies/processes/{id}/
   */
  async updateProcess(id: number, data: ProcessUpdate): Promise<Process> {
    const response = await axiosInstance.patch<Process>(`/companies/processes/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar proceso
   * DELETE /api/companies/processes/{id}/
   */
  async deleteProcess(id: number): Promise<void> {
    await axiosInstance.delete(`/companies/processes/${id}/`);
  }

  /**
   * Cambiar estado de un proceso
   * PATCH /api/companies/processes/{id}/
   */
  async toggleProcessStatus(id: number, status: boolean): Promise<Process> {
    return this.updateProcess(id, { id, status } as ProcessUpdate);
  }
}
