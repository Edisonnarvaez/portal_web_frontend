// src/apps/indicadores/presentation/components/Dashboard/IndicatorBarChart.tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
    data: any[];
    loading: boolean;
}

export default function IndicatorBarChart({ data, loading }: Props) {
    if (loading) return <p className="text-center">Cargando datos...</p>;
    if (data.length === 0) return <p className="text-center">No hay datos para mostrar con los filtros seleccionados.</p>;

    // 🔧 Función segura para obtener valores
    const safeGetValue = (item: any, field: string, defaultValue: any = 'Sin datos') => {
        if (item[field] !== undefined && item[field] !== null) {
            return item[field];
        }
        
        if (item.indicator && typeof item.indicator === 'object' && item.indicator[field] !== undefined) {
            return item.indicator[field];
        }
        
        if (item.headquarters && typeof item.headquarters === 'object' && item.headquarters[field] !== undefined) {
            return item.headquarters[field];
        }
        
        return defaultValue;
    };

    const safeGetNumber = (value: any, defaultValue: number = 0): number => {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    };

    const chartData = data.map((item, index) => {
        const sede = safeGetValue(item, 'name', 'Sin sede') || safeGetValue(item, 'headquarterName', 'Sin sede');
        const indicador = safeGetValue(item, 'name', 'Sin nombre') || safeGetValue(item, 'indicatorName', 'Sin nombre');
        
        return {
            sede: `${sede} - ${indicador}`,
            resultado: safeGetNumber(item.calculatedValue),
            meta: safeGetNumber(safeGetValue(item, 'target', 0)),
        };
    });

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Comparación de resultados vs metas
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <XAxis 
                        dataKey="sede" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="resultado" fill="#3b82f6" name="Resultado" />
                    <Bar dataKey="meta" fill="#10b981" name="Meta" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
