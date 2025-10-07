import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiExclamationTriangle, HiArrowRight, HiCalendar, HiEye, HiBolt } from "react-icons/hi2";
import { HiSpeakerphone } from "react-icons/hi";
import { ContenidoService } from "../../application/services/ContenidoService";
import type { ContenidoInformativo } from "../../domain/types";
import { formatDisplayDate } from "../../../../shared/utils/dateUtils";

export default function NoticiasComunicados() {
  const [contenidos, setContenidos] = useState<ContenidoInformativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contenidoService = new ContenidoService();

  useEffect(() => {
    const fetchContenidos = async () => {
      try {
        setLoading(true);
        const data = await contenidoService.getAllContenidos();
        // 👈 CAMBIAR: Tomar solo los primeros 4
        const sortedData = data.slice(0, 3);
        setContenidos(sortedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching contenidos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContenidos();
  }, []);

  const formatFecha = (fecha: string) => {
    return formatDisplayDate(fecha, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'comunicado' ? HiSpeakerphone : HiSpeakerphone;
  };

  const getTipoColor = (tipo: string, urgente: boolean) => {
    if (urgente) return 'text-red-500';
    return tipo === 'comunicado' 
      ? 'text-blue-500' 
      : 'text-emerald-500';
  };

  const getTipoBgColor = (tipo: string, urgente: boolean) => {
    if (urgente) return 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-200/50 dark:border-red-700/50';
    return tipo === 'comunicado' 
      ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200/50 dark:border-blue-700/50' 
      : 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 border-emerald-200/50 dark:border-emerald-700/50';
  };

  const getIconBgColor = (tipo: string, urgente: boolean) => {
    if (urgente) return 'bg-red-100 dark:bg-red-800/50';
    return tipo === 'comunicado' 
      ? 'bg-blue-100 dark:bg-blue-800/50' 
      : 'bg-emerald-100 dark:bg-emerald-800/50';
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl transition-all duration-500 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-gray-800 dark:group-hover:to-gray-700"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-500"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl group-hover:from-emerald-400/20 group-hover:to-blue-400/20 transition-all duration-500"></div>
      
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        {/* Header mejorado */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <HiSpeakerphone className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Noticias y Comunicados
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Mantente informado con las últimas actualizaciones
              </p>
            </div>
          </div>
          
          <Link
            to="/noticias"
            className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Ver todas
            <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {contenidos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <HiSpeakerphone className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay contenido disponible
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No hay noticias o comunicados disponibles en este momento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contenidos.map((contenido, index) => {
              const IconComponent = getTipoIcon(contenido.tipo);
              const isUrgent = contenido.urgente;
              
              return (
                <div
                  key={contenido.id}
                  className={`
                    group/card relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer
                    bg-gradient-to-br ${getTipoBgColor(contenido.tipo, isUrgent)}
                    ${index === 0 && contenidos.length > 2 ? 'lg:col-span-2' : ''}
                  `}
                >
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover/card:animate-pulse"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      {/* Icono mejorado */}
                      <div className={`
                        flex-shrink-0 p-3 rounded-xl shadow-md
                        ${getIconBgColor(contenido.tipo, isUrgent)}
                      `}>
                        <IconComponent className={`w-6 h-6 ${getTipoColor(contenido.tipo, isUrgent)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Tags mejorados */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`
                            px-3 py-1 text-xs font-bold rounded-full shadow-sm
                            ${isUrgent 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : contenido.tipo === 'comunicado' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-emerald-500 text-white'
                            }
                          `}>
                            {contenido.tipo === 'comunicado' ? 'Comunicado' : 'Noticia'}
                          </span>
                          
                          {isUrgent && (
                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-red-600 text-white rounded-full animate-bounce shadow-lg">
                              <HiBolt className="w-3 h-3" />
                              URGENTE
                            </span>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <HiCalendar className="w-3 h-3" />
                            {formatFecha(contenido.fecha)}
                          </div>
                        </div>
                        
                        {/* Título mejorado */}
                        <h3 className={`
                          font-bold mb-3 line-clamp-2 transition-colors duration-300
                          ${index === 0 && contenidos.length > 2 ? 'text-xl' : 'text-lg'}
                          ${isUrgent 
                            ? 'text-red-800 dark:text-red-200' 
                            : 'text-gray-900 dark:text-gray-100 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400'
                          }
                        `}>
                          {contenido.titulo}
                        </h3>
                        
                        {/* Contenido mejorado */}
                        <p className={`
                          text-gray-600 dark:text-gray-300 mb-4 leading-relaxed
                          ${index === 0 && contenidos.length > 2 ? 'line-clamp-3' : 'line-clamp-2'}
                        `}>
                          {contenido.contenido}
                        </p>
                        
                        {/* Footer mejorado */}
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/noticias/${contenido.id}`}
                            className="group/link flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                          >
                            <HiEye className="w-4 h-4" />
                            Leer más
                            <HiArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform duration-300" />
                          </Link>
                          
                          {contenido.enlace && (
                            <a
                              href={contenido.enlace}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300 underline decoration-dotted"
                            >
                              Enlace externo
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