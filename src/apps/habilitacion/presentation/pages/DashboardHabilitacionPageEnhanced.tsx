import React, { useEffect, useMemo } from 'react';
import {
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { HiOutlineClipboardCheck } from "react-icons/hi";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  useDatosPrestador,
  useServicioSede,
  useAutoevaluacion,
  useCumplimiento,
  usePlanMejora,
  useHallazgo,
} from '../hooks';
import {
  ESTADOS_HABILITACION,
  ESTADOS_CUMPLIMIENTO,
} from '../../domain/types';
import { formatDate, diasParaVencimiento } from '../utils/formatters';
import LoadingScreen from '../../../../shared/components/LoadingScreen';

/* ─── colour palette for charts ─── */
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const CUMPLIMIENTO_COLORS: Record<string, string> = {
  CUMPLE: '#10b981',
  NO_CUMPLE: '#ef4444',
  PARCIAL: '#f59e0b',
  NO_APLICA: '#6b7280',
};

/* ─── KPI card ─── */
interface KPIProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  onClick?: () => void;
}

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
  red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
};

const KPICard: React.FC<KPIProps> = ({ title, value, subtitle, icon, trend, trendLabel, color, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl border p-5 transition-shadow hover:shadow-lg ${colorMap[color]} ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        {trend && trendLabel && (
          <div className="flex items-center gap-1 pt-1">
            {trend === 'up' ? (
              <HiOutlineArrowTrendingUp className="h-4 w-4 text-green-500" />
            ) : trend === 'down' ? (
              <HiOutlineArrowTrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <HiOutlineClock className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">{trendLabel}</span>
          </div>
        )}
      </div>
      <div className="rounded-lg bg-white/60 dark:bg-black/20 p-2">{icon}</div>
    </div>
  </div>
);

/* ─── Alert row ─── */
interface AlertItemData {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: () => void;
}

const severityClasses: Record<string, string> = {
  critical: 'border-l-red-600 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
  warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
  info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
};

/* ─── main component ─── */
const DashboardHabilitacionPageEnhanced: React.FC = () => {
  const navigate = useNavigate();

  const { datos: prestadores, loading: lp, fetchDatos: fetchPrestadores } = useDatosPrestador();
  const { servicios, loading: ls, fetchServicios } = useServicioSede();
  const { autoevaluaciones, loading: la, fetchAutoevaluaciones } = useAutoevaluacion();
  const { cumplimientos, loading: lc, fetchCumplimientos } = useCumplimiento();
  const { planes, vencidos: planesVencidos, loading: lpm, fetchPlanes, fetchVencidos: fetchPlanesVencidos } = usePlanMejora();
  const { hallazgos, estadisticas, loading: lh, fetchHallazgos, fetchEstadisticas, fetchCriticos, criticos } = useHallazgo();

  useEffect(() => {
    fetchPrestadores();
    fetchServicios();
    fetchAutoevaluaciones();
    fetchCumplimientos();
    fetchPlanes();
    fetchHallazgos();
    fetchPlanesVencidos();
    fetchCriticos();
  }, []);

  const loading = lp || ls || la || lc || lpm || lh;

  /* ─── computed metrics ─── */
  const metrics = useMemo(() => {
    const habilitados = prestadores.filter(p => p.estado_habilitacion === 'HABILITADA').length;
    const vencidos = prestadores.filter(p => {
      const d = diasParaVencimiento(p.fecha_vencimiento_habilitacion);
      return d !== null && d < 0;
    }).length;
    const proximosVencer = prestadores.filter(p => {
      const d = diasParaVencimiento(p.fecha_vencimiento_habilitacion);
      return d !== null && d >= 0 && d <= 90;
    }).length;

    const evalPendientes = autoevaluaciones.filter(a => a.estado === 'BORRADOR' || a.estado === 'EN_CURSO').length;
    const evalCompletadas = autoevaluaciones.filter(a => a.estado === 'COMPLETADA').length;

    const planesPendientes = planes.filter(p => p.estado === 'PENDIENTE').length;
    const planesEnCurso = planes.filter(p => p.estado === 'EN_CURSO').length;
    const planesCompletados = planes.filter(p => p.estado === 'COMPLETADO').length;
    const planesVencidosCount = planes.filter(p => p.estado === 'VENCIDO').length;

    return {
      habilitados, vencidos, proximosVencer,
      totalServicios: servicios.length,
      evalPendientes, evalCompletadas, totalEval: autoevaluaciones.length,
      totalCumplimientos: cumplimientos.length,
      planesPendientes, planesEnCurso, planesCompletados, planesVencidosCount,
      totalPlanes: planes.length,
      totalHallazgos: hallazgos.length,
      hallazgosCriticos: criticos.length,
    };
  }, [prestadores, servicios, autoevaluaciones, cumplimientos, planes, hallazgos, criticos]);

  /* ─── chart data ─── */
  const estadoHabilitacionData = useMemo(() =>
    ESTADOS_HABILITACION.map(e => ({
      name: e.label,
      value: prestadores.filter(p => p.estado_habilitacion === e.value).length,
    })).filter(d => d.value > 0),
  [prestadores]);

  const cumplimientoData = useMemo(() =>
    ESTADOS_CUMPLIMIENTO.map(e => ({
      name: e.label,
      value: cumplimientos.filter(c => c.cumple === e.value).length,
      fill: CUMPLIMIENTO_COLORS[e.value] || '#6b7280',
    })).filter(d => d.value > 0),
  [cumplimientos]);

  const planMejoraData = useMemo(() => [
    { name: 'Pendientes', value: metrics.planesPendientes, fill: '#f59e0b' },
    { name: 'En Curso', value: metrics.planesEnCurso, fill: '#3b82f6' },
    { name: 'Completados', value: metrics.planesCompletados, fill: '#10b981' },
    { name: 'Vencidos', value: metrics.planesVencidosCount, fill: '#ef4444' },
  ].filter(d => d.value > 0), [metrics]);

  /* ─── alerts ─── */
  const alerts = useMemo<AlertItemData[]>(() => {
    const result: AlertItemData[] = [];

    if (metrics.vencidos > 0) {
      result.push({
        id: 'vencidos',
        severity: 'critical',
        title: `${metrics.vencidos} prestador(es) con habilitación vencida`,
        description: 'Se requiere renovación inmediata para mantener la operación.',
        action: () => navigate('/habilitacion/prestadores'),
      });
    }
    if (metrics.proximosVencer > 0) {
      result.push({
        id: 'proximos',
        severity: 'warning',
        title: `${metrics.proximosVencer} prestador(es) próximos a vencer`,
        description: 'Vencimiento dentro de los próximos 90 días.',
        action: () => navigate('/habilitacion/prestadores'),
      });
    }
    if (metrics.planesVencidosCount > 0) {
      result.push({
        id: 'planes-vencidos',
        severity: 'critical',
        title: `${metrics.planesVencidosCount} plan(es) de mejora vencidos`,
        description: 'Los planes de mejora han superado su fecha de vencimiento.',
        action: () => navigate('/habilitacion/planes-mejora'),
      });
    }
    if (metrics.hallazgosCriticos > 0) {
      result.push({
        id: 'hall-criticos',
        severity: 'critical',
        title: `${metrics.hallazgosCriticos} hallazgo(s) críticos abiertos`,
        description: 'Requieren atención prioritaria.',
        action: () => navigate('/habilitacion/hallazgos'),
      });
    }
    if (metrics.evalPendientes > 0) {
      result.push({
        id: 'eval-pendientes',
        severity: 'info',
        title: `${metrics.evalPendientes} autoevaluación(es) pendientes`,
        description: 'Hay evaluaciones en borrador o en curso.',
        action: () => navigate('/habilitacion/'),
      });
    }
    return result;
  }, [metrics, navigate]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Habilitación
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Resolución 3100 de 2019 — Visión general del estado de habilitación
          </p>
        </div>
        <button
          onClick={() => { fetchPrestadores(); fetchServicios(); fetchAutoevaluaciones(); fetchCumplimientos(); fetchPlanes(); fetchHallazgos(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow transition-shadow"
        >
          <HiOutlineChartBar className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <HiOutlineExclamationTriangle className="h-5 w-5 text-yellow-500" />
            Alertas ({alerts.length})
          </h2>
          {alerts.map(a => (
            <div
              key={a.id}
              className={`rounded-lg border-l-4 p-4 ${severityClasses[a.severity]}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm mt-0.5">{a.description}</p>
                </div>
                {a.action && (
                  <button onClick={a.action} className="text-xs font-medium underline whitespace-nowrap ml-4">
                    Ver detalle
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── KPIs row 1 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Prestadores Habilitados"
          value={metrics.habilitados}
          subtitle={`de ${prestadores.length} total`}
          icon={<HiOutlineShieldCheck className="h-7 w-7" />}
          color="green"
          onClick={() => navigate('/habilitacion/')}
        />
        <KPICard
          title="Prestadores Vencidos"
          value={metrics.vencidos}
          subtitle={`${metrics.proximosVencer} próximos a vencer`}
          icon={<HiOutlineXCircle className="h-7 w-7" />}
          color="red"
          onClick={() => navigate('/habilitacion/')}
        />
        <KPICard
          title="Servicios Habilitados"
          value={metrics.totalServicios}
          icon={<HiOutlineClipboardCheck className="h-7 w-7" />}
          color="blue"
        />
        <KPICard
          title="Autoevaluaciones"
          value={metrics.totalEval}
          subtitle={`${metrics.evalPendientes} pendientes · ${metrics.evalCompletadas} completadas`}
          icon={<HiOutlineDocumentText className="h-7 w-7" />}
          color="indigo"
        />
      </div>

      {/* ── KPIs row 2 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Cumplimientos"
          value={metrics.totalCumplimientos}
          icon={<HiOutlineCheckCircle className="h-7 w-7" />}
          color="green"
          onClick={() => navigate('/habilitacion/cumplimientos')}
        />
        <KPICard
          title="Planes de Mejora"
          value={metrics.totalPlanes}
          subtitle={`${metrics.planesEnCurso} en curso · ${metrics.planesVencidosCount} vencidos`}
          icon={<HiOutlineLightBulb className="h-7 w-7" />}
          color="yellow"
          onClick={() => navigate('/habilitacion/planes-mejora')}
        />
        <KPICard
          title="Hallazgos"
          value={metrics.totalHallazgos}
          subtitle={`${metrics.hallazgosCriticos} críticos`}
          icon={<HiOutlineExclamationCircle className="h-7 w-7" />}
          color="purple"
          onClick={() => navigate('/habilitacion/hallazgos')}
        />
        <KPICard
          title="Promedio Avance Mejora"
          value={planes.length > 0 ? `${Math.round(planes.reduce((s, p) => s + p.porcentaje_avance, 0) / planes.length)}%` : '—'}
          icon={<HiOutlineArrowTrendingUp className="h-7 w-7" />}
          color="blue"
          trend={planes.length > 0 ? 'up' : 'neutral'}
          trendLabel="promedio global"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado Habilitación Pie */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Estado de Habilitación</h3>
          {estadoHabilitacionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={estadoHabilitacionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {estadoHabilitacionData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos</p>
          )}
        </div>

        {/* Cumplimiento Pie */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Estado de Cumplimiento</h3>
          {cumplimientoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={cumplimientoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {cumplimientoData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos</p>
          )}
        </div>

        {/* Planes de Mejora Bar */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Planes de Mejora</h3>
          {planMejoraData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={planMejoraData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {planMejoraData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos</p>
          )}
        </div>
      </div>

      {/* ── Recent activity + próximos a vencer ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos a vencer */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Próximos a Vencer (90 días)</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {prestadores
              .filter(p => {
                const d = diasParaVencimiento(p.fecha_vencimiento_habilitacion);
                return d !== null && d >= 0 && d <= 90;
              })
              .sort((a, b) => {
                const da = diasParaVencimiento(a.fecha_vencimiento_habilitacion) ?? 999;
                const db = diasParaVencimiento(b.fecha_vencimiento_habilitacion) ?? 999;
                return da - db;
              })
              .map(p => {
                const dias = diasParaVencimiento(p.fecha_vencimiento_habilitacion);
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.codigo_reps}</p>
                      <p className="text-xs text-gray-500">{p.company_detail?.name || p.company_name || '—'}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      (dias ?? 0) <= 30 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {dias} días
                    </span>
                  </div>
                );
              })}
            {prestadores.filter(p => {
              const d = diasParaVencimiento(p.fecha_vencimiento_habilitacion);
              return d !== null && d >= 0 && d <= 90;
            }).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No hay vencimientos próximos</p>
            )}
          </div>
        </div>

        {/* Planes de mejora próximos */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Planes de Mejora — Seguimiento</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {planes
              .filter(p => p.estado === 'EN_CURSO' || p.estado === 'PENDIENTE')
              .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())
              .slice(0, 8)
              .map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.numero_plan}</p>
                    <p className="text-xs text-gray-500 truncate">{p.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* progress bar */}
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${p.porcentaje_avance}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-8 text-right">
                      {p.porcentaje_avance}%
                    </span>
                  </div>
                </div>
              ))}
            {planes.filter(p => p.estado === 'EN_CURSO' || p.estado === 'PENDIENTE').length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin planes activos</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Prestadores', path: '/habilitacion/', icon: <HiOutlineShieldCheck className="h-5 w-5" /> },
          { label: 'Autoevaluaciones', path: '/habilitacion/', icon: <HiOutlineDocumentText className="h-5 w-5" /> },
          { label: 'Cumplimientos', path: '/habilitacion/cumplimientos', icon: <HiOutlineCheckCircle className="h-5 w-5" /> },
          { label: 'Planes Mejora', path: '/habilitacion/planes-mejora', icon: <HiOutlineLightBulb className="h-5 w-5" /> },
          { label: 'Hallazgos', path: '/habilitacion/hallazgos', icon: <HiOutlineExclamationCircle className="h-5 w-5" /> },
          { label: 'Criterios', path: '/habilitacion/', icon: <HiOutlineClipboardCheck className="h-5 w-5" /> },
        ].map(link => (
          <button
            key={link.label}
            onClick={() => navigate(link.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {link.icon}
            <span className="text-xs font-medium">{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardHabilitacionPageEnhanced;
