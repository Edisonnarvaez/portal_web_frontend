import React, { useEffect, useState, useMemo } from 'react';
import {
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineEye,
  HiOutlineLockClosed,
} from 'react-icons/hi2';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useHallazgo } from '../hooks';
import { HallazgoFormModal } from '../components';
import { TIPOS_HALLAZGO, SEVERIDADES_HALLAZGO, ESTADOS_HALLAZGO } from '../../domain/types';
import { getEstadoLabel, getEstadoColor, formatDate } from '../utils/formatters';
import { LoadingScreen } from '../../../../shared/components/LoadingScreen';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';
import type { Hallazgo } from '../../domain/entities/Hallazgo';

const TIPO_COLORS: Record<string, string> = {
  FORTALEZA: '#10b981',
  OPORTUNIDAD_MEJORA: '#3b82f6',
  NO_CONFORMIDAD: '#ef4444',
  HALLAZGO: '#f59e0b',
};

const SEV_COLORS: Record<string, string> = {
  BAJA: '#10b981',
  MEDIA: '#f59e0b',
  ALTA: '#f97316',
  'CRÍTICA': '#ef4444',
};

const ESTADO_ICONS: Record<string, React.ReactNode> = {
  ABIERTO: <HiOutlineShieldExclamation className="h-4 w-4 text-red-500" />,
  EN_SEGUIMIENTO: <HiOutlineEye className="h-4 w-4 text-yellow-500" />,
  CERRADO: <HiOutlineLockClosed className="h-4 w-4 text-green-500" />,
};

const HallazgosPage: React.FC = () => {
  const {
    hallazgos, loading, error,
    fetchHallazgos, deleteHallazgo,
  } = useHallazgo();

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSeveridad, setFiltroSeveridad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editing, setEditing] = useState<Hallazgo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hallazgo | null>(null);

  useEffect(() => {
    fetchHallazgos();
  }, []);

  /* ─── derived ─── */
  const filtered = useMemo(() => {
    return hallazgos.filter(h => {
      const matchTipo = !filtroTipo || h.tipo === filtroTipo;
      const matchSev = !filtroSeveridad || h.severidad === filtroSeveridad;
      const matchEstado = !filtroEstado || h.estado === filtroEstado;
      const matchSearch = !search ||
        h.numero_hallazgo?.toLowerCase().includes(search.toLowerCase()) ||
        h.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        h.area_responsable?.toLowerCase().includes(search.toLowerCase());
      return matchTipo && matchSev && matchEstado && matchSearch;
    });
  }, [hallazgos, filtroTipo, filtroSeveridad, filtroEstado, search]);

  const stats = useMemo(() => {
    const total = hallazgos.length;
    const abiertos = hallazgos.filter(h => h.estado === 'ABIERTO').length;
    const enSeguimiento = hallazgos.filter(h => h.estado === 'EN_SEGUIMIENTO').length;
    const cerrados = hallazgos.filter(h => h.estado === 'CERRADO').length;
    const criticos = hallazgos.filter(h => h.severidad === 'CRÍTICA').length;
    const noConf = hallazgos.filter(h => h.tipo === 'NO_CONFORMIDAD').length;
    return { total, abiertos, enSeguimiento, cerrados, criticos, noConf };
  }, [hallazgos]);

  const pieTipoData = useMemo(() =>
    TIPOS_HALLAZGO.map(t => ({
      name: t.label,
      value: hallazgos.filter(h => h.tipo === t.value).length,
      fill: TIPO_COLORS[t.value] || '#6b7280',
    })).filter(d => d.value > 0),
  [hallazgos]);

  const barSevData = useMemo(() =>
    SEVERIDADES_HALLAZGO.map(s => ({
      name: s.label,
      value: hallazgos.filter(h => h.severidad === s.value).length,
      fill: SEV_COLORS[s.value] || '#6b7280',
    })),
  [hallazgos]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHallazgo(deleteTarget.id);
      setDeleteTarget(null);
    } catch { /* handled by hook */ }
  };

  if (loading && hallazgos.length === 0) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Hallazgos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestión de hallazgos y no conformidades</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowFormModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <HiOutlinePlus className="h-4 w-4" /> Nuevo Hallazgo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total" value={stats.total} icon={<HiOutlineExclamationCircle className="h-5 w-5" />} color="gray" />
        <StatCard label="Abiertos" value={stats.abiertos} icon={<HiOutlineShieldExclamation className="h-5 w-5" />} color="red" />
        <StatCard label="Seguimiento" value={stats.enSeguimiento} icon={<HiOutlineEye className="h-5 w-5" />} color="yellow" />
        <StatCard label="Cerrados" value={stats.cerrados} icon={<HiOutlineLockClosed className="h-5 w-5" />} color="green" />
        <StatCard label="Críticos" value={stats.criticos} icon={<HiOutlineShieldExclamation className="h-5 w-5" />} color="red" highlight />
        <StatCard label="No Conform." value={stats.noConf} icon={<HiOutlineShieldCheck className="h-5 w-5" />} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie - Tipo */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Distribución por Tipo</h3>
          {pieTipoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieTipoData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                  {pieTipoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">Sin datos</p>
          )}
        </div>

        {/* Bar - Severidad */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Distribución por Severidad</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barSevData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barSevData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar hallazgo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_HALLAZGO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filtroSeveridad}
            onChange={e => setFiltroSeveridad(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todas las severidades</option>
            {SEVERIDADES_HALLAZGO.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_HALLAZGO.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">{error}</div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineExclamationCircle className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron hallazgos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(h => (
            <div
              key={h.id}
              className={`rounded-xl border bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow ${
                h.severidad === 'CRÍTICA' && h.estado !== 'CERRADO'
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Left */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {ESTADO_ICONS[h.estado]}
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">{h.numero_hallazgo}</span>
                  <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{h.descripcion}</p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(h.tipo)}`}>
                    {getEstadoLabel(h.tipo)}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(h.severidad)}`}>
                    {getEstadoLabel(h.severidad)}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(h.estado)}`}>
                    {getEstadoLabel(h.estado)}
                  </span>
                </div>

                {/* Meta + actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                    <span>{formatDate(h.fecha_identificacion)}</span>
                    {h.area_responsable && <span className="ml-2">· {h.area_responsable}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditing(h); setShowFormModal(true); }}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(h)}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Extra info row */}
              {h.observaciones && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-1 pl-6">{h.observaciones}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right">{filtered.length} de {hallazgos.length} registros</p>

      {/* Modals */}
      {showFormModal && (
        <HallazgoFormModal
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setEditing(null); }}
          onSuccess={() => { setShowFormModal(false); setEditing(null); fetchHallazgos(); }}
          hallazgo={editing || undefined}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Hallazgo"
        message={`¿Está seguro de que desea eliminar el hallazgo "${deleteTarget?.numero_hallazgo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

/* ─── aux ─── */
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'gray' | 'red' | 'yellow' | 'green' | 'orange';
  highlight?: boolean;
}

const scColors: Record<string, string> = {
  gray: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
  red: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
  yellow: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
  green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
  orange: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, highlight }) => (
  <div className={`rounded-xl border p-4 ${scColors[color]} ${highlight ? 'ring-2 ring-red-400' : ''}`}>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="opacity-40">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

export default HallazgosPage;
