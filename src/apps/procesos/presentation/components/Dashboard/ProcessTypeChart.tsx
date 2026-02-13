import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import type { DocumentsByProcessType } from '../../utils/reportUtils';

interface ProcessTypeChartProps {
    data: DocumentsByProcessType[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ProcessTypeChart({ data }: ProcessTypeChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para este período</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                🔄 Documentos por Tipo de Proceso
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                    layout="vertical"
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                    />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis
                        type="category"
                        dataKey="tipo_proceso"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        width={150}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #4b5563',
                            borderRadius: '8px',
                            color: '#f3f4f6'
                        }}
                        formatter={(value) => [`${value} documentos`, 'Cantidad']}
                        labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12 }}
                        iconType="square"
                    />
                    <Bar dataKey="count" fill="#3b82f6" name="Documentos" radius={[0, 8, 8, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Resumen de datos */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total de Tipos</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.length}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total de Documentos</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {data.reduce((sum, item) => sum + item.count, 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo Más Frecuente</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
                            {data[0]?.tipo_proceso || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
