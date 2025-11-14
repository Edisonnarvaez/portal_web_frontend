import { useState, useEffect } from 'react';
import { ResultService } from '../../application/services/ResultService';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

export const useResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);
  const [pagination, _setPagination] = useState<{ count: number; next: string | null; previous: string | null; page?: number; page_size?: number } | null>(null);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [headquarters, setHeadquarters] = useState<Array<{id: number, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resultService = new ResultService();
  const { notifySuccess, notifyError } = useNotifications();

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      //console.log('🔄 [useResults.fetchResults] Iniciando carga de resultados...');
      //console.log('⏱️ [useResults] Timestamp:', new Date().toISOString());
      
      // Use Promise.allSettled() to allow individual failures without blocking others
      const startTime = performance.now();
      const results = await Promise.allSettled([
        resultService.getAllResults(),
        resultService.getAllResultsWithDetails(),
        resultService.getIndicators(),
        resultService.getHeadquarters()
      ]);
      const loadTime = performance.now() - startTime;
      
      // Extract data with fallbacks
      const resultsData = results[0].status === 'fulfilled' ? results[0].value : [];
      const detailedResultsData = results[1].status === 'fulfilled' ? results[1].value : [];
      const indicatorsData = results[2].status === 'fulfilled' ? results[2].value : [];
      const headquartersData = results[3].status === 'fulfilled' ? results[3].value : [];
      
      // console.log('📈 [useResults] Promesas completadas en', loadTime.toFixed(2), 'ms');
      // console.log('✅ [useResults] Estados de promesas:', {
      //   getAllResults: results[0].status,
      //   getAllResultsWithDetails: results[1].status,
      //   getIndicators: results[2].status,
      //   getHeadquarters: results[3].status
      // });
      
      // Log any rejections with detailed error info
      if (results[0].status === 'rejected') {
        const reason = results[0].reason as any;
        // console.error('❌ [useResults] getAllResults failed:', {
        //   statusCode: reason?.response?.status,
        //   statusText: reason?.response?.statusText,
        //   message: reason?.message,
        //   data: reason?.response?.data,
        //   url: reason?.config?.url
        // });
      }
      if (results[1].status === 'rejected') {
        const reason = results[1].reason as any;
        // console.error('❌ [useResults] getAllResultsWithDetails failed:', {
        //   statusCode: reason?.response?.status,
        //   statusText: reason?.response?.statusText,
        //   message: reason?.message,
        //   data: reason?.response?.data,
        //   url: reason?.config?.url
        // });
      }
      if (results[2].status === 'rejected') {
        const reason = results[2].reason as any;
        // console.error('❌ [useResults] getIndicators failed:', {
        //   statusCode: reason?.response?.status,
        //   statusText: reason?.response?.statusText,
        //   message: reason?.message,
        //   data: reason?.response?.data,
        //   url: reason?.config?.url
        // });
      }
      if (results[3].status === 'rejected') {
        const reason = results[3].reason as any;
        // console.error('❌ [useResults] getHeadquarters failed:', {
        //   statusCode: reason?.response?.status,
        //   statusText: reason?.response?.statusText,
        //   message: reason?.message,
        //   data: reason?.response?.data,
        //   url: reason?.config?.url
        // });
      }
      
      // console.log('📊 [useResults] Datos cargados:', {
      //   results: resultsData.length,
      //   detailedResults: detailedResultsData.length,
      //   indicators: indicatorsData.length,
      //   headquarters: headquartersData.length
      // });
      
  // Ensure results is an array
  setResults(Array.isArray(resultsData) ? resultsData : []);

      // Datos ya están enriquecidos por ResultsApiService.getResultsWithDetails()
      // No necesitamos duplicar la enriquecimiento aquí
      const indicatorsList = Array.isArray(indicatorsData) ? indicatorsData : [];
      const headquartersList = Array.isArray(headquartersData) ? headquartersData : [];

      // detailedResultsData ya viene enriquecido del servicio
      const detailedArray = Array.isArray(detailedResultsData) ? detailedResultsData : ((detailedResultsData as any)?.results ?? []);

      // console.log('🔍 [useResults] detailedArray received:', {
      //   length: detailedArray.length,
      //   type: typeof detailedArray,
      //   isArray: Array.isArray(detailedArray),
      //   firstItem: detailedArray[0],
      //   firstItemKeys: detailedArray[0] ? Object.keys(detailedArray[0]) : []
      // });

      // Check for empty or missing enriched fields
      if (detailedArray.length > 0) {
        const sample = detailedArray[0];
        const missingFields = [];
        if (!sample.indicatorName || sample.indicatorName === 'Sin nombre') missingFields.push('indicatorName');
        if (!sample.headquarterName || sample.headquarterName === 'Sin sede') missingFields.push('headquarterName');
        if (!sample.indicatorCode || sample.indicatorCode === 'Sin código') missingFields.push('indicatorCode');
        
        if (missingFields.length > 0) {
          //console.warn('⚠️ [useResults] Missing enriched fields in first item:', missingFields);
          //console.log('📦 Raw first item:', sample);
        }
      }

      setDetailedResults(detailedArray);
      if (detailedArray.length > 0) {
        //console.log('✅ [useResults] Enriched detailed result (initial load):', detailedArray[0]);
      }
      setIndicators(indicatorsList);
      setHeadquarters(headquartersList);
      
    } catch (err: any) {
      //console.error('❌ Error al cargar resultados:', err);
      setError(err.message || 'Error al cargar los resultados');
      notifyError('Error al cargar los resultados');
      
      // 🔧 Establecer arrays vacíos en caso de error
      setResults([]);
      setDetailedResults([]);
      setIndicators([]);
      setHeadquarters([]);
    } finally {
      setLoading(false);
    }
  };

  const createResult = async (result: CreateResultRequest): Promise<boolean> => {
    try {
      //console.log('🚀 Creando resultado:', result);
      const newResult = await resultService.createResult(result);
      setResults(prev => [...prev, newResult]);
      notifySuccess('Resultado creado exitosamente');
      await fetchResults(); // Refrescar datos para obtener detalles
      return true;
    } catch (err: any) {
      //console.error('❌ Error al crear resultado:', err);
      notifyError(err.message || 'Error al crear el resultado');
      return false;
    }
  };

  const updateResult = async (result: UpdateResultRequest): Promise<boolean> => {
    try {
      const updatedResult = await resultService.updateResult(result);
      setResults(prev => prev.map(item => 
        item.id === updatedResult.id ? updatedResult : item
      ));
      notifySuccess('Resultado actualizado exitosamente');
      await fetchResults(); // Refrescar datos para obtener detalles
      return true;
    } catch (err: any) {
      notifyError(err.message || 'Error al actualizar el resultado');
      return false;
    }
  };

  const deleteResult = async (id: number): Promise<boolean> => {
    try {
      await resultService.deleteResult(id);
      setResults(prev => prev.filter(item => item.id !== id));
      setDetailedResults(prev => prev.filter(item => item.id !== id));
      notifySuccess('Resultado eliminado exitosamente');
      return true;
    } catch (err: any) {
      notifyError(err.message || 'Error al eliminar el resultado');
      return false;
    }
  };

  const getResultsByIndicator = async (indicatorId: number): Promise<Result[]> => {
    try {
      return await resultService.getResultsByIndicator(indicatorId);
    } catch (err: any) {
      notifyError(err.message || 'Error al obtener resultados por indicador');
      return [];
    }
  };

  const getResultsByHeadquarters = async (headquartersId: number): Promise<Result[]> => {
    try {
      return await resultService.getResultsByHeadquarters(headquartersId);
    } catch (err: any) {
      notifyError(err.message || 'Error al obtener resultados por sede');
      return [];
    }
  };

  // Wrapper que simplemente llama a fetchResults (ya carga todos los datos)
  // La paginación se hace client-side en el componente, no server-side
  const fetchPaginatedResults = async () => {
    //console.log('📌 [useResults.fetchPaginatedResults] Llamada: client-side pagination, calling fetchResults()');
    try {
      await fetchResults();
      return true;
    } catch (err: any) {
      //console.error('❌ [useResults.fetchPaginatedResults] Error:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return {
    results,
    detailedResults,
    pagination,
    indicators,
    headquarters,
    loading,
    error,
    fetchResults,
    fetchPaginatedResults,
    createResult,
    updateResult,
    deleteResult,
    getResultsByIndicator,
    getResultsByHeadquarters
  };
};