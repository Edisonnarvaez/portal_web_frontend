import { useState, useEffect } from 'react';
import { FuncionarioService } from '../../application/services/FuncionarioService';
import { ContenidoService } from '../../application/services/ContenidoService';
import { EventoService } from '../../application/services/EventoService';
import { MenuRepository } from '../../infrastructure/repositories/MenuRepository';
import type { 
  Funcionario, 
  ContenidoInformativo, 
  Evento, 
  FelicitacionCumpleanios, 
  Reconocimiento 
} from '../../domain/types';

export const useMenuData = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [contenidos, setContenidos] = useState<ContenidoInformativo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [felicitaciones, setFelicitaciones] = useState<FelicitacionCumpleanios[]>([]);
  const [reconocimientos, setReconocimientos] = useState<Reconocimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Services
  const funcionarioService = new FuncionarioService();
  const contenidoService = new ContenidoService();
  const eventoService = new EventoService();
  const repository = new MenuRepository();

  const fetchFuncionarios = async () => {
    try {
      const data = await funcionarioService.getAllFuncionarios();
      setFuncionarios(data);
    } catch (err: any) {
      console.error('Error fetching funcionarios:', err);
      setError(err.message);
    }
  };

  const fetchContenidos = async () => {
    try {
      const data = await contenidoService.getAllContenidos();
      setContenidos(data);
    } catch (err: any) {
      console.error('Error fetching contenidos:', err);
      setError(err.message);
    }
  };

  const fetchEventos = async () => {
    try {
      const data = await eventoService.getEventosProximos();
      setEventos(data);
    } catch (err: any) {
      console.error('Error fetching eventos:', err);
      setError(err.message);
    }
  };

  const fetchFelicitaciones = async () => {
    try {
      const data = await repository.getFelicitacionesMes();
      setFelicitaciones(data);
    } catch (err: any) {
      console.error('Error fetching felicitaciones:', err);
      setError(err.message);
    }
  };

  const fetchReconocimientos = async () => {
    try {
      const data = await repository.getReconocimientosPublicados();
      setReconocimientos(data);
    } catch (err: any) {
      console.error('Error fetching reconocimientos:', err);
      setError(err.message);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchFuncionarios(),
        fetchContenidos(),
        fetchEventos(),
        fetchFelicitaciones(),
        fetchReconocimientos()
      ]);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const refreshData = () => {
    loadAllData();
  };

  return {
    funcionarios,
    contenidos,
    eventos,
    felicitaciones,
    reconocimientos,
    loading,
    error,
    refreshData,
    fetchFuncionarios,
    fetchContenidos,
    fetchEventos,
    fetchFelicitaciones,
    fetchReconocimientos,
    // Services
    funcionarioService,
    contenidoService,
    eventoService
  };
};