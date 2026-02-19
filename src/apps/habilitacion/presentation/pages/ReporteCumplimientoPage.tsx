// src/apps/habilitacion/presentation/pages/ReporteCumplimientoPage.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  HiArrowLeft,
  HiDocumentArrowDown,
  HiTableCells,
  HiChartBar as HiChartBarIcon,
  HiFunnel,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAutoevaluacion } from '../hooks/useAutoevaluacion';
import { useCumplimiento } from '../hooks/useCumplimiento';
import { usePlanMejora } from '../hooks/usePlanMejora';
import { useHallazgo } from '../hooks/useHallazgo';
import { getEstadoLabel } from '../utils/formatters';
import {
  exportCumplimientosExcel,
  exportCumplimientosPDF,
} from '../utils/exportUtils';
import type { Autoevaluacion, AutoevaluacionResumen } from '../../domain/entities';

// ─── Dark Mode Hook ─────────────────────────────────────────────
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
};

// ─── Chart Colors ───────────────────────────────────────────────
const CUMPLIMIENTO_COLORS: Record<string, string> = {
  CUMPLE: '#22c55e',
  NO_CUMPLE: '#ef4444',
  PARCIALMENTE: '#eab308',
  NO_APLICA: '#9ca3af',
};

const CATEGORIA_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#f59e0b',
  '#ec4899',
  '#10b981',
  '#f97316',
];

// ─── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  isDark,
}: {
  active?: boolean;
  payload?: any[];
  isDark: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`px-3 py-2 rounded-lg shadow-lg border text-sm ${
        isDark
          ? 'bg-gray-800 border-gray-700 text-gray-200'
          : 'bg-white border-gray-200 text-gray-800'
      }`}
    >
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color || entry.payload?.fill }}
          />
          <span className="font-medium">{entry.name}:</span>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Summary Card Component ─────────────────────────────────────
const SummaryCard = ({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
    </p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    {subtitle && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {subtitle}
      </p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
export default function ReporteCumplimientoPage() {
  const navigate = useNavigate();
  const isDark = useDarkMode();

  // Hooks
  const {
    autoevaluaciones,
    fetchAutoevaluaciones,
    getResumen,
    loading: loadingAE,
  } = useAutoevaluacion();
  const { cumplimientos, fetchCumplimientos, loading: loadingC } = useCumplimiento();
  const { planes, fetchPlanes } = usePlanMejora();
  const { hallazgos, fetchHallazgos } = useHallazgo();

  // State
  const [selectedAutoeval, setSelectedAutoeval] = useState<number | ''>('');
  const [resumen, setResumen] = useState<AutoevaluacionResumen | null>(null);
  const [loadingResumen, setLoadingResumen] = useState(false);

  // Load autoevaluaciones on mount
  useEffect(() => {
    fetchAutoevaluaciones();
  }, []);

  // Load data when autoevaluacion selected
  useEffect(() => {
    if (selectedAutoeval) {
      fetchCumplimientos({ autoevaluacion_id: selectedAutoeval });
      fetchPlanes({ autoevaluacion_id: selectedAutoeval });
      fetchHallazgos({ autoevaluacion_id: selectedAutoeval });
      setLoadingResumen(true);
      getResumen(selectedAutoeval)
        .then((r) => setResumen(r))
        .catch(() => setResumen(null))
        .finally(() => setLoadingResumen(false));
    } else {
      // Load all
      fetchCumplimientos();
      fetchPlanes();
      fetchHallazgos();
      setResumen(null);
    }
  }, [selectedAutoeval]);

  // ─── Computed Data ──────────────────────────────────────────
  const selectedAutoevaluacion = useMemo(
    () => autoevaluaciones.find((a) => a.id === selectedAutoeval) as Autoevaluacion | undefined,
    [autoevaluaciones, selectedAutoeval],
  );

  // Pie: Estado cumplimiento distribution
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    cumplimientos.forEach((c) => {
      counts[c.cumple] = (counts[c.cumple] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: getEstadoLabel(key),
      value,
      key,
    }));
  }, [cumplimientos]);

  // Bar: Cumplimiento by criterio category
  const barDataByCategoria = useMemo(() => {
    const categorias: Record<string, { cumple: number; no_cumple: number; parcial: number; no_aplica: number }> = {};

    cumplimientos.forEach((c) => {
      // Use criterio name as pseudo-category when no category field
      const cat = c.criterio?.nombre || 'Sin criterio';
      if (!categorias[cat]) {
        categorias[cat] = { cumple: 0, no_cumple: 0, parcial: 0, no_aplica: 0 };
      }
      switch (c.cumple) {
        case 'CUMPLE':
          categorias[cat].cumple++;
          break;
        case 'NO_CUMPLE':
          categorias[cat].no_cumple++;
          break;
        case 'PARCIALMENTE':
          categorias[cat].parcial++;
          break;
        case 'NO_APLICA':
          categorias[cat].no_aplica++;
          break;
      }
    });

    return Object.entries(categorias)
      .map(([name, vals]) => ({
        name: name.length > 25 ? name.substring(0, 22) + '...' : name,
        Cumple: vals.cumple,
        'No Cumple': vals.no_cumple,
        Parcial: vals.parcial,
        'No Aplica': vals.no_aplica,
      }))
      .slice(0, 12); // Limit for readability
  }, [cumplimientos]);

  // Bar: Hallazgos by type
  const hallazgosByType = useMemo(() => {
    const counts: Record<string, number> = {};
    hallazgos.forEach((h) => {
      counts[h.tipo] = (counts[h.tipo] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: getEstadoLabel(key),
      value,
      key,
    }));
  }, [hallazgos]);

  // Plan mejora by estado
  const planesByEstado = useMemo(() => {
    const counts: Record<string, number> = {};
    planes.forEach((p) => {
      counts[p.estado] = (counts[p.estado] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: getEstadoLabel(key),
      value,
      key,
    }));
  }, [planes]);

  const totalCumplimientos = cumplimientos.length;
  const pctCumple = totalCumplimientos > 0
    ? Math.round((cumplimientos.filter((c) => c.cumple === 'CUMPLE').length / totalCumplimientos) * 100)
    : 0;

  const isLoading = loadingAE || loadingC || loadingResumen;

  const chartAxisColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/habilitacion')}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <HiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reporte de Cumplimiento
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Análisis detallado del cumplimiento de estándares de habilitación
            </p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              exportCumplimientosExcel(cumplimientos, selectedAutoevaluacion)
            }
            disabled={cumplimientos.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800 dark:hover:bg-green-900/50 disabled:opacity-50 transition"
          >
            <HiTableCells className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() =>
              exportCumplimientosPDF(
                cumplimientos,
                selectedAutoevaluacion,
                resumen ?? undefined,
              )
            }
            disabled={cumplimientos.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
          >
            <HiDocumentArrowDown className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <HiFunnel className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Autoevaluación:
          </label>
          <select
            value={selectedAutoeval}
            onChange={(e) =>
              setSelectedAutoeval(e.target.value ? Number(e.target.value) : '')
            }
            className="flex-1 max-w-md px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las autoevaluaciones</option>
            {autoevaluaciones.map((a) => (
              <option key={a.id} value={a.id}>
                {a.numero_autoevaluacion} — Período {a.periodo} (
                {getEstadoLabel(a.estado)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="Cumplimientos Evaluados"
              value={totalCumplimientos}
              color="text-blue-600 dark:text-blue-400"
            />
            <SummaryCard
              label="% Cumplimiento"
              value={resumen ? `${resumen.porcentaje_cumplimiento}%` : `${pctCumple}%`}
              color={
                (resumen?.porcentaje_cumplimiento ?? pctCumple) >= 80
                  ? 'text-green-600 dark:text-green-400'
                  : (resumen?.porcentaje_cumplimiento ?? pctCumple) >= 50
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
              }
              subtitle={resumen ? `${resumen.cumplidos} de ${resumen.total_criterios} criterios` : undefined}
            />
            <SummaryCard
              label="Hallazgos Abiertos"
              value={hallazgos.filter((h) => h.estado === 'ABIERTO').length}
              color="text-orange-600 dark:text-orange-400"
              subtitle={`${hallazgos.length} total`}
            />
            <SummaryCard
              label="Planes Vencidos"
              value={planes.filter((p) => p.estado === 'VENCIDO').length}
              color="text-red-600 dark:text-red-400"
              subtitle={`${planes.length} total`}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie: Distribución de estados */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <HiChartBarIcon className="w-4 h-4 text-blue-500" />
                Distribución de Cumplimiento
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CUMPLIMIENTO_COLORS[entry.key] ||
                            CATEGORIA_COLORS[index % CATEGORIA_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip isDark={isDark} />}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value: string) => (
                        <span className="text-gray-600 dark:text-gray-300">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No hay datos de cumplimiento disponibles
                </div>
              )}
            </div>

            {/* Bar: Hallazgos por tipo */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <HiChartBarIcon className="w-4 h-4 text-purple-500" />
                Hallazgos por Tipo
              </h3>
              {hallazgosByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hallazgosByType}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: chartAxisColor, fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: chartAxisColor, fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<CustomTooltip isDark={isDark} />}
                    />
                    <Bar dataKey="value" name="Cantidad" radius={[6, 6, 0, 0]}>
                      {hallazgosByType.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORIA_COLORS[index % CATEGORIA_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No hay hallazgos registrados
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar: Cumplimiento por criterio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <HiChartBarIcon className="w-4 h-4 text-cyan-500" />
                Cumplimiento por Criterio
              </h3>
              {barDataByCategoria.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barDataByCategoria} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: chartAxisColor, fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fill: chartAxisColor, fontSize: 10 }}
                    />
                    <Tooltip
                      content={<CustomTooltip isDark={isDark} />}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      formatter={(value: string) => (
                        <span className="text-gray-600 dark:text-gray-300">
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="Cumple"
                      stackId="a"
                      fill="#22c55e"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="No Cumple"
                      stackId="a"
                      fill="#ef4444"
                    />
                    <Bar
                      dataKey="Parcial"
                      stackId="a"
                      fill="#eab308"
                    />
                    <Bar
                      dataKey="No Aplica"
                      stackId="a"
                      fill="#9ca3af"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No hay datos por criterio
                </div>
              )}
            </div>

            {/* Pie: Planes de mejora por estado */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <HiChartBarIcon className="w-4 h-4 text-amber-500" />
                Planes de Mejora por Estado
              </h3>
              {planesByEstado.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={planesByEstado}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {planesByEstado.map((entry, index) => {
                        const colorMap: Record<string, string> = {
                          PENDIENTE: '#eab308',
                          EN_CURSO: '#3b82f6',
                          COMPLETADO: '#22c55e',
                          VENCIDO: '#ef4444',
                        };
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              colorMap[entry.key] ||
                              CATEGORIA_COLORS[index % CATEGORIA_COLORS.length]
                            }
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip isDark={isDark} />}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value: string) => (
                        <span className="text-gray-600 dark:text-gray-300">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No hay planes de mejora
                </div>
              )}
            </div>
          </div>

          {/* Data table */}
          {cumplimientos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Detalle de Cumplimientos ({cumplimientos.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                        Servicio
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                        Criterio
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                        Responsable
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                        Hallazgo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {cumplimientos.slice(0, 50).map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {c.servicio_sede?.nombre_servicio || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {c.criterio?.nombre || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.cumple === 'CUMPLE'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : c.cumple === 'NO_CUMPLE'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                  : c.cumple === 'PARCIALMENTE'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {getEstadoLabel(c.cumple)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {c.responsable_mejora?.username || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                          {c.hallazgo || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {cumplimientos.length > 50 && (
                  <div className="px-4 py-3 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
                    Mostrando 50 de {cumplimientos.length}. Descarga el reporte completo en Excel o PDF.
                  </div>
                )}
              </div>
            </div>
          )}

          {cumplimientos.length === 0 && (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <HiChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Sin datos de cumplimiento</p>
              <p className="text-sm mt-1">
                Selecciona una autoevaluación o registra cumplimientos para generar reportes.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
