import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiGift, HiUserCircle, HiArrowRight, HiExclamationTriangle, HiCake, HiSparkles, HiStar, HiTrophy } from "react-icons/hi2";
import { MenuApiService } from "../../infrastructure/services/MenuApiService";
import type { FelicitacionCumpleanios, Reconocimiento } from "../../domain/types";
import { formatBirthdayDate, formatDisplayDate } from "../../../../shared/utils/dateUtils";

export default function ReconocimientosCumpleanios() {
  const [felicitaciones, setFelicitaciones] = useState<FelicitacionCumpleanios[]>([]);
  const [reconocimientos, setReconocimientos] = useState<Reconocimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        //console.log('🔄 Cargando felicitaciones y reconocimientos...');

        const [felicitacionesData, reconocimientosData] = await Promise.all([
          MenuApiService.getFelicitacionesMes(),
          MenuApiService.getReconocimientosPublicados()
        ]);

        //console.log('📝 Felicitaciones obtenidas:', felicitacionesData);
        //console.log('🏆 Reconocimientos obtenidos:', reconocimientosData);

        setFelicitaciones(felicitacionesData);
        // Tomar solo los 3 reconocimientos más recientes
        setReconocimientos(reconocimientosData.slice(0, 3));
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError('Error al cargar cumpleaños y reconocimientos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProfilePicUrl = (foto: string | undefined) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000' ;
    return `${baseUrl}${foto}`;
  };

  const formatFecha = (fecha: string) => {
    return formatBirthdayDate(fecha);
  };

  // Formato de fecha sin año para proteger privacidad
  const formatBirthdayDateWithoutYear = (fecha: string) => {
    try {
      const date = new Date(fecha + 'T00:00:00');
      const options: Intl.DateTimeFormatOptions = { 
        month: 'long', 
        day: 'numeric'
      };
      return date.toLocaleDateString('es-ES', options);
    } catch {
      return fecha;
    }
  };

  // Obtener el día del cumpleaños para animaciones especiales
  const getBirthdayDay = (fecha: string) => {
    const today = new Date();
    const birthday = new Date(fecha);
    birthday.setFullYear(today.getFullYear());

    const todayStr = today.toDateString();
    const birthdayStr = birthday.toDateString();

    return todayStr === birthdayStr;
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-400/10 to-pink-400/10 rounded-full blur-3xl"></div>

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-7 md:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 sm:mb-5 md:mb-6"></div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 sm:h-18 md:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-2xl"></div>
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

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-6 md:p-8">
          <div className="text-center text-red-600 dark:text-red-400 py-4 sm:py-6 md:py-8">
            <HiExclamationTriangle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base md:text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
      {/* Sección de Cumpleaños */}
      <div className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl transition-all duration-500 group-hover:from-pink-100 group-hover:to-rose-100 dark:group-hover:from-gray-800 dark:group-hover:to-gray-700"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl group-hover:from-pink-400/20 group-hover:to-rose-400/20 transition-all duration-500"></div>

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          {/* Header de cumpleaños */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg">
                  <HiGift className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Cumpleaños del Mes
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Celebramos a nuestro equipo
                </p>
              </div>
            </div>

            <Link
              to="/felicitaciones"
              className="group/btn flex items-center gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Ver más</span>
              <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {felicitaciones.length === 0 ? (
            <div className="text-center py-6 sm:py-8 md:py-10">
              <div className="w-12 h-12 sm:w-14 md:w-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <HiGift className="w-6 h-6 sm:w-7 md:w-8 md:h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay cumpleaños este mes
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                No hay cumpleaños programados
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {felicitaciones.slice(0, 3).map((felicitacion) => {
                const funcionario = felicitacion.funcionario;
                const photoUrl = getProfilePicUrl(funcionario?.foto);
                const isToday = getBirthdayDay(funcionario?.fecha_nacimiento || '');

                return (
                  <div
                    key={felicitacion.id}
                    className={`
                      group/card relative overflow-hidden rounded-lg sm:rounded-2xl border-2 transition-all duration-300 hover:shadow-md sm:hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] cursor-pointer p-2.5 sm:p-3 md:p-4
                      ${isToday
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border-yellow-300 dark:border-yellow-600'
                        : 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/30 border-pink-200/50 dark:border-pink-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
                      {/* Foto del funcionario */}
                      <div className="relative flex-shrink-0">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={funcionario?.nombres}
                            className={`w-10 h-10 sm:w-11 md:w-12 md:h-12 rounded-full object-cover border-2 shadow-sm ${isToday ? 'border-yellow-400' : 'border-pink-300'}`}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 sm:w-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 shadow-sm ${photoUrl ? 'hidden' : ''} ${isToday ? 'bg-yellow-100 border-yellow-400' : 'bg-pink-100 border-pink-300'}`}>
                          <HiUserCircle className={`w-6 h-6 sm:w-7 md:w-8 md:h-8 ${isToday ? 'text-yellow-600' : 'text-pink-600'}`} />
                        </div>

                        {isToday && (
                          <div className="absolute -top-1 -right-1 p-0.5 sm:p-1 bg-yellow-500 rounded-full shadow-sm animate-bounce">
                            <HiCake className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 ${isToday ? 'text-yellow-800 dark:text-yellow-200' : 'text-pink-900 dark:text-pink-100'}`}>
                          {funcionario ? `${funcionario.nombres} ${funcionario.apellidos}` : 'Funcionario'}
                        </h3>
                        <p className={`text-xs sm:text-sm ${isToday ? 'text-yellow-600' : 'text-pink-600'}`}>
                          {funcionario?.fecha_nacimiento && formatBirthdayDateWithoutYear(funcionario.fecha_nacimiento)}
                          {isToday && <span className="ml-1 sm:ml-2 font-bold">🎉</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Reconocimientos */}
      <div className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl transition-all duration-500 group-hover:from-yellow-100 group-hover:to-orange-100 dark:group-hover:from-gray-800 dark:group-hover:to-gray-700"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl group-hover:from-yellow-400/20 group-hover:to-orange-400/20 transition-all duration-500"></div>

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          {/* Header de reconocimientos */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg">
                  <HiStar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Reconocimientos
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Celebramos logros excepcionales
                </p>
              </div>
            </div>

            <Link
              to="/reconocimientos"
              className="group/btn flex items-center gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Ver más</span>
              <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {reconocimientos.length === 0 ? (
            <div className="text-center py-6 sm:py-8 md:py-10">
              <div className="w-12 h-12 sm:w-14 md:w-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <HiStar className="w-6 h-6 sm:w-7 md:w-8 md:h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay reconocimientos
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                No hay reconocimientos publicados
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {reconocimientos.map((reconocimiento) => {
                const funcionario = reconocimiento.funcionario;
                const photoUrl = getProfilePicUrl(funcionario?.foto);

                return (
                  <div
                    key={reconocimiento.id}
                    className="group/card relative overflow-hidden rounded-lg sm:rounded-2xl border-2 transition-all duration-300 hover:shadow-md sm:hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] cursor-pointer p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/30 border-yellow-200/50 dark:border-yellow-700/50"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                      {/* Foto del funcionario */}
                      <div className="relative flex-shrink-0">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={`${funcionario.nombres} ${funcionario.apellidos}`}
                            className="w-10 h-10 sm:w-11 md:w-12 md:h-12 rounded-full object-cover border-2 border-yellow-400 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 sm:w-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-sm bg-yellow-100 ${photoUrl ? 'hidden' : ''}`}>
                          <HiUserCircle className="w-6 h-6 sm:w-7 md:w-8 md:h-8 text-yellow-600" />
                        </div>

                        <div className="absolute -top-1 -right-1 p-0.5 sm:p-1 bg-yellow-500 rounded-full shadow-sm">
                          <HiTrophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 text-yellow-800 dark:text-yellow-200">
                          {reconocimiento.titulo}
                        </h3>
                        <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                          {funcionario ? `${funcionario.nombres} ${funcionario.apellidos}` : 'Funcionario'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {reconocimiento.fecha && formatDisplayDate(reconocimiento.fecha)}
                        </p>
                        <div className="hidden sm:block mt-1 sm:mt-2 text-gray-700 dark:text-gray-200 text-xs sm:text-sm leading-relaxed">
                          {reconocimiento.descripcion}
                        </div>
                      </div>
                    </div>
                    <div className="sm:hidden mt-1.5 text-xs text-gray-700 dark:text-gray-200 line-clamp-2">
                      {reconocimiento.descripcion}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}