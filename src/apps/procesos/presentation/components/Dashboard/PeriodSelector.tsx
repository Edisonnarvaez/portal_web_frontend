import React from 'react';
import { HiCalendarDays } from 'react-icons/hi2';
import { ReportUtils } from '../../utils/reportUtils';

interface PeriodSelectorProps {
    selectedYear: number;
    selectedMonth: number;
    onYearChange: (year: number) => void;
    onMonthChange: (month: number) => void;
}

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function PeriodSelector({
    selectedYear,
    selectedMonth,
    onYearChange,
    onMonthChange
}: PeriodSelectorProps) {
    // Generar años disponibles (últimos 5 años y próximos 2)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-5 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
                <HiCalendarDays className="text-blue-600 dark:text-blue-400 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Análisis por Período
                </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecciona un mes y año para ver cuántos documentos se cargaron y a qué procesos fueron asignados
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selector de Mes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📅 Mes
                    </label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => onMonthChange(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                        {MONTHS.map((month, index) => (
                            <option key={index + 1} value={index + 1}>
                                {month}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selector de Año */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📆 Año
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => onYearChange(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Resumen del período seleccionado */}
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    📊 Período seleccionado: <strong>{MONTHS[selectedMonth - 1]} de {selectedYear}</strong>
                </p>
            </div>
        </div>
    );
}
