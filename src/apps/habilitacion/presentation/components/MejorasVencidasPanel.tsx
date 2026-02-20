import React, { useEffect, useState, useMemo } from 'react';
import {
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDocumentCheck,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { useCumplimiento, usePlanMejora } from '../hooks';
import { getEstadoLabel, getEstadoColor, formatDate } from '../utils/formatters';

interface MejorasVencidasPanelProps {
  className?: string;
  /** Si true, muestra como alerta compacta. Default: panel completo */
  compact?: boolean;
  /** Filtrar por autoevaluación ID */
  autoevaluacionId?: number;
}

const MejorasVencidasPanel: React.FC<MejorasVencidasPanelProps> = ({
  className = '',
  compact = false,
  autoevaluacionId,
}) => {
  const { getMejorasVencidas } = useCumplimiento();
  const { fetchVencidos } = usePlanMejora();

  const [cumplimientosVencidos, setCumplimientosVencidos] = useState<any[]>([]);
  const [planesVencidos, setPlanesVencidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCumpl, setExpandedCumpl] = useState(false);
  const [expandedPlanes, setExpandedPlanes] = useState(false);

  useEffect(() => {
    loadData();
  }, [autoevaluacionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cumpl, planes] = await Promise.all([
        getMejorasVencidas(),
        fetchVencidos(),
      ]);
      setCumplimientosVencidos(cumpl ?? []);
      setPlanesVencidos(planes ?? []);
    } catch (err) {
      console.error('Error loading mejoras vencidas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCumplimientos = useMemo(() => {
    if (!autoevaluacionId) return cumplimientosVencidos;
    return cumplimientosVencidos.filter((c: any) => c.autoevaluacion?.id === autoevaluacionId);
  }, [cumplimientosVencidos, autoevaluacionId]);

  const filteredPlanes = useMemo(() => {
    if (!autoevaluacionId) return planesVencidos;
    return planesVencidos.filter((p: any) => p.autoevaluacion_id === autoevaluacionId);
  }, [planesVencidos, autoevaluacionId]);

  const totalVencidos = filteredCumplimientos.length + filteredPlanes.length;

  const diasVencido = (fecha?: string): number => {
    if (!fecha) return 0;
    const diff = new Date().getTime() - new Date(fecha).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (totalVencidos === 0) return null; // No mostrar nada si no hay vencidos

  /* ── Modo compacto: alerta simple ── */
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ${className}`}>
        <HiOutlineExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-300">
          <strong>{totalVencidos}</strong> mejora(s) vencida(s) requieren atención inmediata
          {filteredCumplimientos.length > 0 && <span> · {filteredCumplimientos.length} cumplimiento(s)</span>}
          {filteredPlanes.length > 0 && <span> · {filteredPlanes.length} plan(es) de mejora</span>}
        </p>
      </div>
    );
  }

  /* ── Modo panel completo ── */
  return (
    <div className={`rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
            <HiOutlineExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Mejoras Vencidas</h3>
            <p className="text-xs text-red-600 dark:text-red-400">{totalVencidos} elemento(s) requieren atención</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors"
          title="Actualizar"
        >
          <HiOutlineArrowPath className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Summary badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
            <HiOutlineExclamationCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-red-700 dark:text-red-400">{filteredCumplimientos.length}</p>
              <p className="text-xs text-red-600 dark:text-red-500">Cumplimientos vencidos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10">
            <HiOutlineClock className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-400">{filteredPlanes.length}</p>
              <p className="text-xs text-orange-600 dark:text-orange-500">Planes vencidos</p>
            </div>
          </div>
        </div>

        {/* Cumplimientos vencidos */}
        {filteredCumplimientos.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedCumpl(!expandedCumpl)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiOutlineDocumentCheck className="h-4 w-4 text-red-500" />
                Cumplimientos con fecha comprometida vencida ({filteredCumplimientos.length})
              </span>
              {expandedCumpl ? <HiOutlineChevronUp className="h-4 w-4 text-gray-400" /> : <HiOutlineChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {expandedCumpl && (
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Autoevaluación</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Servicio</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Criterio</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Estado</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Fecha Compromiso</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Días Vencido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {filteredCumplimientos.map((c: any) => (
                      <tr key={c.id} className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{c.autoevaluacion?.numero_autoevaluacion || '—'}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{c.servicio_sede?.nombre_servicio || '—'}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{c.criterio?.nombre || '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(c.cumple)}`}>
                            {getEstadoLabel(c.cumple)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{formatDate(c.fecha_compromiso)}</td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">
                            {diasVencido(c.fecha_compromiso)} días
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Planes vencidos */}
        {filteredPlanes.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedPlanes(!expandedPlanes)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiOutlineClock className="h-4 w-4 text-orange-500" />
                Planes de mejora vencidos ({filteredPlanes.length})
              </span>
              {expandedPlanes ? <HiOutlineChevronUp className="h-4 w-4 text-gray-400" /> : <HiOutlineChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {expandedPlanes && (
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Plan</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Descripción</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Avance</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Estado</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Vencimiento</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Días Vencido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {filteredPlanes.map((p: any) => (
                      <tr key={p.id} className="hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{p.numero_plan}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{p.descripcion}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${Math.min(p.porcentaje_avance || 0, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{p.porcentaje_avance || 0}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getEstadoColor(p.estado)}`}>
                            {getEstadoLabel(p.estado)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{formatDate(p.fecha_vencimiento)}</td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">
                            {diasVencido(p.fecha_vencimiento)} días
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MejorasVencidasPanel;
