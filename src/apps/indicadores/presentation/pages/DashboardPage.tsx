import { useState, useMemo } from "react";
import { useResultsData } from "../hooks/useResultsData";
import FilterSelect from "../components/Shared/FilterSelect";
import { formatIndicatorLabel } from '../utils/dataHelpers';
import IndicatorBarChart from "../components/Dashboard/IndicatorBarChart";
import TimeSeriesChart from "../components/Dashboard/TimeSeriesChart";
import IndicatorTable from "../components/Dashboard/IndicatorTable";
import SummaryCards from "../components/Dashboard/SummaryCards";
import CompliancePieChart from "../components/Dashboard/CompliancePieChart";
import WorstIndicatorsChart from "../components/Dashboard/WorstIndicatorsChart";

export default function DashboardPage() {
    const { data, loading, error } = useResultsData();

    const [selectedSede, setSelectedSede] = useState("");
    const [selectedIndicador, setSelectedIndicador] = useState("");
    const [selectedUnidad, setSelectedUnidad] = useState("");
    const [selectedFrecuencia, setSelectedFrecuencia] = useState("");
    const [selectedAnio, setSelectedAnio] = useState("");

    // 🔧 CORREGIR: Verificar que data sea un array válido
    const safeData = useMemo(() => {
        if (!data || !Array.isArray(data)) {
            console.warn('⚠️ Data no es un array válido:', data);
            return [];
        }
        return data;
    }, [data]);

    // 🔧 Extraer valores únicos para filtros
    const sedes = useMemo(() => {
        if (safeData.length === 0) return [];
    return [...new Set(safeData.map((item) => (item as any).headquarterName || ((item as any).headquarters && (item as any).headquarters.name) || ''))].filter(Boolean);
    }, [safeData]);

    const indicadores = useMemo(() => {
        if (safeData.length === 0) return [];
        // Mostrar código + nombre cuando exista el código
        const fmt = (it: any) => formatIndicatorLabel(it);
        return [...new Set(safeData.map((item) => fmt(item)))].filter(Boolean);
    }, [safeData]);

    const unidades = useMemo(() => {
        if (safeData.length === 0) return [];
    return [...new Set(safeData.map((item) => (item as any).measurementUnit || ((item as any).indicator && (item as any).indicator.measurementUnit) || (item as any).measurement_unit || ''))].filter(Boolean);
    }, [safeData]);

    const frecuencias = useMemo(() => {
        if (safeData.length === 0) return [];
    return [...new Set(safeData.map((item) => (item as any).measurementFrequency || ((item as any).indicator && (item as any).indicator.measurementFrequency) || (item as any).measurement_frequency || ''))].filter(Boolean);
    }, [safeData]);

    const anios = useMemo(() => {
        if (safeData.length === 0) return [];
        return [...new Set(safeData.map((item) => String(item.year)))]
            .filter(Boolean)
            .sort((a, b) => Number(b) - Number(a));
    }, [safeData]);

    // Filtro de datos
    const filteredData = useMemo(() => {
        if (safeData.length === 0) return [];
        
        return safeData.filter((item) => {
            // 🔧 CORREGIR: Validar que item existe y tiene las propiedades necesarias
            if (!item) return false;
            
            const matchesSede = !selectedSede || (item.headquarterName && item.headquarterName === selectedSede);
            // selectedIndicador is a display label like "CODE - Name" or just "Name"
            const indicatorLabel = (() => {
                const it: any = item;
                const code = it.indicatorCode || it.indicator_code || '';
                const name = it.indicatorName || it.indicator_name || (it.indicator && it.indicator.name) || '';
                return code ? `${code} - ${name}` : name;
            })();
            const matchesIndicador = !selectedIndicador || (indicatorLabel === selectedIndicador);
            const matchesUnidad = !selectedUnidad || (item.measurementUnit && item.measurementUnit === selectedUnidad);
            const matchesFrecuencia = !selectedFrecuencia || (item.measurementFrequency && item.measurementFrequency === selectedFrecuencia);
            const matchesAnio = !selectedAnio || (item.year && String(item.year) === selectedAnio);

            return matchesSede && matchesIndicador && matchesUnidad && matchesFrecuencia && matchesAnio;
        });
    }, [safeData, selectedSede, selectedIndicador, selectedUnidad, selectedFrecuencia, selectedAnio]);

    const clearFilters = () => {
        setSelectedSede("");
        setSelectedIndicador("");
        setSelectedUnidad("");
        setSelectedFrecuencia("");
        setSelectedAnio("");
    };

    // 🔧 CORREGIR: Mostrar estado de error
    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="text-red-800 dark:text-red-200 font-medium">Error al cargar datos</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // 🔧 CORREGIR: Mejorar spinner de carga
    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando datos del dashboard...</p>
                </div>
            </div>
        );
    }

    // 🔧 CORREGIR: Mostrar mensaje cuando no hay datos
    if (safeData.length === 0) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <h3 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">No hay datos disponibles</h3>
                    <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                        No se encontraron resultados para mostrar en el dashboard. 
                        Asegúrate de que existan resultados de indicadores cargados en el sistema.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* 🐛 DEBUG: Información temporal */}
            {/* development-only debug panel removed for cleanliness */}

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Dashboard de Resultados
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Visualización y análisis de indicadores institucionales
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Filtros
                    </h3>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Limpiar filtros
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <FilterSelect 
                        label="Sede" 
                        options={sedes} 
                        value={selectedSede} 
                        onChange={setSelectedSede} 
                    />
                    <FilterSelect 
                        label="Indicador" 
                        options={indicadores} 
                        value={selectedIndicador} 
                        onChange={setSelectedIndicador} 
                    />
                    <FilterSelect 
                        label="Unidad de Medida" 
                        options={unidades} 
                        value={selectedUnidad} 
                        onChange={setSelectedUnidad} 
                    />
                    <FilterSelect 
                        label="Frecuencia" 
                        options={frecuencias} 
                        value={selectedFrecuencia} 
                        onChange={setSelectedFrecuencia} 
                    />
                    <FilterSelect 
                        label="Año" 
                        options={anios} 
                        value={selectedAnio} 
                        onChange={setSelectedAnio} 
                    />
                </div>
            </div>

            {/* Componentes del dashboard */}
            <SummaryCards data={filteredData} />
            <IndicatorBarChart data={filteredData} loading={false} />
            <TimeSeriesChart data={filteredData} loading={false} />
            <CompliancePieChart data={filteredData} loading={false} />
            <WorstIndicatorsChart data={filteredData} loading={false} />
            <IndicatorTable data={filteredData} loading={false} />
        </div>
    );
}