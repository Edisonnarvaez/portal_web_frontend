import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useDarkMode } from '../../../../../shared/hooks/useDarkMode';
import type { DocumentsByType } from '../../utils/reportUtils';

interface DocumentTypeChartProps {
    data: DocumentsByType[];
}

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#a855f7',
    '#6366f1', '#84cc16'
];

export default function DocumentTypeChart({ data }: DocumentTypeChartProps) {
    const [isDark] = useDarkMode();
    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles para este período</p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📄 Documentos por Tipo
            </h3>

            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ tipo, count, percent }) => {
                            return `${tipo.slice(0, 15)}: ${percent ? (percent * 100).toFixed(0) : 0}%`;
                        }}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{
                                    filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.2))',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.filter = 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.2))';
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '2px solid #3b82f6',
                            borderRadius: '12px',
                            color: '#ffffff',
                            padding: '14px 16px',
                            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)',
                            fontWeight: '600'
                        }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const percentage = ((payload[0].value / total) * 100).toFixed(1);
                                return (
                                    <div className="bg-slate-950 border-2 border-blue-500 rounded-lg p-3.5 shadow-2xl">
                                        <div className="font-bold text-blue-300 mb-2 text-sm">{data.tipo}</div>
                                        <div className="text-gray-200 text-sm mb-1">
                                            <span className="text-gray-400">Documentos:</span> {payload[0].value}
                                        </div>
                                        <div className="text-green-300 text-sm">
                                            <span className="text-gray-400">Porcentaje:</span> {percentage}%
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.15)' }}
                        wrapperStyle={{
                            outline: 'none'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ 
                            display: 'none'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Leyenda personalizada */}
            <div className="flex flex-wrap justify-center gap-3 mt-4 px-4 py-2 text-xs">
                {data.map((item, index) => (
                    <div key={item.tipo} className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {item.tipo}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tabla detallada */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                            <th className="px-3 py-2 text-left font-semibold text-gray-800 dark:text-gray-100">Tipo de Documento</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-gray-100">Cantidad</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-gray-100">Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={item.tipo}
                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="truncate">{item.tipo}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                                    {item.count}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                                    {((item.count / total) * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                        <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                            <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100">Total</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">{total}</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
