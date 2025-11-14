import { useState } from "react";
import { getIndicatorField, getHeadquarterField, safeNumber } from '../../utils/dataHelpers';
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
// Safe getters separated for indicator and headquarter to avoid mixing fields
// use shared helpers from utils/dataHelpers

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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // 🔧 Procesar datos para asegurar que tengan la estructura correcta
    const processedData = data.map((item, index) => {
    const indicatorObj = item.indicator && typeof item.indicator === 'object' ? item.indicator : undefined;

    const processedItem: any = {
            // 📊 Datos básicos
            id: item.id || index,
            
            // 🏢 Información de la sede
            headquarterName: getHeadquarterField(item, 'name', getHeadquarterField(item, 'headquarterName', 'Sin sede')),
            headquarters: item.headquarters,
            
            // 📈 Información del indicador
            indicatorName: getIndicatorField(item, 'name', getIndicatorField(item, 'indicatorName', 'Sin nombre')),
            indicatorCode: getIndicatorField(item, 'code', getIndicatorField(item, 'indicatorCode', 'Sin código')),
            indicator: item.indicator,
            
            // 🔢 Valores numéricos
            calculatedValue: safeNumber(item.calculatedValue ?? item.calculated_value ?? item.value ?? 0),
            numerator: Number(item.numerator ?? 0),
            denominator: Number(item.denominator ?? 0),
            // Prefer numeric target coming from the enriched result, then indicator object
            target: safeNumber(item.target ?? indicatorObj?.target ?? indicatorObj?.meta_target ?? 0),
            
            // 📅 Información temporal
            year: item.year || new Date().getFullYear(),
            month: item.month,
            quarter: item.quarter,
            semester: item.semester,
            
            // 🏷️ Metadatos
            measurementUnit: getIndicatorField(item, 'measurementUnit', indicatorObj?.measurementUnit ?? '' ) || '',
            measurementFrequency: getIndicatorField(item, 'measurementFrequency', 'annual'),
            calculationMethod: getIndicatorField(item, 'calculationMethod', ''),
            
            // 👤 Usuario
            user: item.user,
            
            // 📅 Fechas
            creationDate: item.creationDate,
            updateDate: item.updateDate,
            
            // 📊 Campos computados
            compliant: typeof item.compliant === 'boolean' ? item.compliant : undefined,
            trend: item.trend || indicatorObj?.trend || undefined,
            diferencia: typeof item.diferencia === 'number' ? item.diferencia : undefined,
            
            // ✅ Copiar todos los campos del indicador original para asegurar disponibilidad en modal
            ...indicatorObj,
        };
        
        return processedItem;
    });

    // Lógica de paginación
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = processedData.slice(startIndex, endIndex);

    // Resetear a página 1 cuando cambia itemsPerPage
    const handleItemsPerPageChange = (newItems: number) => {
        setItemsPerPage(newItems);
        setCurrentPage(1);
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
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
                
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Registros por página:
                    </label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Tabla de Resultados ({processedData.length} registros)
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
                        {paginatedData.map((item: any, idx: number) => {
                            // Use precomputed compliant if available, otherwise compute with trend awareness
                            let cumple: boolean = false;
                            if (typeof item.compliant === 'boolean') {
                                cumple = item.compliant;
                            } else {
                                const calc = Number(item.calculatedValue ?? NaN);
                                const targ = Number(item.target ?? NaN);
                                const trend = String(item.trend ?? '').toLowerCase();
                                if (!isNaN(calc) && !isNaN(targ)) {
                                    if (trend === 'decreasing') cumple = calc <= targ;
                                    else cumple = calc >= targ;
                                } else {
                                    cumple = false;
                                }
                            }
                            // 🔑 Crear una key única combinando ID, período y índice de página
                            const uniqueKey = `${item.id || 'no-id'}-${formatPeriodo(item)}-${startIndex + idx}`;
                            return (
                                <tr key={uniqueKey} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setSelectedIndicator(item);
                                                setModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                                {item.indicatorCode ? <span className="font-mono mr-2">{item.indicatorCode}</span> : null}{item.indicatorName}
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

            {/* Controles de paginación */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, processedData.length)} de {processedData.length} registros
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Anterior
                    </button>
                    
                    <div className="flex items-center gap-1">
                        {(() => {
                            const maxButtons = 5; // Máximo 5 botones de página
                            let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                            let endPage = Math.min(totalPages, startPage + maxButtons - 1);
                            
                            if (endPage - startPage + 1 < maxButtons) {
                                startPage = Math.max(1, endPage - maxButtons + 1);
                            }
                            
                            const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
                            
                            return pages.map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded-md transition-colors ${
                                        page === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ));
                        })()}
                    </div>
                    
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Siguiente →
                    </button>
                </div>
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
