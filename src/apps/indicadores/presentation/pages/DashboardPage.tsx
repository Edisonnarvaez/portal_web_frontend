import { useState, useMemo, useEffect } from "react";
import { useResultsData } from "../hooks/useResultsData";
import LoadingScreen from '../../../../shared/components/LoadingScreen';
// using native selects for dashboard filters
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
    const [selectedAnio, setSelectedAnio] = useState("");

    // 🔧 CORREGIR: Verificar que data sea un array válido
    const safeData = useMemo(() => {
        if (!data || !Array.isArray(data)) {
            //console.warn('⚠️ Data no es un array válido:', data);
            return [];
        }
        //console.log('✅ Data cargada correctamente:', data.length, 'items');
        if (data.length > 0) {
        }
        return data;
    }, [data]);

    // 🔧 Extraer valores únicos para filtros
    const sedes = useMemo(() => {
        if (safeData.length === 0) return [];
        const values = [...new Set(safeData.map((item) => (item as any).headquarterName || ((item as any).headquarters && (item as any).headquarters.name) || ''))].filter(Boolean);
        return values.map((v: string) => ({ label: v, value: v }));
    }, [safeData]);

    const indicadores = useMemo(() => {
        if (safeData.length === 0) return [];
        // Mostrar código + nombre cuando exista el código
        const fmt = (it: any) => formatIndicatorLabel(it);
        const values = [...new Set(safeData.map((item) => fmt(item)))].filter(Boolean);
        return values.map((v: string) => ({ label: v, value: v }));
    }, [safeData]);

    // Extraer años únicos de los datos
    const anos = useMemo(() => {
        if (safeData.length === 0) return [];
        const values = [...new Set(safeData.map((item) => {
            const year = (item as any).year || (item as any).periodo || (item as any).period || new Date().getFullYear();
            return String(year);
        }))].filter(Boolean).sort().reverse(); // Ordena descendente para mostrar años recientes primero
        return values.map((v: string) => ({ label: v, value: v }));
    }, [safeData]);

    // Establecer valores por defecto cuando los datos se cargan
    useEffect(() => {
        if (sedes.length > 0 && !selectedSede) {
            setSelectedSede(sedes[0].value);
        }
    }, [sedes, selectedSede]);

    useEffect(() => {
        if (indicadores.length > 0 && !selectedIndicador) {
            setSelectedIndicador(indicadores[0].value);
        }
    }, [indicadores, selectedIndicador]);

    useEffect(() => {
        if (anos.length > 0 && !selectedAnio) {
            setSelectedAnio(anos[0].value);
        }
    }, [anos, selectedAnio]);

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
            const matchesAnio = !selectedAnio || (String((item as any).year || (item as any).periodo || (item as any).period || '') === selectedAnio);

            return matchesSede && matchesIndicador && matchesAnio;
        });
    }, [safeData, selectedSede, selectedIndicador, selectedAnio]);

    const clearFilters = () => {
        // Resetear a valores por defecto en lugar de vaciar
        if (sedes.length > 0) setSelectedSede(sedes[0].value);
        if (indicadores.length > 0) setSelectedIndicador(indicadores[0].value);
        if (anos.length > 0) setSelectedAnio(anos[0].value);
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
        return <LoadingScreen message="Cargando datos del dashboard..." />;
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
            {/* 🐛 DEBUG: Panel de filtros activos */}
            {(selectedSede || selectedIndicador || selectedAnio) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        🔍 Filtros Activos: {safeData.length} registros originales → {filteredData.length} registros filtrados
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {selectedSede && (
                            <span className="bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 px-2 py-1 rounded">
                                Sede: {selectedSede}
                            </span>
                        )}
                        {selectedIndicador && (
                            <span className="bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 px-2 py-1 rounded">
                                Indicador: {selectedIndicador}
                            </span>
                        )}
                        {selectedAnio && (
                            <span className="bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-100 px-2 py-1 rounded">
                                Año: {selectedAnio}
                            </span>
                        )}
                    </div>
                </div>
            )}

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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-5`}>
                    <div>
                        <select
                            value={selectedSede}
                            onChange={(e) => setSelectedSede(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
                        >
                            <option value="">Todas las sedes</option>
                            {sedes.map((s:any)=> <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedIndicador}
                            onChange={(e) => setSelectedIndicador(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
                        >
                            <option value="">Todos los indicadores</option>
                            {indicadores.map((i:any)=> <option key={i.value} value={i.value}>{i.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedAnio}
                            onChange={(e) => setSelectedAnio(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
                        >
                            <option value="">Todos los años</option>
                            {anos.map((a:any)=> <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 justify-center w-full"
                        >
                            Clear
                        </button>
                    </div>
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