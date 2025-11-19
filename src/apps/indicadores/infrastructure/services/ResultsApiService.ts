import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';

export class ResultsApiService {
  private baseUrl = '/indicators';

  // Results endpoints
  async getResults(): Promise<Result[]> {
    try {
      const paginated = await this.getPaginatedResults();
        return paginated.results || [];
    } catch (error: any) {
      throw new Error('Error loading results');
    }
  }

  /**
   * Returns paginated results object as described in OpenAPI. Normalizes array or paginated responses.
   */
  async getPaginatedResults(params?: { page?: number; page_size?: number; indicator?: number; headquarters?: number; period_start?: string; period_end?: string }): Promise<{ count: number; next: string | null; previous: string | null; results: Result[] }> {
    try {
      const url = `${this.baseUrl}/results/`;
      const startTime = performance.now();
      const response = await axiosInstance.get(url, { params });
      const duration = performance.now() - startTime;
      
      const data = response.data;

      if (Array.isArray(data)) {
        return { count: data.length, next: null, previous: null, results: data };
      }

      const normalized = {
        count: typeof data.count === 'number' ? data.count : (Array.isArray(data.results) ? data.results.length : 0),
        next: data.next || null,
        previous: data.previous || null,
        results: Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []),
      };

      return normalized;
    } catch (error: any) {
      throw new Error('Error loading paginated results');
    }
  }

  async getResultsWithDetails(): Promise<DetailedResult[]> {
    try {
      const url = `${this.baseUrl}/results/detailed/`;
      const response = await axiosInstance.get(url);
      const data = response.data;

      // Extract the results array from whatever structure it comes in
      let resultsArray: any[] = [];
      if (Array.isArray(data)) {
        resultsArray = data;
      } else if (data?.results && Array.isArray(data.results)) {
        resultsArray = data.results;
      } else {
        console.warn('⚠️ [getResultsWithDetails] Unexpected response structure');
        return [];
      }

      // Log first item structure BEFORE enrichment
      if (resultsArray.length > 0) {
      }

      // Now, we need to check if items are already enriched or if they only have IDs
      // If they're not enriched, we need to fetch indicators/headquarters to enrich them
      const firstItem = resultsArray[0];
      const needsEnrichment = firstItem && (
        typeof firstItem.indicator === 'number' || 
        (typeof firstItem.indicator === 'object' && !firstItem.indicatorName)
      );

      if (needsEnrichment) {
        try {
          // Fetch indicators and headquarters in parallel for enrichment
          const [indicatorsResp, headquartersResp] = await Promise.all([
            axiosInstance.get(`${this.baseUrl}/indicators/`),
            axiosInstance.get('/companies/headquarters/')
          ]);

          const indicators = Array.isArray(indicatorsResp.data) ? indicatorsResp.data : (indicatorsResp.data?.results || []);
          const headquarters = Array.isArray(headquartersResp.data) ? headquartersResp.data : (headquartersResp.data?.results || []);

          if (indicators.length > 0) {
          }

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

            // Enrich the indicator object itself with all fields
            const enrichedIndicator = {
              ...(typeof item.indicator === 'object' ? item.indicator : indicatorObj),
              id: indicatorObj?.id,
              name: indicatorObj?.name || indicatorObj?.nombre,
              code: indicatorObj?.code || indicatorObj?.codigo,
              measurementUnit: indicatorObj?.measurementUnit || indicatorObj?.measurement_unit,
              measurementFrequency: indicatorObj?.measurementFrequency || indicatorObj?.measurement_frequency,
              target: Number(indicatorObj?.target) || 0,
              calculationMethod: indicatorObj?.calculationMethod || indicatorObj?.calculation_method || '',
              description: indicatorObj?.description || '',
              version: indicatorObj?.version || '',
              numeratorResponsible: indicatorObj?.numeratorResponsible || indicatorObj?.numerator_responsible || '',
              denominatorResponsible: indicatorObj?.denominatorResponsible || indicatorObj?.denominator_responsible || '',
              numeratorDefinition: indicatorObj?.numerator || '', // Definición del numerador (TextField del modelo)
              denominatorDefinition: indicatorObj?.denominator || '', // Definición del denominador (TextField del modelo)
              numeratorDescription: indicatorObj?.numeratorDescription || indicatorObj?.numerator_description || '',
              denominatorDescription: indicatorObj?.denominatorDescription || indicatorObj?.denominator_description || '',
              trend: item.trend || indicatorObj?.trend || ''
            };

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
              indicator: enrichedIndicator,
              user: item.user,
              // Enriched fields from indicator
              headquarterName: headquarterObj?.name || headquarterObj?.nombre || 'Sin sede',
              indicatorName: indicatorObj?.name || indicatorObj?.nombre || 'Sin nombre',
              indicatorCode: indicatorObj?.code || indicatorObj?.codigo || 'Sin código',
              measurementUnit: indicatorObj?.measurementUnit || indicatorObj?.measurement_unit || '',
              measurementFrequency: indicatorObj?.measurementFrequency || indicatorObj?.measurement_frequency || '',
              target: Number(indicatorObj?.target) || 0,
              calculationMethod: indicatorObj?.calculationMethod || indicatorObj?.calculation_method || '',
              description: indicatorObj?.description || '',
              version: indicatorObj?.version || '',
              numeratorResponsible: indicatorObj?.numeratorResponsible || indicatorObj?.numerator_responsible || '',
              denominatorResponsible: indicatorObj?.denominatorResponsible || indicatorObj?.denominator_responsible || '',
              numeratorDefinition: indicatorObj?.numerator || '', // Definición del numerador (TextField del modelo)
              denominatorDefinition: indicatorObj?.denominator || '', // Definición del denominador (TextField del modelo)
              numeratorDescription: indicatorObj?.numeratorDescription || indicatorObj?.numerator_description || '',
              denominatorDescription: indicatorObj?.denominatorDescription || indicatorObj?.denominator_description || '',
              trend: item.trend || indicatorObj?.trend || ''
            };
          });

          if (transformedResults.length > 0) {
            const sourceIndicator = indicators.find((ind: any) => ind.id === (transformedResults[0].indicator?.id));
          }
          return transformedResults;

        } catch (enrichError) {
          // Fallback: return items as-is without enrichment
          return resultsArray;
        }
      } else {
        // Items are already enriched from the endpoint, but may be missing detailed fields
        // Check if the returned indicators have description/calculationMethod
        const firstIndicator = resultsArray[0]?.indicator;
        const hasDescriptionInResponse = 'description' in (firstIndicator || {}) && resultsArray[0].description !== undefined;
        const hasCalcMethodInResponse = 'calculationMethod' in (firstIndicator || {}) && resultsArray[0].calculationMethod !== undefined;

        // If the endpoint response doesn't have detailed indicator data, fetch it separately
        if (!hasDescriptionInResponse || !hasCalcMethodInResponse) {

          try {
            // Fetch full indicators for enrichment
            const indicatorsResp = await axiosInstance.get(`${this.baseUrl}/indicators/`);
            const indicators = Array.isArray(indicatorsResp.data) ? indicatorsResp.data : (indicatorsResp.data?.results || []);
            // Build lookup map
            const indicatorMap = new Map();
            indicators.forEach((ind: any) => {
              indicatorMap.set(ind.id, ind);
            });
            
            // Enrich with full indicator data
            const transformedResults = resultsArray.map((item: any) => {
              const indicatorId = typeof item.indicator === 'number' ? item.indicator : item.indicator?.id;
              const fullIndicatorData = indicatorMap.get(indicatorId);

              // Merge enriched indicator
              const enrichedIndicator = {
                ...item.indicator,
                id: item.indicator?.id || indicatorId,
                name: item.indicator?.name || fullIndicatorData?.name || fullIndicatorData?.nombre,
                code: item.indicator?.code || fullIndicatorData?.code || fullIndicatorData?.codigo,
                measurementFrequency: item.indicator?.measurementFrequency || fullIndicatorData?.measurementFrequency || fullIndicatorData?.measurement_frequency,
                measurementUnit: item.indicator?.measurementUnit || fullIndicatorData?.measurementUnit || fullIndicatorData?.measurement_unit,
                target: Number(item.indicator?.target ?? fullIndicatorData?.target ?? 0),
                trend: item.indicator?.trend || fullIndicatorData?.trend,
                description: fullIndicatorData?.description || item.description || '',
                calculationMethod: fullIndicatorData?.calculationMethod || fullIndicatorData?.calculation_method || item.calculationMethod || '',
                version: fullIndicatorData?.version || item.version || '',
                numeratorResponsible: fullIndicatorData?.numeratorResponsible || fullIndicatorData?.numerator_responsible || item.numeratorResponsible || '',
                denominatorResponsible: fullIndicatorData?.denominatorResponsible || fullIndicatorData?.denominator_responsible || item.denominatorResponsible || ''
              };
              
              return {
                ...item,
                indicator: enrichedIndicator,
                headquarterName: item.headquarterName || item.headquarters?.name || 'Sin sede',
                indicatorName: item.indicatorName || item.indicator?.name || 'Sin nombre',
                indicatorCode: item.indicatorCode || item.indicator?.code || 'Sin código',
                measurementUnit: item.measurementUnit || item.indicator?.measurementUnit || fullIndicatorData?.measurementUnit || '',
                measurementFrequency: item.measurementFrequency || item.indicator?.measurementFrequency || fullIndicatorData?.measurementFrequency || '',
                target: Number(item.target ?? fullIndicatorData?.target ?? 0),
                calculationMethod: fullIndicatorData?.calculationMethod || fullIndicatorData?.calculation_method || item.calculationMethod || '',
                description: fullIndicatorData?.description || item.description || '',
                version: fullIndicatorData?.version || item.version || '',
                numeratorResponsible: fullIndicatorData?.numeratorResponsible || fullIndicatorData?.numerator_responsible || item.numeratorResponsible || '',
                denominatorResponsible: fullIndicatorData?.denominatorResponsible || fullIndicatorData?.denominator_responsible || item.denominatorResponsible || '',
                trend: item.trend || item.indicator?.trend || fullIndicatorData?.trend || ''
              };
            });

            if (transformedResults.length > 0) {
            }
            return transformedResults;
          } catch (enrichError) {
            console.error('❌ Error fetching indicators for enrichment:', enrichError);
            // Fallback to basic transformation without full details
          }
        }
        
        // Fallback: If endpoint has all data or enrichment failed, just do basic transformation
        const transformedResults = resultsArray.map((item: any) => {
          const enrichedIndicator = {
            ...item.indicator,
            description: item.description || item.indicator?.description || '',
            calculationMethod: item.calculationMethod || item.indicator?.calculationMethod || item.indicator?.calculation_method || '',
            version: item.version || item.indicator?.version || '',
            numeratorResponsible: item.numeratorResponsible || item.indicator?.numeratorResponsible || item.indicator?.numerator_responsible || '',
            denominatorResponsible: item.denominatorResponsible || item.indicator?.denominatorResponsible || item.indicator?.denominator_responsible || ''
          };

          return {
            ...item,
            indicator: enrichedIndicator,
            headquarterName: item.headquarterName || item.headquarters?.name || 'Sin sede',
            indicatorName: item.indicatorName || item.indicator?.name || 'Sin nombre',
            indicatorCode: item.indicatorCode || item.indicator?.code || 'Sin código',
            measurementUnit: item.measurementUnit || item.indicator?.measurementUnit || '',
            measurementFrequency: item.measurementFrequency || item.indicator?.measurementFrequency || '',
            target: Number(item.target) || 0,
            calculationMethod: item.calculationMethod || item.indicator?.calculationMethod || item.indicator?.calculation_method || '',
            description: item.description || item.indicator?.description || '',
            version: item.version || item.indicator?.version || '',
            numeratorResponsible: item.numeratorResponsible || item.indicator?.numeratorResponsible || item.indicator?.numerator_responsible || '',
            denominatorResponsible: item.denominatorResponsible || item.indicator?.denominatorResponsible || item.indicator?.denominator_responsible || '',
            trend: item.trend || item.indicator?.trend || ''
          };
        });

        if (transformedResults.length > 0) {
        }
        return transformedResults;
      }
    } catch (error) {
      console.error('❌ Error fetching detailed results:', error);
      throw new Error('Error loading detailed results');
    }
  }

  async getResultById(id: number): Promise<Result> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching result ${id}:`, error);
      throw new Error(`Error loading result with ID ${id}`);
    }
  }

  async createResult(result: CreateResultRequest): Promise<Result> {
    try {
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
      const response = await axiosInstance.put(`${this.baseUrl}/results/${result.id}/`, result);
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
    } catch (error: any) {
      console.error(`❌ Error deleting result ${id}:`, error);
      throw new Error(`Error deleting result: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getResultsByIndicator(indicatorId: number): Promise<Result[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/results/?indicator=${indicatorId}`);
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
      const startTime = performance.now();
      const response = await axiosInstance.get(url);
      const duration = performance.now() - startTime;
      const indicators = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      
      
      return indicators.map((indicator: any) => ({
        id: indicator.id,
        name: indicator.name,
        code: indicator.code,
        measurementFrequency: indicator.measurementFrequency,
        // New: include meta fields to help the frontend display target/unit without additional requests
        target: indicator.target ?? indicator.meta_target ?? null,
        measurementUnit: indicator.measurementUnit ?? indicator.measurement_unit ?? '',
        trend: indicator.trend ?? indicator.trend_type ?? undefined,
        // Critical: include description and calculation method from backend
        description: indicator.description ?? indicator.desc ?? '',
        calculationMethod: indicator.calculationMethod ?? indicator.calculation_method ?? indicator.calc_method ?? '',
        version: indicator.version ?? '',
        numeratorResponsible: indicator.numeratorResponsible ?? indicator.numerator_responsible ?? '',
        denominatorResponsible: indicator.denominatorResponsible ?? indicator.denominator_responsible ?? '',
        numeratorDefinition: indicator.numerator ?? '',
        denominatorDefinition: indicator.denominator ?? '',
        numeratorDescription: indicator.numeratorDescription ?? '',
        denominatorDescription: indicator.denominatorDescription ?? ''
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
      const startTime = performance.now();
      const response = await axiosInstance.get(url);
      const duration = performance.now() - startTime;

      const headquarters = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);

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