import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineFunnel,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineChartBarSquare,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { useCumplimiento, useAutoevaluacion } from '../hooks';
import { CumplimientoFormModal, Breadcrumbs, DataTable } from '../components';
import type { DataTableColumn } from '../components';
import { ESTADOS_CUMPLIMIENTO } from '../../domain/types';
import { getEstadoLabel, getEstadoColor, formatDate } from '../utils/formatters';
import { LoadingScreen } from '../../../../shared/components/LoadingScreen';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';

const COLOR_MAP: Record<string, string> = {
  CUMPLE: '#10b981',
  NO_CUMPLE: '#ef4444',
  PARCIALMENTE: '#f59e0b',
  NO_APLICA: '#6b7280',
};

const CumplimientoPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { cumplimientos, loading, error, fetchCumplimientos, delete: deleteCumplimiento } = useCumplimiento();
  const { autoevaluaciones, fetchAutoevaluaciones } = useAutoevaluacion();

  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroAutoeval, setFiltroAutoeval] = useState('');
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editing, setEditing] = useState<Cumplimiento | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cumplimiento | null>(null);

  useEffect(() => {
    fetchCumplimientos();
    fetchAutoevaluaciones();
  }, []);

  const filtered = useMemo(() => {
    return cumplimientos.filter(c => {
      const matchEstado = !filtroEstado || c.cumple === filtroEstado;
      const matchAuto = !filtroAutoeval || c.autoevaluacion?.id === Number(filtroAutoeval);
      const matchSearch = !search ||
        c.servicio_sede?.nombre_servicio?.toLowerCase().includes(search.toLowerCase()) ||
        c.criterio?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        c.hallazgo?.toLowerCase().includes(search.toLowerCase());
      return matchEstado && matchAuto && matchSearch;
    });
  }, [cumplimientos, filtroEstado, filtroAutoeval, search]);

  /* ─── stats ─── */
  const stats = useMemo(() => {
    const total = cumplimientos.length;
    const cumple = cumplimientos.filter(c => c.cumple === 'CUMPLE').length;
    const noCumple = cumplimientos.filter(c => c.cumple === 'NO_CUMPLE').length;
    const parcial = cumplimientos.filter(c => c.cumple === 'PARCIALMENTE').length;
    const noAplica = cumplimientos.filter(c => c.cumple === 'NO_APLICA').length;
    const aplicables = total - noAplica;
    const pctCumple = aplicables > 0 ? Math.round((cumple / aplicables) * 100) : 0;
    return { total, cumple, noCumple, parcial, noAplica, pctCumple };
  }, [cumplimientos]);

  const pieData = useMemo(() =>
    ESTADOS_CUMPLIMIENTO.map(e => ({
      name: e.label,
      value: cumplimientos.filter(c => c.cumple === e.value).length,
      fill: COLOR_MAP[e.value] || '#6b7280',
    })).filter(d => d.value > 0),
  [cumplimientos]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCumplimiento(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting cumplimiento:', err);
    }
  };

  /* ── DataTable columns ── */
  const cumplimientoColumns: DataTableColumn<Cumplimiento>[] = useMemo(() => [
    { key: 'autoevaluacion', label: 'Autoevaluación', accessor: r => r.autoevaluacion?.numero_autoevaluacion ?? '', render: r => <span className="font-medium text-gray-900 dark:text-white">{r.autoevaluacion?.numero_autoevaluacion || '—'}</span> },
    { key: 'servicio', label: 'Servicio', accessor: r => r.servicio_sede?.nombre_servicio ?? '', render: r => <span>{r.servicio_sede?.nombre_servicio || '—'}</span> },
    { key: 'criterio', label: 'Criterio', accessor: r => r.criterio?.nombre ?? '', render: r => <span>{r.criterio?.nombre || '—'}</span> },
    { key: 'cumple', label: 'Estado', accessor: r => r.cumple, render: r => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(r.cumple)}`}>{getEstadoLabel(r.cumple)}</span>
    )},
    { key: 'hallazgo', label: 'Hallazgo', accessor: r => r.hallazgo ?? '', render: r => <span className="max-w-[140px] truncate block">{r.hallazgo || '—'}</span> },
    { key: 'responsable', label: 'Responsable', accessor: r => (r.responsable_mejora as any)?.username ?? '', render: r => <span>{(r.responsable_mejora as any)?.username || '—'}</span> },
    { key: 'compromiso', label: 'Compromiso', accessor: r => r.fecha_compromiso ?? '', render: r => <span className="text-gray-500">{formatDate(r.fecha_compromiso)}</span> },
  ], []);

  if (loading && cumplimientos.length === 0) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Habilitación', path: '/habilitacion/' },
        { label: 'Cumplimientos' },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Panel de Cumplimiento</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestión y seguimiento de cumplimientos normativos</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowFormModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <HiOutlinePlus className="h-4 w-4" /> Nuevo Cumplimiento
        </button>
      </div>

      {/* KPI + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPIs */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Cumple" value={stats.cumple} total={stats.total} color="green" icon={<HiOutlineCheckCircle className="h-6 w-6" />} />
          <StatCard label="No Cumple" value={stats.noCumple} total={stats.total} color="red" icon={<HiOutlineXCircle className="h-6 w-6" />} />
          <StatCard label="Parcial" value={stats.parcial} total={stats.total} color="yellow" icon={<HiOutlineExclamationTriangle className="h-6 w-6" />} />
          <StatCard label="% Cumplimiento" value={stats.pctCumple} isPercent color="blue" icon={<HiOutlineChartBarSquare className="h-6 w-6" />} />
        </div>

        {/* Pie */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Distribución</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={4}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={30} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicio, criterio, hallazgo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_CUMPLIMIENTO.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          <select
            value={filtroAutoeval}
            onChange={e => setFiltroAutoeval(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todas las autoevaluaciones</option>
            {autoevaluaciones.map(a => (
              <option key={a.id} value={a.id}>{a.numero_autoevaluacion}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">{error}</div>
      )}

      {/* Table */}
      <DataTable<Cumplimiento>
        data={filtered}
        columns={cumplimientoColumns}
        keyExtractor={r => r.id}
        renderActions={c => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => { setEditing(c); setShowFormModal(true); }}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              <HiOutlinePencilSquare className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteTarget(c)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors"
              title="Eliminar"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          </div>
        )}
        emptyState={
          <div className="text-center py-16">
            <HiOutlineCheckCircle className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron cumplimientos</p>
          </div>
        }
      />

      {/* Modals */}
      {showFormModal && (
        <CumplimientoFormModal
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setEditing(null); }}
          onSuccess={() => { setShowFormModal(false); setEditing(null); fetchCumplimientos(); }}
          cumplimiento={editing || undefined}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Cumplimiento"
        message="¿Está seguro de que desea eliminar este registro de cumplimiento? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

/* ─── aux components ─── */
interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  isPercent?: boolean;
  color: 'green' | 'red' | 'yellow' | 'blue';
  icon: React.ReactNode;
}

const statColors: Record<string, string> = {
  green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
  red: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
  yellow: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
  blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, total, isPercent, color, icon }) => (
  <div className={`rounded-xl border p-4 ${statColors[color]}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="opacity-40">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      {value}{isPercent ? '%' : ''}
    </p>
    {total !== undefined && !isPercent && (
      <p className="text-xs text-gray-500 mt-1">de {total} total</p>
    )}
  </div>
);

export default CumplimientoPanelPage;
