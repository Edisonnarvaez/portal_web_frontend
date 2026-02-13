import React, { useState, useMemo } from 'react';
import { HiOutlineAdjustmentsHorizontal, HiXMark, HiArrowDownTray, HiPrinter } from 'react-icons/hi2';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { useDocumentCRUD } from '../hooks/useDocumentCRUD';
import { useDocumentPermissions } from '../hooks/useDocumentPermissions';
import { useDocumentReports } from '../hooks/useDocumentReports';
import { useAdvancedFilters } from '../hooks/useAdvancedFilters';
import { ReportUtils } from '../utils/reportUtils';

// Componentes de dashboard
import DateRangeFilter from '../components/Dashboard/DateRangeFilter';
import ReportCard from '../components/Dashboard/ReportCard';
import MonthlyChart from '../components/Dashboard/MonthlyChart';
import DocumentTypeChart from '../components/Dashboard/DocumentTypeChart';
import ProcessTypeChart from '../components/Dashboard/ProcessTypeChart';
import ProcessNameChart from '../components/Dashboard/ProcessNameChart';
import PeriodSelector from '../components/Dashboard/PeriodSelector';
import DocumentsByPeriodAndProcess from '../components/Dashboard/DocumentsByPeriodAndProcess';
import DocumentFilters from '../components/DocumentFilters/DocumentFilters';

export default function DashboardProcesosPage() {
    const { documents, processes, processTypes, loading, error } = useDocumentCRUD();
    const permissions = useDocumentPermissions('procesos');
    const {
        filters,
        activeTab,
        setActiveTab,
        updateFilter,
        clearFilters,
        clearDateFilters,
        applyDateFilters,
        hasActiveFilters,
        hasActiveDateFilters
    } = useAdvancedFilters();

    const [showFilters, setShowFilters] = useState(true);

    // Estado para período seleccionado
    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

    // Aplicar filtros básicos
    const basicFilteredDocuments = useMemo(() => {
        let result = documents;

        // Filtros de búsqueda y tipo
        if (filters.searchTerm) {
            result = result.filter(doc =>
                doc.nombre_documento.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                doc.codigo_documento.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filtro por tipo de documento
        if (filters.selectedTipo) {
            result = result.filter(doc => doc.tipo_documento === filters.selectedTipo);
        }

        // Filtro por proceso
        if (filters.selectedProceso) {
            result = result.filter(doc => doc.proceso.toString() === filters.selectedProceso);
        }

        // Filtro por tipo de proceso
        if (filters.selectedTipoProceso) {
            const filteredByProcessType = result.filter(doc => {
                const process = processes.find(p => p.id === doc.proceso);
                return process && process.processType?.toString() === filters.selectedTipoProceso;
            });
            result = filteredByProcessType;
        }

        // Filtro por estado (solo admin puede ver todos)
        if (!permissions.isAdmin) {
            result = result.filter(doc => doc.estado === 'VIG');
        } else if (filters.selectedEstado) {
            result = result.filter(doc => doc.estado === filters.selectedEstado);
        }

        return result;
    }, [documents, filters, processes, permissions]);

    // Aplicar filtros de fecha
    const finalFilteredDocuments = useMemo(() => {
        return applyDateFilters(basicFilteredDocuments);
    }, [basicFilteredDocuments, filters]);

    // Usar hook de reportes con documentos filtrados
    const reports = useDocumentReports(finalFilteredDocuments, processes, processTypes);

    // Obtener opciones para selects
    const tiposDocumento = useMemo(() => {
        const tipos = new Set(documents.map(d => d.tipo_documento));
        return Array.from(tipos).filter(Boolean);
    }, [documents]);

    const estados = ['VIG', 'OBS'];
    const procesosMap = useMemo(() => {
        return processes.map(p => ({
            id: p.id,
            name: p.name || `Proceso ${p.id}`
        }));
    }, [processes]);

    const processTypesMap = useMemo(() => {
        return processTypes.map(pt => ({
            id: pt.id,
            name: pt.name,
            description: pt.description || '',
            status: Boolean(pt.status)
        }));
    }, [processTypes]);

    if (loading) {
        return <LoadingScreen message="Cargando dashboard..." />;
    }

    if (error) {
        return (<LoadingScreen message={`Error: ${error}`} />);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        📊 Dashboard de Procesos y Documentos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Análisis detallado de documentos, procesos y reportes dinámicos
                    </p>
                </div>

                {/* Botones de acciones rápidas */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                    >
                        <HiOutlineAdjustmentsHorizontal />
                        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>

                    {hasActiveFilters() && (
                        <button
                            onClick={() => clearFilters()}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                        >
                            <HiXMark />
                            Limpiar Todos los Filtros
                        </button>
                    )}
                </div>

                {/* Sección de Filtros */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
                        {/* Tabs de filtros */}
                        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('basicos')}
                                className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'basicos'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                Filtros Básicos
                                {hasActiveFilters() && !hasActiveDateFilters() && (
                                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                                        Activos
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('fechas')}
                                className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'fechas'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                Filtros de Fechas
                                {hasActiveDateFilters() && (
                                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                                        Activos
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Tab: Filtros Básicos */}
                        {activeTab === 'basicos' && (
                            <div>
                                {/* Filtros adicionales */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Búsqueda */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            🔍 Buscar Documento
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nombre o código..."
                                            value={filters.searchTerm}
                                            onChange={(e) => updateFilter('searchTerm', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Tipo de Documento */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            📄 Tipo de Documento
                                        </label>
                                        <select
                                            value={filters.selectedTipo}
                                            onChange={(e) => updateFilter('selectedTipo', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Todos los tipos</option>
                                            {tiposDocumento.map(tipo => (
                                                <option key={tipo} value={tipo}>
                                                    {tipo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Proceso */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            🔄 Proceso
                                        </label>
                                        <select
                                            value={filters.selectedProceso}
                                            onChange={(e) => updateFilter('selectedProceso', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Todos los procesos</option>
                                            {procesosMap.map(proc => (
                                                <option key={proc.id} value={proc.id}>
                                                    {proc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tipo de Proceso */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            🏢 Tipo de Proceso
                                        </label>
                                        <select
                                            value={filters.selectedTipoProceso}
                                            onChange={(e) => updateFilter('selectedTipoProceso', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Todos tipos de proceso</option>
                                            {processTypesMap.map(procType => (
                                                <option key={procType.id} value={procType.id}>
                                                    {procType.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Estado */}
                                    {permissions.isAdmin && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                📍 Estado
                                            </label>
                                            <select
                                                value={filters.selectedEstado}
                                                onChange={(e) => updateFilter('selectedEstado', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Todos los estados</option>
                                                {estados.map(estado => (
                                                    <option key={estado} value={estado}>
                                                        {estado === 'VIG' ? 'Vigente' : estado === 'OBS' ? 'Obsoleto' : 'Archivado'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab: Filtros de Fechas */}
                        {activeTab === 'fechas' && (
                            <div>
                                <DateRangeFilter
                                    label="Filtrar por Fecha de Creación"
                                    startDate={filters.creationDateStart}
                                    endDate={filters.creationDateEnd}
                                    onStartChange={(date) => updateFilter('creationDateStart', date)}
                                    onEndChange={(date) => updateFilter('creationDateEnd', date)}
                                    onClear={() => {
                                        updateFilter('creationDateStart', '');
                                        updateFilter('creationDateEnd', '');
                                    }}
                                />

                                <DateRangeFilter
                                    label="Filtrar por Fecha de Actualización"
                                    startDate={filters.updateDateStart}
                                    endDate={filters.updateDateEnd}
                                    onStartChange={(date) => updateFilter('updateDateStart', date)}
                                    onEndChange={(date) => updateFilter('updateDateEnd', date)}
                                    onClear={() => {
                                        updateFilter('updateDateStart', '');
                                        updateFilter('updateDateEnd', '');
                                    }}
                                />

                                {hasActiveDateFilters() && (
                                    <button
                                        onClick={() => clearDateFilters()}
                                        className="w-full px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition font-medium"
                                    >
                                        Limpiar Filtros de Fechas
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Info de documentos filtrados */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                <strong>Mostrando:</strong> {finalFilteredDocuments.length} de {documents.length} documentos
                                {hasActiveFilters() && <span> (filtrados)</span>}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tarjetas de Estadísticas */}
                <ReportCard statistics={reports.statistics} />

                {/* Gráficos - Grid responsivo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Gráfico de Documentos por Mes */}
                    <div className="lg:col-span-2">
                        <MonthlyChart data={reports.documentsByMonth} />
                    </div>

                    {/* Tipos de Documento */}
                    <DocumentTypeChart data={reports.documentsByDocType} />

                    {/* Tipos de Proceso */}
                    <ProcessTypeChart data={reports.documentsByProcessType} />
                </div>

                {/* Gráfico de Procesos */}
                <div className="mb-6">
                    <ProcessNameChart data={reports.documentsByProcessName} />
                </div>

                {/* NUEVA SECCIÓN: Análisis por Período */}
                <div className="mb-8">
                    <PeriodSelector
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                        onYearChange={setSelectedYear}
                        onMonthChange={setSelectedMonth}
                    />
                </div>

                {/* Documentos cargados por proceso en período */}
                <div className="mb-6">
                    <DocumentsByPeriodAndProcess
                        documents={documents}
                        processes={processes}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                    />
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8 border-t border-gray-200 dark:border-gray-700">
                    {/*<p>Dashboard actualizado el {new Date().toLocaleDateString('es-ES')}</p>*/}
                    <p className="text-xs mt-2">Total de registros procesados: {documents.length}</p>
                </div>
            </div>
        </div>
    );
}
