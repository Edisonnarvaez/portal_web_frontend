import { useState, useEffect } from 'react';
import { ResultService } from '../../application/services/ResultService';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

export const useResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);
  const [indicators, setIndicators] = useState<Array<{id: number, name: string, code: string, measurementFrequency: string}>>([]);
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
      
      const [resultsData, detailedResultsData, indicatorsData, headquartersData] = await Promise.all([
        resultService.getAllResults(),
        resultService.getAllResultsWithDetails(),
        resultService.getIndicators(),
        resultService.getHeadquarters()
      ]);
      
      console.log('📊 Datos cargados:', {
        results: resultsData.length,
        detailedResults: detailedResultsData.length,
        indicators: indicatorsData.length,
        headquarters: headquartersData.length
      });
      
      // 🔧 CORREGIR: Validar que los datos sean arrays
      setResults(Array.isArray(resultsData) ? resultsData : []);
      setDetailedResults(Array.isArray(detailedResultsData) ? detailedResultsData : []);
      setIndicators(Array.isArray(indicatorsData) ? indicatorsData : []);
      setHeadquarters(Array.isArray(headquartersData) ? headquartersData : []);
      
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

  useEffect(() => {
    fetchResults();
  }, []);

  return {
    results,
    detailedResults,
    indicators,
    headquarters,
    loading,
    error,
    fetchResults,
    createResult,
    updateResult,
    deleteResult,
    getResultsByIndicator,
    getResultsByHeadquarters
  };
};