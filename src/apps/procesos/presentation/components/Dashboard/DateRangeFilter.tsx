import React from 'react';
import { HiCalendar, HiX } from 'react-icons/hi';
import { ReportUtils } from '../../utils/reportUtils';

interface DateRangeFilterProps {
    label: string;
    startDate: string;
    endDate: string;
    onStartChange: (date: string) => void;
    onEndChange: (date: string) => void;
    onClear: () => void;
}

export default function DateRangeFilter({
    label,
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    onClear
}: DateRangeFilterProps) {
    const hasFilters = startDate || endDate;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <HiCalendar className="text-blue-500 text-lg" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
                </div>
                {hasFilters && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
                    >
                        <HiX /> Limpiar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha inicio */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Desde
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Fecha fin */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Hasta
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Info de rango si están ambas fechas */}
            {startDate && endDate && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded text-xs text-blue-700 dark:text-blue-200">
                    Mostrando documentos desde{' '}
                    <strong>{ReportUtils.formatDate(startDate + 'T00:00:00')}</strong> hasta{' '}
                    <strong>{ReportUtils.formatDate(endDate + 'T23:59:59')}</strong>
                </div>
            )}
        </div>
    );
}
