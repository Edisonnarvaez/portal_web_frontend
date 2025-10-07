import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Tercero, CreateTerceroRequest, UpdateTerceroRequest, Pais, Departamento, Municipio, TipoTercero } from '../../domain/entities/Tercero';

export class TerceroRepository {
  private baseUrl = '/terceros';

  async getAll(): Promise<Tercero[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/terceros/`);
      console.log('📥 Terceros obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener terceros:', error);
      throw new Error('Error al cargar los terceros');
    }
  }

  async getById(id: number): Promise<Tercero> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/terceros/${id}/`);
      console.log('📥 Tercero obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error al obtener tercero ${id}:`, error);
      throw new Error(`Error al cargar el tercero con ID ${id}`);
    }
  }

  async create(tercero: CreateTerceroRequest): Promise<Tercero> {
    try {
      console.log('📤 Creando tercero:', tercero);
      const response = await axiosInstance.post(`${this.baseUrl}/terceros/`, tercero);
      console.log('📥 Tercero creado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al crear tercero:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
      }
      
      throw new Error(error.message || 'Error al crear el tercero');
    }
  }

  async update(tercero: UpdateTerceroRequest): Promise<Tercero> {
    try {
      console.log('📤 Actualizando tercero:', tercero);
      const response = await axiosInstance.put(`${this.baseUrl}/terceros/${tercero.tercero_id}/`, tercero);
      console.log('📥 Tercero actualizado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al actualizar tercero:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
      }
      
      throw new Error(error.message || 'Error al actualizar el tercero');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/terceros/${id}/`);
      console.log(`✅ Tercero ${id} eliminado exitosamente`);
    } catch (error: any) {
      console.error(`❌ Error al eliminar tercero ${id}:`, error);
      throw new Error(`Error al eliminar el tercero: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Métodos para obtener datos relacionados
  async getPaises(): Promise<Pais[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/paises/`);
      console.log('📥 Países obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener países:', error);
      throw new Error('Error al cargar los países');
    }
  }

  async getDepartamentos(paisId?: number): Promise<Departamento[]> {
    try {
      const url = paisId 
        ? `${this.baseUrl}/departamentos/?pais=${paisId}` 
        : `${this.baseUrl}/departamentos/`;
      const response = await axiosInstance.get(url);
      console.log('📥 Departamentos obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener departamentos:', error);
      throw new Error('Error al cargar los departamentos');
    }
  }

  async getMunicipios(departamentoId?: number): Promise<Municipio[]> {
    try {
      const url = departamentoId 
        ? `${this.baseUrl}/municipios/?departamento=${departamentoId}` 
        : `${this.baseUrl}/municipios/`;
      const response = await axiosInstance.get(url);
      console.log('📥 Municipios obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener municipios:', error);
      throw new Error('Error al cargar los municipios');
    }
  }

  async getTiposTercero(): Promise<TipoTercero[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/tipos-tercero/`);
      console.log('📥 Tipos de tercero obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener tipos de tercero:', error);
      throw new Error('Error al cargar los tipos de tercero');
    }
  }
}