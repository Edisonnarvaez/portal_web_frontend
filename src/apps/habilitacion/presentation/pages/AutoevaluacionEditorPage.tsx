import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePencilSquare,
  HiOutlineDocumentCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlinePlus,
  HiOutlineChartBarSquare,
  HiOutlineFunnel,
  HiOutlineListBullet,
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
} from '../components';
import {
  ESTADOS_CUMPLIMIENTO,
  CATEGORIAS_CRITERIO,
} from '../../domain/types';
import { getEstadoLabel, getEstadoColor, formatDate } from '../utils/formatters';
import { LoadingScreen } from '../../../../shared/components/LoadingScreen';

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

  const { autoevaluaciones, loading: la, fetchAutoevaluaciones, getResumen } = useAutoevaluacion();
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
    const parcial = cumplimientosAuto.filter(c => c.cumple === 'PARCIAL').length;
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
      {/* ── Back ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <HiOutlineArrowLeft className="h-4 w-4" /> Volver
      </button>

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
        <button
          onClick={() => setShowEditAutoModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <HiOutlinePencilSquare className="h-4 w-4" /> Editar
        </button>
      </div>

      {/* ── Progress ── */}
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

      {/* ── Tabs ── */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <HiOutlineFunnel className="h-4 w-4 text-gray-400" />
              <select
                value={filtroCumplimiento}
                onChange={e => setFiltroCumplimiento(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos</option>
                {ESTADOS_CUMPLIMIENTO.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
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
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Servicio</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Criterio</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Hallazgo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Compromiso</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {cumplimientosFiltrados.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{c.servicio_sede?.nombre_servicio || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.criterio?.nombre || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(c.cumple)}`}>
                          {getEstadoLabel(c.cumple)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[160px] truncate">{c.hallazgo || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(c.fecha_compromiso)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditingCumplimiento(c); setShowCumplimientoModal(true); }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4" />
                        </button>
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
                            className={`h-full rounded-full transition-all ${
                              p.porcentaje_avance >= 100 ? 'bg-green-500' : p.porcentaje_avance >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
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
