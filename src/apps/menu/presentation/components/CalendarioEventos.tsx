import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  HiCalendarDays, 
  HiClock, 
  HiMapPin, 
  HiGlobeAlt, 
  HiArrowRight,
  HiExclamationTriangle,
  HiStar,
  HiFire,
  HiSparkles
} from "react-icons/hi2";
import { EventoService } from "../../application/services/EventoService";
import type { Evento } from "../../domain/types";
import { formatDisplayDate, getDaysUntilDate } from "../../../../shared/utils/dateUtils";

export default function CalendarioEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventoService = new EventoService();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const data = await eventoService.getEventosProximos();
        // 👈 CAMBIAR: Tomar solo los primeros 4
        const sortedData = data.slice(0, 3);
        setEventos(sortedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const formatFecha = (fecha: string) => {
    return formatDisplayDate(fecha, {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
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

  if (loading) {
    return (
      <div className="relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl"></div>
        
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
          <div className="text-center text-red-600 dark:text-red-400">
            <HiExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden group">
      {/* Fondo decorativo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl transition-all duration-500 group-hover:from-purple-100 group-hover:to-pink-100 dark:group-hover:from-gray-800 dark:group-hover:to-gray-700"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl group-hover:from-purple-400/20 group-hover:to-pink-400/20 transition-all duration-500"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-500"></div>
      
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        {/* Header mejorado */}
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <HiCalendarDays className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Próximos Eventos
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                No te pierdas las actividades programadas
              </p>
            </div>
          </div>
          
          <Link
            to="/eventos"
            className="group/btn flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            Ver todos
            <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {eventos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <HiCalendarDays className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay eventos próximos
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No hay eventos próximos programados en este momento
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {eventos.map((evento, index) => {
              const daysUntil = getDaysUntilEvent(evento.fecha);
              const colors = getEventColor(evento.importante, daysUntil);
              
              return (
                <div
                  key={evento.id}
                  className={`
                    group/card relative overflow-hidden rounded-lg sm:rounded-2xl border-2 transition-all duration-300 hover:shadow-md sm:hover:shadow-xl hover:scale-[1.01] sm:hover:scale-[1.02] cursor-pointer
                    bg-gradient-to-br ${colors.bg}
                  `}
                >
                  {/* Línea de acento lateral */}
                  <div className={`absolute left-0 top-0 h-full w-0.5 sm:w-1 ${colors.accent} transition-all duration-300 group-hover/card:w-1 sm:group-hover/card:w-2`}></div>
                  
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                  
                  <div className="relative p-3 sm:p-4 md:p-6">
                    <div className="flex items-start gap-2 sm:gap-4">
                      {/* Icono mejorado con gradiente */}
                      <div className={`
                        flex-shrink-0 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg
                        ${colors.iconBg}
                      `}>
                        <HiCalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Tags de estado mejorados */}
                        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                          {evento.importante && (
                            <span className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md animate-pulse">
                              <HiStar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span className="hidden sm:inline">IMPORTANTE</span>
                            </span>
                          )}
                          
                          {daysUntil <= 1 && (
                            <span className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-md animate-bounce">
                              <HiFire className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {daysUntil === 0 ? 'HOY' : 'MAÑANA'}
                            </span>
                          )}
                          
                          {daysUntil > 1 && daysUntil <= 7 && (
                            <span className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-sm">
                              <HiSparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span className="hidden sm:inline">En {daysUntil} días</span>
                              <span className="sm:hidden">{daysUntil}d</span>
                            </span>
                          )}
                          
                          <span className={`
                            px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full shadow-sm
                            ${evento.es_virtual 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                            }
                          `}>
                            {evento.es_virtual ? 'Virtual' : 'Presencial'}
                          </span>
                        </div>
                        
                        {/* Título mejorado */}
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 line-clamp-2 group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400 transition-colors duration-300">
                          {evento.titulo}
                        </h3>
                        
                        {/* Descripción */}
                        <p className="hidden sm:block text-gray-600 dark:text-gray-300 mb-2 sm:mb-4 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                          {evento.detalles}
                        </p>
                        
                        {/* Información del evento mejorada */}
                        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <div className="p-1 sm:p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                              <HiCalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-medium text-xs sm:text-sm">{formatFecha(evento.fecha)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <div className="p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <HiClock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-xs sm:text-sm">{formatHora(evento.hora)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 col-span-2 lg:col-span-1">
                            <div className={`p-1 sm:p-1.5 rounded-lg ${evento.es_virtual ? 'bg-green-100 dark:bg-green-900/50' : 'bg-orange-100 dark:bg-orange-900/50'}`}>
                              {evento.es_virtual ? (
                                <HiGlobeAlt className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <HiMapPin className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                              )}
                            </div>
                            <span className="font-medium text-xs sm:text-sm truncate">
                              {evento.es_virtual ? 'Virtual' : (evento.lugar || 'Presencial')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Footer mejorado */}
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            to={`/eventos/${evento.id}`}
                            className="group/link flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-300"
                          >
                            <span className="hidden sm:inline">Ver detalles</span>
                            <span className="sm:hidden">Ver</span>
                            <HiArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover/link:translate-x-1 transition-transform duration-300" />
                          </Link>
                          
                          {evento.enlace && (
                            <a
                              href={evento.enlace}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300 underline decoration-dotted"
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
    </div>
  );
}