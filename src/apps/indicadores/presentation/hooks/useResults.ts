import { useState, useEffect } from 'react';
import { ResultService } from '../../application/services/ResultService';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

export const useResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);
  const [pagination, setPagination] = useState<{ count: number; next: string | null; previous: string | null; page?: number; page_size?: number } | null>(null);
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
      
      console.log('🔄 Iniciando carga de resultados...');
      
      // Use Promise.allSettled() to allow individual failures without blocking others
      const results = await Promise.allSettled([
        resultService.getAllResults(),
        resultService.getAllResultsWithDetails(),
        resultService.getIndicators(),
        resultService.getHeadquarters()
      ]);
      
      // Extract data with fallbacks
      const resultsData = results[0].status === 'fulfilled' ? results[0].value : [];
      const detailedResultsData = results[1].status === 'fulfilled' ? results[1].value : [];
      const indicatorsData = results[2].status === 'fulfilled' ? results[2].value : [];
      const headquartersData = results[3].status === 'fulfilled' ? results[3].value : [];
      
      // Log any rejections
      if (results[0].status === 'rejected') console.error('❌ getAllResults failed:', results[0].reason);
      if (results[1].status === 'rejected') console.error('❌ getAllResultsWithDetails failed:', results[1].reason);
      if (results[2].status === 'rejected') console.error('❌ getIndicators failed:', results[2].reason);
      if (results[3].status === 'rejected') console.error('❌ getHeadquarters failed:', results[3].reason);
      
      console.log('📊 Datos cargados:', {
        results: resultsData.length,
        detailedResults: detailedResultsData.length,
        indicators: indicatorsData.length,
        headquarters: headquartersData.length
      });
      
  // Ensure results is an array
  setResults(Array.isArray(resultsData) ? resultsData : []);

      // Build lookup maps from indicators/headquarters so we can enrich any result objects
      const indicatorsList = Array.isArray(indicatorsData) ? indicatorsData : [];
      const headquartersList = Array.isArray(headquartersData) ? headquartersData : [];

      const indicatorMap = indicatorsList.reduce<Record<number | string, string>>((acc, ind: any) => {
        if (ind && (ind.id !== undefined)) acc[ind.id] = ind.name || String(ind.name || '');
        return acc;
      }, {});

      const hqMap = headquartersList.reduce<Record<number | string, string>>((acc, hq: any) => {
        if (hq && (hq.id !== undefined)) acc[hq.id] = hq.name || String(hq.name || '');
        return acc;
      }, {});

      // Enrich detailed results: backend might return objects already enriched or only ids.
  // detailedResultsData may be an array already (service normalizes) - ensure we map over an array
  const detailedArray = Array.isArray(detailedResultsData) ? detailedResultsData : ((detailedResultsData as any)?.results ?? []);

  const enrichedDetailed: DetailedResult[] = detailedArray.map((item: any) => {
        const resolvedIndicatorName = item.indicatorName || indicatorMap[item.indicator] || 'Sin nombre';
        const resolvedHeadquarterName = item.headquarterName || hqMap[item.headquarters] || 'Sin sede';

  const indicatorObj = item.indicator && typeof item.indicator === 'object' ? item.indicator : undefined;
  const rawTarget = item.target ?? indicatorObj?.target ?? indicatorObj?.meta_target ?? undefined;
        const parsedTarget = rawTarget !== undefined && rawTarget !== null && rawTarget !== '' ? Number(String(rawTarget)) : undefined;
        const rawCalc = item.calculatedValue ?? item.calculated_value ?? item.value ?? 0;
        const calculatedValue = Number(String(rawCalc));
        const trend = (indicatorObj && (indicatorObj.trend ?? indicatorObj.trend_type)) ?? item.trend ?? item.trend_direction ?? undefined;

        let compliant: boolean | undefined = undefined;
        if (parsedTarget !== undefined && !isNaN(parsedTarget) && !isNaN(calculatedValue)) {
          if (String(trend).toLowerCase() === 'decreasing') {
            compliant = calculatedValue <= parsedTarget;
          } else {
            compliant = calculatedValue >= parsedTarget;
          }
        }

        const direction = String(trend).toLowerCase() === 'decreasing' ? -1 : 1;
        const diferencia = (Number(calculatedValue || 0) - Number(parsedTarget || 0)) * direction;

        return {
          ...item,
          indicatorName: resolvedIndicatorName,
          headquarterName: resolvedHeadquarterName,
          indicatorCode: item.indicatorCode || (indicatorObj && (indicatorObj.code || indicatorObj.codigo)) || 'Sin código',
          measurementUnit: item.measurementUnit || '',
          measurementFrequency: item.measurementFrequency || '',
          target: parsedTarget,
          calculationMethod: item.calculationMethod || '',
          trend,
          compliant,
          diferencia,
        } as DetailedResult;
      });

      setDetailedResults(enrichedDetailed);
      if (enrichedDetailed.length > 0) {
        console.log('🔎 Enriched detailed result (initial load):', enrichedDetailed[0]);
      }
      setIndicators(indicatorsList);
      setHeadquarters(headquartersList);
      
    } catch (err: any) {
      console.error('❌ Error al cargar resultados:', err);
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
      console.log('🚀 Creando resultado:', result);
      const newResult = await resultService.createResult(result);
      setResults(prev => [...prev, newResult]);
      notifySuccess('Resultado creado exitosamente');
      await fetchResults(); // Refrescar datos para obtener detalles
      return true;
    } catch (err: any) {
      console.error('❌ Error al crear resultado:', err);
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

  // Server-side paginated fetch for results (best-effort). Sets detailedResults and pagination state.
  const fetchPaginatedResults = async (params?: { page?: number; page_size?: number; indicator?: number; headquarters?: number; period_start?: string; period_end?: string }) => {
    try {
      setLoading(true);
      const paginated = await resultService.getPaginatedResults(params as any);

      // Normalize response: backend may return either an array or a paginated object
      // Possible shapes:
      // - Array<Result> (plain list)
      // - { results: Array<Result>, count: number, next: string | null, previous: string | null }
      const resultsArr: Result[] = Array.isArray(paginated)
        ? paginated
        : Array.isArray((paginated as any).results)
        ? (paginated as any).results
        : [];

      const count: number = typeof (paginated as any).count === 'number' ? (paginated as any).count : resultsArr.length;
      const next: string | null = (paginated && (paginated as any).next) ? (paginated as any).next : null;
      const previous: string | null = (paginated && (paginated as any).previous) ? (paginated as any).previous : null;

      setResults(resultsArr);


      // Ensure we have indicators/headquarters lists to build lookup maps. Fetch on-demand if missing.
      let indicatorsListState = indicators;
      let headquartersListState = headquarters;
      if ((!indicatorsListState || indicatorsListState.length === 0) || (!headquartersListState || headquartersListState.length === 0)) {
        try {
          const [fetchedInds, fetchedHqs] = await Promise.all([
            resultService.getIndicators(),
            resultService.getHeadquarters()
          ]);
          indicatorsListState = Array.isArray(fetchedInds) ? fetchedInds : [];
          headquartersListState = Array.isArray(fetchedHqs) ? fetchedHqs : [];
          // update state so subsequent calls reuse them
          if (indicatorsListState.length > 0) setIndicators(indicatorsListState);
          if (headquartersListState.length > 0) setHeadquarters(headquartersListState);
        } catch (e) {
          // non-fatal: proceed with whatever we have
          console.warn('⚠️ No se pudieron obtener sedes/indicadores para enriquecer la página:', e);
          indicatorsListState = indicatorsListState || [];
          headquartersListState = headquartersListState || [];
        }
      }

      // Build two maps: one for quick name lookup and one for the full indicator object (to read target, trend, unit...)
      const indicatorMapState = (indicatorsListState || []).reduce<Record<number | string, string>>((acc: any, ind: any) => {
        if (ind && (ind.id !== undefined)) acc[ind.id] = ind.name || ind.nombre || '';
        return acc;
      }, {});
      const indicatorFullMap: Record<number | string, any> = (indicatorsListState || []).reduce((acc: any, ind: any) => {
        if (ind && (ind.id !== undefined)) acc[ind.id] = ind;
        return acc;
      }, {} as Record<number | string, any>);
      const hqMapState = (headquartersListState || []).reduce<Record<number | string, string>>((acc: any, hq: any) => {
        if (hq && (hq.id !== undefined)) acc[hq.id] = hq.name || hq.nombre || '';
        return acc;
      }, {});

  const enrichedPage: DetailedResult[] = resultsArr.map((item: any) => {
        // Try multiple possible shapes for indicator id / headquarter id and names (evaluate stepwise to avoid operator precedence issues)
        let indicatorId: any = undefined;
        if (item.indicator !== undefined) indicatorId = item.indicator;
        else if (item.indicator_id !== undefined) indicatorId = item.indicator_id;
        else if (item.indicatorId !== undefined) indicatorId = item.indicatorId;
        else if (item.indicator && typeof item.indicator === 'object') indicatorId = item.indicator.id;

        let headquarterId: any = undefined;
        if (item.headquarters !== undefined) headquarterId = item.headquarters;
        else if (item.headquarter !== undefined) headquarterId = item.headquarter;
        else if (item.headquarter_id !== undefined) headquarterId = item.headquarter_id;
        else if (item.sede !== undefined) headquarterId = item.sede;
        else if (item.sede_id !== undefined) headquarterId = item.sede_id;
        else if (item.headquarters && typeof item.headquarters === 'object') headquarterId = item.headquarters.id;
        else if (item.headquarter && typeof item.headquarter === 'object') headquarterId = item.headquarter.id;

        const indicatorNameFromItem = item.indicatorName ?? item.indicator_name ?? (item.indicator && item.indicator.name) ?? undefined;
        const headquarterNameFromItem = item.headquarterName ?? item.headquarter_name ?? (item.headquarters && item.headquarters.name) ?? (item.headquarter && item.headquarter.name) ?? item.sede_nombre ?? undefined;

        const resolvedIndicatorName = indicatorNameFromItem || (indicatorId !== undefined ? indicatorMapState[indicatorId] : undefined) || 'Sin nombre';
        const resolvedHeadquarterName = headquarterNameFromItem || (headquarterId !== undefined ? hqMapState[headquarterId] : undefined) || 'Sin sede';

        // Try to resolve an indicator object to extract target/unit/frequency/trend when available
        const indicatorObjFromList = indicatorId !== undefined ? indicatorFullMap[indicatorId] : undefined;
        const indicatorObj = item.indicator && typeof item.indicator === 'object' ? item.indicator : indicatorObjFromList;

        const rawTarget = item.target ?? item.meta_target ?? indicatorObj?.target ?? indicatorObjFromList?.target ?? undefined;
        const parsedTarget = rawTarget !== undefined && rawTarget !== null && rawTarget !== '' ? Number(String(rawTarget)) : undefined;

        const measurementUnit = item.measurementUnit || item.measurement_unit || indicatorObj?.measurementUnit || indicatorObj?.measurement_unit || '';
        const measurementFrequency = item.measurementFrequency || item.measurement_frequency || indicatorObj?.measurementFrequency || indicatorObj?.measurement_frequency || '';

        // Trend resolution: possible fields from item or indicator object
        const trendRaw = (indicatorObj && (indicatorObj.trend ?? indicatorObj.trend_type)) ?? item.trend ?? item.trend_direction ?? undefined;
        const trend = typeof trendRaw === 'string' ? trendRaw.toLowerCase() : trendRaw;

        // Calculated value can live under several keys
        const rawCalc = item.calculatedValue ?? item.calculated_value ?? item.value ?? item.result ?? 0;
        const calculatedValue = Number(String(rawCalc));

        // Determine compliance and difference respecting trend direction
        let compliant: boolean | undefined = undefined;
        if (parsedTarget !== undefined && !isNaN(parsedTarget) && !isNaN(calculatedValue) && parsedTarget !== 0) {
          if (String(trend).toLowerCase() === 'decreasing' || String(trend).toLowerCase() === 'desc' || String(trend).toLowerCase() === 'down') {
            compliant = calculatedValue <= parsedTarget;
          } else {
            compliant = calculatedValue >= parsedTarget;
          }
        }

        const direction = (String(trend).toLowerCase() === 'decreasing' || String(trend).toLowerCase() === 'desc' || String(trend).toLowerCase() === 'down') ? -1 : 1;
        const diferencia = (Number(calculatedValue || 0) - Number(parsedTarget || 0)) * direction;

        return {
          ...item,
          indicatorName: resolvedIndicatorName,
          headquarterName: resolvedHeadquarterName,
          indicatorCode: item.indicatorCode || item.indicator_code || (indicatorObj && (indicatorObj.code || indicatorObj.codigo)) || '',
          measurementUnit,
          measurementFrequency,
          target: parsedTarget,
          calculationMethod: item.calculationMethod || item.calculation_method || '',
          trend,
          calculatedValue,
          compliant,
          diferencia
        } as DetailedResult;
      });

      setDetailedResults(enrichedPage);
      if (enrichedPage.length > 0) {
        console.log('🔎 Enriched detailed result (page):', enrichedPage[0]);
      }
      setPagination({ count, next, previous, page: params?.page, page_size: params?.page_size });
      return true;
    } catch (err: any) {
      console.error('❌ Error fetching paginated results:', err);
      notifyError(err.message || 'Error al cargar resultados paginados');
      setResults([]);
      setDetailedResults([]);
      setPagination(null);
      return false;
    } finally {
      setLoading(false);
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