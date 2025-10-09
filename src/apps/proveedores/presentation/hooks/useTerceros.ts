import { useState, useEffect } from 'react';
import { TerceroService } from '../../application/services/TerceroService';
import type { Tercero, CreateTerceroRequest, UpdateTerceroRequest, Pais, Departamento, Municipio, TipoTercero } from '../../domain/entities/Tercero';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

export const useTerceros = () => {
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [tiposTercero, setTiposTercero] = useState<TipoTercero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const terceroService = new TerceroService();
  const { notifySuccess, notifyError } = useNotifications();

  const fetchTerceros = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await terceroService.getAllTerceros();
      setTerceros(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar terceros');
      notifyError('Error al cargar los terceros');
      setTerceros([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [paisesData, tiposTerceroData] = await Promise.all([
        terceroService.getPaises(),
        terceroService.getTiposTercero()
      ]);
      
      setPaises(Array.isArray(paisesData) ? paisesData : []);
      setTiposTercero(Array.isArray(tiposTerceroData) ? tiposTerceroData : []);
    } catch (err: any) {
      console.error('Error al cargar datos relacionados:', err);
    }
  };

  const fetchDepartamentos = async (paisId: number) => {
    try {
      const data = await terceroService.getDepartamentos(paisId);
      setDepartamentos(Array.isArray(data) ? data : []);
      setMunicipios([]); // Limpiar municipios cuando cambia el país
    } catch (err: any) {
      console.error('Error al cargar departamentos:', err);
      setDepartamentos([]);
    }
  };

  const fetchMunicipios = async (departamentoId: number) => {
    try {
      const data = await terceroService.getMunicipios(departamentoId);
      setMunicipios(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error al cargar municipios:', err);
      setMunicipios([]);
    }
  };

  const createTercero = async (tercero: CreateTerceroRequest): Promise<boolean> => {
    try {
      console.log('🚀 Creando tercero:', tercero);
      const newTercero = await terceroService.createTercero(tercero);
      setTerceros(prev => [...prev, newTercero]);
      notifySuccess('Tercero creado exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error al crear tercero:', err);
      notifyError(err.message || 'Error al crear el tercero');
      // Rethrow so callers (form/page) can present field-level errors
      throw err;
    }
  };

  const updateTercero = async (tercero: UpdateTerceroRequest): Promise<boolean> => {
    try {
      const updatedTercero = await terceroService.updateTercero(tercero);
      setTerceros(prev => prev.map(item => 
        item.tercero_id === updatedTercero.tercero_id ? updatedTercero : item
      ));
      notifySuccess('Tercero actualizado exitosamente');
      return true;
    } catch (err: any) {
      notifyError(err.message || 'Error al actualizar el tercero');
      // Rethrow so callers can handle validation errors
      throw err;
    }
  };

  const deleteTercero = async (id: number): Promise<boolean> => {
    try {
      await terceroService.deleteTercero(id);
      setTerceros(prev => prev.filter(item => item.tercero_id !== id));
      notifySuccess('Tercero eliminado exitosamente');
      return true;
    } catch (err: any) {
      notifyError(err.message || 'Error al eliminar el tercero');
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTerceros(),
        fetchRelatedData()
      ]);
    };
    loadData();
  }, []);

  return {
    terceros,
    paises,
    departamentos,
    municipios,
    tiposTercero,
    loading,
    error,
    fetchTerceros,
    fetchDepartamentos,
    fetchMunicipios,
    createTercero,
    updateTercero,
    deleteTercero,
    terceroService
  };
};