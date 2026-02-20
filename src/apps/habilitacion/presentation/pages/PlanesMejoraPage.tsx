import React, { useEffect, useState, useMemo } from 'react';
import {
    HiOutlineClipboardDocumentList,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
} from 'react-icons/hi2';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { usePlanMejora } from '../hooks';
import { PlanMejoraFormModal, Breadcrumbs } from '../components';
import { ESTADOS_PLAN_MEJORA } from '../../domain/types';
import { getEstadoLabel, getEstadoColor, formatDate } from '../utils/formatters';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import type { PlanMejora } from '../../domain/entities/PlanMejora';

const STATUS_COLORS: Record<string, string> = {
    PENDIENTE: '#f59e0b',
    EN_CURSO: '#3b82f6',
    COMPLETADO: '#10b981',
    VENCIDO: '#ef4444',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    PENDIENTE: <HiOutlineClock className="h-5 w-5 text-yellow-500" />,
    EN_CURSO: <HiOutlineArrowPath className="h-5 w-5 text-blue-500" />,
    COMPLETADO: <HiOutlineCheckCircle className="h-5 w-5 text-green-500" />,
    VENCIDO: <HiOutlineExclamationTriangle className="h-5 w-5 text-red-500" />,
};

const PlanesMejoraPage: React.FC = () => {
    const {
        planes, loading, error,
        fetchPlanes, deletePlan,
    } = usePlanMejora();

    const [filtroEstado, setFiltroEstado] = useState('');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [showFormModal, setShowFormModal] = useState(false);
    const [editing, setEditing] = useState<PlanMejora | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PlanMejora | null>(null);

    useEffect(() => {
        fetchPlanes();
    }, []);

    /* ─── derived ─── */
    const filtered = useMemo(() => {
        return planes.filter(p => {
            const matchEstado = !filtroEstado || p.estado === filtroEstado;
            const matchSearch = !search ||
                p.numero_plan?.toLowerCase().includes(search.toLowerCase()) ||
                p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
                p.responsable_nombre?.toLowerCase().includes(search.toLowerCase());
            return matchEstado && matchSearch;
        });
    }, [planes, filtroEstado, search]);

    const stats = useMemo(() => {
        const total = planes.length;
        const pendiente = planes.filter(p => p.estado === 'PENDIENTE').length;
        const enCurso = planes.filter(p => p.estado === 'EN_CURSO').length;
        const completado = planes.filter(p => p.estado === 'COMPLETADO').length;
        const vencido = planes.filter(p => p.estado === 'VENCIDO').length;
        const avgAvance = total > 0 ? Math.round(planes.reduce((s, p) => s + p.porcentaje_avance, 0) / total) : 0;
        return { total, pendiente, enCurso, completado, vencido, avgAvance };
    }, [planes]);

    const chartData = useMemo(() =>
        ESTADOS_PLAN_MEJORA.map(e => ({
            name: e.label,
            value: planes.filter(p => p.estado === e.value).length,
            fill: STATUS_COLORS[e.value] || '#6b7280',
        })),
        [planes]);

    /* ─── helpers ─── */
    const diasRestantes = (fecha: string) => {
        const diff = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86_400_000);
        return diff;
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deletePlan(deleteTarget.id);
            setDeleteTarget(null);
        } catch { /* handled by hook */ }
    };

    if (loading && planes.length === 0) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumbs items={[
                { label: 'Habilitación', path: '/habilitacion/' },
                { label: 'Planes de Mejora' },
            ]} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Planes de Mejora</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Seguimiento y gestión de planes de mejora continua</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setShowFormModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    <HiOutlinePlus className="h-4 w-4" /> Nuevo Plan
                </button>
            </div>

            {/* KPI row + chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KPIs */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <KpiCard label="Total" value={stats.total} color="gray" />
                    <KpiCard label="Pendientes" value={stats.pendiente} color="yellow" />
                    <KpiCard label="En Curso" value={stats.enCurso} color="blue" />
                    <KpiCard label="Completados" value={stats.completado} color="green" />
                    <KpiCard label="Vencidos" value={stats.vencido} color="red" />
                </div>

                {/* Average progress */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col items-center justify-center">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Avance Promedio</p>
                    <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                className="text-gray-200 dark:text-gray-700"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={stats.avgAvance >= 75 ? '#10b981' : stats.avgAvance >= 50 ? '#3b82f6' : '#f59e0b'}
                                strokeWidth="3"
                                strokeDasharray={`${stats.avgAvance}, 100`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
                            {stats.avgAvance}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Distribución por Estado</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="relative flex-1 w-full">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por número, descripción o responsable..."
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
                        {ESTADOS_PLAN_MEJORA.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                    </select>
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 py-2 text-xs font-medium ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            Tarjetas
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-2 text-xs font-medium ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            Tabla
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">{error}</div>
            )}

            {/* Content */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <HiOutlineClipboardDocumentList className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron planes de mejora</p>
                </div>
            ) : viewMode === 'cards' ? (
                /* ─── Cards view ─── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(plan => {
                        const days = diasRestantes(plan.fecha_vencimiento);
                        const isUrgent = days >= 0 && days <= 15 && plan.estado !== 'COMPLETADO';
                        return (
                            <div
                                key={plan.id}
                                className={`rounded-xl border bg-white dark:bg-gray-800 p-5 transition-shadow hover:shadow-md ${isUrgent ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {STATUS_ICONS[plan.estado]}
                                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{plan.numero_plan}</span>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(plan.estado)}`}>
                                        {getEstadoLabel(plan.estado)}
                                    </span>
                                </div>

                                {/* Body */}
                                <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2 mb-3">{plan.descripcion}</p>

                                {/* Progress */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>Avance</span>
                                        <span className="font-medium">{plan.porcentaje_avance}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${plan.porcentaje_avance >= 75 ? 'bg-green-500' :
                                                    plan.porcentaje_avance >= 50 ? 'bg-blue-500' :
                                                        plan.porcentaje_avance >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${plan.porcentaje_avance}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    <div>
                                        <span className="block text-gray-400 dark:text-gray-500">Responsable</span>
                                        <span className="text-gray-700 dark:text-gray-300">{plan.responsable_nombre || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 dark:text-gray-500">Vencimiento</span>
                                        <span className={`${isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {formatDate(plan.fecha_vencimiento)}
                                            {days >= 0 && plan.estado !== 'COMPLETADO' && (
                                                <span className="ml-1">({days}d)</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-1 border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <button
                                        onClick={() => { setEditing(plan); setShowFormModal(true); }}
                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                                        title="Editar"
                                    >
                                        <HiOutlinePencilSquare className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(plan)}
                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors"
                                        title="Eliminar"
                                    >
                                        <HiOutlineTrash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ─── Table view ─── */
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">N° Plan</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Descripción</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Estado</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Avance</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Responsable</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Inicio</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Vencimiento</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            {filtered.map(plan => {
                                const days = diasRestantes(plan.fecha_vencimiento);
                                const isUrgent = days >= 0 && days <= 15 && plan.estado !== 'COMPLETADO';
                                return (
                                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{plan.numero_plan}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{plan.descripcion}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(plan.estado)}`}>
                                                {getEstadoLabel(plan.estado)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${plan.porcentaje_avance >= 75 ? 'bg-green-500' :
                                                                plan.porcentaje_avance >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${plan.porcentaje_avance}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{plan.porcentaje_avance}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{plan.responsable_nombre || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{formatDate(plan.fecha_inicio)}</td>
                                        <td className={`px-4 py-3 ${isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500'}`}>
                                            {formatDate(plan.fecha_vencimiento)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => { setEditing(plan); setShowFormModal(true); }}
                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Editar"
                                                >
                                                    <HiOutlinePencilSquare className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(plan)}
                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <HiOutlineTrash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-xs text-gray-400 text-right">{filtered.length} de {planes.length} registros</p>

            {/* Modals */}
            {showFormModal && (
                <PlanMejoraFormModal
                    isOpen={showFormModal}
                    onClose={() => { setShowFormModal(false); setEditing(null); }}
                    onSuccess={() => { setShowFormModal(false); setEditing(null); fetchPlanes(); }}
                    planMejora={editing || undefined}
                />
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Eliminar Plan de Mejora"
                message={`¿Está seguro de que desea eliminar el plan "${deleteTarget?.numero_plan}"? Esta acción no se puede deshacer.`}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
};

/* ─── aux ─── */
interface KpiCardProps {
    label: string;
    value: number;
    color: 'gray' | 'yellow' | 'blue' | 'green' | 'red';
}

const kpiColors: Record<string, string> = {
    gray: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
    yellow: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
    red: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 ${kpiColors[color]}`}>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

export default PlanesMejoraPage;
