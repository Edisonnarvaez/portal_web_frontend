import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';

export class ResultsApiService {
  private baseUrl = '/indicators';

  // Results endpoints
  async getResults(): Promise<Result[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/`);
      console.log('📥 Results obtained:', response.data);
      
      // 🔧 CORREGIR: Validar estructura de respuesta
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        console.warn('⚠️ La respuesta no es un array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching results:', error);
      throw new Error('Error loading results');
    }
  }

  async getResultsWithDetails(): Promise<DetailedResult[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/detailed/`);
      console.log('📥 Detailed results obtained:', response.data);
      
      // 🔧 CORREGIR: Extraer el array results del objeto de respuesta
      if (response.data && Array.isArray(response.data.results)) {
        // Transformar los datos para que coincidan con la interfaz DetailedResult
        const transformedResults = response.data.results.map((item: any) => {
          // 🔧 Debug: Verificar datos de entrada
          console.log('🔍 Transformando item:', {
            id: item.id,
            calculatedValue: item.calculatedValue,
            target: item.indicator?.target,
            targetType: typeof item.indicator?.target,
            indicatorName: item.indicator?.name,
            headquarterName: item.headquarters?.name
          });

          // 🔧 Validar y convertir valores numéricos
          const calculatedValue = parseFloat(item.calculatedValue) || 0;
          const target = parseFloat(item.indicator?.target) || 0;
          const numerator = parseFloat(item.numerator) || 0;
          const denominator = parseFloat(item.denominator) || 0;

          console.log('✅ Valores convertidos:', {
            calculatedValue,
            target,
            numerator,
            denominator
          });

          return {
            // Datos básicos del resultado
            id: item.id,
            numerator: numerator,
            denominator: denominator,
            calculatedValue: calculatedValue,
            creationDate: item.creationDate,
            updateDate: item.updateDate,
            year: item.year,
            month: item.month,
            quarter: item.quarter,
            semester: item.semester,
            
            // IDs de relaciones
            headquarters: item.headquarters?.id || item.headquarters,
            indicator: item.indicator?.id || item.indicator,
            user: item.user?.id || item.user,
            
            // 🔧 CORREGIR: Datos detallados extraídos de objetos anidados
            headquarterName: item.headquarters?.name || 'Sin sede',
            indicatorName: item.indicator?.name || 'Sin nombre',
            indicatorCode: item.indicator?.code || 'Sin código',
            measurementUnit: item.indicator?.measurementUnit || '',
            measurementFrequency: item.indicator?.measurementFrequency || '',
            target: target, // 🔧 Ya convertido a número
            calculationMethod: item.indicator?.calculationMethod || ''
          };
        });
        
        console.log('✅ Datos transformados correctamente:', transformedResults.length, 'elementos');
        console.log('📝 Primer elemento transformado:', transformedResults[0]);
        
        return transformedResults;
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        return response.data;
      } else {
        console.warn('⚠️ Estructura de respuesta inesperada:', response.data);
        return [];
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
      const response = await axiosInstance.get(`${this.baseUrl}/indicators/`);
      console.log('📥 Indicators obtained:', response.data);
      
      const indicators = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      
      return indicators.map((indicator: any) => ({
        id: indicator.id,
        name: indicator.name,
        code: indicator.code,
        measurementFrequency: indicator.measurementFrequency
      }));
    } catch (error) {
      console.error('❌ Error fetching indicators:', error);
      throw new Error('Error loading indicators');
    }
  }

  async getHeadquarters(): Promise<Array<{id: number, name: string}>> {
    try {
      const response = await axiosInstance.get('/companies/headquarters/');
      console.log('📥 Headquarters obtained:', response.data);
      
      const headquarters = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      
      return headquarters.map((hq: any) => ({
        id: hq.id,
        name: hq.name
      }));
    } catch (error) {
      console.error('❌ Error fetching headquarters:', error);
      throw new Error('Error loading headquarters');
    }
  }
}