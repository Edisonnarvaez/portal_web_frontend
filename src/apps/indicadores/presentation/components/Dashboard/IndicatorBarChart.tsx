// src/apps/indicadores/presentation/components/Dashboard/IndicatorBarChart.tsx
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { getIndicatorField, getHeadquarterField, safeNumber } from '../../utils/dataHelpers';

// 🆕 Funciones de transformación para mostrar valores en español
const transformMonthToSpanish = (month: string | number): string => {
    const monthMap: { [key: string]: string } = {
        'january': 'Enero', 'january': 'Enero', '1': 'Enero', 'january': 'Enero',
        'february': 'Febrero', 'feb': 'Febrero', '2': 'Febrero',
        'march': 'Marzo', 'mar': 'Marzo', '3': 'Marzo',
        'april': 'Abril', 'apr': 'Abril', '4': 'Abril',
        'may': 'Mayo', '5': 'Mayo',
        'june': 'Junio', 'jun': 'Junio', '6': 'Junio',
        'july': 'Julio', 'jul': 'Julio', '7': 'Julio',
        'august': 'Agosto', 'aug': 'Agosto', '8': 'Agosto',
        'september': 'Septiembre', 'sep': 'Septiembre', 'sept': 'Septiembre', '9': 'Septiembre',
        'october': 'Octubre', 'oct': 'Octubre', '10': 'Octubre',
        'november': 'Noviembre', 'nov': 'Noviembre', '11': 'Noviembre',
        'december': 'Diciembre', 'dec': 'Diciembre', '12': 'Diciembre',
    };
    
    const normalized = String(month).toLowerCase().trim();
    return monthMap[normalized] || month;
};

const transformPeriodToSpanish = (period: string): string => {
    const periodMap: { [key: string]: string } = {
        'q1': 'Primer Trimestre',
        'q2': 'Segundo Trimestre',
        'q3': 'Tercer Trimestre',
        'q4': 'Cuarto Trimestre',
        '1': 'Primer Trimestre',
        '2': 'Segundo Trimestre',
        '3': 'Tercer Trimestre',
        '4': 'Cuarto Trimestre',
        'quarter1': 'Primer Trimestre',
        'quarter2': 'Segundo Trimestre',
        'quarter3': 'Tercer Trimestre',
        'quarter4': 'Cuarto Trimestre',
        'first quarter': 'Primer Trimestre',
        'second quarter': 'Segundo Trimestre',
        'third quarter': 'Tercer Trimestre',
        'fourth quarter': 'Cuarto Trimestre',
        'semestre1': 'Primer Semestre',
        'semestre2': 'Segundo Semestre',
        'semester1': 'Primer Semestre',
        'semester2': 'Segundo Semestre',
        'h1': 'Primer Semestre',
        'h2': 'Segundo Semestre',
    };
    
    const normalized = String(period).toLowerCase().trim();
    return periodMap[normalized] || period;
};

const transformTrendToSpanish = (trend: string): string => {
    const trendMap: { [key: string]: string } = {
        'increasing': 'Creciente ↑',
        'creciente': 'Creciente ↑',
        'ascending': 'Creciente ↑',
        'up': 'Creciente ↑',
        'decreasing': 'Decreciente ↓',
        'decreciente': 'Decreciente ↓',
        'descending': 'Decreciente ↓',
        'down': 'Decreciente ↓',
        'stable': 'Estable →',
        'estable': 'Estable →',
        'constant': 'Estable →',
    };
    
    const normalized = String(trend).toLowerCase().trim();
    return trendMap[normalized] || trend;
};

const transformFrequencyToSpanish = (frequency: string): string => {
    const frequencyMap: { [key: string]: string } = {
        'monthly': 'Mensual',
        'monthly': 'Mensual',
        'mensual': 'Mensual',
        'quarterly': 'Trimestral',
        'quarterly': 'Trimestral',
        'trimestral': 'Trimestral',
        'annual': 'Anual',
        'yearly': 'Anual',
        'anual': 'Anual',
        'weekly': 'Semanal',
        'semanal': 'Semanal',
        'daily': 'Diario',
        'diario': 'Diario',
        'semestral': 'Semestral',
        'half-yearly': 'Semestral',
    };
    
    const normalized = String(frequency).toLowerCase().trim();
    return frequencyMap[normalized] || frequency;
};

interface Props {
    data: any[];
    loading: boolean;
}

export default function IndicatorBarChart({ data, loading }: Props) {
    if (loading) return <p className="text-center text-gray-600 dark:text-gray-300">Cargando datos...</p>;
    if (data.length === 0) return <p className="text-center text-gray-600 dark:text-gray-300">No hay datos para mostrar con los filtros seleccionados.</p>;

    // 🆕 Función para calcular cumplimiento basado en tendencia
    const calculateCompliance = (resultado: number, meta: number, trend: string | null | undefined) => {
        // Normalizar la tendencia
        const normalizedTrend = (trend || '').toString().toLowerCase().trim();
        
        // Si tendencia es CRECIENTE: resultado debe ser >= meta
        if (normalizedTrend === 'creciente' || normalizedTrend === 'increasing' || normalizedTrend === 'ascendente') {
            return resultado >= meta ? { status: '✅ Cumple', cumple: true } : { status: '❌ No cumple', cumple: false };
        }
        
        // Si tendencia es DECRECIENTE: resultado debe ser <= meta
        if (normalizedTrend === 'decreciente' || normalizedTrend === 'decreasing' || normalizedTrend === 'descendente') {
            return resultado <= meta ? { status: '✅ Cumple', cumple: true } : { status: '❌ No cumple', cumple: false };
        }
        
        // Si no hay tendencia explícita, asumir creciente (más común)
        return resultado >= meta ? { status: '✅ Cumple', cumple: true } : { status: '❌ No cumple', cumple: false };
    };

    // 🔑 NUEVA SOLUCIÓN: Crear un mapeo directo de rawData para búsquedas más confiables en el tooltip
    // Cada item en data original se mapea a su label de gráfico para búsqueda rápida
    // ❌ REMOVIDO: Ya no necesitamos rawDataByLabel porque Recharts envía todos los datos en payload[0].payload


    const allChartData = useMemo(() => {
        return data.map((item, idx) => {
            // Sede: intenta obtener del objeto headquarters, luego del campo directo
            const sede = getHeadquarterField(item, 'name', item.headquarterName || 'Sin sede');
            
            // Indicador: preferir código, luego id, luego nombre
            const indicatorCode = getIndicatorField(item, 'code', '') || getIndicatorField(item, 'indicatorCode', '');
            const indicatorId = getIndicatorField(item, 'id', '') || item.indicator_id || item.indicator || '';
            const indicatorName = getIndicatorField(item, 'name', '') || getIndicatorField(item, 'indicatorName', '');
            
            // Label: código > id > nombre > fallback
            const indicadorLabel = indicatorCode 
                ? indicatorCode.toString() 
                : (indicatorId ? `ID:${indicatorId}` : (indicatorName || 'Sin nombre'));

            // Valores numéricos con DEBUG detallado
            const calculatedValue = item.calculatedValue ?? item.calculated_value ?? item.value ?? null;
            const targetValue = getIndicatorField(item, 'target', item.target ?? 0);
            
            const resultado = safeNumber(calculatedValue);
            const meta = safeNumber(targetValue);
            
            // 🆕 Obtener tendencia y calcular cumplimiento correcto
            const trend = String(item.trend ?? getIndicatorField(item, 'trend', '') ?? '').toLowerCase();
            const { status: complianceStatus, cumple } = calculateCompliance(resultado, meta, trend);
            
            // DEBUG: Log solo de la primera fila que tenga valor 10
            if (resultado === 10 && idx < 1) {
                console.warn('⚠️ IndicatorBarChart [Item 0]:', {
                    sede,
                    indicadorLabel,
                    resultado,
                    meta,
                    calculatedValue: `${item.calculatedValue} | ${item.calculated_value} | ${item.value}`,
                    targetValue,
                    periodo: item.period || item.resultado_periodo,
                    raw: { ...item }
                });
            }
            
            // Validar que resultado y target sean números válidos
            if (!Number.isFinite(resultado) || !Number.isFinite(meta)) {
                return null; // Filtrar registros inválidos
            }

            // 🔑 SOLUCIÓN: Hacer la clave ÚNICA agregando mes/período para que cada barra sea independiente
            const mes = item.month || item.mes || item.monthName || 'N/A';
            const periodo = item.period || item.resultado_periodo || item.periodo || item.quarter || 'N/A';
            const año = item.year || item.ano || new Date().getFullYear();
            
            // Crear ID único para cada registro (para grouping en Recharts)
            const uniqueId = `${sede}|${indicadorLabel}|${periodo}|${mes}|${año}|${idx}`;

            return {
                // 🔑 Usar uniqueId como key en Recharts para evitar agrupaciones
                sede: uniqueId,
                // 🔑 Guardar los datos "limpios" para mostrar en el gráfico
                sedeDisplay: sede,
                indicadorDisplay: indicadorLabel,
                resultado,
                meta,
                trend: String(item.trend ?? getIndicatorField(item, 'trend', '') ?? '').toLowerCase(),
                compliant: typeof item.compliant === 'boolean' ? item.compliant : undefined,
                // Información adicional para el tooltip
                mes: mes,
                periodo: periodo,
                año: año,
                headquarters: sede,
                indicator: indicatorName || indicadorLabel,
                unit: item.measurementUnit || item.measurement_unit || 'N/A',
                frequency: item.measurementFrequency || item.measurement_frequency || 'N/A',
                // 🆕 Cumplimiento basado en tendencia
                cumplimiento: complianceStatus,
                cumple: cumple,
                // Tendencia explícita para debugging
                tendencia: trend || 'No especificada'
            };
        }).filter(Boolean); // Eliminar nulos del mapeo
    }, [data]);

    // DEBUG: Mostrar datos procesados con cumplimiento basado en tendencia
    if (data.length > 0 && allChartData.length > 0) {
        console.log('📊 IndicatorBarChart - Datos Originales (primeros 3):', {
            valores: data.slice(0, 3).map(d => ({
                resultado: (d as any).calculatedValue ?? (d as any).calculated_value ?? (d as any).value,
                meta: (d as any).target,
                periodo: (d as any).period,
                tendencia: (d as any).trend
            }))
        });
        console.log('📊 AllChartData Procesado (primeros 5) - CON CUMPLIMIENTO BASADO EN TENDENCIA:', allChartData.slice(0, 5).map(d => ({
            resultado: d.resultado,
            meta: d.meta,
            cumplimiento: d.cumplimiento,
            cumple: d.cumple,
            tendencia: d.tendencia,
            regla: d.tendencia === 'creciente' ? 'resultado >= meta' : d.tendencia === 'decreciente' ? 'resultado <= meta' : 'no especificada'
        })));
    }
    // ✅ Usar directamente allChartData sin paginación
    const chartData = allChartData;

    // DEBUG: Verificar que chartData se actualiza con los filtros
    console.log('🔄 IndicatorBarChart - ChartData recalculado:', {
        totalItems: chartData.length,
        primeraBarraLabel: chartData[0]?.sede || 'N/A',
        primeraBarraResultado: chartData[0]?.resultado || 'N/A',
        primeraBarraMeta: chartData[0]?.meta || 'N/A',
        timestamp: new Date().toLocaleTimeString()
    });

    // 🆕 DEBUG: Mostrar los PRIMEROS 10 items para ver si hay duplicados o agrupaciones
    console.log('📊 PRIMEROS 10 ITEMS DE CHARTDATA:', chartData.slice(0, 10).map((item, idx) => ({
        idx,
        sede: item.sede,
        resultado: item.resultado,
        meta: item.meta,
        mes: item.mes,
        periodo: item.periodo
    })));

    // Calcular altura dinámica del gráfico según cantidad de barras
    const chartHeight = Math.max(300, 280 + (chartData.length * 15));
    
    // 🔑 Generar key única para forza a Recharts a rerender completamente cuando cambian los datos
    // Esto es importante para que el tooltip se sincronice con los datos nuevos al filtrar
    const chartKey = `chart-${chartData.length}-${chartData[0]?.sede || 'empty'}`;
    
    console.log('🔑 ChartKey:', chartKey);

    // Componente personalizado del Tooltip con información detallada
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length > 0) {
            // ✅ SOLUCIÓN CORRECTA: Usar payload[0].payload que YA TIENE TODOS LOS DATOS PROCESADOS
            // Recharts envía en payload el objeto COMPLETO de chartData que transformamos arriba
            const chartItem = payload[0]?.payload;
            
            if (!chartItem) {
                console.warn('⚠️ CustomTooltip: payload.payload es null/undefined');
                return null;
            }

            // DEBUG: Mostrar qué datos recibimos de Recharts
            console.log('🔍 CustomTooltip - Datos de Recharts (payload[0].payload):', {
                sede: chartItem.sede,
                resultado: chartItem.resultado,
                meta: chartItem.meta,
                mes: chartItem.mes,
                periodo: chartItem.periodo,
                año: chartItem.año,
                cumplimiento: chartItem.cumplimiento,
                tendencia: chartItem.tendencia
            });

            // Los datos ya están procesados en allChartData, solo extraer directamente
            const resultado = chartItem.resultado || 0;
            const meta = chartItem.meta || 0;
            const sede = chartItem.headquarters || 'N/A';
            const indicatorName = chartItem.indicator || 'Sin indicador';
            const unit = chartItem.unit || 'N/A';
            const año = chartItem.año || new Date().getFullYear();
            const complianceStatus = chartItem.cumplimiento || '❌ No especificado';
            
            // 🆕 Aplicar transformaciones para mostrar en español
            const frequency = transformFrequencyToSpanish(chartItem.frequency || 'N/A');
            const mesSpanish = transformMonthToSpanish(chartItem.mes || 'N/A');
            const periodoSpanish = transformPeriodToSpanish(chartItem.periodo || 'N/A');
            const trend = transformTrendToSpanish(chartItem.tendencia || chartItem.trend || 'no especificada');

            return (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-blue-500 shadow-xl max-w-xs">
                    {/* Encabezado con indicador */}
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-300 dark:border-gray-600 pb-2">
                        📍 {indicatorName}
                    </p>
                    
                    {/* Valores principales */}
                    <div className="space-y-1 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                            📊 Resultado: 
                            <span className="ml-1 font-bold text-sm">{typeof resultado === 'number' ? resultado.toFixed(2) : 'N/A'}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">{unit}</span>
                        </p>
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                            🎯 Meta: 
                            <span className="ml-1 font-bold text-sm">{typeof meta === 'number' ? meta.toFixed(2) : 'N/A'}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">{unit}</span>
                        </p>
                        
                        {/* Estado de cumplimiento con tendencia */}
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">
                            <span>Estado: </span>
                            <span className="font-bold">{complianceStatus}</span>
                        </p>
                        
                        {/* Tendencia del indicador */}
                        {trend && trend !== 'no especificada' && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                📈 Tendencia: <span className="font-semibold capitalize">{trend}</span>
                            </p>
                        )}
                    </div>
                    
                    {/* Información adicional - INCLUYENDO MES */}
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        {/* Mes si está disponible */}
                        {mesSpanish && mesSpanish !== 'N/A' && (
                            <p><span className="font-semibold text-gray-700 dark:text-gray-300">📅 Mes:</span> {mesSpanish}</p>
                        )}
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">📋 Período:</span> {periodoSpanish}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">📆 Año:</span> {año}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">🏢 Sede:</span> {sede}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">⏱️ Frecuencia:</span> {frequency}</p>
                        
                        {/* Información de cumplimiento basada en tendencia */}
                        {trend && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-600 mt-1">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">💡 Regla:</span> {
                                    trend.toLowerCase().includes('creciente') 
                                        ? 'Debe crecer (resultado ≥ meta)' 
                                        : trend.toLowerCase().includes('decreciente') 
                                        ? 'Debe decrecer (resultado ≤ meta)'
                                        : 'Tendencia no especificada'
                                }
                            </p>
                        )}
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
                        Comparación de resultados vs metas
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Análisis de desempeño por sede e indicador
                    </p>
                </div>
            </div>
            
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart 
                    key={chartKey}
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
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
                    <XAxis 
                        dataKey="sede" 
                        tick={{ fontSize: 10, fill: '#666' }}
                        axisLine={{ stroke: '#ddd' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tickFormatter={(value) => {
                            // value es como "Sede A|Indicador 1|Q1|Enero|2025|0"
                            // Extrae: "Sede A - Indicador 1 - Enero"
                            const parts = value.split('|');
                            if (parts.length >= 4) {
                                return `${parts[0]} - ${parts[1]}`;
                            }
                            return value;
                        }}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: '#666' }}
                        axisLine={{ stroke: '#ddd' }}
                        label={{ value: 'Valor', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="square"
                        formatter={(value) => value === 'resultado' ? '📊 Resultado' : '🎯 Meta'}
                    />
                    <Bar 
                        dataKey="resultado" 
                        fill="url(#colorResultado)" 
                        name="resultado"
                        radius={[8, 8, 0, 0]}
                        animationDuration={800}
                    />
                    <Bar 
                        dataKey="meta" 
                        fill="url(#colorMeta)" 
                        name="meta"
                        radius={[8, 8, 0, 0]}
                        animationDuration={800}
                    />
                </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 px-4 py-3 bg-blue-50 dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-600">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">💡 Tip:</span> Los resultados en azul representan el desempeño actual. La meta en verde muestra el objetivo. 
                    Datos superiores a la meta indican cumplimiento. Se muestran <span className="font-bold">{allChartData.length}</span> registros en total.
                </p>
            </div>
        </div>
    );
}
