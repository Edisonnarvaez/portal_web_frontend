import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
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
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para este período</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
            formatter={(value, name) => [`${value} documentos`, 'Cantidad']}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Tabla detallada */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Tipo de Documento</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Cantidad</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.tipo}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {item.tipo}
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">
                  {item.count}
                </td>
                <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                  {((item.count / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">Total</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">{total}</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
