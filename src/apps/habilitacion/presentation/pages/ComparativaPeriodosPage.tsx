// src/apps/habilitacion/presentation/pages/ComparativaPeriodosPage.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  HiArrowLeft,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiMinusSmall,
  HiTableCells,
  HiDocumentArrowDown,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAutoevaluacion } from '../hooks/useAutoevaluacion';
import { getEstadoLabel } from '../utils/formatters';
import type { AutoevaluacionResumen } from '../../domain/entities';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

// ─── Types ──────────────────────────────────────────────────────
interface PeriodoData {
  periodo: number;
  autoevaluacionId: number;
  numero: string;
  estado: string;
  porcentaje_cumplimiento: number;
  total_criterios: number;
  cumplidos: number;
  no_cumplidos: number;
  parcialmente: number;
  no_aplica: number;
  planes_pendientes: number;
  mejoras_vencidas: number;
}

// ─── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
  isDark,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
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
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Trend Indicator ────────────────────────────────────────────
const TrendIndicator = ({
  current,
  previous,
  unit = '%',
  inverted = false,
}: {
  current: number;
  previous: number;
  unit?: string;
  inverted?: boolean;
}) => {
  const diff = current - previous;
  const isPositive = inverted ? diff < 0 : diff > 0;
  const isNeutral = diff === 0;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <HiMinusSmall className="w-4 h-4" />
        Sin cambio
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isPositive ? (
        <HiArrowTrendingUp className="w-4 h-4" />
      ) : (
        <HiArrowTrendingDown className="w-4 h-4" />
      )}
      {diff > 0 ? '+' : ''}
      {diff}
      {unit}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
export default function ComparativaPeriodosPage() {
  const navigate = useNavigate();
  const isDark = useDarkMode();

  const { autoevaluaciones, fetchAutoevaluaciones, getResumen, loading } =
    useAutoevaluacion();

  const [periodosData, setPeriodosData] = useState<PeriodoData[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load autoevaluaciones
  useEffect(() => {
    fetchAutoevaluaciones();
  }, []);

  // Load resumen for each autoevaluacion
  useEffect(() => {
    if (autoevaluaciones.length === 0) return;

    const loadResumenes = async () => {
      setLoadingData(true);
      const results: PeriodoData[] = [];

      for (const ae of autoevaluaciones) {
        try {
          const r: AutoevaluacionResumen = await getResumen(ae.id);
          results.push({
            periodo: ae.periodo,
            autoevaluacionId: ae.id,
            numero: ae.numero_autoevaluacion,
            estado: ae.estado,
            porcentaje_cumplimiento: r.porcentaje_cumplimiento,
            total_criterios: r.total_criterios,
            cumplidos: r.cumplidos,
            no_cumplidos: r.no_cumplidos,
            parcialmente: r.parcialmente_cumplidos,
            no_aplica: r.no_aplica,
            planes_pendientes: r.planes_mejora_pendientes,
            mejoras_vencidas: r.mejoras_vencidas,
          });
        } catch {
          // Skip failed resumen
        }
      }

      // Sort by periodo
      results.sort((a, b) => a.periodo - b.periodo);
      setPeriodosData(results);
      setLoadingData(false);
    };

    loadResumenes();
  }, [autoevaluaciones]);

  // ─── Chart Data ───────────────────────────────────────────────
  const lineChartData = useMemo(
    () =>
      periodosData.map((p) => ({
        name: `P${p.periodo}`,
        '% Cumplimiento': p.porcentaje_cumplimiento,
        'Total Criterios': p.total_criterios,
      })),
    [periodosData],
  );

  const barChartData = useMemo(
    () =>
      periodosData.map((p) => ({
        name: `P${p.periodo}`,
        Cumple: p.cumplidos,
        'No Cumple': p.no_cumplidos,
        Parcial: p.parcialmente,
        'No Aplica': p.no_aplica,
      })),
    [periodosData],
  );

  const planesChartData = useMemo(
    () =>
      periodosData.map((p) => ({
        name: `P${p.periodo}`,
        Pendientes: p.planes_pendientes,
        Vencidas: p.mejoras_vencidas,
      })),
    [periodosData],
  );

  // Overall trend
  const latestPeriodo = periodosData[periodosData.length - 1];
  const previousPeriodo =
    periodosData.length >= 2 ? periodosData[periodosData.length - 2] : null;

  const chartAxisColor = isDark ? '#9ca3af' : '#6b7280';
  const isLoading = loading || loadingData;

  // Export handlers
  const handleExportExcel = () => {
    const data = periodosData.map((p) => ({
      'Período': p.periodo,
      'N° Autoevaluación': p.numero,
      'Estado': getEstadoLabel(p.estado),
      '% Cumplimiento': p.porcentaje_cumplimiento,
      'Total Criterios': p.total_criterios,
      'Cumplidos': p.cumplidos,
      'No Cumplidos': p.no_cumplidos,
      'Parcialmente': p.parcialmente,
      'No Aplica': p.no_aplica,
      'Planes Pendientes': p.planes_pendientes,
      'Mejoras Vencidas': p.mejoras_vencidas,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = Object.keys(data[0] || {}).map((k) => ({ wch: Math.max(k.length, 16) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comparativa');
    XLSX.writeFile(wb, 'comparativa_periodos_habilitacion.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text('Comparativa entre Períodos — Habilitación', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 22);

    (doc as any).autoTable({
      head: [['Período', 'Autoevaluación', 'Estado', '% Cumpl.', 'Criterios', 'Cumplidos', 'No Cumple', 'Parcial', 'N/A', 'Planes Pend.', 'Vencidas']],
      body: periodosData.map((p) => [
        `P${p.periodo}`,
        p.numero,
        getEstadoLabel(p.estado),
        `${p.porcentaje_cumplimiento}%`,
        p.total_criterios,
        p.cumplidos,
        p.no_cumplidos,
        p.parcialmente,
        p.no_aplica,
        p.planes_pendientes,
        p.mejoras_vencidas,
      ]),
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save('comparativa_periodos_habilitacion.pdf');
  };

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
              Comparativa entre Períodos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Evolución del cumplimiento y tendencias a lo largo del tiempo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={periodosData.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800 dark:hover:bg-green-900/50 disabled:opacity-50 transition"
          >
            <HiTableCells className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={periodosData.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
          >
            <HiDocumentArrowDown className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : periodosData.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <HiArrowTrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Sin datos comparativos</p>
          <p className="text-sm mt-1">
            Se necesitan al menos dos autoevaluaciones con diferentes períodos.
          </p>
        </div>
      ) : (
        <>
          {/* Trend Summary Cards */}
          {latestPeriodo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Último % Cumplimiento
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {latestPeriodo.porcentaje_cumplimiento}%
                </p>
                {previousPeriodo && (
                  <TrendIndicator
                    current={latestPeriodo.porcentaje_cumplimiento}
                    previous={previousPeriodo.porcentaje_cumplimiento}
                  />
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Criterios Cumplidos
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {latestPeriodo.cumplidos}
                </p>
                {previousPeriodo && (
                  <TrendIndicator
                    current={latestPeriodo.cumplidos}
                    previous={previousPeriodo.cumplidos}
                    unit=""
                  />
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  No Cumplidos
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {latestPeriodo.no_cumplidos}
                </p>
                {previousPeriodo && (
                  <TrendIndicator
                    current={latestPeriodo.no_cumplidos}
                    previous={previousPeriodo.no_cumplidos}
                    unit=""
                    inverted
                  />
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Períodos Analizados
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {periodosData.length}
                </p>
                <span className="text-xs text-gray-400">
                  P{periodosData[0].periodo} — P
                  {periodosData[periodosData.length - 1].periodo}
                </span>
              </div>
            </div>
          )}

          {/* Line Chart: Evolución % Cumplimiento */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <HiArrowTrendingUp className="w-4 h-4 text-blue-500" />
              Evolución del % de Cumplimiento
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#374151' : '#e5e7eb'}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: chartAxisColor, fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: chartAxisColor, fontSize: 12 }}
                  tickFormatter={(v: number) => `${v}%`}
                />
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
                <ReferenceLine
                  y={80}
                  stroke="#22c55e"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Meta 80%',
                    fill: '#22c55e',
                    fontSize: 11,
                    position: 'right',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="% Cumplimiento"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar: Composición por período */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Composición de Cumplimiento por Período
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#374151' : '#e5e7eb'}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chartAxisColor, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: chartAxisColor, fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip isDark={isDark} />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(v: string) => (
                      <span className="text-gray-600 dark:text-gray-300">
                        {v}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="Cumple"
                    stackId="a"
                    fill="#22c55e"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar dataKey="No Cumple" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Parcial" stackId="a" fill="#eab308" />
                  <Bar
                    dataKey="No Aplica"
                    stackId="a"
                    fill="#9ca3af"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Planes pendientes y mejoras vencidas por período */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Planes Pendientes y Mejoras Vencidas
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={planesChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#374151' : '#e5e7eb'}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chartAxisColor, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: chartAxisColor, fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip isDark={isDark} />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(v: string) => (
                      <span className="text-gray-600 dark:text-gray-300">
                        {v}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="Pendientes"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Vencidas"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detail Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Detalle por Período
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Período
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Autoevaluación
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      % Cumpl.
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      Cumple
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      No Cumple
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      Parcial
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      Tendencia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {periodosData.map((p, idx) => {
                    const prev = idx > 0 ? periodosData[idx - 1] : null;
                    return (
                      <tr
                        key={p.autoevaluacionId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          Período {p.periodo}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {p.numero}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {getEstadoLabel(p.estado)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-bold ${
                              p.porcentaje_cumplimiento >= 80
                                ? 'text-green-600 dark:text-green-400'
                                : p.porcentaje_cumplimiento >= 50
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {p.porcentaje_cumplimiento}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-green-600 dark:text-green-400">
                          {p.cumplidos}
                        </td>
                        <td className="px-4 py-3 text-center text-red-600 dark:text-red-400">
                          {p.no_cumplidos}
                        </td>
                        <td className="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400">
                          {p.parcialmente}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {prev ? (
                            <TrendIndicator
                              current={p.porcentaje_cumplimiento}
                              previous={prev.porcentaje_cumplimiento}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
