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
  Legend,
} from "recharts";

/**
 * Transformar mes (número o nombre en inglés) a español
 */
function transformMonthToSpanish(month: string | number): string {
  const monthMap: Record<string | number, string> = {
    '1': 'Enero', 'january': 'Enero', 'jan': 'Enero',
    '2': 'Febrero', 'february': 'Febrero', 'feb': 'Febrero',
    '3': 'Marzo', 'march': 'Marzo', 'mar': 'Marzo',
    '4': 'Abril', 'april': 'Abril', 'apr': 'Abril',
    '5': 'Mayo', 'may': 'Mayo',
    '6': 'Junio', 'june': 'Junio', 'jun': 'Junio',
    '7': 'Julio', 'july': 'Julio', 'jul': 'Julio',
    '8': 'Agosto', 'august': 'Agosto', 'aug': 'Agosto',
    '9': 'Septiembre', 'september': 'Septiembre', 'sep': 'Septiembre',
    '10': 'Octubre', 'october': 'Octubre', 'oct': 'Octubre',
    '11': 'Noviembre', 'november': 'Noviembre', 'nov': 'Noviembre',
    '12': 'Diciembre', 'december': 'Diciembre', 'dec': 'Diciembre',
  };
  return monthMap[String(month).toLowerCase()] || String(month);
}

/**
 * Transformar período (Q1, S1, etc.) a español
 */
function transformPeriodToSpanish(period: string): string {
  const periodMap: Record<string, string> = {
    'q1': 'Primer Trimestre',
    'q2': 'Segundo Trimestre',
    'q3': 'Tercer Trimestre',
    'q4': 'Cuarto Trimestre',
    's1': 'Primer Semestre',
    's2': 'Segundo Semestre',
    'annual': 'Anual',
  };
  return periodMap[String(period).toLowerCase()] || String(period);
}

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

  if (loading) return <p className="text-center">Cargando ranking...</p>;
  if (!data || data.length === 0) return <p className="text-center">No hay datos para mostrar.</p>;

  const ranked = useMemo(() => {
    return data
      .map((item) => {
        const calculatedValue = safeNumber(item.calculatedValue ?? item.calculated_value ?? item.value ?? 0);
        const target = safeNumber(item.target ?? getIndicatorField(item, 'target', (item as any).target ?? 0));
        const trend = String(item.trend ?? getIndicatorField(item, 'trend', '') ?? '').toLowerCase();

        let diferencia: number;
        if (typeof item.diferencia === 'number' && !isNaN(item.diferencia)) {
          diferencia = item.diferencia;
        } else {
          const direction = trend === 'decreasing' ? -1 : 1;
          diferencia = (calculatedValue - target) * direction;
        }

        return {
          ...item,
          calculatedValue,
          target,
          diferencia,
          name: item.indicatorName || (item.indicator && item.indicator.name) || item.name || `Indicador ${item.id}`,
          sede: item.headquarterName || (item.headquarters && item.headquarters.name) || item.sede || 'Sin sede',
          displayName: `${item.indicatorCode || (item.indicator && item.indicator.code) || item.code || 'IND'} - ${item.headquarterName || (item.headquarters && item.headquarters.name) || 'Sin sede'}`
        };
      })
      .filter(item => typeof item.diferencia === 'number' && !isNaN(item.diferencia))
      // sort ascending so worst (most negative after direction normalization) come first
      .sort((a, b) => a.diferencia - b.diferencia)
      .slice(0, top);
  }, [data, top]);

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
            contentStyle={{
              backgroundColor: chartColors.tooltipBg,
              border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: chartColors.tooltipText,
            }}
            formatter={(value: any, name: string) => {
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                return ['N/A', name];
              }
              return [numValue.toFixed(2), name];
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      📊 {data.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🏢 Sede: {data.sede}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📈 Valor actual: {data.calculatedValue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🎯 Meta: {data.target.toFixed(2)}
                    </p>
                    <p className={`text-sm font-medium ${
                      data.diferencia < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      📊 Diferencia: {data.diferencia.toFixed(2)}
                    </p>
                    {data.trend && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📉 Tendencia: {transformTrendToSpanish(data.trend)}
                      </p>
                    )}
                    {data.frequency && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ⏱️ Frecuencia: {transformFrequencyToSpanish(data.frequency)}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="diferencia" 
            fill={chartColors.barFill}
            radius={[4, 4, 0, 0]}
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