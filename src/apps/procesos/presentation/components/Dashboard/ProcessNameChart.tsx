import React, { useState } from 'react';
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
import type { DocumentsByProcessName } from '../../utils/reportUtils';

interface ProcessNameChartProps {
  data: DocumentsByProcessName[];
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#a855f7'
];

export default function ProcessNameChart({ data }: ProcessNameChartProps) {
  const [showAll, setShowAll] = useState(false);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para este período</p>
      </div>
    );
  }

  // Mostrar solo los top 5 por defecto
  const displayData = showAll ? data : data.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          🏢 Documentos por Nombre de Proceso
        </h3>
        {data.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            {showAll ? 'Ver menos' : `Ver todo (${data.length})`}
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={displayData}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="nombre_proceso"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval={0}
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
          <Bar dataKey="count" fill="#3b82f6" name="Documentos" radius={[8, 8, 0, 0]}>
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Tabla detallada */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Nombre del Proceso</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">Cantidad</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">% del Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const total = data.reduce((sum, i) => sum + i.count, 0);
              return (
                <tr
                  key={item.nombre_proceso}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.nombre_proceso}</td>
                  <td className="px-3 py-2 text-center font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">
                    {((item.count / total) * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-xs text-blue-700 dark:text-blue-200">
        Mostrando {displayData.length} de {data.length} procesos diferentes
      </div>
    </div>
  );
}
