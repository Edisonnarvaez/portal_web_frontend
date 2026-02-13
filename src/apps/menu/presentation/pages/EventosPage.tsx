import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { 
  HiCalendarDays, 
  HiClock, 
  HiMapPin, 
  HiGlobeAlt, 
  HiArrowRight,
  HiArrowLeft,
  HiMagnifyingGlass,
  HiPlus,
  HiPencil,
  HiTrash,
  HiExclamationTriangle,
  HiStar,
  HiFire,
  HiSparkles
} from "react-icons/hi2";
import { EventoService } from "../../application/services/EventoService";
import { EventoCrudService } from "../../application/services/EventoCrudService";
import { useMenuPermissions } from "../hooks/useMenuPermissions";
import type { Evento, CreateEventoRequest, UpdateEventoRequest } from "../../domain/types";
import CrudModal from "../components/CrudModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import EventoForm from "../components/EventoForm";
import { formatDisplayDate, getDaysUntilDate } from "../../../../shared/utils/dateUtils";

export default function EventosPage() {
  const { id } = useParams();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoDetalle, setEventoDetalle] = useState<Evento | null>(null);
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  // Estados CRUD
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  const eventoService = new EventoService();
  const eventoCrudService = new EventoCrudService();
  const permissions = useMenuPermissions("menu");

  useEffect(() => {
    if (id) {
      fetchEventoDetalle(parseInt(id));
    } else {
      fetchEventos();
    }
  }, [id]);

  useEffect(() => {
    const filtered = eventoService.filterEventos(
      eventos,
      searchTerm,
      showVirtualOnly,
      showImportantOnly
    );
    setFilteredEventos(filtered);
  }, [eventos, searchTerm, showVirtualOnly, showImportantOnly]);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const data = await eventoService.getAllEventos();
      setEventos(data);
      setFilteredEventos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventoDetalle = async (eventoId: number) => {
    try {
      setLoading(true);
      const data = await eventoService.getEventoById(eventoId);
      setEventoDetalle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateEventoRequest | UpdateEventoRequest) => {
    setCrudLoading(true);
    
    let result;
    if ('id' in data) {
      result = await eventoCrudService.updateEvento(data as UpdateEventoRequest);
      if (result.success) {
        setShowEditModal(false);
        setSelectedEvento(null);
        fetchEventos();
      }
    } else {
      result = await eventoCrudService.createEvento(data as CreateEventoRequest);
      if (result.success) {
        setShowCreateModal(false);
        fetchEventos();
      }
    }
    
    if (!result.success) {
      console.error(result.message);
    }
    
    setCrudLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedEvento) return;

    setCrudLoading(true);
    const result = await eventoCrudService.deleteEvento(selectedEvento.id);

    if (result.success) {
      setShowDeleteModal(false);
      setSelectedEvento(null);
      fetchEventos();
    } else {
      console.error(result.message);
    }
    setCrudLoading(false);
  };

  const openEditModal = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowEditModal(true);
  };

  const openDeleteModal = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowDeleteModal(true);
  };

  const formatFecha = (fecha: string) => {
    return formatDisplayDate(fecha, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilEvent = (fecha: string) => {
    return getDaysUntilDate(fecha);
  };

  const getEventColor = (importante: boolean, daysUntil: number) => {
    if (importante) return {
      bg: 'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/30 border-amber-200/50 dark:border-amber-700/50',
      icon: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      accent: 'bg-amber-500'
    };
    
    if (daysUntil <= 1) return {
      bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-200/50 dark:border-red-700/50',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      accent: 'bg-red-500'
    };
    
    if (daysUntil <= 7) return {
      bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 border-orange-200/50 dark:border-orange-700/50',
      icon: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      accent: 'bg-orange-500'
    };
    
    return {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200/50 dark:border-blue-700/50',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      accent: 'bg-blue-500'
    };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setShowVirtualOnly(false);
    setShowImportantOnly(false);
  };

  if (loading) {
    return <LoadingScreen message="Cargando eventos..." />;
  }

  if (error) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        
        <div className="relative p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
              <div className="text-center text-red-600 dark:text-red-400">
                <HiExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de detalle del evento
  if (id && eventoDetalle) {
    const daysUntil = getDaysUntilEvent(eventoDetalle.fecha);
    const colors = getEventColor(eventoDetalle.importante, daysUntil);

    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative p-6">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/eventos"
              className="group inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 font-medium transition-colors"
            >
              <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-3" />
              Volver a eventos
            </Link>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className={`flex-shrink-0 p-4 rounded-2xl shadow-lg ${colors.iconBg}`}>
                    <HiCalendarDays className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {eventoDetalle.importante && (
                        <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md">
                          <HiStar className="w-3 h-3" />
                          IMPORTANTE
                        </span>
                      )}
                      
                      {daysUntil <= 1 && (
                        <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-md animate-pulse">
                          <HiFire className="w-3 h-3" />
                          {daysUntil === 0 ? 'HOY' : 'MAÑANA'}
                        </span>
                      )}
                      
                      <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                        eventoDetalle.es_virtual 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      }`}>
                        {eventoDetalle.es_virtual ? 'Virtual' : 'Presencial'}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {eventoDetalle.titulo}
                    </h1>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                        <HiCalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Fecha</p>
                        <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                          {formatFecha(eventoDetalle.fecha)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <HiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Hora</p>
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                          {formatHora(eventoDetalle.hora)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-4 ${
                    eventoDetalle.es_virtual 
                      ? 'bg-green-50 dark:bg-green-900/30' 
                      : 'bg-orange-50 dark:bg-orange-900/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        eventoDetalle.es_virtual 
                          ? 'bg-green-100 dark:bg-green-800' 
                          : 'bg-orange-100 dark:bg-orange-800'
                      }`}>
                        {eventoDetalle.es_virtual ? (
                          <HiGlobeAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <HiMapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          eventoDetalle.es_virtual 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {eventoDetalle.es_virtual ? 'Modalidad' : 'Lugar'}
                        </p>
                        <p className={`text-lg font-bold ${
                          eventoDetalle.es_virtual 
                            ? 'text-green-800 dark:text-green-200' 
                            : 'text-orange-800 dark:text-orange-200'
                        }`}>
                          {eventoDetalle.es_virtual ? 'Virtual' : (eventoDetalle.lugar || 'Por definir')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Detalles del evento
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {eventoDetalle.detalles}
                    </p>
                  </div>
                </div>

                {eventoDetalle.enlace && (
                  <div className="text-center">
                    <a
                      href={eventoDetalle.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {eventoDetalle.es_virtual ? 'Unirse al evento' : 'Más información'}
                      <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista de eventos
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <HiCalendarDays className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Eventos y Actividades
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Mantente informado sobre las próximas actividades institucionales
                </p>
              </div>
            </div>
            
            {permissions.canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <HiPlus className="w-5 h-5" />
                Crear evento
              </button>
            )}
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center">
                <HiCalendarDays className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Eventos</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{eventos.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center">
                <HiStar className="w-8 h-8 text-amber-600 dark:text-amber-400 mr-3" />
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Importantes</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {eventos.filter(e => e.importante).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center">
                <HiGlobeAlt className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Virtuales</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {eventos.filter(e => e.es_virtual).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center">
                <HiMapPin className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Presenciales</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {eventos.filter(e => !e.es_virtual).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVirtualOnly}
                    onChange={(e) => setShowVirtualOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solo virtuales</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showImportantOnly}
                    onChange={(e) => setShowImportantOnly(e.target.checked)}
                    className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solo importantes</span>
                </label>

                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de eventos */}
        {filteredEventos.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 max-w-md mx-auto">
              <HiCalendarDays className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                No se encontraron eventos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {eventos.length === 0 
                  ? "Aún no hay eventos programados."
                  : "Intenta ajustar los filtros de búsqueda."
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEventos.map((evento) => {
              const daysUntil = getDaysUntilEvent(evento.fecha);
              const colors = getEventColor(evento.importante, daysUntil);
              
              return (
                <div
                  key={evento.id}
                  className={`
                    group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer
                    bg-gradient-to-br ${colors.bg}
                  `}
                >
                  {/* Línea de acento lateral */}
                  <div className={`absolute left-0 top-0 w-1 h-full ${colors.accent} transition-all duration-300 group-hover:w-2`}></div>
                  
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      {/* Icono mejorado con gradiente */}
                      <div className={`flex-shrink-0 p-3 rounded-xl shadow-lg ${colors.iconBg}`}>
                        <HiCalendarDays className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Tags de estado mejorados */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {evento.importante && (
                            <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md animate-pulse">
                              <HiStar className="w-3 h-3" />
                              IMPORTANTE
                            </span>
                          )}
                          
                          {daysUntil <= 1 && (
                            <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-md animate-bounce">
                              <HiFire className="w-3 h-3" />
                              {daysUntil === 0 ? 'HOY' : 'MAÑANA'}
                            </span>
                          )}
                          
                          {daysUntil > 1 && daysUntil <= 7 && (
                            <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-sm">
                              <HiSparkles className="w-3 h-3" />
                              En {daysUntil} días
                            </span>
                          )}
                          
                          <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                            evento.es_virtual 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          }`}>
                            {evento.es_virtual ? 'Virtual' : 'Presencial'}
                          </span>
                        </div>
                        
                        {/* Título mejorado */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                          {evento.titulo}
                        </h3>
                        
                        {/* Descripción */}
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                          {evento.detalles}
                        </p>
                        
                        {/* Información del evento mejorada */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                              <HiCalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-medium">{formatFecha(evento.fecha)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <HiClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium">{formatHora(evento.hora)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 col-span-2 lg:col-span-1">
                            <div className={`p-1.5 rounded-lg ${evento.es_virtual ? 'bg-green-100 dark:bg-green-900/50' : 'bg-orange-100 dark:bg-orange-900/50'}`}>
                              {evento.es_virtual ? (
                                <HiGlobeAlt className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <HiMapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              )}
                            </div>
                            <span className="font-medium truncate">
                              {evento.es_virtual ? 'Virtual' : (evento.lugar || 'Presencial')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Footer mejorado */}
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/eventos/${evento.id}`}
                            className="group/link flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-300"
                          >
                            Ver detalles
                            <HiArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform duration-300" />
                          </Link>
                          
                          {permissions.canEdit && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(evento)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                              >
                                <HiPencil className="w-4 h-4" />
                                Editar
                              </button>
                              {permissions.canDelete && (
                                <button
                                  onClick={() => openDeleteModal(evento)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                                >
                                  <HiTrash className="w-4 h-4" />
                                  Eliminar
                                </button>
                              )}
                            </div>
                          )}
                          
                          {evento.enlace && (
                            <a
                              href={evento.enlace}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300 underline decoration-dotted"
                            >
                              {evento.es_virtual ? 'Unirse' : 'Más info'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales CRUD */}
      <CrudModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Evento"
        loading={crudLoading}
        submitText="Crear"
      >
        <EventoForm
          onSubmit={handleSubmit}
          loading={crudLoading}
        />
      </CrudModal>

      <CrudModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEvento(null);
        }}
        title="Editar Evento"
        loading={crudLoading}
        submitText="Actualizar"
      >
        <EventoForm
          evento={selectedEvento}
          onSubmit={handleSubmit}
          loading={crudLoading}
        />
      </CrudModal>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEvento(null);
        }}
        onConfirm={handleDelete}
        loading={crudLoading}
        title="Eliminar Evento"
        message="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
        itemName={selectedEvento ? selectedEvento.titulo : ''}
      />
    </div>
  );
}