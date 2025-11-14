import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  indicator: any | null;
  results: any[];
}

export default function IndicatorDetailModal({ isOpen, onClose, indicator, results }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  if (!indicator) return null;

  // Obtener el objeto indicador del nested object
  const indicatorData = indicator.indicator || indicator;
  
  // Función auxiliar para formatear período (reutilizable)
  const formatPeriodo = (item: any): string => {
    switch (item.measurementFrequency) {
      case "monthly":
        return `${item.year}-${String(item.month).padStart(2, "0")}`;
      case "quarterly":
        return `Q${item.quarter} ${item.year}`;
      case "semiannual":
        return `S${item.semester} ${item.year}`;
      case "annual":
        return `${item.year}`;
      default:
        return `${item.year}`;
    }
  };
  
  // 🔑 El resultado SELECCIONADO es el que está en 'indicator' (pasado desde IndicatorTable)
  // Este es el que debe mostrarse como resultado actual
  const selectedResultPeriodo = formatPeriodo(indicator);
  
  // Obtener todos los resultados del MISMO INDICADOR para poder mostrar el gráfico de evolución
  const resultsForThisIndicator = results.filter((r) => {
    // Si tenemos ID del indicador, comparar por ID (más preciso)
    if (indicatorData?.id && r.indicator?.id) {
      return r.indicator.id === indicatorData.id;
    }
    // Si no, comparar por nombre del indicador
    if (indicator.indicatorName && r.indicatorName) {
      return r.indicatorName === indicator.indicatorName;
    }
    // Fallback: si el resultado tiene el mismo indicador object
    if (r.indicator && indicatorData) {
      return r.indicator === indicatorData || r.indicator?.name === indicatorData?.name;
    }
    return false;
  });
  
  // Crear datos para el gráfico con ordenamiento CRONOLÓGICO ASCENDENTE (pasado a futuro)
  const chartData = resultsForThisIndicator
    .map((item) => ({
      resultado: item.calculatedValue || 0,
      meta: parseFloat(indicator.target || indicatorData?.target || '0'),
      periodo: formatPeriodo(item),
      year: item.year,
      month: item.month || 1,
      quarter: item.quarter || 1,
      semester: item.semester || 1,
      // Guardar el ID del resultado para poder identificarlo después
      resultId: item.id,
    }))
    .sort((a, b) => {
      // 📈 ORDENAMIENTO CRONOLÓGICO ASCENDENTE (antiguo → reciente) para que el gráfico sea claro
      // Ordenar por año primero (ascendente - más antiguo primero)
      if (a.year !== b.year) return a.year - b.year;
      // Luego por mes
      if (a.month !== b.month) return a.month - b.month;
      // Luego por trimestre
      if (a.quarter !== b.quarter) return a.quarter - b.quarter;
      // Luego por semestre
      return a.semester - b.semester;
    });

  // Calcular estadísticas - USAR EL RESULTADO SELECCIONADO (el que se abrió del modal)
  // Este debe ser el "currentResult" porque es el que el usuario seleccionó
  const currentResult = indicator;
  
  // Para calcular tendencia visual, obtener el resultado anterior en el tiempo
  // Primero, encontrar el período anterior del resultado seleccionado
  const previousResult = chartData.length > 0 
    ? resultsForThisIndicator
        .map((item) => ({
          ...item,
          periodo: formatPeriodo(item),
          year: item.year,
          month: item.month || 1,
          quarter: item.quarter || 1,
          semester: item.semester || 1,
        }))
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          if (a.month !== b.month) return a.month - b.month;
          if (a.quarter !== b.quarter) return a.quarter - b.quarter;
          return a.semester - b.semester;
        })
        .find((item) => {
          // Buscar el resultado anterior al seleccionado
          const selectedIndex = chartData.findIndex(d => d.periodo === selectedResultPeriodo);
          return selectedIndex > 0 && chartData[selectedIndex - 1]?.periodo === item.periodo;
        }) || null
    : null;
  
  // Mejor manejo de target - usar !== undefined
  // IMPORTANTE: Usar !== undefined en lugar de solo truthy check, porque 0 es falsy
  const target = currentResult && currentResult.target !== undefined && currentResult.target !== null
    ? parseFloat(currentResult.target)
    : parseFloat(indicator.target || indicatorData?.target || '0');
  
  // Mejor manejo de currentValue - usar múltiples fallbacks
  // IMPORTANTE: Usar !== undefined en lugar de solo truthy check, porque 0 es falsy
  const currentValue = currentResult && currentResult.calculatedValue !== undefined && currentResult.calculatedValue !== null
    ? parseFloat(currentResult.calculatedValue)
    : parseFloat(indicator.calculatedValue || indicator.result || '0');
  
  // 🔑 Obtener trend del indicador (meta: increasing/decreasing)
  const indicatorTrend = (indicator?.trend || indicatorData?.trend || 'increasing').toLowerCase();
  // También calcular trend visual basado en comparación histórica
  const trendVisual = currentValue >= (previousResult?.calculatedValue || currentValue) ? 'up' : 'down';
  
  // ✅ Calcular cumplimiento basado en el trend del indicador
  const cumplimiento = target > 0 ? ((currentValue / target) * 100).toFixed(1) : '0';
  const cumple = indicatorTrend === 'decreasing' || indicatorTrend === 'descendente' 
    ? currentValue <= target 
    : currentValue >= target;

  // console.log('🔍 Debugging Modal - Final Data:', {
  //   totalResults: results.length,
  //   filteredResults: resultsForThisIndicator.length,
  //   chartDataLength: chartData.length,
  //   mostRecentPeriodo: chartData[0]?.periodo,
  //   currentResult: {
  //     id: currentResult?.id,
  //     calculatedValue: currentResult?.calculatedValue,
  //     target: currentResult?.target,
  //     year: currentResult?.year,
  //     month: currentResult?.month,
  //     creationDate: currentResult?.creationDate,
  //     updateDate: currentResult?.updateDate,
  //   },
  //   computedValues: {
  //     currentValue,
  //     target,
  //     cumplimiento: `${cumplimiento}%`,
  //     cumple,
  //     indicatorTrend,
  //     trendVisual,
  //   },
  // });

  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length > 0) {
      return (
        <div
          style={{
            backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDarkMode ? '#4b5563' : '#ddd',
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid',
          }}
        >
          <p className="font-semibold">{payload[0]?.payload?.periodo}</p>
          <p className="text-blue-400">📊 Resultado: {payload[0]?.value?.toFixed(2)}</p>
          <p className="text-green-400">🎯 Meta: {payload[1]?.value?.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl max-h-[95vh] overflow-y-auto">
          {/* Encabezado */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 flex justify-between items-start p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="flex-1 pr-4">
              <Dialog.Title className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                {indicator.indicatorName || indicatorData?.name || 'Indicador'}
              </Dialog.Title>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Código: <span className="font-mono font-semibold">{indicator.indicatorCode || indicatorData?.code || '-'}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="flex-shrink-0 p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Tarjetas de resumen */}
            {currentResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className={`p-3 sm:p-4 rounded-lg border-2 ${cumple ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Estado Actual</p>
                  <div className="flex items-center mt-2 gap-2">
                    {cumple ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <span className={`text-base sm:text-lg font-bold ${cumple ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {cumple ? 'Cumple ✓' : 'No Cumple ✗'}
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-lg border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-500">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Resultado</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2 break-words">
                    {currentValue?.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {indicator.measurementUnit || indicatorData?.measurementUnit || ''}
                  </p>
                </div>

                <div className="p-3 sm:p-4 rounded-lg border-2 bg-green-50 dark:bg-green-900/20 border-green-500">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cumplimiento</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
                    {cumplimiento}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Meta: {target?.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Gráfico de evolución */}
            {resultsForThisIndicator.length > 0 && (
              <div className="border rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">📈 Evolución Temporal</h3>
                <div className="w-full h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isDarkMode ? '#4b5563' : '#ddd'}
                      />
                      <XAxis 
                        dataKey="periodo"
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#666', fontSize: 11 }}
                        stroke={isDarkMode ? '#4b5563' : '#ddd'}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#666', fontSize: 11 }}
                        stroke={isDarkMode ? '#4b5563' : '#ddd'}
                        width={40}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => {
                          if (value === 'resultado') {
                            return <span style={{ color: '#3b82f6', fontSize: '12px' }}>📊 Resultado</span>;
                          }
                          return <span style={{ color: '#10b981', fontSize: '12px' }}>🎯 Meta</span>;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="resultado"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="meta"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Información detallada - 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información del indicador */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  ℹ️ Información del Indicador
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Versión:</strong> <span className="text-gray-600 dark:text-gray-400">{indicatorData?.version ?? indicator?.version ?? currentResult?.version ?? '-'}</span></p>
                  <p><strong>Descripción:</strong> <span className="text-gray-600 dark:text-gray-400 block text-xs">{indicatorData?.description ?? indicator?.description ?? currentResult?.description ?? '-'}</span></p>
                  <p><strong>Unidad:</strong> <span className="text-gray-600 dark:text-gray-400">{indicator.measurementUnit ?? indicatorData?.measurementUnit ?? currentResult?.measurementUnit ?? '-'}</span></p>
                  <p><strong>Frecuencia:</strong> <span className="text-gray-600 dark:text-gray-400 capitalize">{indicator.measurementFrequency ?? indicatorData?.measurementFrequency ?? currentResult?.measurementFrequency ?? '-'}</span></p>
                  <p><strong>Método:</strong> <span className="text-gray-600 dark:text-gray-400 text-xs">{indicator.calculationMethod ?? indicatorData?.calculationMethod ?? currentResult?.calculationMethod ?? '-'}</span></p>
                </div>
              </div>

              {/* Fórmula y Responsables */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  🔧 Fórmula
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <strong>Numerador / Denominador:</strong>
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p><span className="text-blue-600 dark:text-blue-400">Numerador:</span> {indicatorData?.numerator ?? indicator?.numerator ?? currentResult?.numerator ?? '-'}</p>
                      <p><span className="text-green-600 dark:text-green-400">Denominador:</span> {indicatorData?.denominator ?? indicator?.denominator ?? currentResult?.denominator ?? '-'}</p>
                    </div>
                  </div>
                  <p><strong>Responsable Numerador:</strong> <span className="text-gray-600 dark:text-gray-400">{indicatorData?.numeratorResponsible ?? indicator?.numeratorResponsible ?? currentResult?.numeratorResponsible ?? '-'}</span></p>
                  <p><strong>Responsable Denominador:</strong> <span className="text-gray-600 dark:text-gray-400">{indicatorData?.denominatorResponsible ?? indicator?.denominatorResponsible ?? currentResult?.denominatorResponsible ?? '-'}</span></p>
                </div>
              </div>

              {/* Información de la Sede y Resultado */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  🏢 Sede e Información del Resultado
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Sede:</strong> <span className="text-gray-600 dark:text-gray-400">{indicator.headquarterName ?? currentResult?.headquarterName ?? '-'}</span></p>
                  <p><strong>Resultado Valor:</strong> <span className="text-blue-600 dark:text-blue-400 font-semibold">{(currentResult?.calculatedValue ?? currentValue)?.toFixed(2) ?? '-'}</span></p>
                  <p><strong>Meta Valor:</strong> <span className="text-green-600 dark:text-green-400 font-semibold">{(currentResult?.target ?? target)?.toFixed(2) ?? '-'}</span></p>
                  <p><strong>Numerador:</strong> <span className="text-gray-600 dark:text-gray-400">{currentResult?.numerator ?? indicator?.numerator ?? '-'}</span></p>
                  <p><strong>Denominador:</strong> <span className="text-gray-600 dark:text-gray-400">{currentResult?.denominator ?? indicator?.denominator ?? '-'}</span></p>
                  {currentResult?.creationDate && (
                    <p><strong>Fecha Creación:</strong> <span className="text-gray-600 dark:text-gray-400 text-xs">{new Date(currentResult.creationDate).toLocaleDateString('es-CO')}</span></p>
                  )}
                  {currentResult?.updateDate && (
                    <p><strong>Última Actualización:</strong> <span className="text-gray-600 dark:text-gray-400 text-xs">{new Date(currentResult.updateDate).toLocaleDateString('es-CO')}</span></p>
                  )}
                </div>
              </div>
            </div>

            {/* Resultado actual */}
            {currentResult && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📊 Último Resultado</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase">Valor</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{currentValue?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase">Meta</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{target?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase">Diferencia</p>
                    <p className={`text-lg font-bold ${(currentValue - target) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {(currentValue - target).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase">Tendencia</p>
                    <div className="flex items-center mt-1">
                      {trendVisual === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
