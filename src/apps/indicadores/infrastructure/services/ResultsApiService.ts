import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';

export class ResultsApiService {
  private baseUrl = '/indicators';

  // Results endpoints
  async getResults(): Promise<Result[]> {
    try {
      console.log('📍 [ResultsApiService] Calling getResults...');
      // Prefer the paginated endpoint and return only the array for backward compatibility
      const paginated = await this.getPaginatedResults();
      console.log('✅ [ResultsApiService] getResults returned:', paginated.results?.length ?? 0, 'items');
      return paginated.results || [];
    } catch (error: any) {
      console.error('❌ [ResultsApiService] Error fetching results (normalized):', {
        message: error?.message,
        status: error?.response?.status,
        url: error?.config?.url,
        data: error?.response?.data
      });
      throw new Error('Error loading results');
    }
  }

  /**
   * Returns paginated results object as described in OpenAPI. Normalizes array or paginated responses.
   */
  async getPaginatedResults(params?: { page?: number; page_size?: number; indicator?: number; headquarters?: number; period_start?: string; period_end?: string }): Promise<{ count: number; next: string | null; previous: string | null; results: Result[] }> {
    try {
      const url = `${this.baseUrl}/results/`;
      console.log('📍 [ResultsApiService.getPaginatedResults] Calling URL:', url, 'with params:', params);
      const startTime = performance.now();
      const response = await axiosInstance.get(url, { params });
      const duration = performance.now() - startTime;
      console.log(`✅ [ResultsApiService.getPaginatedResults] Success (${duration.toFixed(2)}ms) - Status: ${response.status}`);
      
      const data = response.data;

      if (Array.isArray(data)) {
        console.log('ℹ️ [ResultsApiService.getPaginatedResults] Response is an array, wrapping...');
        return { count: data.length, next: null, previous: null, results: data };
      }

      const normalized = {
        count: typeof data.count === 'number' ? data.count : (Array.isArray(data.results) ? data.results.length : 0),
        next: data.next || null,
        previous: data.previous || null,
        results: Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []),
      };
      
      console.log('📦 [ResultsApiService.getPaginatedResults] Normalized response:', {
        count: normalized.count,
        hasNext: !!normalized.next,
        hasPrevious: !!normalized.previous,
        resultsCount: normalized.results.length
      });
      
      return normalized;
    } catch (error: any) {
      console.error('❌ [ResultsApiService.getPaginatedResults] Error:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        data: error?.response?.data
      });
      throw new Error('Error loading paginated results');
    }
  }

  async getResultsWithDetails(): Promise<DetailedResult[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/detailed/`);
      const data = response.data;

      // Prefer the 'results' array when the backend returns the detailed wrapper
      if (data && Array.isArray(data.results)) {
        // Transformar los datos para que coincidan con la interfaz DetailedResult
        const transformedResults = data.results.map((item: any) => {
          const calculatedValue = Number(item.calculatedValue) || 0;
          const target = Number(item.indicator?.target) || 0;
          const numerator = Number(item.numerator) || 0;
          const denominator = Number(item.denominator) || 0;

          return {
            id: item.id,
            numerator,
            denominator,
            calculatedValue,
            creationDate: item.creationDate,
            updateDate: item.updateDate,
            year: item.year,
            month: item.month,
            quarter: item.quarter,
            semester: item.semester,
            // Relaciones: mantener objetos anidados si existen, o ids si vienen así
            headquarters: item.headquarters ?? item.headquarters?.id ?? item.headquarters,
            indicator: item.indicator ?? item.indicator?.id ?? item.indicator,
            user: item.user ?? item.user?.id ?? item.user,
            // Datos detallados extraídos de objetos anidados
            headquarterName: item.headquarters?.name ?? item.headquarters?.nombre ?? 'Sin sede',
            indicatorName: item.indicator?.name ?? item.indicator?.nombre ?? 'Sin nombre',
            indicatorCode: item.indicator?.code ?? item.indicator?.codigo ?? 'Sin código',
            measurementUnit: item.indicator?.measurementUnit ?? item.indicator?.measurement_unit ?? '',
            measurementFrequency: item.indicator?.measurementFrequency ?? item.indicator?.measurement_frequency ?? '',
            target: target,
            calculationMethod: item.indicator?.calculationMethod ?? item.indicator?.calculation_method ?? ''
          };
        });

        return transformedResults;
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array (retro-compatibilidad)
        return response.data;
      } else {
        console.warn('⚠️ Estructura de respuesta inesperada en detailed endpoint:', response.data);
        // Si el backend cambió y devuelve { results, statistics }, devolver results si existe, o vacio
        const maybeResults = response.data?.results;
        return Array.isArray(maybeResults) ? maybeResults : [];
      }
    } catch (error) {
      console.error('❌ Error fetching detailed results:', error);
      throw new Error('Error loading detailed results');
    }
  }

  async getResultById(id: number): Promise<Result> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/${id}/`);
      console.log('📥 Result obtained:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching result ${id}:`, error);
      throw new Error(`Error loading result with ID ${id}`);
    }
  }

  async createResult(result: CreateResultRequest): Promise<Result> {
    try {
      console.log('📤 Creating result:', result);
      
      // 🔧 Validar datos antes de enviar
      if (!result.headquarters || result.headquarters === 0) {
        throw new Error('Debe seleccionar una sede válida');
      }
      
      if (!result.indicator || result.indicator === 0) {
        throw new Error('Debe seleccionar un indicador válido');
      }
      
      if (!result.user || result.user === 0) {
        throw new Error('Usuario requerido');
      }

      const response = await axiosInstance.post(`${this.baseUrl}/results/`, result);
      console.log('📥 Result created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating result:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation errors:\n${errorMessages}`);
        }
      }
      
      throw new Error(error.message || 'Error creating result');
    }
  }

  async updateResult(result: UpdateResultRequest): Promise<Result> {
    try {
      console.log('📤 Updating result:', result);
      const response = await axiosInstance.put(`${this.baseUrl}/results/${result.id}/`, result);
      console.log('📥 Result updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating result:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation errors:\n${errorMessages}`);
        }
      }
      
      throw new Error(error.message || 'Error updating result');
    }
  }

  async deleteResult(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/results/${id}/`);
      console.log(`✅ Result ${id} deleted successfully`);
    } catch (error: any) {
      console.error(`❌ Error deleting result ${id}:`, error);
      throw new Error(`Error deleting result: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getResultsByIndicator(indicatorId: number): Promise<Result[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/?indicator=${indicatorId}`);
      console.log('📥 Results by indicator obtained:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching results for indicator ${indicatorId}:`, error);
      throw new Error(`Error loading results for indicator ${indicatorId}`);
    }
  }

  async getResultsByHeadquarters(headquartersId: number): Promise<Result[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/?headquarters=${headquartersId}`);
      console.log('📥 Results by headquarters obtained:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching results for headquarters ${headquartersId}:`, error);
      throw new Error(`Error loading results for headquarters ${headquartersId}`);
    }
  }

  // 🔧 ADD: Missing methods for dropdowns and filters
  async getIndicators(): Promise<Array<{id: number, name: string, code: string, measurementFrequency: string}>> {
    try {
      const url = `${this.baseUrl}/indicators/`;
      console.log('📍 [ResultsApiService.getIndicators] Calling URL:', url);
      const startTime = performance.now();
      const response = await axiosInstance.get(url);
      const duration = performance.now() - startTime;
      console.log(`✅ [ResultsApiService.getIndicators] Success (${duration.toFixed(2)}ms) - Status: ${response.status}`);
      
      const indicators = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      
      console.log('📦 [ResultsApiService.getIndicators] Parsed:', indicators.length, 'indicators');
      
      return indicators.map((indicator: any) => ({
        id: indicator.id,
        name: indicator.name,
        code: indicator.code,
        measurementFrequency: indicator.measurementFrequency,
        // New: include meta fields to help the frontend display target/unit without additional requests
        target: indicator.target ?? indicator.meta_target ?? null,
        measurementUnit: indicator.measurementUnit ?? indicator.measurement_unit ?? '',
        trend: indicator.trend ?? indicator.trend_type ?? undefined,
      }));
    } catch (error: any) {
      console.error('❌ [ResultsApiService.getIndicators] Error:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        data: error?.response?.data
      });
      throw new Error('Error loading indicators');
    }
  }

  async getHeadquarters(): Promise<Array<{id: number, name: string}>> {
    try {
      const url = '/companies/headquarters/';
      console.log('📍 [ResultsApiService.getHeadquarters] Calling URL:', url);
      const startTime = performance.now();
      const response = await axiosInstance.get(url);
      const duration = performance.now() - startTime;
      console.log(`✅ [ResultsApiService.getHeadquarters] Success (${duration.toFixed(2)}ms) - Status: ${response.status}`);
      
      const headquarters = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      
      console.log('📦 [ResultsApiService.getHeadquarters] Parsed:', headquarters.length, 'headquarters');
      
      return headquarters.map((hq: any) => ({
        id: hq.id,
        name: hq.name
      }));
    } catch (error: any) {
      console.error('❌ [ResultsApiService.getHeadquarters] Error:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        data: error?.response?.data
      });
      throw new Error('Error loading headquarters');
    }
  }
}