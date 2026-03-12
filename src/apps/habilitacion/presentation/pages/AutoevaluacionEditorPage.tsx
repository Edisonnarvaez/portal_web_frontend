import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HiOutlinePencilSquare,
    HiOutlineDocumentCheck,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineExclamationTriangle,
    HiOutlinePlus,
    HiOutlineChartBarSquare,
    HiOutlineFunnel,
    HiOutlineListBullet,
    HiOutlineDocumentDuplicate,
    HiOutlineShieldCheck,
} from 'react-icons/hi2';
import {
    useAutoevaluacion,
    useCumplimiento,
    useCriterio,
    useHallazgo,
    usePlanMejora,
} from '../hooks';
import type { CriterioEvaluacion } from '../../domain/entities/Criterio';
import {
    CumplimientoFormModal,
    HallazgoFormModal,
    PlanMejoraFormModal,
    AutoevaluacionFormModal,
    DuplicarAutoevaluacionModal,
    ValidarAutoevaluacionModal,
    MejorasVencidasPanel,
    ResumenPanel,
    Breadcrumbs,
} from '../components';
import {
    ESTADOS_CUMPLIMIENTO,
    CATEGORIAS_CRITERIO,
} from '../../domain/types';
import { getEstadoLabel, getEstadoColor, formatDate } from '../utils/formatters';
import LoadingScreen from '../../../../shared/components/LoadingScreen';

type EditorTab = 'criterios' | 'cumplimientos' | 'hallazgos' | 'planes';

const AutoevaluacionEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const autoId = Number(id);

    const [activeTab, setActiveTab] = useState<EditorTab>('criterios');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroCumplimiento, setFiltroCumplimiento] = useState('');
    const [showEditAutoModal, setShowEditAutoModal] = useState(false);
    const [showCumplimientoModal, setShowCumplimientoModal] = useState(false);
    const [showHallazgoModal, setShowHallazgoModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingCumplimiento, setEditingCumplimiento] = useState<any>(null);
    const [editingHallazgo, setEditingHallazgo] = useState<any>(null);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [showDuplicarModal, setShowDuplicarModal] = useState(false);
    const [showValidarModal, setShowValidarModal] = useState(false);

    const { autoevaluaciones, loading: la, fetchAutoevaluaciones, validar, duplicar } = useAutoevaluacion();
    const { criterios, evaluaciones, loading: lcr, fetchCriterios, fetchEvaluaciones } = useCriterio();
    const { cumplimientos, loading: lc, fetchCumplimientos } = useCumplimiento();
    const { hallazgos, loading: lh, fetchHallazgos } = useHallazgo();
    const { planes, loading: lp, fetchPlanes } = usePlanMejora();

    const autoevaluacion = useMemo(() => autoevaluaciones.find(a => a.id === autoId), [autoevaluaciones, autoId]);

    useEffect(() => {
        fetchAutoevaluaciones();
        fetchCriterios();
        fetchEvaluaciones(autoId);
        fetchCumplimientos({ autoevaluacion_id: autoId });
        fetchHallazgos({ autoevaluacion_id: autoId });
        fetchPlanes({ autoevaluacion_id: autoId });
    }, [autoId]);

    const loading = la || lcr || lc || lh || lp;

    /* ─── computed ─── */
    const cumplimientosAuto = useMemo(
        () => cumplimientos.filter(c => c.autoevaluacion?.id === autoId),
        [cumplimientos, autoId],
    );

    const hallazgosAuto = useMemo(
        () => hallazgos.filter(h => h.autoevaluacion_id === autoId),
        [hallazgos, autoId],
    );

    const planesAuto = useMemo(
        () => planes.filter(p => p.autoevaluacion_id === autoId),
        [planes, autoId],
    );

    const criteriosFiltrados = useMemo(() => {
        let list = criterios;
        if (filtroCategoria) list = list.filter(c => c.categoria === filtroCategoria);
        return list;
    }, [criterios, filtroCategoria]);

    const cumplimientosFiltrados = useMemo(() => {
        let list = cumplimientosAuto;
        if (filtroCumplimiento) list = list.filter(c => c.cumple === filtroCumplimiento);
        return list;
    }, [cumplimientosAuto, filtroCumplimiento]);

    /* progress */
    const progress = useMemo(() => {
        const total = cumplimientosAuto.length;
        if (total === 0) return { total: 0, cumple: 0, noCumple: 0, parcial: 0, noAplica: 0, pct: 0 };
        const cumple = cumplimientosAuto.filter(c => c.cumple === 'CUMPLE').length;
        const noCumple = cumplimientosAuto.filter(c => c.cumple === 'NO_CUMPLE').length;
        const parcial = cumplimientosAuto.filter(c => c.cumple === 'PARCIALMENTE').length;
        const noAplica = cumplimientosAuto.filter(c => c.cumple === 'NO_APLICA').length;
        const aplicables = total - noAplica;
        const pct = aplicables > 0 ? Math.round((cumple / aplicables) * 100) : 0;
        return { total, cumple, noCumple, parcial, noAplica, pct };
    }, [cumplimientosAuto]);

    const getEvaluacionForCriterio = (criterioId: number): CriterioEvaluacion | undefined =>
        evaluaciones.find(e => e.criterio_id === criterioId);

    const tabs: { key: EditorTab; label: string; count: number }[] = [
        { key: 'criterios', label: 'Criterios', count: criterios.length },
        { key: 'cumplimientos', label: 'Cumplimientos', count: cumplimientosAuto.length },
        { key: 'hallazgos', label: 'Hallazgos', count: hallazgosAuto.length },
        { key: 'planes', label: 'Planes Mejora', count: planesAuto.length },
    ];

    if (loading && !autoevaluacion) return <LoadingScreen />;
    if (!autoevaluacion) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-gray-600 dark:text-gray-400">Autoevaluación no encontrada</p>
                    <button onClick={() => navigate('/habilitacion/')} className="mt-4 text-blue-600 underline text-sm">
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* ── Breadcrumbs ── */}
            <Breadcrumbs items={[
                { label: 'Habilitación', path: '/habilitacion/' },
                ...(autoevaluacion.datos_prestador
                    ? [{ label: autoevaluacion.datos_prestador.codigo_reps, path: `/habilitacion/prestador/${autoevaluacion.datos_prestador.id}` }]
                    : []),
                { label: autoevaluacion.numero_autoevaluacion },
            ]} />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <HiOutlineDocumentCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {autoevaluacion.numero_autoevaluacion}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Período {autoevaluacion.periodo} · v{autoevaluacion.version} ·{' '}
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getEstadoColor(autoevaluacion.estado)}`}>
                                {getEstadoLabel(autoevaluacion.estado)}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {autoevaluacion.estado !== 'VALIDADA' && (
                        <button
                            onClick={() => setShowValidarModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                            <HiOutlineShieldCheck className="h-4 w-4" /> Validar
                        </button>
                    )}
                    <button
                        onClick={() => setShowDuplicarModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                    >
                        <HiOutlineDocumentDuplicate className="h-4 w-4" /> Duplicar
                    </button>
                    <button
                        onClick={() => setShowEditAutoModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        <HiOutlinePencilSquare className="h-4 w-4" /> Editar
                    </button>
                </div>
            </div>

            {/* ── Progress ── */}
            {/* ── Resumen Panel ── */}
            {cumplimientosAuto.length > 0 && (
                <ResumenPanel 
                    cumplimientos={cumplimientosAuto}
                    hallazgos={hallazgosAuto}
                    planes={planesAuto}
                    compact={false}
                />
            )}

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <HiOutlineChartBarSquare className="h-5 w-5 text-indigo-500" />
                        Progreso de Cumplimiento
                    </h3>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress.pct}%</span>
                </div>

                {/* progress bar */}
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                    {progress.total > 0 && (
                        <>
                            <div className="h-full bg-green-500 transition-all" style={{ width: `${(progress.cumple / progress.total) * 100}%` }} />
                            <div className="h-full bg-yellow-400 transition-all" style={{ width: `${(progress.parcial / progress.total) * 100}%` }} />
                            <div className="h-full bg-red-500 transition-all" style={{ width: `${(progress.noCumple / progress.total) * 100}%` }} />
                            <div className="h-full bg-gray-400 transition-all" style={{ width: `${(progress.noAplica / progress.total) * 100}%` }} />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <StatBadge label="Cumple" value={progress.cumple} color="green" />
                    <StatBadge label="Parcial" value={progress.parcial} color="yellow" />
                    <StatBadge label="No Cumple" value={progress.noCumple} color="red" />
                    <StatBadge label="No Aplica" value={progress.noAplica} color="gray" />
                </div>
            </div>

            {/* ── Mejoras Vencidas Alert ── */}
            <MejorasVencidasPanel compact autoevaluacionId={autoId} />

            {/* ── Tabs ── */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === t.key
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        {t.label}
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Criterios tab ── */}
            {activeTab === 'criterios' && (
                <div className="space-y-4">
                    {/* filter */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <HiOutlineFunnel className="h-4 w-4 text-gray-400" />
                        <select
                            value={filtroCategoria}
                            onChange={e => setFiltroCategoria(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Todas las categorías</option>
                            {CATEGORIAS_CRITERIO.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    {criteriosFiltrados.length === 0 ? (
                        <EmptyState message="No hay criterios disponibles" />
                    ) : (
                        <div className="space-y-3">
                            {criteriosFiltrados.map(cr => {
                                const ev = getEvaluacionForCriterio(cr.id);
                                return (
                                    <div key={cr.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow transition-shadow">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <StatusIcon estado={ev?.estado_cumplimiento} />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{cr.numero_criterio}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{cr.descripcion}</p>
                                                    {cr.categoria && (
                                                        <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                                            {getEstadoLabel(cr.categoria)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {ev ? (
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(ev.estado_cumplimiento)}`}>
                                                        {getEstadoLabel(ev.estado_cumplimiento)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Sin evaluar</span>
                                                )}
                                            </div>
                                        </div>
                                        {ev?.observaciones && (
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-8">{ev.observaciones}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Cumplimientos tab ── */}
            {activeTab === 'cumplimientos' && (
                <div className="space-y-4">
                    {/* Filtros visuales */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <HiOutlineFunnel className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFiltroCumplimiento('')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                        filtroCumplimiento === ''
                                            ? 'bg-gray-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Todos ({cumplimientosAuto.length})
                                </button>
                                {ESTADOS_CUMPLIMIENTO.map(e => {
                                    const count = cumplimientosAuto.filter(c => c.cumple === e.value).length;
                                    const isActive = filtroCumplimiento === e.value;
                                    return (
                                        <button
                                            key={e.value}
                                            onClick={() => setFiltroCumplimiento(e.value)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                                isActive
                                                    ? `${e.color || 'bg-blue-100'} text-blue-700 dark:text-blue-300 border-2 border-blue-500`
                                                    : `${e.color || 'bg-gray-100 dark:bg-gray-700'} text-gray-700 dark:text-gray-300 hover:opacity-80`
                                            }`}
                                        >
                                            {e.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Botón para crear nuevo */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setEditingCumplimiento(null); setShowCumplimientoModal(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            <HiOutlinePlus className="h-4 w-4" /> Nuevo
                        </button>
                    </div>

                    {cumplimientosFiltrados.length === 0 ? (
                        <EmptyState message="No hay cumplimientos" />
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Servicio</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Criterio</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Cumplimiento</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Hallazgo / Observación</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Fecha Compromiso</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {cumplimientosFiltrados.map((c, idx) => (
                                        <tr 
                                            key={c.id} 
                                            className={`transition-colors ${
                                                idx % 2 === 0 
                                                    ? 'bg-white dark:bg-gray-950'
                                                    : 'bg-gray-50 dark:bg-gray-900'
                                            } hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {c.servicio_sede?.nombre_servicio || '—'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-700 dark:text-gray-300">
                                                    {c.criterio?.nombre || '—'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${getEstadoColor(c.cumple)}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {getEstadoLabel(c.cumple)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-sm">
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {c.hallazgo || '—'}
                                                    </p>
                                                    {c.plan_mejora && (
                                                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                            📋 Plan de mejora iniciado
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {formatDate(c.fecha_compromiso || '')}
                                                </div>
                                                {c.fecha_compromiso && new Date(c.fecha_compromiso) < new Date() && (
                                                    <div className="text-xs text-red-600 dark:text-red-400 font-semibold">
                                                        ⚠️ Vencido
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => { setEditingCumplimiento(c); setShowCumplimientoModal(true); }}
                                                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <HiOutlinePencilSquare className="h-4 w-4" />
                                                    </button>
                                                    {/* TODO: Agregar botón de eliminar si es necesario */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Hallazgos tab ── */}
            {activeTab === 'hallazgos' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setEditingHallazgo(null); setShowHallazgoModal(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        >
                            <HiOutlinePlus className="h-4 w-4" /> Nuevo Hallazgo
                        </button>
                    </div>

                    {hallazgosAuto.length === 0 ? (
                        <EmptyState message="No hay hallazgos" />
                    ) : (
                        <div className="space-y-3">
                            {hallazgosAuto.map(h => (
                                <div
                                    key={h.id}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow transition-shadow cursor-pointer"
                                    onClick={() => { setEditingHallazgo(h); setShowHallazgoModal(true); }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{h.numero_hallazgo}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{h.descripcion}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Planes tab ── */}
            {activeTab === 'planes' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                        >
                            <HiOutlinePlus className="h-4 w-4" /> Nuevo Plan
                        </button>
                    </div>

                    {planesAuto.length === 0 ? (
                        <EmptyState message="No hay planes de mejora" />
                    ) : (
                        <div className="space-y-3">
                            {planesAuto.map(p => (
                                <div
                                    key={p.id}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow transition-shadow cursor-pointer"
                                    onClick={() => { setEditingPlan(p); setShowPlanModal(true); }}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.numero_plan}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{p.descripcion}</p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="w-24">
                                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${p.porcentaje_avance >= 100 ? 'bg-green-500' : p.porcentaje_avance >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${Math.min(p.porcentaje_avance, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 text-center mt-1">{p.porcentaje_avance}%</p>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(p.estado)}`}>
                                                {getEstadoLabel(p.estado)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                                        <span>Inicio: {formatDate(p.fecha_inicio)}</span>
                                        <span>Vence: {formatDate(p.fecha_vencimiento)}</span>
                                        {p.responsable && <span>Resp: {p.responsable}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {showEditAutoModal && (
                <AutoevaluacionFormModal
                    isOpen={showEditAutoModal}
                    onClose={() => setShowEditAutoModal(false)}
                    onSuccess={() => { setShowEditAutoModal(false); fetchAutoevaluaciones(); }}
                    autoevaluacion={autoevaluacion}
                />
            )}

            {showCumplimientoModal && (
                <CumplimientoFormModal
                    isOpen={showCumplimientoModal}
                    onClose={() => { setShowCumplimientoModal(false); setEditingCumplimiento(null); }}
                    onSuccess={() => { setShowCumplimientoModal(false); setEditingCumplimiento(null); fetchCumplimientos({ autoevaluacion_id: autoId }); }}
                    cumplimiento={editingCumplimiento || undefined}
                />
            )}

            {showHallazgoModal && (
                <HallazgoFormModal
                    isOpen={showHallazgoModal}
                    onClose={() => { setShowHallazgoModal(false); setEditingHallazgo(null); }}
                    onSuccess={() => { setShowHallazgoModal(false); setEditingHallazgo(null); fetchHallazgos({ autoevaluacion_id: autoId }); }}
                    hallazgo={editingHallazgo || undefined}
                />
            )}

            {showPlanModal && (
                <PlanMejoraFormModal
                    isOpen={showPlanModal}
                    onClose={() => { setShowPlanModal(false); setEditingPlan(null); }}
                    onSuccess={() => { setShowPlanModal(false); setEditingPlan(null); fetchPlanes({ autoevaluacion_id: autoId }); }}
                    planMejora={editingPlan || undefined}
                />
            )}

            {showDuplicarModal && autoevaluacion && (
                <DuplicarAutoevaluacionModal
                    isOpen={showDuplicarModal}
                    onClose={() => setShowDuplicarModal(false)}
                    autoevaluacion={autoevaluacion}
                    onDuplicar={duplicar}
                    onSuccess={(nueva) => {
                        setShowDuplicarModal(false);
                        fetchAutoevaluaciones();
                        navigate(`/habilitacion/autoevaluacion/${nueva.id}`);
                    }}
                />
            )}

            {showValidarModal && autoevaluacion && (
                <ValidarAutoevaluacionModal
                    isOpen={showValidarModal}
                    onClose={() => setShowValidarModal(false)}
                    autoevaluacion={autoevaluacion}
                    cumplimientos={cumplimientosAuto}
                    onValidar={validar}
                    onSuccess={() => {
                        setShowValidarModal(false);
                        fetchAutoevaluaciones();
                    }}
                />
            )}
        </div>
    );
};

/* ─── helpers ─── */
const StatusIcon: React.FC<{ estado?: string }> = ({ estado }) => {
    if (!estado) return <HiOutlineListBullet className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />;
    switch (estado) {
        case 'CUMPLE': return <HiOutlineCheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />;
        case 'NO_CUMPLE': return <HiOutlineXCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />;
        case 'PARCIAL': return <HiOutlineExclamationTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />;
        default: return <HiOutlineListBullet className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />;
    }
};

const StatBadge: React.FC<{ label: string; value: number; color: 'green' | 'yellow' | 'red' | 'gray' }> = ({ label, value, color }) => {
    const cls: Record<string, string> = {
        green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
    };
    return (
        <div className={`rounded-lg p-3 text-center ${cls[color]}`}>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs">{label}</p>
        </div>
    );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-12">
        <HiOutlineDocumentCheck className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
);

export default AutoevaluacionEditorPage;
