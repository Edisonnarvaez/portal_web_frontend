import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import {
  HiChartBar,
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiExclamationTriangle
} from 'react-icons/hi2';

import { useIndicators } from '../hooks/useIndicators';
import { usePermissions } from '../hooks/usePermissions';
import type { Indicator } from '../../domain/entities/Indicator';
import IndicatorForm from '../components/Forms/IndicadoresForm';
import FilterPanel from '../components/Shared/FilterPanel';

// 📅 Función para convertir frecuencia a español
const frequencyToSpanish = (frequency: string | undefined): string => {
  if (!frequency) return 'No especificada';
  const frequencyMap: { [key: string]: string } = {
    'monthly': 'Mensual',
    'quarterly': 'Trimestral',
    'semiannual': 'Semestral',
    'annual': 'Anual'
  };
  return frequencyMap[frequency.toLowerCase()] || frequency;
};

// 📈 Función para convertir tendencia a español
const trendToSpanish = (trend: string | undefined): string => {
  if (!trend) return 'No especificada';
  const trendMap: { [key: string]: string } = {
    'increasing': 'Creciente',
    'decreasing': 'Decreciente'
  };
  return trendMap[trend.toLowerCase()] || trend;
};

// Componentes auxiliares
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

const ViewModal = ({ isOpen, onClose, indicator }: any) => {
  if (!isOpen || !indicator) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{indicator.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Código: {indicator.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción</label>
            <p className="text-gray-900 dark:text-gray-100 mt-2 leading-relaxed">
              {indicator.description || 'No disponible'}
            </p>
          </div>

          {/* Configuración */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Frecuencia</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                {frequencyToSpanish(indicator.measurementFrequency)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Meta</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                {indicator.target}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Tendencia</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                {trendToSpanish(indicator.trend)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Unidad</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                {indicator.measurementUnit || '—'}
              </p>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Numerador</label>
              <p className="text-gray-900 dark:text-gray-100 mt-1">{indicator.numerator || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Denominador</label>
              <p className="text-gray-900 dark:text-gray-100 mt-1">{indicator.denominator || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                indicator.status 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {indicator.status ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Cerrar
          </button>
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

const IndicatorsTable = ({ data, onEdit, onDelete, onView, permissions }: any) => (
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
                {frequencyToSpanish(indicator.measurementFrequency)}
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
                  {/* Botón Ver - Siempre disponible si puede ver */}
                  {permissions.canView && (
                    <button
                      onClick={() => onView(indicator)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <HiEye className="w-4 h-4" />
                    </button>
                  )}

                  {/* Botón Editar - Solo Admin */}
                  {permissions.canUpdate && (
                    <button
                      onClick={() => onEdit(indicator)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded transition-colors"
                      title="Editar"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                  )}

                  {/* Botón Eliminar - Solo Admin */}
                  {permissions.canDelete && (
                    <button
                      onClick={() => onDelete(indicator)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                      title="Eliminar"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  )}
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
  const [showViewModal, setShowViewModal] = useState(false);

  // Estados de elementos seleccionados
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  // Hook de permisos
  const { canView, canCreate, canUpdate, canDelete, roleDescription } = usePermissions('indicadores');

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
  // trend options based on indicators data - Convertir tendencias a español
  const trendOptions = Array.from(new Set((indicators || []).map((i:any) => (i.trend || '').toString().toLowerCase()).filter(Boolean))).map(t => ({ label: trendToSpanish(t), value: t }));

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
    setShowViewModal(true);
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
      {/* Header con información de permisos */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Indicadores
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {roleDescription}
            </p>
          </div>

          {/* Botón Nuevo Indicador - Solo si tiene permiso */}
          {canCreate ? (
            <button
              onClick={handleCreateIndicator}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg"
            >
              <HiPlus className="w-5 h-5" />
              <span>Nuevo Indicador</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 rounded-lg cursor-not-allowed" title="No tienes permiso para crear indicadores">
              <HiPlus className="w-5 h-5" />
              <span>Nuevo Indicador</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!canView ? (
          // Pantalla de acceso denegado
          <motion.div
            key="no-access"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="text-center">
              <HiExclamationTriangle className="w-24 h-24 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Acceso Denegado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No tienes permisos para acceder a la gestión de indicadores.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {roleDescription}
              </p>
            </div>
          </motion.div>
        ) : loading ? (
          <LoadingScreen message="Cargando indicadores..." />
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

            {/* Tabla de indicadores */}
            <IndicatorsTable
              data={filteredIndicators}
              onEdit={handleEditIndicator}
              onDelete={handleDeleteIndicator}
              onView={handleViewIndicator}
              permissions={{ canView, canCreate, canUpdate, canDelete }}
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

      {/* Modal ver indicador */}
      <ViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedIndicator(null);
        }}
        indicator={selectedIndicator}
      />

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