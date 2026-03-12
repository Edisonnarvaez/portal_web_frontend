import React, { useMemo } from 'react';
import {
  HiOutlineChartPie,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentDuplicate,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';
import type { Hallazgo } from '../../domain/entities/Hallazgo';
import type { PlanMejora } from '../../domain/entities/PlanMejora';

interface ResumenPanelProps {
  cumplimientos: Cumplimiento[];
  hallazgos?: Hallazgo[];
  planes?: PlanMejora[];
  compact?: boolean;
}

/**
 * ResumenPanel - Componente que muestra un resumen visual del cumplimiento
 * Incluye pie chart, estadísticas y estado de planes de mejora
 */
export const ResumenPanel: React.FC<ResumenPanelProps> = ({
  cumplimientos,
  hallazgos = [],
  planes = [],
  compact = false,
}) => {
  const stats = useMemo(() => {
    const total = cumplimientos.length;
    const cumple = cumplimientos.filter(c => c.cumple === 'CUMPLE').length;
    const noCumple = cumplimientos.filter(c => c.cumple === 'NO_CUMPLE').length;
    const parcial = cumplimientos.filter(c => c.cumple === 'PARCIALMENTE').length;
    const noAplica = cumplimientos.filter(c => c.cumple === 'NO_APLICA').length;
    const aplicables = total - noAplica;
    const pctCumple = aplicables > 0 ? Math.round((cumple / aplicables) * 100) : 0;

    const hallazgosAbiertos = hallazgos.filter(h => h.estado !== 'CERRADO').length;
    const planesVigentes = planes.filter(p => p.estado !== 'COMPLETADO').length;
    const planesPendientes = planes.filter(p => p.estado === 'PENDIENTE').length;

    return {
      total,
      cumple,
      noCumple,
      parcial,
      noAplica,
      aplicables,
      pctCumple,
      hallazgosAbiertos,
      hallazgos: hallazgos.length,
      planesVigentes,
      planesPendientes,
      planes: planes.length,
    };
  }, [cumplimientos, hallazgos, planes]);

  // Colores para el pie chart
  const colors = {
    cumple: 'rgb(34, 197, 94)',      // green-500
    noCumple: 'rgb(239, 68, 68)',    // red-500
    parcial: 'rgb(250, 204, 21)',    // yellow-400
    noAplica: 'rgb(156, 163, 175)',  // gray-400
  };

  // Calculador de tamaño del segmento del pie
  const getSegmentStyle = (value: number, total: number) => {
    return (value / total) * 100;
  };

  const cumplePct = getSegmentStyle(stats.cumple, stats.total);
  const noCumplePct = getSegmentStyle(stats.noCumple, stats.total);
  const parcialPct = getSegmentStyle(stats.parcial, stats.total);
  const noAplicaPct = getSegmentStyle(stats.noAplica, stats.total);

  if (compact) {
    // Vista compacta para integrar en tablas o dashboards
    return (
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Cumplimiento General</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.pctCumple}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {stats.total > 0 && (
              <>
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${cumplePct}%` }}
                />
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${parcialPct}%` }}
                />
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${noCumplePct}%` }}
                />
                <div
                  className="h-full bg-gray-400"
                  style={{ width: `${noAplicaPct}%` }}
                />
              </>
            )}
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/20">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.cumple}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Cumple</p>
          </div>
          <div className="text-center p-2 rounded bg-red-50 dark:bg-red-900/20">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.noCumple}</p>
            <p className="text-xs text-red-600 dark:text-red-400">No Cumple</p>
          </div>
        </div>
      </div>
    );
  }

  // Vista completa
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <HiOutlineChartPie className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Evaluación</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Análisis general del cumplimiento</p>
        </div>
      </div>

      {/* Main stat - Cumplimiento % */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Pie Chart */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {/* Segmentos del pie */}
            {stats.cumple > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={colors.cumple}
                strokeWidth="12"
                strokeDasharray={`${(stats.cumple / stats.total) * 282.6} 282.6`}
              />
            )}
            {stats.parcial > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={colors.parcial}
                strokeWidth="12"
                strokeDasharray={`${(stats.parcial / stats.total) * 282.6} 282.6`}
                strokeDashoffset={-((stats.cumple / stats.total) * 282.6)}
              />
            )}
            {stats.noCumple > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={colors.noCumple}
                strokeWidth="12"
                strokeDasharray={`${(stats.noCumple / stats.total) * 282.6} 282.6`}
                strokeDashoffset={-((stats.cumple + stats.parcial) / stats.total) * 282.6}
              />
            )}
            {stats.noAplica > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={colors.noAplica}
                strokeWidth="12"
                strokeDasharray={`${(stats.noAplica / stats.total) * 282.6} 282.6`}
                strokeDashoffset={-((stats.cumple + stats.parcial + stats.noCumple) / stats.total) * 282.6}
              />
            )}
          </svg>
          {/* Centro del pie */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pctCumple}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cumple</p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Cumple</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stats.cumple} de {stats.aplicables} aplicables</p>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.cumple}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Parcialmente</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cumplimiento parcial</p>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.parcial}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">No Cumple</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Falta de cumplimiento</p>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.noCumple}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">No Aplica</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">No es aplicable</p>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.noAplica}</span>
          </div>
        </div>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Criterios totales */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Criterios Evaluados</span>
            <HiOutlineClipboardDocumentList className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aplicables}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            de {stats.total} evaluaciones
          </p>
        </div>

        {/* Hallazgos */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Hallazgos</span>
            <HiOutlineExclamationTriangle className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hallazgosAbiertos}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            abiertos de {stats.hallazgos}
          </p>
        </div>

        {/* Planes de mejora */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Planes Mejora</span>
            <HiOutlineDocumentDuplicate className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.planesVigentes}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            vigentes de {stats.planes} planes
          </p>
        </div>
      </div>

      {/* Progress bar general */}
      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cumplimiento General</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.pctCumple}%</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          {stats.total > 0 && (
            <>
              <div
                className={`h-full transition-all ${stats.pctCumple >= 80 ? 'bg-green-500' : stats.pctCumple >= 60 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min(stats.pctCumple, 100)}%` }}
              />
            </>
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Alerta si hay muchos hallazgos o planes pendientes */}
      {(stats.hallazgosAbiertos > 5 || stats.planesPendientes > 3) && (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <HiOutlineExclamationTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Atención requerida</p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 space-y-0.5">
                {stats.hallazgosAbiertos > 5 && (
                  <li>• {stats.hallazgosAbiertos} hallazgos abiertos pendientes de clausura</li>
                )}
                {stats.planesPendientes > 3 && (
                  <li>• {stats.planesPendientes} planes de mejora pendientes de iniciar</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenPanel;
