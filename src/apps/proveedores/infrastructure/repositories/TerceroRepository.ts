import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Tercero, CreateTerceroRequest, UpdateTerceroRequest, Pais, Departamento, Municipio, TipoTercero } from '../../domain/entities/Tercero';

export class TerceroRepository {
  private baseUrl = '/terceros';

  /**
   * Try to extract a meaningful error message from backend responses.
   * The backend sometimes returns an HTML Django debug page when an exception
   * occurs (for example a missing DB table). In that case axios throws but
   * error.response.data may contain the HTML string. We attempt to detect
   * common patterns (OperationalError, "no such table") and return a
   * concise message to surface in the UI.
   */
  private extractBackendErrorMessage(error: any): string {
    try {
      const data = error?.response?.data;
      if (!data) return error.message || 'Error desconocido del servidor';

      // If backend returned JSON, build a concise message from fields
      if (typeof data === 'object') {
        const entries = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        return entries || JSON.stringify(data);
      }

      // If it's a string, it may be HTML (Django debug) or plain text.
      if (typeof data === 'string') {
        // Check for common DB error phrase
        const lowered = data.toLowerCase();
        if (lowered.includes('operationalerror') || lowered.includes('no such table')) {
          // Try to extract the precise phrase
          const match = data.match(/no such table:\s*([\w_\.]+)/i);
          if (match) return `Error de base de datos: tabla faltante ${match[1]}`;
          return 'Error de base de datos en el servidor (tabla faltante o migraciones pendientes)';
        }

        // Fallback: strip HTML tags to get a shorter message
        const stripped = data.replace(/<[^>]*>/g, '').trim();
        return stripped.substring(0, 400) || 'Respuesta inesperada del servidor';
      }
      return error.message || 'Error desconocido del servidor';
    } catch (e) {
      return error.message || 'Error desconocido del servidor';
    }
  }

  async getAll(): Promise<Tercero[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/terceros/`);
      const data = response.data;
      console.log('📥 Terceros obtenidos:', data);
      // Some deployments return a paginated object { count, next, previous, results }
      return Array.isArray(data) ? data : data.results || [];
    } catch (error: any) {
      console.error('❌ Error al obtener terceros:', error);
      throw new Error(this.extractBackendErrorMessage(error) || 'Error al cargar los terceros');
    }
  }

  async getById(id: number): Promise<Tercero> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/terceros/${id}/`);
      console.log('📥 Tercero obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error al obtener tercero ${id}:`, error);
      throw new Error(this.extractBackendErrorMessage(error) || `Error al cargar el tercero con ID ${id}`);
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

      // Prefer structured backend validation messages when present
      if (error.response?.data && typeof error.response.data === 'object') {
        const backendErrors = error.response.data;
        const errorMessages = Object.entries(backendErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(`Errores de validación:\n${errorMessages}`);
      }

      // If backend returned HTML/debug, extract a friendly message
      throw new Error(this.extractBackendErrorMessage(error) || error.message || 'Error al crear el tercero');
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

      if (error.response?.data && typeof error.response.data === 'object') {
        const backendErrors = error.response.data;
        const errorMessages = Object.entries(backendErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(`Errores de validación:\n${errorMessages}`);
      }

      throw new Error(this.extractBackendErrorMessage(error) || error.message || 'Error al actualizar el tercero');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/terceros/${id}/`);
      console.log(`✅ Tercero ${id} eliminado exitosamente`);
    } catch (error: any) {
      console.error(`❌ Error al eliminar tercero ${id}:`, error);
      throw new Error(this.extractBackendErrorMessage(error) || `Error al eliminar el tercero: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Métodos para obtener datos relacionados
  async getPaises(): Promise<Pais[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/paises/`);
      const data = response.data;
      console.log('📥 Países obtenidos:', data);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error: any) {
      console.error('❌ Error al obtener países:', error);
      throw new Error(this.extractBackendErrorMessage(error) || 'Error al cargar los países');
    }
  }

  async getDepartamentos(paisId?: number): Promise<Departamento[]> {
    try {
      const url = paisId 
        ? `${this.baseUrl}/departamentos/?pais=${paisId}` 
        : `${this.baseUrl}/departamentos/`;
      const response = await axiosInstance.get(url);
      const data = response.data;
      console.log('📥 Departamentos obtenidos:', data);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error: any) {
      console.error('❌ Error al obtener departamentos:', error);
      throw new Error(this.extractBackendErrorMessage(error) || 'Error al cargar los departamentos');
    }
  }

  async getMunicipios(departamentoId?: number): Promise<Municipio[]> {
    try {
      const url = departamentoId 
        ? `${this.baseUrl}/municipios/?departamento=${departamentoId}` 
        : `${this.baseUrl}/municipios/`;
      const response = await axiosInstance.get(url);
      const data = response.data;
      console.log('📥 Municipios obtenidos:', data);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error: any) {
      console.error('❌ Error al obtener municipios:', error);
      throw new Error(this.extractBackendErrorMessage(error) || 'Error al cargar los municipios');
    }
  }

  async getTiposTercero(): Promise<TipoTercero[]> {
    // The backend may expose this resource under slightly different paths
    const candidates = ['tipos-tercero/', 'tipos_tercero/', 'tipos/', 'tipo-tercero/'];
    for (const p of candidates) {
      try {
        const response = await axiosInstance.get(`${this.baseUrl}/${p}`);
        const data = response.data;
        console.log('📥 Tipos de tercero obtenidos (%s):', p, data);
        return Array.isArray(data) ? data : data.results || [];
      } catch (err) {
        // try next candidate
        continue;
      }
    }
    console.error('❌ No se pudo obtener tipos de tercero en ninguna ruta candidata');
    // Return empty list so UI can continue to function even if the backend
    // doesn't expose tipos de tercero in this deployment.
    return [];
  }
}