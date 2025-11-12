import React, { useMemo, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

// 🆕 Funciones de transformación para mostrar valores en español
const transformMonthToSpanish = (month: string | number): string => {
    const monthMap: { [key: string]: string } = {
        'january': 'Enero', '1': 'Enero',
        'february': 'Febrero', '2': 'Febrero',
        'march': 'Marzo', '3': 'Marzo',
        'april': 'Abril', '4': 'Abril',
        'may': 'Mayo', '5': 'Mayo',
        'june': 'Junio', '6': 'Junio',
        'july': 'Julio', '7': 'Julio',
        'august': 'Agosto', '8': 'Agosto',
        'september': 'Septiembre', '9': 'Septiembre',
        'october': 'Octubre', '10': 'Octubre',
        'november': 'Noviembre', '11': 'Noviembre',
        'december': 'Diciembre', '12': 'Diciembre',
    };
    
    const normalized = String(month).toLowerCase().trim();
    return monthMap[normalized] || String(month);
};

const transformPeriodToSpanish = (period: string): string => {
    const periodMap: { [key: string]: string } = {
        'q1': 'Q1 - Primer Trimestre',
        'q2': 'Q2 - Segundo Trimestre',
        'q3': 'Q3 - Tercer Trimestre',
        'q4': 'Q4 - Cuarto Trimestre',
        'quarter1': 'Primer Trimestre',
        'quarter2': 'Segundo Trimestre',
        'quarter3': 'Tercer Trimestre',
        'quarter4': 'Cuarto Trimestre',
        's1': 'S1 - Primer Semestre',
        's2': 'S2 - Segundo Semestre',
        'semester1': 'Primer Semestre',
        'semester2': 'Segundo Semestre',
        'h1': 'H1 - Primer Semestre',
        'h2': 'H2 - Segundo Semestre',
    };
    
    const normalized = String(period).toLowerCase().trim();
    return periodMap[normalized] || period;
};

const transformFrequencyToSpanish = (frequency: string): string => {
    const frequencyMap: { [key: string]: string } = {
        'monthly': 'Mensual',
        'mensual': 'Mensual',
        'quarterly': 'Trimestral',
        'trimestral': 'Trimestral',
        'semesterly': 'Semestral',
        'semester': 'Semestral',
        'semestral': 'Semestral',
        'annual': 'Anual',
        'annually': 'Anual',
        'yearly': 'Anual',
        'anual': 'Anual',
        'weekly': 'Semanal',
        'semanal': 'Semanal',
        'daily': 'Diario',
        'diario': 'Diario',
    };
    
    const normalized = String(frequency).toLowerCase().trim();
    return frequencyMap[normalized] || frequency;
};

interface Props {
  data: any[];
  loading: boolean;
}

function formatLabel(item: any) {
  switch (item.measurementFrequency?.toLowerCase()) {
    case "monthly":
      const month = transformMonthToSpanish(item.month);
      return `${month} ${item.year}`;
    case "quarterly":
      const quarter = transformPeriodToSpanish(`Q${item.quarter}`);
      return `${quarter} ${item.year}`;
    case "semesterly":
    case "semester":
      const semester = transformPeriodToSpanish(`S${item.semester}`);
      return `${semester} ${item.year}`;
    case "annually":
    case "annual":
      return `${item.year}`;
    default:
      return `${item.year}`;
  }
}

export default function TimeSeriesChart({ data, loading }: Props) {
  if (loading) return <p className="text-center text-gray-600 dark:text-gray-300">Cargando gráfico temporal...</p>;
  if (data.length === 0) return <p className="text-center text-gray-600 dark:text-gray-300">No hay datos para mostrar con los filtros seleccionados.</p>;

  // 🆕 Detectar dark mode para ajustar colores de ejes
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Detectar dark mode desde la clase 'dark' en el documento
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Escuchar cambios de dark mode
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // 🆕 Colores adaptativos para dark mode
  const chartColors = {
    axisText: isDarkMode ? '#9ca3af' : '#666',
    axisLine: isDarkMode ? '#4b5563' : '#ddd',
    gridStroke: isDarkMode ? '#2d3748' : '#e5e7eb',
    tooltipBg: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  };

  const chartData = useMemo(() => {
    return data
      .map((item, idx) => ({
        // 🔑 Clave única para cada punto
        id: `${formatLabel(item)}-${item.headquarters?.name || 'N/A'}-${idx}`,
        label: formatLabel(item),
        resultado: Number(item.calculatedValue ?? item.calculated_value ?? item.value ?? 0),
        meta: Number(item.target ?? 0),
        // 🆕 Información adicional para el tooltip
        frequency: transformFrequencyToSpanish(item.measurementFrequency || 'N/A'),
        month: item.month ? transformMonthToSpanish(item.month) : 'N/A',
        quarter: item.quarter ? transformPeriodToSpanish(`Q${item.quarter}`) : 'N/A',
        semester: item.semester ? transformPeriodToSpanish(`S${item.semester}`) : 'N/A',
        year: item.year || new Date().getFullYear(),
        // 🔑 Campos para ordenamiento cronológico
        sortYear: item.year || new Date().getFullYear(),
        sortMonth: item.month || 1,
        sortQuarter: item.quarter || 1,
        sortSemester: item.semester || 1,
        headquarters: item.headquarters?.name || item.headquarterName || 'Sin sede',
        indicator: item.indicator?.name || item.indicatorName || 'Sin indicador',
        unit: item.measurementUnit || item.measurement_unit || 'N/A',
        // Raw data para debugging
        rawItem: item
      }))
      .sort((a, b) => {
        // 🆕 ORDENAMIENTO CRONOLÓGICO: Primero por año (antiguo a reciente), luego por mes/trimestre/semestre
        
        // Comparar años
        if (a.sortYear !== b.sortYear) {
          return a.sortYear - b.sortYear; // De antiguo a reciente
        }
        
        // Si el año es el mismo, ordenar por frecuencia
        const frequencyA = a.frequency.toLowerCase();
        const frequencyB = b.frequency.toLowerCase();
        
        // Si es mensual, ordenar por mes
        if (frequencyA.includes('mensual') && frequencyB.includes('mensual')) {
          return a.sortMonth - b.sortMonth;
        }
        
        // Si es trimestral, ordenar por trimestre
        if (frequencyA.includes('trimestral') && frequencyB.includes('trimestral')) {
          return a.sortQuarter - b.sortQuarter;
        }
        
        // Si es semestral, ordenar por semestre
        if (frequencyA.includes('semestral') && frequencyB.includes('semestral')) {
          return a.sortSemester - b.sortSemester;
        }
        
        // Mantener el orden original si tipos diferentes
        return 0;
      });
  }, [data]);

  // 🆕 CustomTooltip mejorado con información completa
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const dataPoint = payload[0]?.payload;
      
      if (!dataPoint) return null;

      const resultado = dataPoint.resultado || 0;
      const meta = dataPoint.meta || 0;
      const difference = (resultado - meta).toFixed(2);
      const percentage = meta !== 0 ? ((resultado / meta) * 100).toFixed(1) : 0;
      const isCompliant = resultado >= meta;

      return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-blue-500 shadow-xl max-w-sm">
          {/* Encabezado */}
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-300 dark:border-gray-600 pb-2">
            📍 {dataPoint.indicator}
          </p>
          
          {/* Período */}
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            📅 Período: <span className="font-bold">{dataPoint.label}</span>
          </p>
          
          {/* Valores principales */}
          <div className="space-y-1 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              📊 Resultado: 
              <span className="ml-1 font-bold text-sm">{resultado.toFixed(2)}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">{dataPoint.unit}</span>
            </p>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">
              🎯 Meta: 
              <span className="ml-1 font-bold text-sm">{meta.toFixed(2)}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">{dataPoint.unit}</span>
            </p>
            
            {/* Diferencia y cumplimiento */}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-xs font-semibold ${isCompliant ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {isCompliant ? '✅ Cumple' : '❌ No cumple'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Diferencia: <span className="font-semibold">{difference}</span> ({percentage}%)
              </p>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">🏢 Sede:</span> {dataPoint.headquarters}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">⏱️ Frecuencia:</span> {dataPoint.frequency}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-gray-800 dark:via-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            📈 Evolución temporal del indicador
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Análisis de tendencias a lo largo del tiempo
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorResultado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#1e40af" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#065f46" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 11, fill: chartColors.axisText }}
            axisLine={{ stroke: chartColors.axisLine }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: chartColors.axisText }}
            axisLine={{ stroke: chartColors.axisLine }}
            label={{ value: 'Valor', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
            formatter={(value) => {
              if (value === 'resultado') {
                return <span style={{ color: '#3b82f6' }}>📊 Resultado</span>;
              }
              return <span style={{ color: '#10b981' }}>🎯 Meta</span>;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="resultado" 
            stroke="url(#colorResultado)" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
            name="resultado"
          />
          <Line 
            type="monotone" 
            dataKey="meta" 
            stroke="url(#colorMeta)" 
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="meta"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 px-4 py-3 bg-blue-50 dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-600">
        <p className="text-xs text-gray-700 dark:text-gray-300">
          <span className="font-semibold">💡 Tip:</span> La línea azul muestra el desempeño actual. La línea verde punteada muestra la meta. 
          Total de <span className="font-bold">{chartData.length}</span> períodos registrados.
        </p>
      </div>
    </div>
  );
}
