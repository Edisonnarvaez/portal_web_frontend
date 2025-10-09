// src/apps/indicadores/presentation/components/Dashboard/IndicatorBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getIndicatorField, getHeadquarterField, safeNumber } from '../../utils/dataHelpers';

interface Props {
    data: any[];
    loading: boolean;
}

export default function IndicatorBarChart({ data, loading }: Props) {
    if (loading) return <p className="text-center">Cargando datos...</p>;
    if (data.length === 0) return <p className="text-center">No hay datos para mostrar con los filtros seleccionados.</p>;

    // use shared helpers



    const chartData = data.map((item) => {
        const sede = getHeadquarterField(item, 'name', getHeadquarterField(item, 'headquarterName', 'Sin sede'));
        const indicador = getIndicatorField(item, 'name', getIndicatorField(item, 'indicatorName', 'Sin nombre'));
        const target = getIndicatorField(item, 'target', (item as any).target ?? 0);

        return {
            sede: `${sede} - ${indicador}`,
            resultado: safeNumber((item as any).calculatedValue),
            meta: safeNumber(target),
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
