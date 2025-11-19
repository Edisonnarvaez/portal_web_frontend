// src/apps/indicadores/presentation/hooks/useResultsData.ts
import { useState, useEffect } from 'react';
import { ResultService } from '../../application/services/ResultService';
import type { DetailedResult } from '../../domain/entities/Result';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

export const useResultsData = () => {
  const [data, setData] = useState<DetailedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ count: number; next: string | null; previous: string | null; page?: number; page_size?: number } | null>(null);

  const resultService = new ResultService();
  const { notifyError } = useNotifications();

  // default large page size to emulate full-list fetch when backend is paginated
  const DEFAULT_PAGE_SIZE = 1000;

  const fetchData = async (params?: { page?: number; page_size?: number; indicator?: number; headquarters?: number; period_start?: string; period_end?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const effectiveParams = { page: params?.page || 1, page_size: params?.page_size || DEFAULT_PAGE_SIZE, ...params };
      const paginatedRaw = await resultService.getPaginatedResults(effectiveParams as any);

      // Normalize paginated responses: backend can return either an array or an object with results
      const resultsArr: DetailedResult[] = Array.isArray(paginatedRaw)
        ? paginatedRaw as DetailedResult[]
        : Array.isArray((paginatedRaw as any)?.results)
        ? (paginatedRaw as any).results
        : [];

      const count = (paginatedRaw && typeof (paginatedRaw as any).count === 'number') ? (paginatedRaw as any).count : resultsArr.length;
      const next = (paginatedRaw && (paginatedRaw as any).next) ? (paginatedRaw as any).next : null;
      const previous = (paginatedRaw && (paginatedRaw as any).previous) ? (paginatedRaw as any).previous : null;

      // Ensure indicators and headquarters are available to enrich the results with codes/names
      let indicatorsList: any[] = [];
      let hqList: any[] = [];
      try {
        const [inds, hqs] = await Promise.all([resultService.getIndicators(), resultService.getHeadquarters()]);
        indicatorsList = Array.isArray(inds) ? inds : [];
        hqList = Array.isArray(hqs) ? hqs : [];
      } catch (e) {
        //console.warn('⚠️ No se pudieron obtener indicadores/sedes para enriquecer dashboard:', e);
      }

      const indicatorMap = indicatorsList.reduce<Record<number | string, any>>((acc, ind: any) => {
        if (ind && ind.id !== undefined) acc[ind.id] = ind;
        return acc;
      }, {});
      const hqMap = hqList.reduce<Record<number | string, any>>((acc, hq: any) => {
        if (hq && hq.id !== undefined) acc[hq.id] = hq;
        return acc;
      }, {});

      const enriched = resultsArr.map((item: any) => {
          // Resolve indicator id: item.indicator can be either an id or an object
          let indicatorId: any = undefined;
          if (typeof item.indicator === 'number' || typeof item.indicator === 'string') indicatorId = item.indicator;
          else if (item.indicator && typeof item.indicator === 'object') indicatorId = item.indicator.id;
          else if (item.indicator_id !== undefined) indicatorId = item.indicator_id;
          else if (item.indicatorId !== undefined) indicatorId = item.indicatorId;

          // Resolve headquarter id similarly
          let headquarterId: any = undefined;
          if (typeof item.headquarters === 'number' || typeof item.headquarters === 'string') headquarterId = item.headquarters;
          else if (typeof item.headquarter === 'number' || typeof item.headquarter === 'string') headquarterId = item.headquarter;
          else if (item.headquarters && typeof item.headquarters === 'object') headquarterId = item.headquarters.id;
          else if (item.headquarter && typeof item.headquarter === 'object') headquarterId = item.headquarter.id;
          else if (item.headquarter_id !== undefined) headquarterId = item.headquarter_id;
          else if (item.sede !== undefined) headquarterId = item.sede;
          else if (item.sede_id !== undefined) headquarterId = item.sede_id;

        const indicatorObj = indicatorId !== undefined ? indicatorMap[indicatorId] : (item.indicator && typeof item.indicator === 'object' ? item.indicator : undefined);
        const hqObj = headquarterId !== undefined ? hqMap[headquarterId] : (item.headquarters && typeof item.headquarters === 'object' ? item.headquarters : (item.headquarter && typeof item.headquarter === 'object' ? item.headquarter : undefined));

        const indicatorName = item.indicatorName ?? item.indicator_name ?? indicatorObj?.name ?? indicatorObj?.nombre ?? (item.indicator && item.indicator.name) ?? '';
        const indicatorCode = item.indicatorCode ?? item.indicator_code ?? indicatorObj?.code ?? indicatorObj?.codigo ?? indicatorObj?.codigo_indicador ?? '';
        const headquarterName = item.headquarterName ?? item.headquarter_name ?? hqObj?.name ?? hqObj?.nombre ?? '';

        const measurementUnit = item.measurementUnit ?? item.measurement_unit ?? indicatorObj?.measurementUnit ?? indicatorObj?.measurement_unit ?? indicatorObj?.measurementUnit ?? '';
        const measurementFrequency = item.measurementFrequency ?? item.measurement_frequency ?? indicatorObj?.measurementFrequency ?? indicatorObj?.measurement_frequency ?? '';
        
        // Extract enriched fields from indicator object
        const description = item.description ?? indicatorObj?.description ?? '';
        const calculationMethod = item.calculationMethod ?? item.calculation_method ?? indicatorObj?.calculationMethod ?? indicatorObj?.calculation_method ?? '';
        const version = item.version ?? indicatorObj?.version ?? '';
        const numeratorResponsible = item.numeratorResponsible ?? item.numerator_responsible ?? indicatorObj?.numeratorResponsible ?? indicatorObj?.numerator_responsible ?? '';
        const denominatorResponsible = item.denominatorResponsible ?? item.denominator_responsible ?? indicatorObj?.denominatorResponsible ?? indicatorObj?.denominator_responsible ?? '';

        // DEBUG: Log enrichment for specific indicator
        if (indicatorId === 3 || (item.indicatorName && item.indicatorName.includes('caída'))) {
        }

        // Prefer indicator's target (may be string) but normalize to number when possible
        const rawTarget = item.target ?? indicatorObj?.target ?? indicatorObj?.meta_target ?? undefined;
        const parsedTarget = rawTarget !== undefined && rawTarget !== null && rawTarget !== '' ? Number(String(rawTarget)) : undefined;

        // Normalize calculated value
        const rawCalc = item.calculatedValue ?? item.calculated_value ?? item.value ?? 0;
        const calculatedValue = Number(String(rawCalc));

        // Trend: indicator may carry a 'trend' field ('increasing' | 'decreasing')
        const trend = (indicatorObj && (indicatorObj.trend ?? indicatorObj.trend_type)) ?? item.trend ?? item.trend_direction ?? undefined;

        // Normalize trend and compute compliance
        const trendNormalized = typeof trend === 'string' ? trend.toLowerCase() : undefined;
        let compliant: boolean | undefined = undefined;
        if (parsedTarget !== undefined && !isNaN(parsedTarget) && !isNaN(calculatedValue)) {
          if (trendNormalized === 'decreasing') {
            compliant = calculatedValue <= parsedTarget;
          } else {
            // default to increasing
            compliant = calculatedValue >= parsedTarget;
          }
        }

        // Direction-aware diferencia for ranking: multiply by -1 for decreasing trends so that lower values are worse consistently
        const direction = trendNormalized === 'decreasing' ? -1 : 1;
        const diferencia = (Number(calculatedValue || 0) - Number(parsedTarget || 0)) * direction;

        // Build nested indicator/headquarters objects for components that expect objects
        const synthesizedIndicator = indicatorObj ?? (indicatorId !== undefined ? {
          id: indicatorId,
          name: indicatorName,
          code: indicatorCode,
          target: parsedTarget,
          measurementUnit,
          measurementFrequency,
          process: indicatorObj?.process ?? item.process ?? undefined
        } : undefined);

        const synthesizedHQ = hqObj ?? (headquarterId !== undefined ? { id: headquarterId, name: headquarterName } : undefined);

        return {
          ...item,
          indicator: synthesizedIndicator,
          headquarters: synthesizedHQ,
          calculatedValue,
          indicatorName,
          indicatorCode,
          headquarterName,
          measurementUnit,
          measurementFrequency,
          description,
          calculationMethod,
          version,
          numeratorResponsible,
          denominatorResponsible,
          numeratorDefinition: indicatorObj?.numerator || '', // Definición del numerador del modelo Indicator
          denominatorDefinition: indicatorObj?.denominator || '', // Definición del denominador del modelo Indicator
          numeratorDescription: indicatorObj?.numeratorDescription || item.numeratorDescription || '',
          denominatorDescription: indicatorObj?.denominatorDescription || item.denominatorDescription || '',
          target: parsedTarget,
          trend,
          compliant,
          diferencia
        } as DetailedResult;
      });

      setData(enriched);
      setPagination({ count, next, previous, page: effectiveParams.page, page_size: effectiveParams.page_size });
    } catch (err: any) {
      //console.error('❌ Error al cargar datos paginados del dashboard:', err);
      const errorMessage = err.message || 'Error al cargar los datos de resultados';
      setError(errorMessage);
      setData([]);
      setPagination(null);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();
  const refetchWithParams = (p: Parameters<typeof fetchData>[0]) => fetchData(p as any);

  return {
    data,
    loading,
    error,
    pagination,
    refetch,
    refetchWithParams,
  };
};