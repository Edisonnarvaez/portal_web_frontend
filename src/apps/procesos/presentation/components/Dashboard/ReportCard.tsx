import React from 'react';
import { HiOutlineDocumentText, HiCheckCircle, HiExclamationCircle, HiArchiveBoxXMark } from 'react-icons/hi2';
import type { DocumentStatistics } from '../../utils/reportUtils';

interface ReportCardProps {
    statistics: DocumentStatistics;
}

export default function ReportCard({ statistics }: ReportCardProps) {
    const stats = [
        {
            label: 'Total de Documentos',
            value: statistics.total,
            icon: HiOutlineDocumentText,
            color: 'bg-blue-100 dark:bg-blue-900',
            textColor: 'text-blue-600 dark:text-blue-300',
            borderColor: 'border-l-4 border-blue-500'
        },
        {
            label: 'Documentos Vigentes',
            value: statistics.vigentes,
            icon: HiCheckCircle,
            color: 'bg-green-100 dark:bg-green-900',
            textColor: 'text-green-600 dark:text-green-300',
            borderColor: 'border-l-4 border-green-500'
        },
        {
            label: 'Documentos Obsoletos',
            value: statistics.obsoletos,
            icon: HiExclamationCircle,
            color: 'bg-yellow-100 dark:bg-yellow-900',
            textColor: 'text-yellow-600 dark:text-yellow-300',
            borderColor: 'border-l-4 border-yellow-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className={`${stat.borderColor} ${stat.color} rounded-lg p-5 shadow-md hover:shadow-lg transition`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">
                                    {stat.label}
                                </p>
                                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                            </div>
                            <Icon className={`text-4xl ${stat.textColor} opacity-20`} />
                        </div>
                    </div>
                );
            })}

            {/* Promedio mensual */}
            <div className={`border-l-4 border-indigo-500 bg-indigo-100 dark:bg-indigo-900 rounded-lg p-5 shadow-md hover:shadow-lg transition md:col-span-1 lg:col-span-4`}>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Promedio de Documentos por Mes
                </p>
                <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                        {statistics.promedio_por_mes}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Total de {statistics.total} documentos distribuidos en los months registrados
                    </p>
                </div>
            </div>
        </div>
    );
}
