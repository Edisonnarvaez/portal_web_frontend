// src/apps/habilitacion/presentation/components/AlertasHabilitacionPanel.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  HiExclamationTriangle,
  HiBellAlert,
  HiClock,
  HiShieldExclamation,
  HiDocumentCheck,
  HiChevronRight,
  HiXMark,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useDatosPrestador } from '../hooks/useDatosPrestador';
import { usePlanMejora } from '../hooks/usePlanMejora';
import { useAutoevaluacion } from '../hooks/useAutoevaluacion';
import { useHallazgo } from '../hooks/useHallazgo';
import { formatDate, diasParaVencimiento } from '../utils/formatters';
import type { DatosPrestador } from '../../domain/entities/DatosPrestador';
import type { PlanMejora } from '../../domain/entities/PlanMejora';
import type { Autoevaluacion } from '../../domain/entities/Autoevaluacion';
import type { Hallazgo } from '../../domain/entities/Hallazgo';

// ─── Alert Types ────────────────────────────────────────────────
type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertCategory = 'habilitacion' | 'mejora' | 'evaluacion' | 'hallazgo';

interface AlertItem {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  timestamp?: string;
}

// ─── Severity Config ────────────────────────────────────────────
const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { icon: React.ReactNode; bg: string; border: string; text: string; badge: string }
> = {
  critical: {
    icon: <HiShieldExclamation className="w-5 h-5" />,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-500',
  },
  warning: {
    icon: <HiExclamationTriangle className="w-5 h-5" />,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-500',
  },
  info: {
    icon: <HiClock className="w-5 h-5" />,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-500',
  },
};

// ─── Props ──────────────────────────────────────────────────────
interface AlertasHabilitacionPanelProps {
  /** Compact mode: show summary only (for sidebar/top indicators) */
  compact?: boolean;
  /** Maximum alerts to show */
  maxAlerts?: number;
  /** Hide dismissed alerts */
  dismissible?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AlertasHabilitacionPanel({
  compact = false,
  maxAlerts = 20,
  dismissible = true,
}: AlertasHabilitacionPanelProps) {
  const navigate = useNavigate();

  // Hooks for data
  const { datos, fetchDatos, getProximosAVencer } = useDatosPrestador();
  const { planes, fetchPlanes, fetchVencidos, fetchProximosAVencer, vencidos, proximosVencer } = usePlanMejora();
  const { autoevaluaciones, fetchAutoevaluaciones } = useAutoevaluacion();
  const { hallazgos, fetchHallazgos, abiertos, criticos, fetchAbiertos, fetchCriticos } = useHallazgo();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [proximosAVencerPrestador, setProximosAVencerPrestador] = useState<DatosPrestador[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load all data on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([
          fetchDatos(),
          fetchPlanes(),
          fetchAutoevaluaciones(),
          fetchHallazgos(),
          fetchVencidos(),
          fetchProximosAVencer(30),
          fetchAbiertos(),
          fetchCriticos(),
        ]);

        try {
          const proximos = await getProximosAVencer(180);
          setProximosAVencerPrestador(proximos);
        } catch {
          // Calculate locally if endpoint fails
          setProximosAVencerPrestador([]);
        }
      } catch {
        // Partial load is acceptable
      }
      setLoaded(true);
    };
    loadAll();
  }, []);

  // ─── Generate Alerts ───────────────────────────────────────────
  const alerts = useMemo<AlertItem[]>(() => {
    const items: AlertItem[] = [];

    // 1. Habilitaciones vencidas (CRITICAL)
    datos
      .filter((d) => {
        const dias = diasParaVencimiento(d.fecha_vencimiento_habilitacion);
        return dias !== null && dias < 0;
      })
      .forEach((d) => {
        items.push({
          id: `hab-vencida-${d.id}`,
          severity: 'critical',
          category: 'habilitacion',
          title: 'Habilitación vencida',
          description: `${d.codigo_reps} (${d.headquarters_detail?.name || 'Sin sede'}) — Venció el ${formatDate(d.fecha_vencimiento_habilitacion)}`,
          actionLabel: 'Ver prestador',
          actionTo: `/habilitacion/prestador/${d.id}`,
        });
      });

    // 2. Habilitaciones próximas a vencer ≤90 días (WARNING)
    datos
      .filter((d) => {
        const dias = diasParaVencimiento(d.fecha_vencimiento_habilitacion);
        return dias !== null && dias >= 0 && dias <= 90;
      })
      .forEach((d) => {
        const dias = diasParaVencimiento(d.fecha_vencimiento_habilitacion)!;
        items.push({
          id: `hab-prox-${d.id}`,
          severity: dias <= 30 ? 'critical' : 'warning',
          category: 'habilitacion',
          title: `Habilitación vence en ${dias} días`,
          description: `${d.codigo_reps} (${d.headquarters_detail?.name || 'Sin sede'}) — Vence el ${formatDate(d.fecha_vencimiento_habilitacion)}`,
          actionLabel: 'Renovar',
          actionTo: `/habilitacion/prestador/${d.id}`,
        });
      });

    // 3. Habilitaciones próximas ≤180 días (INFO)
    datos
      .filter((d) => {
        const dias = diasParaVencimiento(d.fecha_vencimiento_habilitacion);
        return dias !== null && dias > 90 && dias <= 180;
      })
      .forEach((d) => {
        const dias = diasParaVencimiento(d.fecha_vencimiento_habilitacion)!;
        items.push({
          id: `hab-info-${d.id}`,
          severity: 'info',
          category: 'habilitacion',
          title: `Habilitación vence en ${dias} días`,
          description: `${d.codigo_reps} — Considere iniciar renovación`,
          actionLabel: 'Ver detalle',
          actionTo: `/habilitacion/prestador/${d.id}`,
        });
      });

    // 4. Planes de mejora vencidos (CRITICAL)
    const planesVencidos = planes.filter((p) => p.estado === 'VENCIDO');
    if (planesVencidos.length > 0) {
      items.push({
        id: 'planes-vencidos',
        severity: 'critical',
        category: 'mejora',
        title: `${planesVencidos.length} plan(es) de mejora vencido(s)`,
        description: planesVencidos
          .slice(0, 3)
          .map((p) => p.numero_plan)
          .join(', ') + (planesVencidos.length > 3 ? ` y ${planesVencidos.length - 3} más` : ''),
        actionLabel: 'Ver planes',
        actionTo: '/habilitacion/planes-mejora',
      });
    }

    // 5. Planes próximos a vencer ≤30 días (WARNING)
    const planesProximos = planes.filter((p) => {
      const dias = diasParaVencimiento(p.fecha_vencimiento);
      return dias !== null && dias >= 0 && dias <= 30 && p.estado !== 'COMPLETADO' && p.estado !== 'VENCIDO';
    });
    if (planesProximos.length > 0) {
      items.push({
        id: 'planes-proximos',
        severity: 'warning',
        category: 'mejora',
        title: `${planesProximos.length} plan(es) próximo(s) a vencer`,
        description: planesProximos
          .slice(0, 3)
          .map((p) => `${p.numero_plan} (${diasParaVencimiento(p.fecha_vencimiento)}d)`)
          .join(', '),
        actionLabel: 'Ver planes',
        actionTo: '/habilitacion/planes-mejora',
      });
    }

    // 6. Autoevaluaciones pendientes / en borrador (INFO)
    const aesPendientes = autoevaluaciones.filter(
      (a) => a.estado === 'BORRADOR' || a.estado === 'EN_CURSO',
    );
    if (aesPendientes.length > 0) {
      items.push({
        id: 'aes-pendientes',
        severity: 'info',
        category: 'evaluacion',
        title: `${aesPendientes.length} autoevaluación(es) pendiente(s)`,
        description: aesPendientes
          .slice(0, 3)
          .map((a) => `${a.numero_autoevaluacion} (${a.estado === 'BORRADOR' ? 'Borrador' : 'En curso'})`)
          .join(', '),
        actionLabel: 'Ver autoevaluaciones',
        actionTo: '/habilitacion',
      });
    }

    // 7. Hallazgos críticos abiertos (CRITICAL)
    const hallazgosCriticos = hallazgos.filter(
      (h) => h.severidad === 'CRÍTICA' && h.estado !== 'CERRADO',
    );
    if (hallazgosCriticos.length > 0) {
      items.push({
        id: 'hallazgos-criticos',
        severity: 'critical',
        category: 'hallazgo',
        title: `${hallazgosCriticos.length} hallazgo(s) crítico(s) abierto(s)`,
        description: hallazgosCriticos
          .slice(0, 3)
          .map((h) => h.numero_hallazgo)
          .join(', '),
        actionLabel: 'Ver hallazgos',
        actionTo: '/habilitacion/hallazgos',
      });
    }

    // 8. Hallazgos abiertos no críticos (WARNING)
    const hallazgosAbiertos = hallazgos.filter(
      (h) => h.estado === 'ABIERTO' && h.severidad !== 'CRÍTICA',
    );
    if (hallazgosAbiertos.length > 0) {
      items.push({
        id: 'hallazgos-abiertos',
        severity: 'warning',
        category: 'hallazgo',
        title: `${hallazgosAbiertos.length} hallazgo(s) abierto(s)`,
        description: `${hallazgosAbiertos.filter((h) => h.severidad === 'ALTA').length} alta severidad`,
        actionLabel: 'Ver hallazgos',
        actionTo: '/habilitacion/hallazgos',
      });
    }

    // Sort: critical → warning → info
    const severityOrder: Record<AlertSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return items;
  }, [datos, planes, autoevaluaciones, hallazgos]);

  // Filter dismissed
  const visibleAlerts = useMemo(
    () =>
      alerts
        .filter((a) => !dismissed.has(a.id))
        .slice(0, maxAlerts),
    [alerts, dismissed, maxAlerts],
  );

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const totalCount = alerts.length;

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  // ─── Compact Mode ─────────────────────────────────────────────
  if (compact) {
    if (!loaded || totalCount === 0) return null;

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
          criticalCount > 0
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
            : warningCount > 0
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
        }`}
        onClick={() => navigate('/habilitacion/alertas')}
      >
        <HiBellAlert
          className={`w-5 h-5 ${
            criticalCount > 0
              ? 'text-red-600 dark:text-red-400'
              : warningCount > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-blue-600 dark:text-blue-400'
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {totalCount} alerta{totalCount !== 1 ? 's' : ''} activa{totalCount !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {criticalCount > 0 && (
              <span className="text-red-600 dark:text-red-400 font-medium">
                {criticalCount} crítica{criticalCount !== 1 ? 's' : ''}
              </span>
            )}
            {criticalCount > 0 && warningCount > 0 && ' · '}
            {warningCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                {warningCount} advertencia{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <HiChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  // ─── Full Mode ─────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
        <HiDocumentCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">Sin alertas activas</p>
        <p className="text-sm mt-1">
          Todas las habilitaciones, planes y evaluaciones están al día.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary header  */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <HiBellAlert className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {totalCount} alerta{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {criticalCount} crítica{criticalCount !== 1 ? 's' : ''}
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {warningCount} advertencia{warningCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Alert items */}
      {visibleAlerts.map((alert) => {
        const config = SEVERITY_CONFIG[alert.severity];
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} ${config.border} transition-all`}
          >
            <div className={`mt-0.5 ${config.text}`}>{config.icon}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${config.text}`}>
                {alert.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {alert.description}
              </p>
              {alert.actionLabel && alert.actionTo && (
                <button
                  onClick={() => navigate(alert.actionTo!)}
                  className={`mt-2 text-xs font-medium ${config.text} hover:underline inline-flex items-center gap-1`}
                >
                  {alert.actionLabel}
                  <HiChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
            {dismissible && (
              <button
                onClick={() => dismiss(alert.id)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Descartar"
              >
                <HiXMark className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Static Alert Count Hook (for Sidebar badge) ────────────────
export function useAlertCount() {
  const { datos, fetchDatos } = useDatosPrestador();
  const { planes, fetchPlanes } = usePlanMejora();
  const { hallazgos, fetchHallazgos } = useHallazgo();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        await Promise.all([fetchDatos(), fetchPlanes(), fetchHallazgos()]);
      } catch {
        // Partial is OK
      }
    };
    loadCounts();
  }, []);

  useEffect(() => {
    let c = 0;
    // Habilitaciones vencidas o próximas ≤90 días
    datos.forEach((d) => {
      const dias = diasParaVencimiento(d.fecha_vencimiento_habilitacion);
      if (dias !== null && dias <= 90) c++;
    });
    // Planes vencidos
    c += planes.filter((p) => p.estado === 'VENCIDO').length;
    // Hallazgos críticos abiertos
    c += hallazgos.filter(
      (h) => h.severidad === 'CRÍTICA' && h.estado !== 'CERRADO',
    ).length;

    setCount(c);
  }, [datos, planes, hallazgos]);

  return count;
}
