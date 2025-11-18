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

  // Funciones para traducir valores del backend
  const translateFrequency = (frequency: string): string => {
    const frequencyMap: { [key: string]: string } = {
      'monthly': 'Mensual',
      'quarterly': 'Trimestral',
      'semiannual': 'Semestral',
      'annual': 'Anual'
    };
    return frequencyMap[frequency?.toLowerCase()] || frequency || 'No especificada';
  };

  const translateCalculationMethod = (method: string): string => {
    const methodMap: { [key: string]: string } = {
      'percentage': 'Porcentaje',
      'rate_per_1000': 'Tasa por 1000',
      'rate_per_10000': 'Tasa por 10000',
      'average': 'Promedio',
      'ratio': 'Razón'
    };
    return methodMap[method?.toLowerCase()] || method || 'No especificado';
  };
  
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
  
  // ✅ LÓGICA MEJORADA: Calcular cumplimiento basado en el trend del indicador
  // Para indicadores INCREASING: cumplimiento >= 100% significa que actual >= meta (CUMPLE)
  // Para indicadores DECREASING: cumplimiento <= 100% significa que actual <= meta (CUMPLE)
  
  const isDecreasing = indicatorTrend === 'decreasing' || indicatorTrend === 'descendente';
  
  // Calcular cumplimiento como DISTANCIA A LA META (siempre positivo y significativo)
  let cumplimiento: string;
  let cumple: boolean;
  
  if (isDecreasing) {
    // Para DECREASING (ej: Tasa de caída): queremos que baje
    // Si actual < meta: Cumple (100% = meta, menos es mejor)
    // Fórmula: (meta / actual) * 100 - muestra cuánto más bajo estamos
    cumple = currentValue <= target;
    cumplimiento = currentValue > 0 
      ? ((target / currentValue) * 100).toFixed(1) 
      : '0';
  } else {
    // Para INCREASING (ej: Satisfacción): queremos que suba
    // Si actual >= meta: Cumple (100% = meta, más es mejor)
    // Fórmula: (actual / meta) * 100 - muestra cuánto hemos logrado
    cumple = currentValue >= target;
    cumplimiento = target > 0 
      ? ((currentValue / target) * 100).toFixed(1) 
      : '0';
  }
  
  // Calcular trend visual basado en dirección del cambio vs objetivo
  let trendVisual: 'up' | 'down';
  if (previousResult?.calculatedValue !== undefined && previousResult?.calculatedValue !== null) {
    const previousValue = parseFloat(previousResult.calculatedValue);
    
    if (isDecreasing) {
      // Para DECREASING: mejora = ir hacia ABAJO (disminuir)
      // Si actual < anterior: Mejora (está disminuyendo hacia la meta)
      trendVisual = currentValue < previousValue ? 'down' : 'up';
    } else {
      // Para INCREASING: mejora = ir hacia ARRIBA (aumentar)
      // Si actual > anterior: Mejora (está aumentando hacia la meta)
      trendVisual = currentValue > previousValue ? 'up' : 'down';
    }
  } else {
    // Sin dato anterior: asumir que cumple = mejora
    trendVisual = cumple ? 'up' : 'down';
  }

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
            {/* Tarjetas de resumen - MEJORADO: Mostrar período, resultado, cumplimiento, estado */}
            {currentResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Período del Resultado */}
                <div className="p-3 sm:p-4 rounded-lg border-2 bg-purple-50 dark:bg-purple-900/20 border-purple-500">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Período</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-400 mt-2">
                    {selectedResultPeriodo}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(currentResult.creationDate).toLocaleDateString('es-CO')}
                  </p>
                </div>

                {/* Estado Actual */}
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

                {/* Resultado */}
                <div className="p-3 sm:p-4 rounded-lg border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-500">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Resultado</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2 break-words">
                    {currentValue?.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {indicator.measurementUnit || indicatorData?.measurementUnit || 'Sin unidad'}
                  </p>
                </div>

                {/* Cumplimiento */}
                <div className="p-3 sm:p-4 rounded-lg border-2 bg-green-50 dark:bg-green-900/20 border-green-500">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cumplimiento</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
                    {cumplimiento}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    vs {target?.toFixed(2)}
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

            {/* Información detallada - 2 columnas mejorado (Indicador + Resultado Específico) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Detallada del Indicador */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  📋 Información del Indicador
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Código:</strong> <span className="text-gray-600 dark:text-gray-400 font-mono">{indicator.indicatorCode ?? indicatorData?.code ?? '-'}</span></p>
                  <p><strong>Descripción:</strong> <span className="text-gray-600 dark:text-gray-400 block text-xs leading-relaxed">{indicator?.description ?? indicator?.indicator?.description ?? indicatorData?.description ?? 'No disponible'}</span></p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase mb-2">Componentes del Indicador (Definiciones)</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-700 dark:text-gray-300"><strong>📊 Numerador:</strong></p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 ml-2 mt-1 p-1 bg-white dark:bg-gray-800 rounded italic">{indicator?.numeratorDefinition ?? indicator?.indicator?.numeratorDefinition ?? indicatorData?.numeratorDefinition ?? 'No definido'}</p>
                        {(indicator?.numeratorDescription || indicator?.indicator?.numeratorDescription || indicatorData?.numeratorDescription) && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 ml-2 mt-1 border-l-2 border-blue-300 pl-2">Descripción: {indicator?.numeratorDescription ?? indicator?.indicator?.numeratorDescription ?? indicatorData?.numeratorDescription}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-700 dark:text-gray-300"><strong>📉 Denominador:</strong></p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 ml-2 mt-1 p-1 bg-white dark:bg-gray-800 rounded italic">{indicator?.denominatorDefinition ?? indicator?.indicator?.denominatorDefinition ?? indicatorData?.denominatorDefinition ?? 'No definido'}</p>
                        {(indicator?.denominatorDescription || indicator?.indicator?.denominatorDescription || indicatorData?.denominatorDescription) && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 ml-2 mt-1 border-l-2 border-green-300 pl-2">Descripción: {indicator?.denominatorDescription ?? indicator?.indicator?.denominatorDescription ?? indicatorData?.denominatorDescription}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <p><strong>Unidad de Medida:</strong> <span className="text-gray-600 dark:text-gray-400">{indicator.measurementUnit ?? indicatorData?.measurementUnit ?? 'Sin especificar'}</span></p>
                  <p><strong>Frecuencia de Medición:</strong> <span className="text-gray-600 dark:text-gray-400">{translateFrequency(indicator.measurementFrequency ?? indicatorData?.measurementFrequency ?? '')}</span></p>
                  <p><strong>Sede:</strong> <span className="text-gray-600 dark:text-gray-400">{indicator.headquarterName ?? currentResult?.headquarterName ?? '-'}</span></p>
                </div>
              </div>

              {/* Fórmula y Cálculo del Indicador */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  🔧 Fórmula de Cálculo
                </h4>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <strong className="text-gray-800 dark:text-gray-200">Método de Cálculo:</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded font-semibold text-blue-600 dark:text-blue-400">
                      {translateCalculationMethod(indicator.calculationMethod ?? indicator.indicator?.calculationMethod ?? indicatorData?.calculationMethod ?? '')}
                    </p>
                  </div>
                  <div>
                    <strong className="text-gray-800 dark:text-gray-200">Fórmula de Aplicación:</strong>
                    <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded space-y-3 border border-blue-200 dark:border-blue-600/30">
                      {/* Numerador del resultado actual */}
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-blue-500">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">📊 Numerador</p>
                          {/*<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{indicator?.numeratorDefinition ?? indicator?.indicator?.numeratorDefinition ?? indicatorData?.numeratorDefinition ?? 'No especificado'}</p>*/}
                        </div>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{currentResult?.numerator ?? '-'}</p>
                      </div>
                      
                      {/* Denominador del resultado actual */}
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-green-500">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">📉 Denominador</p>
                          {/*<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{indicator?.denominatorDefinition ?? indicator?.indicator?.denominatorDefinition ?? indicatorData?.denominatorDefinition ?? 'No especificado'}</p>*/}
                        </div>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{currentResult?.denominator ?? '-'}</p>
                      </div>
                      
                      {/* Resultado */}
                      <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">📈 Resultado Final</p>
                        <p className="text-center text-sm font-mono text-gray-700 dark:text-gray-300">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{currentResult?.numerator}</span> ÷ 
                          <span className="text-green-600 dark:text-green-400 font-bold ml-1">{currentResult?.denominator}</span> = 
                          <span className="text-purple-600 dark:text-purple-400 font-bold text-lg ml-1">{currentValue?.toFixed(4)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Auditoría - Compacta */}
            {currentResult && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Creado:</strong> {currentResult?.creationDate ? new Date(currentResult.creationDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'} | 
                  <strong className="ml-3">Período:</strong> {selectedResultPeriodo} | 
                  <strong className="ml-3">Total Períodos:</strong> {resultsForThisIndicator.length}
                </p>
              </div>
            )}

            {/* Análisis Estadístico - Mejorado sin redundancia */}
            {currentResult && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-purple-600/30">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">📊 Análisis Estadístico del Resultado</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {/* Valor del Resultado */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Valor</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{currentValue?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{indicator.measurementUnit || '-'}</p>
                  </div>
                  
                  {/* Meta */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Meta</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{target?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{indicator.measurementUnit || '-'}</p>
                  </div>
                  
                  {/* Diferencia */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Diferencia</p>
                    <p className={`text-2xl font-bold mt-1 ${(currentValue - target) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {(currentValue - target) >= 0 ? '+' : ''}{(currentValue - target).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(currentValue - target) >= 0 ? 'Sobre' : 'Bajo'} meta</p>
                  </div>
                  
                  {/* Cumplimiento Porcentaje */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">% Cumpl.</p>
                    <p className={`text-2xl font-bold mt-1 ${parseFloat(cumplimiento) >= 100 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {cumplimiento}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{parseFloat(cumplimiento) >= 100 ? 'Cumple' : 'Incumple'}</p>
                  </div>
                  
                  {/* Tendencia */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Tendencia</p>
                    <div className="flex items-center justify-center mt-2">
                      {trendVisual === 'up' ? (
                        <div className="flex flex-col items-center">
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">Mejora</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                          <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">Declina</p>
                        </div>
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
