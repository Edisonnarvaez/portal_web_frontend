import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChartBar,
  HiPlus,
  HiSparkles,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiPencil,
  HiTrash,
  HiEye
} from 'react-icons/hi2';

import { useIndicators } from '../hooks/useIndicators';
import type { Indicator } from '../../domain/entities/Indicator';
import IndicatorForm from '../components/Forms/IndicadoresForm';
import FilterPanel from '../components/Shared/FilterPanel';
import IndicatorDebug from '../components/Debug/IndicatorDebug';

// Componentes auxiliares
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            Eliminar Indicador
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Estás seguro de que deseas eliminar este indicador? Esta acción no se puede deshacer.
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

const IndicatorsTable = ({ data, onEdit, onDelete, onView }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Frecuencia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Meta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((indicator: Indicator) => (
            <tr key={indicator.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {indicator.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {indicator.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {indicator.description?.substring(0, 50)}...
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {indicator.measurementFrequency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {indicator.target}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  indicator.status 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {indicator.status ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(indicator)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                    title="Ver detalles"
                  >
                    <HiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(indicator)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded"
                    title="Editar"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(indicator)}
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

const IndicadoresPage: React.FC = () => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState('');
  const [selectedTrendFilter, setSelectedTrendFilter] = useState('');

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados de elementos seleccionados
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  // Hook de indicadores
  const {
    indicators,
    processes,
    loading,
    createIndicator,
    updateIndicator,
    deleteIndicator
  } = useIndicators();

  // process options for the filter (from processes list)
  const processOptions = (processes || []).map((p: any) => ({ label: p.name, value: String(p.id) }));
  // trend options based on indicators data
  const trendOptions = Array.from(new Set((indicators || []).map((i:any) => (i.trend || '').toString().toLowerCase()).filter(Boolean))).map(t => ({ label: t, value: t }));

  // Filtros aplicados
  const filteredIndicators = indicators.filter((indicator: Indicator) => {
    const matchesSearch = indicator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          indicator.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = selectedStatus === '' || indicator.status?.toString() === selectedStatus;
    const matchesFrequency = selectedFrequency === '' || indicator.measurementFrequency === selectedFrequency;
    const matchesProcess = selectedProcessFilter === '' || String(indicator.process ?? '') === selectedProcessFilter;
    const matchesTrend = selectedTrendFilter === '' || String((indicator.trend || '').toLowerCase()) === selectedTrendFilter;

    return matchesSearch && matchesStatus && matchesFrequency && matchesProcess && matchesTrend;
  });

  // Handlers
  const handleCreateIndicator = () => {
    setSelectedIndicator(null);
    setShowCreateModal(true);
  };

  const handleEditIndicator = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setShowEditModal(true);
  };

  const handleDeleteIndicator = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setShowDeleteModal(true);
  };

  const handleViewIndicator = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    // Aquí podrías agregar un modal de vista si lo necesitas
  };

  const handleSubmitIndicator = async (data: any) => {
    setCrudLoading(true);
    let success = false;

    if (selectedIndicator) {
      success = await updateIndicator({ ...data, id: selectedIndicator.id });
      if (success) {
        setShowEditModal(false);
        setSelectedIndicator(null);
      }
    } else {
      success = await createIndicator(data);
      if (success) {
        setShowCreateModal(false);
      }
    }

    setCrudLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIndicator) return;

    setCrudLoading(true);
    const success = await deleteIndicator(selectedIndicator.id!);

    if (success) {
      setShowDeleteModal(false);
      setSelectedIndicator(null);
    }

    setCrudLoading(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedFrequency('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Indicadores
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra los indicadores de la organización
            </p>
          </div>

          <button
            onClick={handleCreateIndicator}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg"
          >
            <HiPlus className="w-5 h-5" />
            <span>Nuevo Indicador</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <LoadingSpinner />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filtros */}
            <FilterPanel
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedFrequency={selectedFrequency}
              onFrequencyChange={setSelectedFrequency}
              onClearFilters={handleClearFilters}
              processOptions={processOptions}
              selectedProcess={selectedProcessFilter}
              onProcessChange={setSelectedProcessFilter}
              trendOptions={trendOptions}
              selectedTrend={selectedTrendFilter}
              onTrendChange={setSelectedTrendFilter}
            />

            {/* Estadísticas */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <HiSparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filteredIndicators.length} indicador(es) encontrado(s)
                </span>
              </div>
            </div>

            {/* Tabla de indicadores */}
            <IndicatorsTable
              data={filteredIndicators}
              onEdit={handleEditIndicator}
              onDelete={handleDeleteIndicator}
              onView={handleViewIndicator}
            />

            {filteredIndicators.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <HiChartBar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No se encontraron indicadores
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Intenta ajustar los filtros o crear un nuevo indicador
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}

      {/* Modal crear indicador */}
      <CrudModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedIndicator(null);
        }}
        title="Crear Nuevo Indicador"
      >
        <IndicatorForm
          processes={processes}
          onSubmit={handleSubmitIndicator}
          loading={crudLoading}
        />
      </CrudModal>

      {/* Modal editar indicador */}
      <CrudModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedIndicator(null);
        }}
        title="Editar Indicador"
      >
        <IndicatorForm
          indicator={selectedIndicator ?? undefined}
          processes={processes}
          onSubmit={handleSubmitIndicator}
          loading={crudLoading}
        />
      </CrudModal>

      {/* Modal eliminar indicador */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedIndicator(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={crudLoading}
        itemName={selectedIndicator?.name || ''}
      />

      {/* 🐛 TEMPORAL: Componente de debug */}
      {/* {import.meta.env.MODE === 'development' && <IndicatorDebug />}*/}
    </div>
  );
};

export default IndicadoresPage;