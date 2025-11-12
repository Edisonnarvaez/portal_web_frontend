import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiTableCells,
  HiPlus,
  HiSparkles,
  HiPencil,
  HiTrash,
  HiEye
} from 'react-icons/hi2';

import { useResults } from '../hooks/useResults'; // 👈 Solo usar este hook
import { notify } from '../../../../shared/utils/notifications';
import type { DetailedResult } from '../../domain/entities/Result';
import ResultForm from '../components/Forms/ResultForm';
import { FaSearch, FaTimes } from 'react-icons/fa';

// Componentes auxiliares reutilizables
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

const CrudModal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading, itemName }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Eliminar Resultado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Estás seguro de que deseas eliminar este resultado? Esta acción no se puede deshacer.
          </p>
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-6">
            Elemento: {itemName}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({
  searchTerm,
  onSearchChange,
  selectedIndicator,
  onIndicatorChange,
  selectedHeadquarters,
  onHeadquartersChange,
  selectedYear,
  onYearChange,
  onClearFilters,
  indicatorOptions,
  headquarterOptions,
  yearOptions
}: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-5`}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar resultados..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
        />
      </div>

      <div>
        <select
          value={selectedIndicator}
          onChange={(e) => onIndicatorChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
        >
          <option value="">Todos los indicadores</option>
          {(indicatorOptions || []).map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={selectedHeadquarters}
          onChange={(e) => onHeadquartersChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
        >
          <option value="">Todas las sedes</option>
          {(headquarterOptions || []).map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
        >
          <option value="">Todos los años</option>
          {(yearOptions || []).map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

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

const ResultsTable = ({ data, onEdit, onDelete, onView, indicators }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Indicador
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Sede
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Resultado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Meta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Año
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((result: DetailedResult) => (
            <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {result.indicatorName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {result.indicatorCode}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {result.headquarterName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {result.calculatedValue?.toFixed(2) || '0.00'} {result.measurementUnit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {(() => {
                  const targFromResult = typeof result.target === 'number' ? result.target : Number(result.target ?? NaN);
                  const indicatorObj = result.indicator && typeof result.indicator === 'object' ? (result.indicator as any) : undefined;
                  // Try indicators list as fallback (indicators prop passed from parent)
                  const indicatorFromList = indicators && Array.isArray(indicators) ? indicators.find((i: any) => i.id === (indicatorObj?.id ?? result.indicator)) : undefined;
                  const targFromIndicator = indicatorObj?.target ?? indicatorFromList?.target;
                  const targ = !isNaN(Number(targFromResult)) && Number(targFromResult) !== 0 ? Number(targFromResult) : (targFromIndicator !== undefined ? Number(targFromIndicator) : NaN);
                  const unit = result.measurementUnit || indicatorObj?.measurementUnit || indicatorObj?.measurement_unit || indicatorFromList?.measurementUnit || indicatorFromList?.measurement_unit || '';
                  return (isNaN(targ) ? '—' : targ.toFixed(2)) + (unit ? ` ${unit}` : '');
                })()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {result.year}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(result)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                    title="Ver detalles"
                  >
                    <HiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(result)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded"
                    title="Editar"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(result)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                    title="Eliminar"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DashboardMetrics = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <HiTableCells className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resultados</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.totalResults}</p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <HiSparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cumplimiento Promedio</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {data.avgCompliance.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <HiSparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alto Rendimiento</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.highPerformance}</p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <HiTableCells className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Indicadores Únicos</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.uniqueIndicators}</p>
        </div>
      </div>
    </div>
  </div>
);

const ResultadosPage: React.FC = () => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [selectedHeadquarters, setSelectedHeadquarters] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Estados de elementos seleccionados
  const [selectedResult, setSelectedResult] = useState<DetailedResult | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  // 👈 Solo usar este hook - eliminamos toda la lógica duplicada
  const {
    detailedResults,
    indicators,
    headquarters,
    loading,
    pagination,
    fetchPaginatedResults,
    createResult,
    updateResult,
    deleteResult
  } = useResults();

  // DEBUG: Log datos del hook
  useEffect(() => {
    console.log('📋 [ResultadosPage] Hook useResults retornó:', {
      detailedResults: detailedResults.length,
      indicators: indicators.length,
      headquarters: headquarters.length,
      loading,
      pagination
    });
  }, [detailedResults, indicators, headquarters, loading, pagination]);

  // Opciones para filtros (label/value)
  const headquarterOptions = useMemo(() => (headquarters || []).map((hq: any) => ({ label: hq.name, value: String(hq.id) })), [headquarters]);
  const indicatorOptions = useMemo(() => (indicators || []).map((ind: any) => ({ label: `${ind.code ? ind.code + ' - ' : ''}${ind.name}`, value: String(ind.id) })), [indicators]);
  const yearOptions = useMemo(() => Array.from(new Set(detailedResults.map(r => r.year))).sort((a,b)=>b-a).map(y=>({label:String(y), value:String(y)})), [detailedResults]);

  // DEBUG: Log opciones de filtros
  useEffect(() => {
    console.log('🎯 [ResultadosPage] Opciones de filtros:', {
      headquarterOptions: headquarterOptions.length,
      indicatorOptions: indicatorOptions.length,
      yearOptions: yearOptions.length,
      firstHeadquarter: headquarterOptions[0],
      firstIndicator: indicatorOptions[0],
      firstYear: yearOptions[0]
    });
  }, [headquarterOptions, indicatorOptions, yearOptions]);

  // Fetch paginated results when pagination params change
  // NOTE: We don't use pagination for detailedResults display because it would
  // replace the full dataset with just a page. Instead, we load ALL data once
  // and filter/paginate on the client side for accurate metrics calculation.
  // This useEffect is kept for reference but disabled.
  useEffect(() => {
    // Paginación deshabilitada: usamos todos los datos cargados por fetchResults()
    // console.log('📄 [ResultadosPage] Paginación triggerizada:', { page, pageSize });
  }, [page, pageSize]);

  // Filtros aplicados
  const filteredResults = useMemo(() => {
    const filtered = detailedResults.filter((result: DetailedResult) => {
      const term = (searchTerm || '').trim().toLowerCase();

      const indicatorName = result.indicatorName ?? '';
      const indicatorCode = result.indicatorCode ?? '';
      const headquarterName = result.headquarterName ?? '';

      const matchesSearch =
        term === '' ||
        [indicatorName, indicatorCode, headquarterName].some((field) =>
          String(field).toLowerCase().includes(term)
        );

      const resultIndicatorId = (result.indicator && typeof result.indicator === 'object') ? String((result.indicator as any).id) : String(result.indicator ?? '');
      const resultHeadquarterId = (result.headquarters && typeof result.headquarters === 'object') ? String((result.headquarters as any).id) : String(result.headquarters ?? '');

      const matchesIndicator = selectedIndicator === '' || resultIndicatorId === String(selectedIndicator);
      const matchesHeadquarters = selectedHeadquarters === '' || resultHeadquarterId === String(selectedHeadquarters);
      const matchesYear = selectedYear === '' || String(result.year) === selectedYear;

      return matchesSearch && matchesIndicator && matchesHeadquarters && matchesYear;
    });
    
    console.log('🔍 [ResultadosPage] Filtrado:', {
      detailedResultsCount: detailedResults.length,
      filteredCount: filtered.length,
      filters: { searchTerm, selectedIndicator, selectedHeadquarters, selectedYear }
    });
    
    return filtered;
  }, [detailedResults, searchTerm, selectedIndicator, selectedHeadquarters, selectedYear]);

  // Métricas del dashboard - usar filteredResults si hay filtros aplicados, sino detailedResults
  const dashboardData = useMemo(() => {
    const hasFilters = searchTerm || selectedIndicator || selectedHeadquarters || selectedYear;
    const metricsData = hasFilters ? filteredResults : detailedResults;
    
    // Helper function para validar si un valor es numérico y válido
    const isValidMetric = (targetValue: number, calc: number): boolean => {
      return !isNaN(targetValue) && !isNaN(calc) && targetValue > 0 && calc > 0;
    };
    
    // Calcular cumplimiento promedio - SOLO con valores válidos
    let validCount = 0;
    let complianceSum = 0;
    
    const validMetrics = metricsData.filter(r => {
      const targetValue = typeof r.target === 'number' ? r.target : Number(r.target);
      const calc = Number(r.calculatedValue ?? 0);
      return isValidMetric(targetValue, calc);
    });
    
    for (const curr of validMetrics) {
      const targetValue = typeof curr.target === 'number' ? curr.target : Number(curr.target);
      const calc = Number(curr.calculatedValue ?? 0);
      const isDecreasing = String(curr.trend || '').toLowerCase() === 'decreasing' || String(curr.trend || '').toLowerCase() === 'desc' || String(curr.trend || '').toLowerCase() === 'down';
      const ratio = isDecreasing ? (targetValue / calc) : (calc / targetValue);
      const compliance = Math.min(ratio * 100, 100); // Máximo 100%
      complianceSum += compliance;
      validCount++;
    }
    
    const result = {
      totalResults: metricsData.length,
      avgCompliance: validCount > 0 ? (complianceSum / validCount) : 0,
      highPerformance: validMetrics.filter(r => {
        const targetValue = typeof r.target === 'number' ? r.target : Number(r.target);
        const calc = Number(r.calculatedValue ?? 0);
        const isDecreasing = String(r.trend || '').toLowerCase() === 'decreasing' || String(r.trend || '').toLowerCase() === 'desc' || String(r.trend || '').toLowerCase() === 'down';
        const ratio = isDecreasing ? (targetValue / calc) : (calc / targetValue);
        return (ratio * 100) >= 95;
      }).length,
      uniqueIndicators: new Set(metricsData.map(r => (r.indicator && typeof r.indicator === 'object') ? (r.indicator as any).id : r.indicator)).size
    };
    
    console.log('📊 [ResultadosPage] Dashboard Metrics:', result);
    console.log('📊 [ResultadosPage] Valid metrics for compliance:', validCount, '/', metricsData.length);
    
    return result;
  }, [filteredResults, detailedResults, searchTerm, selectedIndicator, selectedHeadquarters, selectedYear]);

  // Handlers
  const handleCreateResult = () => {
    setSelectedResult(null);
    setShowCreateModal(true);
  };

  const handleEditResult = (result: DetailedResult) => {
    setSelectedResult(result);
    setShowEditModal(true);
  };

  const handleDeleteResult = (result: DetailedResult) => {
    setSelectedResult(result);
    setShowDeleteModal(true);
  };

  const handleViewResult = (result: DetailedResult) => {
    setSelectedResult(result);
    setShowViewModal(true);
  };

  const handleSubmitResult = async (data: any) => {
    setCrudLoading(true);
    let success = false;

    if (selectedResult) {
      success = await updateResult({ ...data, id: selectedResult.id });
      if (success) {
        setShowEditModal(false);
        setSelectedResult(null);
      }
    } else {
      success = await createResult(data);
      if (success) {
        setShowCreateModal(false);
      }
    }

    setCrudLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedResult) return;

    setCrudLoading(true);
    const success = await deleteResult(selectedResult.id!);

    if (success) {
      setShowDeleteModal(false);
      setSelectedResult(null);
    }

    setCrudLoading(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedIndicator('');
    setSelectedHeadquarters('');
    setSelectedYear('');
    setPage(1);
  };

  // Bulk CSV preview and upload state
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<any[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      const rows = e.detail?.rows || [];
      setBulkRows(rows);
      setBulkPreviewOpen(true);
    };
    window.addEventListener('bulkCsvPreview', handler as EventListener);
    return () => window.removeEventListener('bulkCsvPreview', handler as EventListener);
  }, []);

  const handleSubmitBulk = async () => {
    if (!bulkRows || bulkRows.length === 0) return;
    setBulkUploading(true);
    const { mapRowToCreatePayload } = await import('../utils/csvUtils');
    const results: { ok: boolean; errors?: string[] }[] = [];
    for (const r of bulkRows) {
      if (!r.valid) {
        results.push({ ok: false, errors: r.errors });
        continue;
      }
      try {
        const payload = mapRowToCreatePayload(r.row);
        const ok = await createResult(payload as any);
        results.push({ ok });
      } catch (err: any) {
        results.push({ ok: false, errors: [err?.message || String(err)] });
      }
    }
    setBulkUploading(false);
    // Refresh results after bulk upload
    if (typeof fetchPaginatedResults === 'function') await fetchPaginatedResults({ page: 1, page_size: pageSize });
    setBulkPreviewOpen(false);
    // Show brief summary
    const successCount = results.filter(r => r.ok).length;
    const failCount = results.length - successCount;
    if (failCount > 0) {
      notify.warning(`Carga masiva finalizada: ${successCount} exitosos, ${failCount} fallidos`);
    } else {
      notify.success(`Carga masiva finalizada: ${successCount} registros cargados exitosamente`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Resultados
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Registro y seguimiento de resultados de indicadores
            </p>
          </div>

          <button
            onClick={handleCreateResult}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-lg"
          >
            <HiPlus className="w-5 h-5" />
            <span>Nuevo Resultado</span>
          </button>
                  {/* Bulk upload controls */}
                  <div className="ml-4 flex items-center gap-3">
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const { generateTemplateCSV } = await import('../utils/csvUtils');
                          const blob = generateTemplateCSV(indicators || [], headquarters || []);
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'resultados_template.csv';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        } catch (err: any) {
                          // Show a user-friendly toast and keep a console trace for debugging
                          console.error('Error generating template CSV', err);
                          notify.error(`No se pudo generar la plantilla CSV: ${err?.message ?? 'error desconocido'}`);
                        }
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Descargar plantilla CSV
                    </a>

                    <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer">
                      Cargar CSV
                      <input type="file" accept=".csv" className="hidden" id="csvUploadInput"
                        onChange={async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          const text = await file.text();
                          try {
                            const { parseCSV, validateRowForCreate } = await import('../utils/csvUtils');
                            const rows = parseCSV(text);
                            // Validate each row
                            const validated = rows.map((r,i) => ({ row: r, ...validateRowForCreate(r), __index: i+2 }));
                            // Store preview in state (use a custom event to open preview modal)
                            const evt = new CustomEvent('bulkCsvPreview', { detail: { rows: validated } });
                            window.dispatchEvent(evt);
                          } catch (err: any) {
                            console.error('Error parsing CSV', err);
                            // If the parser detected a binary/XLSX file, show a more specific message
                            const msg = err?.message || String(err);
                            if (/xlsx|binario|binary|PK/i.test(msg)) {
                              notify.error('El archivo parece ser un archivo binario (.xlsx). Exporta a CSV (UTF-8) y vuelve a intentar.');
                            } else {
                              notify.error(`Error al parsear el CSV: ${msg}`);
                            }
                          }
                          // reset input
                          (e.target as HTMLInputElement).value = '';
                        }}
                      />
                    </label>
                  </div>
        </div>
      </div>

      <motion.div
        key={loading ? 'loading' : 'content'}
        initial={{ opacity: 0, y: loading ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Métricas del dashboard */}
            <DashboardMetrics data={dashboardData} />

            {/* Filtros */}
            <FilterPanel
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedIndicator={selectedIndicator}
              onIndicatorChange={setSelectedIndicator}
              selectedHeadquarters={selectedHeadquarters}
              onHeadquartersChange={setSelectedHeadquarters}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              onClearFilters={handleClearFilters}
              indicatorOptions={indicatorOptions}
              headquarterOptions={headquarterOptions}
              yearOptions={yearOptions}
            />

            {/* Estadísticas */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <HiSparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filteredResults.length} resultado(s) encontrado(s)
                </span>
              </div>
            </div>

            {/* Tabla de resultados */}
            <ResultsTable
              data={filteredResults}
              onEdit={handleEditResult}
              onDelete={handleDeleteResult}
              onView={handleViewResult}
              indicators={indicators}
            />

            {/* Simple pagination controls (if backend provides pagination) */}
            {pagination && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Mostrando {filteredResults.length} de {pagination.count}</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Página</label>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">{page || 1}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Tamaño</label>
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 bg-white dark:bg-gray-800 border rounded">
                      {[10,25,50,100].map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPage(Math.max(1, (pagination.page || 1) - 1)); }}
                      disabled={!pagination.previous}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    >Anterior</button>
                    <button
                      onClick={() => { setPage((pagination.page || 1) + 1); }}
                      disabled={!pagination.next}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    >Siguiente</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modales */}

      {/* Modal crear resultado */}
      <CrudModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedResult(null);
        }}
        title="Crear Nuevo Resultado"
      >
        <ResultForm
          indicators={indicators}
          headquarters={headquarters}
          onSubmit={handleSubmitResult}
          loading={crudLoading}
        />
      </CrudModal>

      {/* Modal editar resultado */}
      <CrudModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedResult(null);
        }}
        title="Editar Resultado"
      >
        <ResultForm
          result={selectedResult ?? undefined}
          indicators={indicators}
          headquarters={headquarters}
          onSubmit={handleSubmitResult}
          loading={crudLoading}
        />
      </CrudModal>

      {/* Modal eliminar resultado */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedResult(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={crudLoading}
        itemName={selectedResult?.indicatorName || ''}
      />

      {/* Modal ver resultado */}
      <CrudModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedResult(null);
        }}
        title="Ver Resultado"
      >
        {selectedResult ? (
          <div className="space-y-3">
            <div>
              <strong>Indicador:</strong> {selectedResult.indicatorName} ({selectedResult.indicatorCode})
            </div>
            <div>
              <strong>Sede:</strong> {selectedResult.headquarterName}
            </div>
            <div>
              <strong>Resultado:</strong> {selectedResult.calculatedValue?.toFixed(2) || '0.00'} {selectedResult.measurementUnit}
            </div>
            <div>
              <strong>Meta:</strong> {(() => {
                const targFromResult = typeof selectedResult.target === 'number' ? selectedResult.target : Number(selectedResult.target ?? NaN);
                const indicatorObj = selectedResult.indicator && typeof selectedResult.indicator === 'object' ? (selectedResult.indicator as any) : undefined;
                const indicatorFromList = indicators && Array.isArray(indicators) ? indicators.find((i: any) => i.id === (indicatorObj?.id ?? selectedResult.indicator)) : undefined;
                const targFromIndicator = indicatorObj?.target ?? indicatorFromList?.target;
                const targ = !isNaN(Number(targFromResult)) && Number(targFromResult) !== 0 ? Number(targFromResult) : (targFromIndicator !== undefined ? Number(targFromIndicator) : NaN);
                const unit = selectedResult.measurementUnit || indicatorObj?.measurementUnit || indicatorObj?.measurement_unit || indicatorFromList?.measurementUnit || indicatorFromList?.measurement_unit || '';
                return (isNaN(targ) ? '—' : targ.toFixed(2)) + (unit ? ` ${unit}` : '');
              })()}
            </div>
            <div>
              <strong>Año:</strong> {selectedResult.year}
            </div>
            <div>
              <strong>Observaciones:</strong> {('observations' in selectedResult && (selectedResult as any).observations) || '-'}
            </div>
          </div>
        ) : (
          <div>No hay resultado seleccionado</div>
        )}
      </CrudModal>

        {/* Bulk CSV preview modal */}
        <CrudModal isOpen={bulkPreviewOpen} onClose={() => setBulkPreviewOpen(false)} title="Vista previa de carga masiva">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Revise las filas detectadas y los errores de validación antes de confirmar la carga.</p>
            <div className="max-h-64 overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left">Fila</th>
                    <th className="px-2 py-1 text-left">Valida</th>
                    <th className="px-2 py-1 text-left">Errores</th>
                    <th className="px-2 py-1 text-left">Datos (preview)</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkRows.map((r: any, idx: number) => (
                    <tr key={idx} className={`${r.valid ? '' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <td className="px-2 py-1 align-top">{r.__index}</td>
                      <td className="px-2 py-1 align-top">{r.valid ? 'Sí' : 'No'}</td>
                      <td className="px-2 py-1 align-top text-xs text-red-700 dark:text-red-300">{(r.errors || []).join('; ')}</td>
                      <td className="px-2 py-1 align-top font-mono text-xs">{JSON.stringify(r.row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setBulkPreviewOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Cancelar</button>
              <button onClick={handleSubmitBulk} disabled={bulkUploading} className="px-4 py-2 bg-blue-600 text-white rounded">{bulkUploading ? 'Cargando...' : 'Confirmar carga'}</button>
            </div>
          </div>
        </CrudModal>
    </div>
  );
};

export default ResultadosPage;