// src/apps/indicadores/presentation/hooks/useResultsData.ts
import { useState, useEffect } from 'react';
import { ResultService } from '../../application/services/ResultService';
import type { DetailedResult } from '../../domain/entities/Result';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

export const useResultsData = () => {
  const [data, setData] = useState<DetailedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resultService = new ResultService();
  const { notifyError } = useNotifications();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando datos para dashboard...');
      
      const results = await resultService.getAllResultsWithDetails();
      
      console.log('📊 Resultados cargados para dashboard:', results.length);
      console.log('📝 Primer resultado:', results[0]);
      
      // 🔧 Validar que los datos sean un array
      if (Array.isArray(results)) {
        setData(results);
        console.log('✅ Datos establecidos correctamente como array');
      } else {
        console.warn('⚠️ Los resultados no son un array:', results);
        setData([]);
        setError('Los datos recibidos no tienen el formato esperado');
      }
    } catch (err: any) {
      console.error('❌ Error al cargar datos del dashboard:', err);
      const errorMessage = err.message || 'Error al cargar los datos de resultados';
      setError(errorMessage);
      setData([]);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData 
  };
};