import React, { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import IndicatorDetailModal from "./IndicatorDetailModal";

interface Props {
    data: any[];
    loading: boolean;
}

function formatPeriodo(item: any) {
    switch (item.measurementFrequency) {
        case "monthly":
            return `${item.year}-${String(item.month).padStart(2, "0")}`;
        case "quarterly":
            return `Q${item.quarter} ${item.year}`;
        case "semiannual":
            return `S${item.semester} ${item.year}`;
        case "annual":
            return `${item.year}`;
        default:
            return `${item.year}`;
    }
}

// 🔧 Función para extraer valores seguros de los datos
function getIndicatorValue(item: any, field: string, defaultValue: any = 0) {
    if (item[field] !== undefined && item[field] !== null) {
        return item[field];
    }
    
    // 🔍 Si el campo no existe directamente, intentar extraerlo de objetos anidados
    if (item.indicator && typeof item.indicator === 'object' && item.indicator[field] !== undefined) {
        return item.indicator[field];
    }
    
    if (item.headquarters && typeof item.headquarters === 'object' && item.headquarters[field] !== undefined) {
        return item.headquarters[field];
    }
    
    return defaultValue;
}

// 🔧 Función para formatear números de forma segura
function safeFormatNumber(value: any, decimals: number = 2): string {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return '0.00';
    }
    return numValue.toFixed(decimals);
}

export default function IndicatorTable({ data, loading }: Props) {
    if (loading) return <p className="text-center">Cargando tabla...</p>;
    if (data.length === 0) return <p className="text-center">No hay datos para mostrar.</p>;

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState<any>(null);

    // 🔧 Procesar datos para asegurar que tengan la estructura correcta
    const processedData = data.map((item, index) => {
        console.log(`🔍 Procesando item ${index}:`, item);
        
        const processedItem = {
            // 📊 Datos básicos
            id: item.id || index,
            
            // 🏢 Información de la sede
            headquarterName: getIndicatorValue(item, 'name', 'Sin sede') || 
                           getIndicatorValue(item, 'headquarterName', 'Sin sede'),
            headquarters: item.headquarters,
            
            // 📈 Información del indicador
            indicatorName: getIndicatorValue(item, 'name', 'Sin nombre') ||
                          getIndicatorValue(item, 'indicatorName', 'Sin nombre'),
            indicatorCode: getIndicatorValue(item, 'code', 'Sin código') ||
                          getIndicatorValue(item, 'indicatorCode', 'Sin código'),
            indicator: item.indicator,
            
            // 🔢 Valores numéricos
            calculatedValue: parseFloat(item.calculatedValue || 0),
            numerator: parseFloat(item.numerator || 0),
            denominator: parseFloat(item.denominator || 0),
            target: parseFloat(getIndicatorValue(item, 'target', 0)),
            
            // 📅 Información temporal
            year: item.year || new Date().getFullYear(),
            month: item.month,
            quarter: item.quarter,
            semester: item.semester,
            
            // 🏷️ Metadatos
            measurementUnit: getIndicatorValue(item, 'measurementUnit', ''),
            measurementFrequency: getIndicatorValue(item, 'measurementFrequency', 'annual'),
            calculationMethod: getIndicatorValue(item, 'calculationMethod', ''),
            
            // 👤 Usuario
            user: item.user,
            
            // 📅 Fechas
            creationDate: item.creationDate,
            updateDate: item.updateDate
        };
        
        console.log(`✅ Item procesado ${index}:`, processedItem);
        return processedItem;
    });

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
            <div className="flex justify-end gap-4 mb-4">
                <button
                    onClick={() => exportToExcel(processedData)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Exportar a Excel
                </button>
                <button
                    onClick={() => exportToPDF(processedData)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Exportar a PDF
                </button>
            </div>

            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Tabla de Resultados
            </h2>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700 border-b font-medium">
                        <tr>
                            <th className="px-4 py-2 text-gray-900 dark:text-gray-100">Indicador</th>
                            <th className="px-4 py-2 text-gray-900 dark:text-gray-100">Sede</th>
                            <th className="px-4 py-2 text-gray-900 dark:text-gray-100">Resultado</th>
                            <th className="px-4 py-2 text-gray-900 dark:text-gray-100">Meta</th>
                            <th className="px-4 py-2 text-gray-900 dark:text-gray-100">Unidad</th>
                            <th className="px-4 py-2 text-gray-900 dark:text-gray-100">Período</th>
                            <th className="px-4 py-2 text-gray-900 dark:text-gray-100">Cumple</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.map((item, idx) => {
                            const cumple = item.calculatedValue >= item.target;
                            return (
                                <tr key={item.id || idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setSelectedIndicator(item);
                                                setModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            {item.indicatorName}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {item.headquarterName}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {safeFormatNumber(item.calculatedValue)}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {safeFormatNumber(item.target)}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {item.measurementUnit || '-'}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {formatPeriodo(item)}
                                    </td>
                                    <td className="px-4 py-2">
                                        {cumple ? (
                                            <CheckCircleIcon className="text-green-500 w-5 h-5" />
                                        ) : (
                                            <XCircleIcon className="text-red-500 w-5 h-5" />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <IndicatorDetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                indicator={selectedIndicator}
                results={processedData}
            />
        </div>
    );
}
