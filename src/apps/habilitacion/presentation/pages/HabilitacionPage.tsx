import { useState, useEffect } from 'react';
import { HiOutlineClipboardList, HiOutlineRefresh, HiOutlinePlus } from 'react-icons/hi';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { useDatosPrestador, useServicioSede, useAutoevaluacion } from '../hooks';
import { PrestadorCard, ServicioCard, AutoevaluacionCard } from '../components';
import {
  ESTADOS_HABILITACION,
  CLASES_PRESTADOR,
  MODALIDADES_SERVICIO,
  COMPLEJIDADES_SERVICIO,
  ESTADOS_AUTOEVALUACION,
} from '../../domain/types';

const HabilitacionPage = () => {
  // Estado de la página
  const [activeTab, setActiveTab] = useState<'prestadores' | 'servicios' | 'autoevaluaciones'>('prestadores');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroClase, setFiltroClase] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [filtroComplejidad, setFiltroComplejidad] = useState('');
  const [filtroAutoevaluacion, setFiltroAutoevaluacion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const {
    datos: prestadores,
    loading: loadingPrestadores,
    error: errorPrestadores,
    fetchDatos: fetchPrestadores,
  } = useDatosPrestador();

  const {
    servicios,
    loading: loadingServicios,
    error: errorServicios,
    fetchServicios,
  } = useServicioSede();

  const {
    autoevaluaciones,
    loading: loadingAutoevaluaciones,
    error: errorAutoevaluaciones,
    fetchAutoevaluaciones,
  } = useAutoevaluacion();

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (activeTab === 'prestadores') {
        await fetchPrestadores();
      } else if (activeTab === 'servicios') {
        await fetchServicios();
      } else if (activeTab === 'autoevaluaciones') {
        await fetchAutoevaluaciones();
      }
    };

    loadData();
  }, [activeTab, fetchPrestadores, fetchServicios, fetchAutoevaluaciones]);

  // Filtrar prestadores
  const prestadoresFiltrados = prestadores.filter(p => {
    const matchesSearch =
      p.codigo_reps.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroEstado || p.estado_habilitacion === filtroEstado;
    const matchesClase = !filtroClase || p.clase_prestador === filtroClase;
    return matchesSearch && matchesEstado && matchesClase;
  });

  // Filtrar servicios
  const serviciosFiltrados = servicios.filter(s => {
    const matchesSearch =
      s.codigo_servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroEstado || s.estado_habilitacion === filtroEstado;
    const matchesModalidad = !filtroModalidad || s.modalidad === filtroModalidad;
    const matchesComplejidad = !filtroComplejidad || s.complejidad === filtroComplejidad;
    return matchesSearch && matchesEstado && matchesModalidad && matchesComplejidad;
  });

  // Filtrar autoevaluaciones
  const autoevaluacionesFiltradas = autoevaluaciones.filter(a => {
    const matchesSearch =
      a.numero_autoevaluacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.datos_prestador?.codigo_reps.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroAutoevaluacion || a.estado === filtroAutoevaluacion;
    return matchesSearch && matchesEstado;
  });

  const loading = activeTab === 'prestadores' ? loadingPrestadores : activeTab === 'servicios' ? loadingServicios : loadingAutoevaluaciones;
  const error = activeTab === 'prestadores' ? errorPrestadores : activeTab === 'servicios' ? errorServicios : errorAutoevaluaciones;

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <HiOutlineClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Habilitación</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gestión de prestadores, servicios y autoevaluaciones</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'prestadores') fetchPrestadores();
            if (activeTab === 'servicios') fetchServicios();
            if (activeTab === 'autoevaluaciones') fetchAutoevaluaciones();
          }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:shadow-md transition-shadow"
        >
          <HiOutlineRefresh className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-sm font-medium">Actualizar</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('prestadores')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
            activeTab === 'prestadores'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
          }`}
        >
          Prestadores ({prestadores.length})
        </button>
        <button
          onClick={() => setActiveTab('servicios')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
            activeTab === 'servicios'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
          }`}
        >
          Servicios ({servicios.length})
        </button>
        <button
          onClick={() => setActiveTab('autoevaluaciones')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
            activeTab === 'autoevaluaciones'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
          }`}
        >
          Autoevaluaciones ({autoevaluaciones.length})
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por código, nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filtros por tab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {activeTab === 'prestadores' && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">Todos</option>
                    {ESTADOS_HABILITACION.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clase</label>
                  <select
                    value={filtroClase}
                    onChange={(e) => setFiltroClase(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">Todos</option>
                    {CLASES_PRESTADOR.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeTab === 'servicios' && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">Todos</option>
                    {ESTADOS_HABILITACION.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modalidad</label>
                  <select
                    value={filtroModalidad}
                    onChange={(e) => setFiltroModalidad(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">Todos</option>
                    {MODALIDADES_SERVICIO.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complejidad</label>
                  <select
                    value={filtroComplejidad}
                    onChange={(e) => setFiltroComplejidad(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">Todos</option>
                    {COMPLEJIDADES_SERVICIO.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeTab === 'autoevaluaciones' && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                <select
                  value={filtroAutoevaluacion}
                  onChange={(e) => setFiltroAutoevaluacion(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm"
                >
                  <option value="">Todos</option>
                  {ESTADOS_AUTOEVALUACION.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-4">
        {/* Prestadores */}
        {activeTab === 'prestadores' && (
          <div>
            {error && <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg mb-4">{error}</div>}
            {prestadoresFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No hay prestadores que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {prestadoresFiltrados.map(p => (
                  <PrestadorCard
                    key={p.id}
                    id={p.id}
                    codigoReps={p.codigo_reps}
                    clasePresta={p.clase_prestador}
                    estadoHabilitacion={p.estado_habilitacion}
                    fechaVencimiento={p.fecha_vencimiento_habilitacion}
                    aseguradora={p.aseguradora_pep}
                    numeroPolicza={p.numero_poliza}
                    company={p.company}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Servicios*/}
        {activeTab === 'servicios' && (
          <div>
            {error && <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg mb-4">{error}</div>}
            {serviciosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No hay servicios que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviciosFiltrados.map(s => (
                  <ServicioCard
                    key={s.id}
                    id={s.id}
                    codigoServicio={s.codigo_servicio}
                    nombreServicio={s.nombre_servicio}
                    modalidad={s.modalidad}
                    complejidad={s.complejidad}
                    estadoHabilitacion={s.estado_habilitacion}
                    fechaVencimiento={s.fecha_vencimiento}
                    headquarters={s.headquarters}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Autoevaluaciones */}
        {activeTab === 'autoevaluaciones' && (
          <div>
            {error && <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg mb-4">{error}</div>}
            {autoevaluacionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No hay autoevaluaciones que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {autoevaluacionesFiltradas.map(a => (
                  <AutoevaluacionCard
                    key={a.id}
                    id={a.id}
                    numeroAutoevaluacion={a.numero_autoevaluacion}
                    periodo={a.periodo}
                    estado={a.estado}
                    fechaVencimiento={a.fecha_vencimiento}
                    datosPrestador={a.datos_prestador}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabilitacionPage;
