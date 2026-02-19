import { useState, useEffect } from 'react';
import { HiOutlineChartBar, HiOutlineExclamation, HiOutlineCheckCircle } from 'react-icons/hi';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { useDatosPrestador, useServicioSede, useAutoevaluacion, useCumplimiento } from '../hooks';

const DashboardHabilitacionPage = () => {
  const [loading, setLoading] = useState(true);

  const { datos: prestadores, fetchDatos: fetchPrestadores, getProximosAVencer } = useDatosPrestador();
  const { servicios, fetchServicios, getProximosAVencer: getServiciosProximoAVencer } = useServicioSede();
  const { autoevaluaciones, fetchAutoevaluaciones } = useAutoevaluacion();
  const { cumplimientos, fetchCumplimientos, getMejorasVencidas } = useCumplimiento();

  const [proximosVencer, setProximosVencer] = useState<any[]>([]);
  const [serviciosProximosVencer, setServiciosProximosVencer] = useState<any[]>([]);
  const [mejorasVencidas, setMejorasVencidas] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchPrestadores(),
          fetchServicios(),
          fetchAutoevaluaciones(),
          fetchCumplimientos(),
        ]);

        const proximos = await getProximosAVencer(90);
        setProximosVencer(proximos);

        const serviciosProximo = await getServiciosProximoAVencer(90);
        setServiciosProximosVencer(serviciosProximo);

        const mejoras = await getMejorasVencidas();
        setMejorasVencidas(mejoras);
      } catch (err) {
        console.error('Error cargando dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <LoadingScreen />;

  const tarjetas = [
    {
      titulo: 'Total Prestadores',
      valor: prestadores.length,
      color: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      titulo: 'Servicios Habilitados',
      valor: servicios.length,
      color: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      titulo: 'Autoevaluaciones',
      valor: autoevaluaciones.length,
      color: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      titulo: 'Mejoras Vencidas',
      valor: mejorasVencidas.length,
      color: 'bg-red-100 dark:bg-red-900',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <HiOutlineChartBar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard de Habilitación</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monitor de prestadores, servicios y evaluaciones</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetas.map((tarjeta, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{tarjeta.titulo}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">{tarjeta.valor}</p>
              </div>
              <div className={`${tarjeta.color} p-3 rounded-lg`}>
                <HiOutlineCheckCircle className={`w-6 h-6 sm:w-8 sm:h-8 ${tarjeta.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {(proximosVencer.length > 0 || serviciosProximosVencer.length > 0 || mejorasVencidas.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HiOutlineExclamation className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Alertas Importantes</h2>
          </div>

          <div className="space-y-3">
            {mejorasVencidas.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex h-2 w-2 rounded-full bg-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{mejorasVencidas.length} mejoras vencidas</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Se requiere acción inmediata</p>
                </div>
              </div>
            )}

            {proximosVencer.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex h-2 w-2 rounded-full bg-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{proximosVencer.length} prestadores próximos a vencer</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Vencimiento en próximos 90 días</p>
                </div>
              </div>
            )}

            {serviciosProximosVencer.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex h-2 w-2 rounded-full bg-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{serviciosProximosVencer.length} servicios próximos a vencer</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Vencimiento en próximos 90 días</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Información */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Resumen del Sistema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Prestadores por Clase</p>
            <div className="space-y-2">
              {['IPS', 'PROF', 'PH', 'PJ'].map(clase => (
                <div key={clase} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{clase}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {prestadores.filter(p => p.clase_prestador === clase).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Servicios por Complejidad</p>
            <div className="space-y-2">
              {['BAJA', 'MEDIA', 'ALTA'].map(comp => (
                <div key={comp} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{comp}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {servicios.filter(s => s.complejidad === comp).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHabilitacionPage;
