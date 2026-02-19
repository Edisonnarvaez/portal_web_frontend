import { useState, useEffect } from 'react';
import {
  HiOutlineClipboardList,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { useDatosPrestador, useServicioSede, useAutoevaluacion, useCumplimiento } from '../hooks';
import { PrestadorCard, ServicioCard, AutoevaluacionCard } from '../components';
import {
  ESTADOS_HABILITACION,
  CLASES_PRESTADOR,
  MODALIDADES_SERVICIO,
  COMPLEJIDADES_SERVICIO,
  ESTADOS_AUTOEVALUACION,
  ESTADOS_CUMPLIMIENTO,
} from '../../domain/types';

interface AlertItem {
  id: string;
  type: 'vencimiento' | 'mejora' | 'evaluacion';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  actionUrl?: string;
}

const HabilitacionPageEnhanced = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prestadores' | 'servicios' | 'autoevaluaciones' | 'cumplimientos'>('dashboard');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroClase, setFiltroClase] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [filtroComplejidad, setFiltroComplejidad] = useState('');
  const [filtroAutoevaluacion, setFiltroAutoevaluacion] = useState('');
  const [filtroCumplimiento, setFiltroCumplimiento] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Hooks
  const {
    datos: prestadores,
    loading: loadingPrestadores,
    error: errorPrestadores,
    fetchDatos: fetchPrestadores,
    delete: deletePrestador,
  } = useDatosPrestador();

  const {
    servicios,
    loading: loadingServicios,
    error: errorServicios,
    fetchServicios,
    delete: deleteServicio,
  } = useServicioSede();

  const {
    autoevaluaciones,
    loading: loadingAutoevaluaciones,
    error: errorAutoevaluaciones,
    fetchAutoevaluaciones,
    delete: deleteAutoevaluacion,
  } = useAutoevaluacion();

  const {
    cumplimientos,
    loading: loadingCumplimientos,
    error: errorCumplimientos,
    fetchCumplimientos,
  } = useCumplimiento();

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      switch (activeTab) {
        case 'dashboard':
          await Promise.all([fetchPrestadores(), fetchServicios(), fetchAutoevaluaciones()]);
          break;
        case 'prestadores':
          await fetchPrestadores();
          break;
        case 'servicios':
          await fetchServicios();
          break;
        case 'autoevaluaciones':
          await fetchAutoevaluaciones();
          break;
        case 'cumplimientos':
          await fetchCumplimientos();
          break;
      }
    };

    loadData();
  }, [activeTab]);

  // Calcular alertas
  const calculateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    // Prestadores próximos a vencer
    prestadores.forEach((p, idx) => {
      const fechaVencimiento = new Date(p.fecha_vencimiento_habilitacion || '');
      const hoy = new Date();
      const diasFaltantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

      if (diasFaltantes < 0) {
        alerts.push({
          id: `vencimiento-prestador-${p.id}`,
          type: 'vencimiento',
          severity: 'critical',
          title: `Habilitación Vencida: ${p.codigo_reps}`,
          description: `Vencida hace ${Math.abs(diasFaltantes)} días. Requiere renovación inmediata.`,
          actionUrl: `/habilitacion?tab=prestadores&id=${p.id}`,
        });
      } else if (diasFaltantes <= 30) {
        alerts.push({
          id: `vencimiento-prestador-${p.id}`,
          type: 'vencimiento',
          severity: 'warning',
          title: `Vencimiento Próximo: ${p.codigo_reps}`,
          description: `Vence en ${diasFaltantes} días. Inicie trámite de renovación.`,
          actionUrl: `/habilitacion?tab=prestadores&id=${p.id}`,
        });
      }
    });

    // Servicios próximos a vencer
    servicios.forEach((s) => {
      const fechaVencimiento = new Date(s.fecha_vencimiento || '');
      const hoy = new Date();
      const diasFaltantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

      if (diasFaltantes <= 30 && diasFaltantes > 0) {
        alerts.push({
          id: `vencimiento-servicio-${s.id}`,
          type: 'vencimiento',
          severity: 'warning',
          title: `Servicio Próximo a Vencer: ${s.nombre_servicio}`,
          description: `${s.nombre_servicio} vence en ${diasFaltantes} días.`,
        });
      }
    });

    // Autoevaluaciones en borrador
    const autoevaluacionesBorrador = autoevaluaciones.filter((a) => a.estado === 'BORRADOR');
    if (autoevaluacionesBorrador.length > 0) {
      alerts.push({
        id: 'evaluaciones-pendientes',
        type: 'evaluacion',
        severity: 'info',
        title: `Evaluaciones Incompletas`,
        description: `Hay ${autoevaluacionesBorrador.length} autoevaluaciones en estado borrador.`,
      });
    }

    return alerts;
  };

  // Filtrar prestadores
  const prestadoresFiltrados = prestadores.filter((p) => {
    const matchesSearch =
      p.codigo_reps.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroEstado || p.estado_habilitacion === filtroEstado;
    const matchesClase = !filtroClase || p.clase_prestador === filtroClase;
    return matchesSearch && matchesEstado && matchesClase;
  });

  // Filtrar servicios
  const serviciosFiltrados = servicios.filter((s) => {
    const matchesSearch =
      s.codigo_servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroEstado || s.estado_habilitacion === filtroEstado;
    const matchesModalidad = !filtroModalidad || s.modalidad === filtroModalidad;
    const matchesComplejidad = !filtroComplejidad || s.complejidad === filtroComplejidad;
    return matchesSearch && matchesEstado && matchesModalidad && matchesComplejidad;
  });

  // Filtrar autoevaluaciones
  const autoevaluacionesFiltradas = autoevaluaciones.filter((a) => {
    const matchesSearch =
      a.numero_autoevaluacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.datos_prestador?.codigo_reps.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroAutoevaluacion || a.estado === filtroAutoevaluacion;
    return matchesSearch && matchesEstado;
  });

  // Filtrar cumplimientos
  const cumplimientosFiltrados = cumplimientos.filter((c) => {
    const matchesEstado = !filtroCumplimiento || c.cumple === filtroCumplimiento;
    return matchesEstado;
  });

  const alerts = calculateAlerts();
  const loading =
    activeTab === 'dashboard'
      ? loadingPrestadores || loadingServicios || loadingAutoevaluaciones
      : activeTab === 'prestadores'
      ? loadingPrestadores
      : activeTab === 'servicios'
      ? loadingServicios
      : activeTab === 'autoevaluaciones'
      ? loadingAutoevaluaciones
      : loadingCumplimientos;

  const error =
    activeTab === 'prestadores'
      ? errorPrestadores
      : activeTab === 'servicios'
      ? errorServicios
      : activeTab === 'autoevaluaciones'
      ? errorAutoevaluaciones
      : activeTab === 'cumplimientos'
      ? errorCumplimientos
      : '';

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      switch (activeTab) {
        case 'prestadores':
          await deletePrestador(selectedItem.id);
          await fetchPrestadores();
          break;
        case 'servicios':
          await deleteServicio(selectedItem.id);
          await fetchServicios();
          break;
        case 'autoevaluaciones':
          await deleteAutoevaluacion(selectedItem.id);
          await fetchAutoevaluaciones();
          break;
      }
      setShowDeleteDialog(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  if (loading && activeTab === 'dashboard') return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <HiOutlineClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Gestión de Habilitación
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Resolución 3100 de 2019</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (activeTab === 'prestadores') fetchPrestadores();
              else if (activeTab === 'servicios') fetchServicios();
              else if (activeTab === 'autoevaluaciones') fetchAutoevaluaciones();
              else if (activeTab === 'cumplimientos') fetchCumplimientos();
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:shadow-md transition-shadow"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Actualizar</span>
          </button>
          {activeTab !== 'dashboard' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Crear</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
        {(['dashboard', 'prestadores', 'servicios', 'autoevaluaciones', 'cumplimientos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm('');
              setFiltroEstado('');
              setFiltroClase('');
            }}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Alertas */}
      {activeTab === 'dashboard' && alerts.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineExclamation className="w-5 h-5 text-yellow-600" />
            Alertas Importantes ({alerts.length})
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-600 text-red-800 dark:text-red-200'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-600 text-yellow-800 dark:text-yellow-200'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-800 dark:text-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm mt-1">{alert.description}</p>
                  </div>
                  {alert.actionUrl && (
                    <button className="text-xs font-medium underline ml-2">Ver</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardKPI
              title="Prestadores Habilitados"
              value={prestadores.filter((p) => p.estado_habilitacion === 'HABILITADA').length}
              icon={<HiOutlineCheckCircle className="w-8 h-8 text-green-600" />}
              color="green"
            />
            <DashboardKPI
              title="Prestadores Vencidos"
              value={prestadores.filter((p) => {
                const fecha = new Date(p.fecha_vencimiento_habilitacion || '');
                return fecha < new Date();
              }).length}
              icon={<HiOutlineXCircle className="w-8 h-8 text-red-600" />}
              color="red"
            />
            <DashboardKPI
              title="Servicios Habilitados"
              value={servicios.length}
              icon={<HiOutlineClipboardList className="w-8 h-8 text-blue-600" />}
              color="blue"
            />
            <DashboardKPI
              title="Autoevaluaciones Pendientes"
              value={autoevaluaciones.filter((a) => a.estado === 'BORRADOR' || a.estado === 'EN_CURSO').length}
              icon={<HiOutlineExclamation className="w-8 h-8 text-yellow-600" />}
              color="yellow"
            />
          </div>

          {/* Últimas Actividades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity title="Prestadores Recientes" items={prestadores.slice(0, 5)} />
            <RecentActivity title="Autoevaluaciones Recientes" items={autoevaluaciones.slice(0, 5)} />
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      {activeTab !== 'dashboard' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por código, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filtros dinámicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeTab === 'prestadores' && (
                <>
                  <Select
                    label="Estado"
                    value={filtroEstado}
                    onChange={setFiltroEstado}
                    options={ESTADOS_HABILITACION.map((e) => ({ value: e.value, label: e.label }))}
                  />
                  <Select
                    label="Clase"
                    value={filtroClase}
                    onChange={setFiltroClase}
                    options={CLASES_PRESTADOR.map((c) => ({ value: c.value, label: c.label }))}
                  />
                </>
              )}

              {activeTab === 'servicios' && (
                <>
                  <Select
                    label="Estado"
                    value={filtroEstado}
                    onChange={setFiltroEstado}
                    options={ESTADOS_HABILITACION.map((e) => ({ value: e.value, label: e.label }))}
                  />
                  <Select
                    label="Modalidad"
                    value={filtroModalidad}
                    onChange={setFiltroModalidad}
                    options={MODALIDADES_SERVICIO.map((m) => ({ value: m.value, label: m.label }))}
                  />
                  <Select
                    label="Complejidad"
                    value={filtroComplejidad}
                    onChange={setFiltroComplejidad}
                    options={COMPLEJIDADES_SERVICIO.map((c) => ({ value: c.value, label: c.label }))}
                  />
                </>
              )}

              {activeTab === 'autoevaluaciones' && (
                <Select
                  label="Estado"
                  value={filtroAutoevaluacion}
                  onChange={setFiltroAutoevaluacion}
                  options={ESTADOS_AUTOEVALUACION.map((e) => ({ value: e.value, label: e.label }))}
                />
              )}

              {activeTab === 'cumplimientos' && (
                <Select
                  label="Estado Cumplimiento"
                  value={filtroCumplimiento}
                  onChange={setFiltroCumplimiento}
                  options={ESTADOS_CUMPLIMIENTO.map((e) => ({ value: e.value, label: e.label }))}
                />
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Tarjetas
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Tabla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      {!loading && (
        <div>
          {error && <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg mb-4">{error}</div>}

          {activeTab === 'prestadores' && (
            <ContentGrid
              items={prestadoresFiltrados}
              emptyMessage="No hay prestadores"
              viewMode={viewMode}
              renderCard={(item) => (
                <div className="relative">
                  <PrestadorCard key={item.id} {...item} />
                  <ActionButtons
                    item={item}
                    onEdit={() => setSelectedItem(item)}
                    onDelete={() => {
                      setSelectedItem(item);
                      setShowDeleteDialog(true);
                    }}
                  />
                </div>
              )}
            />
          )}

          {activeTab === 'servicios' && (
            <ContentGrid
              items={serviciosFiltrados}
              emptyMessage="No hay servicios"
              viewMode={viewMode}
              renderCard={(item) => (
                <div className="relative">
                  <ServicioCard key={item.id} {...item} />
                  <ActionButtons
                    item={item}
                    onEdit={() => setSelectedItem(item)}
                    onDelete={() => {
                      setSelectedItem(item);
                      setShowDeleteDialog(true);
                    }}
                  />
                </div>
              )}
            />
          )}

          {activeTab === 'autoevaluaciones' && (
            <ContentGrid
              items={autoevaluacionesFiltradas}
              emptyMessage="No hay autoevaluaciones"
              viewMode={viewMode}
              renderCard={(item) => (
                <div className="relative">
                  <AutoevaluacionCard key={item.id} {...item} />
                  <ActionButtons
                    item={item}
                    onEdit={() => setSelectedItem(item)}
                    onDelete={() => {
                      setSelectedItem(item);
                      setShowDeleteDialog(true);
                    }}
                  />
                </div>
              )}
            />
          )}
        </div>
      )}

      {loading && activeTab !== 'dashboard' && <LoadingScreen />}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Eliminar Registro"
        message="¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedItem(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

// Componentes auxiliares

interface DashboardKPIProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'yellow';
}

const DashboardKPI: React.FC<DashboardKPIProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className="opacity-20">{icon}</div>
      </div>
    </div>
  );
};

interface RecentActivityProps {
  title: string;
  items: any[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ title, items }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay items disponibles</p>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {item.numero_autoevaluacion || item.nombre_servicio || item.codigo_reps}
            </div>
            <HiOutlineCheckCircle className="w-4 h-4 text-green-600" />
          </div>
        ))
      )}
    </div>
  </div>
);

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
    >
      <option value="">Todos</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface ContentGridProps {
  items: any[];
  emptyMessage: string;
  viewMode: 'cards' | 'table';
  renderCard: (item: any) => React.ReactNode;
}

const ContentGrid: React.FC<ContentGridProps> = ({ items, emptyMessage, viewMode, renderCard }) => {
  if (items.length === 0) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">{emptyMessage}</div>;
  }

  if (viewMode === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="space-y-2">
            {items.map((item) => (
              <tr key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <td className="px-4 py-3">{item.codigo_reps || item.nombre_servicio || item.numero_autoevaluacion}</td>
                <td className="px-4 py-3">{item.estado_habilitacion || item.estado || '-'}</td>
                <td className="px-4 py-3 text-right">{/* Actions could go here */}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(renderCard)}</div>;
};

interface ActionButtonsProps {
  item: any;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ item, onEdit, onDelete }) => (
  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <button
      onClick={onEdit}
      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      title="Editar"
    >
      <HiOutlinePencil className="w-4 h-4" />
    </button>
    <button
      onClick={onDelete}
      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      title="Eliminar"
    >
      <HiOutlineTrash className="w-4 h-4" />
    </button>
  </div>
);

export default HabilitacionPageEnhanced;
