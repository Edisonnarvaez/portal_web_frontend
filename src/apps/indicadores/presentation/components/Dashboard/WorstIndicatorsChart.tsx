import { useMemo, useState, useEffect } from "react";
import { safeNumber, getIndicatorField } from '../../utils/dataHelpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";

/**
 * Transformar tendencia a español con iconos
 */
function transformTrendToSpanish(trend: string): string {
  const trendMap: Record<string, string> = {
    'increasing': 'Creciente ↑',
    'decreasing': 'Decreciente ↓',
    'stable': 'Estable →',
  };
  return trendMap[String(trend).toLowerCase()] || String(trend);
}

/**
 * Transformar frecuencia a español
 */
function transformFrequencyToSpanish(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    'monthly': 'Mensual',
    'quarterly': 'Trimestral',
    'semestral': 'Semestral',
    'annual': 'Anual',
  };
  return frequencyMap[String(frequency).toLowerCase()] || String(frequency);
}

// CustomTooltip removido - ahora inline en el Tooltip prop

interface Props {
  data: any[];
  loading: boolean;
  top?: number;
}

export default function WorstIndicatorsChart({ data, loading, top = 5 }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar cambios en dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const chartColors = {
    axisText: isDarkMode ? '#9ca3af' : '#666',
    axisLine: isDarkMode ? '#4b5563' : '#ddd',
    tooltipBg: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipText: isDarkMode ? '#f3f4f6' : '#1f2937',
    gridStroke: isDarkMode ? '#374151' : '#e5e7eb',
    barFill: '#ef4444',
    cursorFill: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
  };

  // IMPORTANTE: Los hooks deben estar ANTES de cualquier early return
  const ranked = useMemo(() => {
    console.log('🔍 WorstIndicatorsChart - INICIO useMemo ranked. Data recibida:', {
      length: data.length,
      primero: data[0] ? {
        id: (data[0] as any).id,
        indicatorName: (data[0] as any).indicatorName,
        headquarterName: (data[0] as any).headquarterName,
        calculatedValue: (data[0] as any).calculatedValue,
        target: (data[0] as any).target
      } : null
    });

    const result = data
      .map((item, index) => {
        const calculatedValue = safeNumber(item.calculatedValue ?? item.calculated_value ?? item.value ?? 0);
        const target = safeNumber(item.target ?? getIndicatorField(item, 'target', (item as any).target ?? 0));
        const trend = String(item.trend ?? getIndicatorField(item, 'trend', '') ?? '').toLowerCase();
        const measurementFrequency = item.measurementFrequency ?? item.measurement_frequency ?? getIndicatorField(item, 'measurementFrequency', 'annual');
        const measurementUnit = item.measurementUnit ?? item.measurement_unit ?? getIndicatorField(item, 'measurementUnit', '');

        let diferencia: number;
        if (typeof item.diferencia === 'number' && !isNaN(item.diferencia)) {
          diferencia = item.diferencia;
        } else {
          const direction = trend === 'decreasing' ? -1 : 1;
          diferencia = (calculatedValue - target) * direction;
        }

        // 🔑 Generar un ID único y estable para cada item del ranked
        const uniqueId = `${item.indicatorCode || item.id}-${item.headquarterName || index}`;
        
        // 📅 Obtener información del período para hacer el displayName único
        const monthName = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][(item.month || 1) - 1];
        const periodStr = item.month ? `${monthName}'${String(item.year || 2025).slice(-2)}` : 
                         item.quarter ? `Q${item.quarter}` : 
                         item.semester ? `S${item.semester}` : '';
        
        return {
          ...item,
          id: item.id || index,
          // KEY IMPORTANTE: identificador único para Recharts
          _rechartsKey: uniqueId,
          calculatedValue,
          target,
          diferencia,
          trend,
          measurementFrequency,
          measurementUnit,
          name: item.indicatorName || (item.indicator && item.indicator.name) || item.name || `Indicador ${item.id}`,
          sede: item.headquarterName || (item.headquarters && item.headquarters.name) || item.sede || 'Sin sede',
          // 🔑 CRÍTICO: displayName DEBE SER ÚNICO para que Recharts diferencie las barras
          displayName: `${item.indicatorCode || (item.indicator && item.indicator.code) || item.code || 'IND'} - ${periodStr}` 
        };
      })
      .filter(item => typeof item.diferencia === 'number' && !isNaN(item.diferencia))
      // sort ascending so worst (most negative after direction normalization) come first
      .sort((a, b) => a.diferencia - b.diferencia)
      .slice(0, top)
      // 🔑 CRÍTICO: Agregar index único para cada item en el array final
      .map((item, arrayIndex) => ({
        ...item,
        _arrayIndex: arrayIndex,  // Este es el index en el array FINAL
        _uniqueTooltipKey: `${item._rechartsKey}-${arrayIndex}-${item.calculatedValue}` // key extra para Recharts
      }));

    console.log('🔍 WorstIndicatorsChart - RESULTADO ranked:', {
      length: result.length,
      items: result.map(r => ({
        id: r.id,
        name: r.name,
        sede: r.sede,
        displayName: r.displayName,
        diferencia: r.diferencia,
        _arrayIndex: r._arrayIndex,
        _uniqueTooltipKey: r._uniqueTooltipKey,
        calculatedValue: r.calculatedValue,
        target: r.target,
        trend: r.trend
      }))
    });

    // 🔍 CRÍTICO: Log del ARRAY COMPLETO en JSON
    console.log('🔍 ARRAY COMPLETO RANKED (JSON):', JSON.stringify(result, null, 2));

    return result;
  }, [data, top]);

  // AHORA sí, hacer early returns si es necesario
  if (loading) return <p className="text-center">Cargando ranking...</p>;
  if (!data || data.length === 0) return <p className="text-center">No hay datos para mostrar.</p>;

  if (ranked.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Peores Indicadores
        </h3>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay datos válidos para mostrar el ranking
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Peores Indicadores (Top {top})
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={ranked}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartColors.gridStroke}
          />
          <XAxis 
            dataKey="displayName" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
            tick={{ fill: chartColors.axisText }}
            axisLine={{ stroke: chartColors.axisLine }}
          />
          <YAxis 
            label={{ value: 'Diferencia vs Meta', angle: -90, position: 'insideLeft' }}
            tick={{ fill: chartColors.axisText }}
            axisLine={{ stroke: chartColors.axisLine }}
          />
          <Tooltip 
            content={({ active, payload, label }: any) => {
              if (active && payload && payload.length > 0) {
                const chartItem = payload[0]?.payload;
                
                if (!chartItem) {
                  return null;
                }

                // 🔍 DEBUG: Ver exactamente qué recibimos de Recharts
                console.log('🔍 Tooltip INLINE - Datos del payload:', {
                  label,
                  _arrayIndex: chartItem._arrayIndex,
                  displayName: chartItem.displayName,
                  name: chartItem.name,
                  id: chartItem.id,
                  _rechartsKey: chartItem._rechartsKey,
                  _uniqueTooltipKey: chartItem._uniqueTooltipKey,
                  calculatedValue: chartItem.calculatedValue,
                  target: chartItem.target,
                  diferencia: chartItem.diferencia,
                });

                const resultado = Number(chartItem.calculatedValue || 0);
                const meta = Number(chartItem.target || 0);
                const sede = chartItem.sede || 'Sin sede';
                const indicatorName = chartItem.name || chartItem.indicatorName || 'Sin nombre';
                const diferencia = Number(chartItem.diferencia || 0);
                const trend = chartItem.trend || '';
                const frequency = chartItem.measurementFrequency || '';
                const unit = chartItem.measurementUnit || '';

                return (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">
                      📊 {indicatorName}
                    </p>
                    
                    <div className="space-y-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">📈 Valor actual:</span> {resultado.toFixed(2)} {unit}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">🎯 Meta:</span> {meta.toFixed(2)} {unit}
                      </p>
                      <p className={`text-sm font-semibold ${
                        diferencia < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        📊 Diferencia: {diferencia.toFixed(2)} {unit}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">🏢 Sede:</span> {sede}
                      </p>
                      {trend && (
                        <p>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">📉 Tendencia:</span> {transformTrendToSpanish(trend)}
                        </p>
                      )}
                      {frequency && (
                        <p>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">⏱️ Frecuencia:</span> {transformFrequencyToSpanish(frequency)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
            contentStyle={{
              backgroundColor: chartColors.tooltipBg,
              border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: chartColors.tooltipText,
            }}
            cursor={{ fill: chartColors.cursorFill }}
            wrapperStyle={{ outline: 'none' }}
            isAnimationActive={false}
          />
          <Bar 
            dataKey="diferencia" 
            fill={chartColors.barFill}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            shape={{ ...({} as any) }}
          >
            <LabelList 
              dataKey="diferencia" 
              position="top" 
              formatter={(value: any) => {
                // 🔧 CORREGIR: Validar que value sea un número antes de usar toFixed
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                  return 'N/A';
                }
                return numValue.toFixed(1);
              }}
              style={{ fontSize: '12px', fill: isDarkMode ? '#d1d5db' : '#374151' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}