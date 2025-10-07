import { useState, useEffect } from 'react';
import { IndicatorService } from '../../application/services/IndicatorService';
import type { Indicator, CreateIndicatorRequest, UpdateIndicatorRequest } from '../../domain/entities/Indicator';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

export const useIndicators = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [processes, setProcesses] = useState<Array<{id: number, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const indicatorService = new IndicatorService();
  const { notifySuccess, notifyError } = useNotifications();

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carga de indicadores...');
      
      const [indicatorsData, processesData] = await Promise.all([
        indicatorService.getAllIndicators(),
        indicatorService.getProcesses()
      ]);
      
      console.log('📊 Indicadores cargados:', indicatorsData.length);
      console.log('🏭 Procesos cargados:', processesData.length);
      
      setIndicators(indicatorsData);
      setProcesses(processesData);
    } catch (err: any) {
      console.error('❌ Error al cargar indicadores:', err);
      setError(err.message || 'Error al cargar los indicadores');
      notifyError(err.message || 'Error al cargar los indicadores');
    } finally {
      setLoading(false);
    }
  };

  const createIndicator = async (indicator: CreateIndicatorRequest): Promise<boolean> => {
    try {
      console.log('🚀 Creando indicador:', indicator);
      
      // 🔧 Validar datos requeridos
      if (!indicator.process || indicator.process === 0) {
        notifyError('Debe seleccionar un proceso');
        return false;
      }

      const newIndicator = await indicatorService.createIndicator(indicator);
      setIndicators(prev => [...prev, newIndicator]);
      notifySuccess('Indicador creado exitosamente');
      
      console.log('✅ Indicador creado:', newIndicator);
      return true;
    } catch (err: any) {
      console.error('❌ Error al crear indicador:', err);
      notifyError(err.message || 'Error al crear el indicador');
      return false;
    }
  };

  const updateIndicator = async (indicator: UpdateIndicatorRequest): Promise<boolean> => {
    try {
      console.log('🔄 Actualizando indicador:', indicator);
      
      const updatedIndicator = await indicatorService.updateIndicator(indicator);
      setIndicators(prev => prev.map(item => 
        item.id === updatedIndicator.id ? updatedIndicator : item
      ));
      notifySuccess('Indicador actualizado exitosamente');
      
      console.log('✅ Indicador actualizado:', updatedIndicator);
      return true;
    } catch (err: any) {
      console.error('❌ Error al actualizar indicador:', err);
      notifyError(err.message || 'Error al actualizar el indicador');
      return false;
    }
  };

  const deleteIndicator = async (id: number): Promise<boolean> => {
    try {
      console.log('🗑️ Eliminando indicador:', id);
      
      await indicatorService.deleteIndicator(id);
      setIndicators(prev => prev.filter(item => item.id !== id));
      notifySuccess('Indicador eliminado exitosamente');
      
      console.log('✅ Indicador eliminado:', id);
      return true;
    } catch (err: any) {
      console.error('❌ Error al eliminar indicador:', err);
      notifyError(err.message || 'Error al eliminar el indicador');
      return false;
    }
  };

  const toggleIndicatorStatus = async (id: number, status: boolean): Promise<boolean> => {
    try {
      console.log(`🔄 Cambiando estado del indicador ${id} a:`, status);
      
      const updatedIndicator = await indicatorService.toggleIndicatorStatus(id, status);
      setIndicators(prev => prev.map(item => 
        item.id === updatedIndicator.id ? updatedIndicator : item
      ));
      notifySuccess(`Indicador ${status ? 'activado' : 'inactivado'} exitosamente`);
      
      console.log('✅ Estado cambiado:', updatedIndicator);
      return true;
    } catch (err: any) {
      console.error('❌ Error al cambiar estado:', err);
      notifyError(err.message || 'Error al cambiar el estado del indicador');
      return false;
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  return {
    indicators,
    processes,
    loading,
    error,
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    toggleIndicatorStatus
  };
};