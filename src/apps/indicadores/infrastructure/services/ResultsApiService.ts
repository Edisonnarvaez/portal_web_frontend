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
      // console.log('🔍 [getResultsWithDetails] Fetching from URL:', url);
      
      const response = await axiosInstance.get(url);
      const data = response.data;

      // console.log('📥 [getResultsWithDetails] RAW Response data:', {
      //   type: typeof data,
      //   isArray: Array.isArray(data),
      //   hasResults: !!data?.results,
      //   resultsCount: data?.results?.length,
      //   keysInData: Object.keys(data || {}).slice(0, 10),
      //   sampleItem: Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : null),
      //   sampleIndicatorFields: Array.isArray(data) ? Object.keys(data[0]?.indicator || {}) : (data?.results ? Object.keys(data.results[0]?.indicator || {}) : [])
      // });
      
      // console.log('📥 [getResultsWithDetails] Full raw data (first 500 chars):', JSON.stringify(data).slice(0, 500));

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

      // console.log('✅ [getResultsWithDetails] Got', resultsArray.length, 'raw items from endpoint');
      
      // Log first item structure BEFORE enrichment
      if (resultsArray.length > 0) {
        // console.log('🔎 [getResultsWithDetails] FIRST ITEM BEFORE ENRICHMENT:', {
        //   allFields: Object.keys(resultsArray[0]),
        //   hasDescription: 'description' in resultsArray[0],
        //   hasCalculationMethod: 'calculationMethod' in resultsArray[0],
        //   indicatorObjectFields: resultsArray[0].indicator ? Object.keys(resultsArray[0].indicator) : 'no indicator object'
        // });
      }

      // Now, we need to check if items are already enriched or if they only have IDs
      // If they're not enriched, we need to fetch indicators/headquarters to enrich them
      const firstItem = resultsArray[0];
      const needsEnrichment = firstItem && (
        typeof firstItem.indicator === 'number' || 
        (typeof firstItem.indicator === 'object' && !firstItem.indicatorName)
      );
      
      // console.log('🔎 [getResultsWithDetails] Check enrichment:', {
      //   hasFirstItem: !!firstItem,
      //   indicatorType: typeof firstItem?.indicator,
      //   indicatorValue: firstItem?.indicator,
      //   hasIndicatorName: !!firstItem?.indicatorName,
      //   needsEnrichment
      // });

      if (needsEnrichment) {
        // console.log('⚠️ [getResultsWithDetails] Items are NOT enriched, fetching indicators/headquarters for enrichment...');
        
        try {
          // Fetch indicators and headquarters in parallel for enrichment
          const [indicatorsResp, headquartersResp] = await Promise.all([
            axiosInstance.get(`${this.baseUrl}/indicators/`),
            axiosInstance.get('/companies/headquarters/')
          ]);

          const indicators = Array.isArray(indicatorsResp.data) ? indicatorsResp.data : (indicatorsResp.data?.results || []);
          const headquarters = Array.isArray(headquartersResp.data) ? headquartersResp.data : (headquartersResp.data?.results || []);

          // console.log('✅ [getResultsWithDetails] Fetched', indicators.length, 'indicators and', headquarters.length, 'headquarters for enrichment');
          
          if (indicators.length > 0) {
            // console.log('🔎 Sample indicator has fields:', Object.keys(indicators[0]));
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

          //console.log('✅ [getResultsWithDetails] Enriched', transformedResults.length, 'items');
          //console.log('🔎 First enriched item:', transformedResults[0]);
          // console.log('✅ [getResultsWithDetails] Enriched', transformedResults.length, 'items');
          if (transformedResults.length > 0) {
            // console.log('🔎 FIRST ENRICHED ITEM FIELDS:', Object.keys(transformedResults[0]));
            // console.log('🔎 Description present in result:', 'description' in transformedResults[0], 'Value:', transformedResults[0].description);
            // console.log('🔎 CalculationMethod present in result:', 'calculationMethod' in transformedResults[0], 'Value:', transformedResults[0].calculationMethod);
            // console.log('🔎 Nested indicator fields:', Object.keys(transformedResults[0].indicator || {}));
            // console.log('🔎 Description in indicator:', 'description' in (transformedResults[0].indicator || {}), 'Value:', transformedResults[0].indicator?.description);
            // console.log('🔎 CalculationMethod in indicator:', 'calculationMethod' in (transformedResults[0].indicator || {}), 'Value:', transformedResults[0].indicator?.calculationMethod);
            
            // 🔍 DEBUG: Check what source data looks like
            const sourceIndicator = indicators.find((ind: any) => ind.id === (transformedResults[0].indicator?.id));
            // console.log('🔍 SOURCE INDICATOR DATA (from API):', {
            //   indicatorId: transformedResults[0].indicator?.id,
            //   indicatorFields: sourceIndicator ? Object.keys(sourceIndicator) : 'NOT FOUND',
            //   description: sourceIndicator?.description,
            //   calculation_method: sourceIndicator?.calculation_method,
            //   calculationMethod: sourceIndicator?.calculationMethod,
            //   allSourceData: sourceIndicator
            // });
          }
          return transformedResults;

        } catch (enrichError) {
          //console.error('❌ [getResultsWithDetails] Error enriching items:', enrichError);
          // Fallback: return items as-is without enrichment
          return resultsArray;
        }
      } else {
        // Items are already enriched from the endpoint, but may be missing detailed fields
        // console.log('✅ [getResultsWithDetails] Items are already enriched from endpoint');
        // console.log('🔍 Checking if we need to fetch full indicator details...');
        
        // Check if the returned indicators have description/calculationMethod
        const firstIndicator = resultsArray[0]?.indicator;
        const hasDescriptionInResponse = 'description' in (firstIndicator || {}) && resultsArray[0].description !== undefined;
        const hasCalcMethodInResponse = 'calculationMethod' in (firstIndicator || {}) && resultsArray[0].calculationMethod !== undefined;
        
        // console.log('🔍 Response check:', {
        //   hasDescription: hasDescriptionInResponse,
        //   hasCalculationMethod: hasCalcMethodInResponse,
        //   indicatorFields: Object.keys(firstIndicator || {})
        // });
        
        // If the endpoint response doesn't have detailed indicator data, fetch it separately
        if (!hasDescriptionInResponse || !hasCalcMethodInResponse) {
          // console.log('⚠️ Response lacks description/calculationMethod, fetching full indicator details...');
          
          try {
            // Fetch full indicators for enrichment
            const indicatorsResp = await axiosInstance.get(`${this.baseUrl}/indicators/`);
            const indicators = Array.isArray(indicatorsResp.data) ? indicatorsResp.data : (indicatorsResp.data?.results || []);
            
            // console.log('✅ Fetched', indicators.length, 'full indicators for enrichment');
            
            // Build lookup map
            const indicatorMap = new Map();
            indicators.forEach((ind: any) => {
              indicatorMap.set(ind.id, ind);
            });
            
            // Enrich with full indicator data
            const transformedResults = resultsArray.map((item: any) => {
              const indicatorId = typeof item.indicator === 'number' ? item.indicator : item.indicator?.id;
              const fullIndicatorData = indicatorMap.get(indicatorId);
              
              // console.log('🔍 Enriching with full indicator:', {
              //   resultId: item.id,
              //   indicatorId,
              //   hasFullData: !!fullIndicatorData,
              //   fullDataFields: fullIndicatorData ? Object.keys(fullIndicatorData) : 'NONE'
              // });
              
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
            
            // console.log('✅ [getResultsWithDetails] Fully enriched', transformedResults.length, 'items with indicator details');
            if (transformedResults.length > 0) {
              // console.log('🔎 First result after full enrichment:', {
              //   hasDescription: transformedResults[0].description,
              //   hasCalculationMethod: transformedResults[0].calculationMethod,
              //   indicatorHasDescription: transformedResults[0].indicator?.description,
              //   indicatorHasCalculationMethod: transformedResults[0].indicator?.calculationMethod
              // });
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

        // console.log('✅ [getResultsWithDetails] Normalized', transformedResults.length, 'already-enriched items');
        if (transformedResults.length > 0) {
          // console.log('🔎 First normalized item indicator fields:', Object.keys(transformedResults[0].indicator));
          // console.log('🔎 First normalized item has description:', transformedResults[0].indicator?.description);
          // console.log('🔎 First normalized item has calculationMethod:', transformedResults[0].indicator?.calculationMethod);
        }
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