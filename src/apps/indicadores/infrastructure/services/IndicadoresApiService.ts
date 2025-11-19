import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Indicator, CreateIndicatorRequest, UpdateIndicatorRequest } from '../../domain/entities/Indicator';

export class IndicadoresApiService {
  private baseUrl = '/indicators';

  // Indicadores
  async getIndicators(): Promise<Indicator[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/indicators/`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener indicadores:', error);
      throw new Error('Error al cargar los indicadores');
    }
  }

  async getIndicatorById(id: number): Promise<Indicator> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/indicators/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener indicador ${id}:`, error);
      throw new Error(`Error al cargar el indicador con ID ${id}`);
    }
  }

  async createIndicator(indicator: CreateIndicatorRequest): Promise<Indicator> {
    try {
      
      // 🔧 Validar datos antes de enviar
      if (!indicator.process || indicator.process === 0) {
        throw new Error('Debe seleccionar un proceso válido');
      }

      const response = await axiosInstance.post(`${this.baseUrl}/indicators/`, indicator);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al crear indicador:', error);
      
      // 🔧 Mejorar manejo de errores
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
      }
      
      throw new Error(error.message || 'Error al crear el indicador');
    }
  }

  async updateIndicator(indicator: UpdateIndicatorRequest): Promise<Indicator> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/indicators/${indicator.id}/`, indicator);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al actualizar indicador:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
      }
      
      throw new Error(error.message || 'Error al actualizar el indicador');
    }
  }

  async deleteIndicator(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/indicators/${id}/`);
    } catch (error: any) {
      console.error(`❌ Error al eliminar indicador ${id}:`, error);
      throw new Error(`Error al eliminar el indicador: ${error.response?.data?.detail || error.message}`);
    }
  }

  async toggleIndicatorStatus(id: number, status: boolean): Promise<Indicator> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/indicators/${id}/`, { status });
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error al cambiar estado del indicador ${id}:`, error);
      throw new Error(`Error al cambiar el estado: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Obtener procesos disponibles para el dropdown
  async getProcesses(): Promise<Array<{id: number, name: string}>> {
    try {
      const response = await axiosInstance.get('/companies/processes/');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener procesos:', error);
      throw new Error('Error al cargar los procesos');
    }
  }
}