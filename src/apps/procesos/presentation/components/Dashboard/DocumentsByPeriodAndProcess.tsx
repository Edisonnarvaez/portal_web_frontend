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
import { HiCalendarDays, HiExclamationTriangle } from 'react-icons/hi2';
import type { Document } from '../../../domain/entities/Document';
import type { Process } from '../../../domain/entities/Process';

interface DocumentsByPeriodAndProcessProps {
    documents: Document[];
    processes: Process[];
    selectedYear: number;
    selectedMonth: number;
}

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#a855f7',
    '#6366f1', '#84cc16'
];

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function DocumentsByPeriodAndProcess({
    documents,
    processes,
    selectedYear,
    selectedMonth
}: DocumentsByPeriodAndProcessProps) {
    // Filtrar documentos por período
    const documentsInPeriod = documents.filter(doc => {
        const fecha = new Date(doc.fecha_creacion);
        return fecha.getFullYear() === selectedYear && fecha.getMonth() + 1 === selectedMonth;
    });

    // Agrupar por proceso
    const processMap = new Map<number, { name: string; count: number }>();

    documentsInPeriod.forEach(doc => {
        const process = processes.find(p => p.id === doc.proceso);
        const processName = process?.name || `Proceso ${doc.proceso}`;

        if (!processMap.has(doc.proceso)) {
            processMap.set(doc.proceso, { name: processName, count: 0 });
        }

        const entry = processMap.get(doc.proceso)!;
        entry.count += 1;
    });

    // Convertir a array y ordenar por cantidad descendente
    const data = Array.from(processMap.values())
        .map((item, index) => ({
            ...item,
            id: index
        }))
        .sort((a, b) => b.count - a.count);

    const totalDocuments = documentsInPeriod.length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <HiCalendarDays className="text-blue-600 dark:text-blue-400 text-2xl" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        📤 Documentos Cargados por Proceso - {MONTHS[selectedMonth - 1]} {selectedYear}
                    </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Análisis detallado de documentos cargados en el período seleccionado distribuidos por proceso
                </p>
            </div>

            {totalDocuments === 0 ? (
                <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-center">
                        <HiExclamationTriangle className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                            No hay documentos cargados en {MONTHS[selectedMonth - 1]} de {selectedYear}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Gráfico */}
                    <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"

                                />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
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
                                <Bar dataKey="count" fill="#3b82f6" name="Documentos Cargados" radius={[8, 8, 0, 0]}>
                                    {data.map((entry) => (
                                        <Cell key={`cell-${entry.id}`} fill={COLORS[entry.id % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabla Detallada */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Nombre del Proceso</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Documentos Cargados</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Porcentaje</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Indicador</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => {
                                    const percentage = ((item.count / totalDocuments) * 100).toFixed(1);
                                    const percentageNum = parseFloat(percentage);

                                    return (
                                        <tr
                                            key={`${item.name}-${index}`}
                                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                    />
                                                    <span className="font-bold text-gray-900 dark:text-white">{index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                                                {item.count}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                                                            style={{ width: `${percentageNum}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${percentageNum > 30
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                        : percentageNum > 15
                                                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    }`}>
                                                    {percentageNum > 30 ? '✅ Alto' : percentageNum > 15 ? '⚡ Medio' : '⚠️ Bajo'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-gray-100 dark:bg-gray-700 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                                    <td colSpan={2} className="px-4 py-3 text-gray-900 dark:text-white">
                                        TOTAL DEL PERÍODO
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                                        {totalDocuments}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                                        100%
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                                            📊 Resumen
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Resumen de Indicadores */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Total Cargado</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalDocuments}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">documentos en el período</p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-1">Procesos Activos</p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{data.length}</p>
                            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">procesos con carga</p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-1">Promedio/Proceso</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {data.length > 0 ? Math.round(totalDocuments / data.length) : 0}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">documentos por proceso</p>
                        </div>
                    </div>

                    {/* Nota sobre indicadores */}
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            <strong>📌 Nota sobre Indicadores:</strong> Los indicadores (Alto, Medio, Bajo) se calculan basándose en el porcentaje de documentos del período.
                            Un proceso se marca como "Alto" si concentra más del 30% de la carga total, "Medio" si está entre 15%-30%, y "Bajo" si es menor al 15%.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
