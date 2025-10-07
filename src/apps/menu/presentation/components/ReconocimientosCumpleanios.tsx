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

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Sección de Cumpleaños */}
      <div className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl transition-all duration-500 group-hover:from-pink-100 group-hover:to-rose-100 dark:group-hover:from-gray-800 dark:group-hover:to-gray-700"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl group-hover:from-pink-400/20 group-hover:to-rose-400/20 transition-all duration-500"></div>

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          {/* Header de cumpleaños */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg">
                  <HiGift className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Cumpleaños del Mes
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Celebramos a nuestro equipo
                </p>
              </div>
            </div>

            <Link
              to="/felicitaciones"
              className="group/btn flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Ver más
              <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {felicitaciones.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <HiGift className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay cumpleaños este mes
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No hay cumpleaños programados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {felicitaciones.slice(0, 3).map((felicitacion) => {
                const funcionario = felicitacion.funcionario;
                const photoUrl = getProfilePicUrl(funcionario?.foto);
                const isToday = getBirthdayDay(funcionario?.fecha_nacimiento || '');

                return (
                  <div
                    key={felicitacion.id}
                    className={`
                      group/card relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer p-4
                      ${isToday
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border-yellow-300 dark:border-yellow-600'
                        : 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/30 border-pink-200/50 dark:border-pink-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Foto del funcionario */}
                      <div className="relative flex-shrink-0">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={funcionario?.nombres}
                            className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isToday ? 'border-yellow-400' : 'border-pink-300'}`}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm ${photoUrl ? 'hidden' : ''} ${isToday ? 'bg-yellow-100 border-yellow-400' : 'bg-pink-100 border-pink-300'}`}>
                          <HiUserCircle className={`w-8 h-8 ${isToday ? 'text-yellow-600' : 'text-pink-600'}`} />
                        </div>

                        {isToday && (
                          <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full shadow-sm animate-bounce">
                            <HiCake className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 ${isToday ? 'text-yellow-800 dark:text-yellow-200' : 'text-pink-900 dark:text-pink-100'}`}>
                          {funcionario ? `${funcionario.nombres} ${funcionario.apellidos}` : 'Funcionario'}
                        </h3>
                        <p className={`text-sm ${isToday ? 'text-yellow-600' : 'text-pink-600'}`}>
                          {funcionario?.fecha_nacimiento && formatFecha(funcionario.fecha_nacimiento)}
                          {isToday && <span className="ml-2 font-bold">🎉</span>}
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

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          {/* Header de reconocimientos */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                  <HiStar className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Reconocimientos
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Celebramos logros excepcionales
                </p>
              </div>
            </div>

            <Link
              to="/reconocimientos"
              className="group/btn flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Ver más
              <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {reconocimientos.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <HiStar className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay reconocimientos
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No hay reconocimientos publicados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reconocimientos.map((reconocimiento) => {
                const funcionario = reconocimiento.funcionario;
                const photoUrl = getProfilePicUrl(funcionario?.foto);

                return (
                  <div
                    key={reconocimiento.id}
                    className="group/card relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer p-4 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/30 border-yellow-200/50 dark:border-yellow-700/50"
                  >
                    <div className="flex items-start gap-3">
                      {/* Foto del funcionario */}
                      <div className="relative flex-shrink-0">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={`${funcionario.nombres} ${funcionario.apellidos}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-sm bg-yellow-100 ${photoUrl ? 'hidden' : ''}`}>
                          <HiUserCircle className="w-8 h-8 text-yellow-600" />
                        </div>

                        <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full shadow-sm">
                          <HiTrophy className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 text-yellow-800 dark:text-yellow-200">
                          {reconocimiento.titulo}
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {funcionario ? `${funcionario.nombres} ${funcionario.apellidos}` : 'Funcionario'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {reconocimiento.fecha && formatDisplayDate(reconocimiento.fecha)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-gray-700 dark:text-gray-200 text-sm">
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