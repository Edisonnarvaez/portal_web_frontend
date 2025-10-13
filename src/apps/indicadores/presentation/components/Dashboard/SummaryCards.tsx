import React from 'react';
import { HiTableCells, HiArrowTrendingUp, HiSparkles, HiChartBar } from 'react-icons/hi2';

interface Props {
  data: any[];
}

export default function SummaryCards({ data }: Props) {
  // 🔧 Función segura para obtener valores numéricos
  const safeGetNumber = (value: any, defaultValue: number = 0): number => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  const total = data.length;
  
  // 🔧 Calcular cumplidos de forma segura
  const cumplidos = data.filter((d) => {
    if (typeof d.compliant === 'boolean') return d.compliant;
    const calculatedValue = safeGetNumber(d.calculatedValue);
    const target = safeGetNumber(d.target || d.indicator?.target);
    const trend = String(d.trend || (d.indicator && d.indicator.trend) || '').toLowerCase();
    if (!target || isNaN(calculatedValue) || isNaN(target)) return false;
    return trend === 'decreasing' ? (calculatedValue <= target) : (calculatedValue >= target);
  }).length;
  
  const noCumplidos = total - cumplidos;
  const promedioCumplimiento = total > 0 
    ? ((cumplidos / total) * 100).toFixed(1) 
    : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <HiTableCells className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resultados</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <HiArrowTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cumplidos</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{cumplidos}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <HiSparkles className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No Cumplidos</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{noCumplidos}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <HiChartBar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">% Cumplimiento</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{promedioCumplimiento}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
