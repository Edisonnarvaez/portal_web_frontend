import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface FilterPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedFrequency: string;
  onFrequencyChange: (value: string) => void;
  onClearFilters: () => void;
  // Optional: process filter
  processOptions?: Array<{ label: string; value: string }>;
  selectedProcess?: string;
  onProcessChange?: (value: string) => void;
  // Optional: trend filter
  trendOptions?: Array<{ label: string; value: string }>;
  selectedTrend?: string;
  onTrendChange?: (value: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedFrequency,
  onFrequencyChange,
  onClearFilters,
  processOptions,
  selectedProcess,
  onProcessChange,
  trendOptions,
  selectedTrend,
  onTrendChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-6`}>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar indicadores..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        { /* If processOptions provided, render process select */ }
        {processOptions ? (
          <select
            value={selectedProcess}
            onChange={(e) => onProcessChange && onProcessChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
          >
            <option value="">Todos los procesos</option>
            {processOptions.map((p: { label: string; value: string }) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        ) : (
          <select
            value={selectedFrequency}
            onChange={(e) => onFrequencyChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
          >
            <option value="">Todas las frecuencias</option>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="semiannual">Semestral</option>
            <option value="annual">Anual</option>
          </select>
        )}

        { /* Trend select rendered if provided */ }
        {trendOptions && (
          <div>
            <select
              value={selectedTrend}
              onChange={(e) => onTrendChange && onTrendChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
            >
              <option value="">Todas las tendencias</option>
              {trendOptions.map((t: { label: string; value: string }) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 justify-center w-full"
          >
            <FaTimes size={14} />
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;