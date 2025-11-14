import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';

export class ResultsApiService {
  private baseUrl = '/indicators';

  // Results endpoints
  async getResults(): Promise<Result[]> {
    try {
      //console.log('📍 [ResultsApiService] Calling getResults...');
      // Prefer the paginated endpoint and return only the array for backward compatibility
      const paginated = await this.getPaginatedResults();
      //console.log('✅ [ResultsApiService] getResults returned:', paginated.results?.length ?? 0, 'items');
      return paginated.results || [];
    } catch (error: any) {
      // console.error('❌ [ResultsApiService] Error fetching results (normalized):', {
      //   message: error?.message,
      //   status: error?.response?.status,
      //   url: error?.config?.url,
      //   data: error?.response?.data
      // });
      throw new Error('Error loading results');
    }
  }

  /**
   * Returns paginated results object as described in OpenAPI. Normalizes array or paginated responses.
   */
  async getPaginatedResults(params?: { page?: number; page_size?: number; indicator?: number; headquarters?: number; period_start?: string; period_end?: string }): Promise<{ count: number; next: string | null; previous: string | null; results: Result[] }> {
    try {
      const url = `${this.baseUrl}/results/`;
      //console.log('📍 [ResultsApiService.getPaginatedResults] Calling URL:', url, 'with params:', params);
      const startTime = performance.now();
      const response = await axiosInstance.get(url, { params });
      const duration = performance.now() - startTime;
      //console.log(`✅ [ResultsApiService.getPaginatedResults] Success (${duration.toFixed(2)}ms) - Status: ${response.status}`);
      
      const data = response.data;

      if (Array.isArray(data)) {
        //console.log('ℹ️ [ResultsApiService.getPaginatedResults] Response is an array, wrapping...');
        return { count: data.length, next: null, previous: null, results: data };
      }

      const normalized = {
        count: typeof data.count === 'number' ? data.count : (Array.isArray(data.results) ? data.results.length : 0),
        next: data.next || null,
        previous: data.previous || null,
        results: Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []),
      };
      
      // console.log('📦 [ResultsApiService.getPaginatedResults] Normalized response:', {
      //   count: normalized.count,
      //   hasNext: !!normalized.next,
      //   hasPrevious: !!normalized.previous,
      //   resultsCount: normalized.results.length
      // });
      
      return normalized;
    } catch (error: any) {
      // console.error('❌ [ResultsApiService.getPaginatedResults] Error:', {
      //   message: error?.message,
      //   status: error?.response?.status,
      //   statusText: error?.response?.statusText,
      //   url: error?.config?.url,
      //   data: error?.response?.data
      // });
      throw new Error('Error loading paginated results');
    }
  }

  async getResultsWithDetails(): Promise<DetailedResult[]> {
    try {
      const url = `${this.baseUrl}/results/detailed/`;
      //console.log('🔍 [getResultsWithDetails] Fetching from URL:', url);
      
      const response = await axiosInstance.get(url);
      const data = response.data;

      // console.log('📥 [getResultsWithDetails] RAW Response data:', {
      //   type: typeof data,
      //   isArray: Array.isArray(data),
      //   hasResults: !!data?.results,
      //   resultsCount: data?.results?.length,
      //   keysInData: Object.keys(data || {}).slice(0, 10),
      //   sampleItem: Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : null)
      // });
      
      //console.log('📥 [getResultsWithDetails] Full raw data (first 500 chars):', JSON.stringify(data).slice(0, 500));

      // Extract the results array from whatever structure it comes in
      let resultsArray: any[] = [];
      if (Array.isArray(data)) {
        resultsArray = data;
      } else if (data?.results && Array.isArray(data.results)) {
        resultsArray = data.results;
      } else {
        //console.warn('⚠️ [getResultsWithDetails] Unexpected response structure');
        return [];
      }

      //console.log('✅ [getResultsWithDetails] Got', resultsArray.length, 'raw items from endpoint');

      // Now, we need to check if items are already enriched or if they only have IDs
      // If they're not enriched, we need to fetch indicators/headquarters to enrich them
      const firstItem = resultsArray[0];
      const needsEnrichment = firstItem && (
        typeof firstItem.indicator === 'number' || 
        (typeof firstItem.indicator === 'object' && !firstItem.indicatorName)
      );

      if (needsEnrichment) {
        //console.log('⚠️ [getResultsWithDetails] Items are NOT enriched, fetching indicators/headquarters for enrichment...');
        
        try {
          // Fetch indicators and headquarters in parallel for enrichment
          const [indicatorsResp, headquartersResp] = await Promise.all([
            axiosInstance.get(`${this.baseUrl}/indicators/`),
            axiosInstance.get('/companies/headquarters/')
          ]);

          const indicators = Array.isArray(indicatorsResp.data) ? indicatorsResp.data : (indicatorsResp.data?.results || []);
          const headquarters = Array.isArray(headquartersResp.data) ? headquartersResp.data : (headquartersResp.data?.results || []);

          //console.log('✅ [getResultsWithDetails] Fetched', indicators.length, 'indicators and', headquarters.length, 'headquarters for enrichment');

          // Build lookup maps
          const indicatorMap = new Map();
          indicators.forEach((ind: any) => {
            indicatorMap.set(ind.id, ind);
          });

          const headquarterMap = new Map();
          headquarters.forEach((hq: any) => {
            headquarterMap.set(hq.id, hq);
          });

          // Transform with enrichment
          const transformedResults = resultsArray.map((item: any) => {
            const indicatorId = typeof item.indicator === 'number' ? item.indicator : item.indicator?.id;
            const headquarterId = typeof item.headquarters === 'number' ? item.headquarters : item.headquarters?.id;

            const indicatorObj = indicatorMap.get(indicatorId);
            const headquarterObj = headquarterMap.get(headquarterId);

            return {
              id: item.id,
              numerator: Number(item.numerator) || 0,
              denominator: Number(item.denominator) || 0,
              calculatedValue: Number(item.calculatedValue) || 0,
              creationDate: item.creationDate,
              updateDate: item.updateDate,
              year: item.year,
              month: item.month,
              quarter: item.quarter,
              semester: item.semester,
              // Store both ID and object
              headquarters: typeof item.headquarters === 'object' ? item.headquarters : headquarterObj,
              indicator: typeof item.indicator === 'object' ? item.indicator : indicatorObj,
              user: item.user,
              // Enriched fields
              headquarterName: headquarterObj?.name || headquarterObj?.nombre || 'Sin sede',
              indicatorName: indicatorObj?.name || indicatorObj?.nombre || 'Sin nombre',
              indicatorCode: indicatorObj?.code || indicatorObj?.codigo || 'Sin código',
              measurementUnit: indicatorObj?.measurementUnit || indicatorObj?.measurement_unit || '',
              measurementFrequency: indicatorObj?.measurementFrequency || indicatorObj?.measurement_frequency || '',
              target: Number(indicatorObj?.target) || 0,
              calculationMethod: indicatorObj?.calculationMethod || indicatorObj?.calculation_method || '',
              trend: item.trend || indicatorObj?.trend || ''
            };
          });

          //console.log('✅ [getResultsWithDetails] Enriched', transformedResults.length, 'items');
          //console.log('🔎 First enriched item:', transformedResults[0]);
          return transformedResults;

        } catch (enrichError) {
          //console.error('❌ [getResultsWithDetails] Error enriching items:', enrichError);
          // Fallback: return items as-is without enrichment
          return resultsArray;
        }
      } else {
        // Items are already enriched, just ensure they have the right fields
        //console.log('✅ [getResultsWithDetails] Items are already enriched from endpoint');
        
        const transformedResults = resultsArray.map((item: any) => ({
          ...item,
          headquarterName: item.headquarterName || item.headquarters?.name || 'Sin sede',
          indicatorName: item.indicatorName || item.indicator?.name || 'Sin nombre',
          indicatorCode: item.indicatorCode || item.indicator?.code || 'Sin código',
          measurementUnit: item.measurementUnit || item.indicator?.measurementUnit || '',
          measurementFrequency: item.measurementFrequency || item.indicator?.measurementFrequency || '',
          target: Number(item.target) || 0,
          trend: item.trend || item.indicator?.trend || ''
        }));

        //console.log('✅ [getResultsWithDetails] Normalized', transformedResults.length, 'already-enriched items');
        //console.log('🔎 First normalized item:', transformedResults[0]);
        return transformedResults;
      }
    } catch (error) {
      //console.error('❌ Error fetching detailed results:', error);
      throw new Error('Error loading detailed results');
    }
  }

  async getResultById(id: number): Promise<Result> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/${id}/`);
      //console.log('📥 Result obtained:', response.data);
      return response.data;
    } catch (error) {
      //console.error(`❌ Error fetching result ${id}:`, error);
      throw new Error(`Error loading result with ID ${id}`);
    }
  }

  async createResult(result: CreateResultRequest): Promise<Result> {
    try {
      //console.log('📤 Creating result:', result);
      
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
      //console.log('📥 Result created:', response.data);
      return response.data;
    } catch (error: any) {
      //console.error('❌ Error creating result:', error);
      
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
      //console.log('📤 Updating result:', result);
      const response = await axiosInstance.put(`${this.baseUrl}/results/${result.id}/`, result);
      //console.log('📥 Result updated:', response.data);
      return response.data;
    } catch (error: any) {
      //console.error('❌ Error updating result:', error);
      
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
      //console.log(`✅ Result ${id} deleted successfully`);
    } catch (error: any) {
      //console.error(`❌ Error deleting result ${id}:`, error);
      throw new Error(`Error deleting result: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getResultsByIndicator(indicatorId: number): Promise<Result[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/?indicator=${indicatorId}`);
      //console.log('📥 Results by indicator obtained:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      //console.error(`❌ Error fetching results for indicator ${indicatorId}:`, error);
      throw new Error(`Error loading results for indicator ${indicatorId}`);
    }
  }

  async getResultsByHeadquarters(headquartersId: number): Promise<Result[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/?headquarters=${headquartersId}`);
      //console.log('📥 Results by headquarters obtained:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      //console.error(`❌ Error fetching results for headquarters ${headquartersId}:`, error);
      throw new Error(`Error loading results for headquarters ${headquartersId}`);
    }
  }

  // 🔧 ADD: Missing methods for dropdowns and filters
  async getIndicators(): Promise<Array<{id: number, name: string, code: string, measurementFrequency: string}>> {
    try {
      const url = `${this.baseUrl}/indicators/`;
      //console.log('📍 [ResultsApiService.getIndicators] Calling URL:', url);
      const startTime = performance.now();
      const response = await axiosInstance.get(url);
      const duration = performance.now() - startTime;
      //console.log(`✅ [ResultsApiService.getIndicators] Success (${duration.toFixed(2)}ms) - Status: ${response.status}`);
      
      const indicators = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      
      //console.log('📦 [ResultsApiService.getIndicators] Parsed:', indicators.length, 'indicators');
      
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
      // console.error('❌ [ResultsApiService.getIndicators] Error:', {
      //   message: error?.message,
      //   status: error?.response?.status,
      //   statusText: error?.response?.statusText,
      //   url: error?.config?.url,
      //   data: error?.response?.data
      // });
      throw new Error('Error loading indicators');
    }
  }

  async getHeadquarters(): Promise<Array<{id: number, name: string}>> {
    try {
      const url = '/companies/headquarters/';
      // console.log('📍 [ResultsApiService.getHeadquarters] Calling URL:', url);
      const startTime = performance.now();
      const response = await axiosInstance.get(url);
      const duration = performance.now() - startTime;
      // console.log(`✅ [ResultsApiService.getHeadquarters] Success (${duration.toFixed(2)}ms) - Status: ${response.status}`);
      
      const headquarters = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      
      // console.log('📦 [ResultsApiService.getHeadquarters] Parsed:', headquarters.length, 'headquarters');
      
      return headquarters.map((hq: any) => ({
        id: hq.id,
        name: hq.name
      }));
    } catch (error: any) {
      // console.error('❌ [ResultsApiService.getHeadquarters] Error:', {
      //   message: error?.message,
      //   status: error?.response?.status,
      //   statusText: error?.response?.statusText,
      //   url: error?.config?.url,
      //   data: error?.response?.data
      // });
      throw new Error('Error loading headquarters');
    }
  }
}