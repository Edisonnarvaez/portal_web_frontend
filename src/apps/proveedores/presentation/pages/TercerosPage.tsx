import React, { useState } from 'react';
import { HiPlus, HiArrowPath, HiEye, HiPencil, HiTrash } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../../shared/components/Button';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { useTerceros } from '../hooks/useTerceros';
import { useTerceroFilters } from '../hooks/useTerceroFilters';
import TerceroFilters from '../components/TerceroFilters';
import TerceroTable from '../components/TerceroTable';
import TerceroForm from '../components/TerceroForm';
import TerceroView from '../components/TerceroView';
import type { Tercero, CreateTerceroRequest, UpdateTerceroRequest } from '../../domain/entities/Tercero';

// Componentes auxiliares
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
    <div className="text-red-600 dark:text-red-400 mb-4">
      <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-lg font-medium">Error al cargar los datos</h3>
      <p className="text-sm mt-1">{message}</p>
    </div>
    <Button onClick={onRetry} variant="primary">
      Intentar nuevamente
    </Button>
  </div>
);

const CrudModal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default function TercerosPage() {
  // Estados principales
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados de elementos seleccionados
  const [selectedTercero, setSelectedTercero] = useState<Tercero | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  // Hooks personalizados
  const {
    terceros,
    paises,
    departamentos,
    municipios,
    tiposTercero,
    loading,
    error,
    fetchTerceros,
    fetchDepartamentos,
    fetchMunicipios,
    createTercero,
    updateTercero,
    deleteTercero,
    terceroService
  } = useTerceros();

  const { filters, filteredTerceros, updateFilter, clearFilters } = useTerceroFilters(terceros);

  // Handlers para modales
  const handleCreateTercero = () => {
    setSelectedTercero(null);
    setShowCreateModal(true);
  };

  const handleEditTercero = (tercero: Tercero) => {
    setSelectedTercero(tercero);
    setShowEditModal(true);
  };

  const handleViewTercero = (tercero: Tercero) => {
    setSelectedTercero(tercero);
    setShowViewModal(true);
  };

  const handleDeleteTercero = (tercero: Tercero) => {
    setSelectedTercero(tercero);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedTercero(null);
    setCrudLoading(false);
  };

  // Handlers para CRUD operations
  const handleSubmitTercero = async (data: CreateTerceroRequest | UpdateTerceroRequest) => {
    setCrudLoading(true);
    let success = false;

    try {
      if (selectedTercero) {
        // Actualizar tercero existente
        success = await updateTercero(data as UpdateTerceroRequest);
      } else {
        // Crear nuevo tercero
        success = await createTercero(data as CreateTerceroRequest);
      }

      if (success) {
        handleCloseModals();
      }
    } catch (error) {
      // Let the form display validation errors by rethrowing
      console.error('Error en handleSubmitTercero:', error);
      throw error;
    } finally {
      setCrudLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTercero?.tercero_id) return;

    setCrudLoading(true);
    const success = await deleteTercero(selectedTercero.tercero_id);

    if (success) {
      handleCloseModals();
    }
    setCrudLoading(false);
  };

  // Handler para refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTerceros();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Render de estados de carga y error
  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <LoadingSpinner />
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
            Cargando terceros...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Terceros
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra la información de personas naturales y jurídicas
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <HiArrowPath className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button
              onClick={handleCreateTercero}
              variant="primary"
              className="flex items-center gap-2"
            >
              <HiPlus className="w-4 h-4" />
              Nuevo Tercero
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <TerceroFilters
        filters={filters}
        tiposTercero={tiposTercero}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />

      {/* Tabla de resultados */}
      <AnimatePresence mode="wait">
        <motion.div
          key="table"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <TerceroTable
            terceros={filteredTerceros}
            tiposTercero={tiposTercero}
            onView={handleViewTercero}
            onEdit={handleEditTercero}
            onDelete={handleDeleteTercero}
            getTipoDocumentoLabel={terceroService.getTipoDocumentoLabel}
            getNombreCompleto={terceroService.getNombreCompleto}
          />
        </motion.div>
      </AnimatePresence>

      {/* Modales */}
      <AnimatePresence>
        {/* Modal crear tercero */}
        <CrudModal
          isOpen={showCreateModal}
          onClose={handleCloseModals}
          title="Crear Nuevo Tercero"
        >
          <TerceroForm
            paises={paises}
            departamentos={departamentos}
            municipios={municipios}
            tiposTercero={tiposTercero}
            onSubmit={handleSubmitTercero}
            onCancel={handleCloseModals}
            onDepartamentoChange={fetchDepartamentos}
            onMunicipioChange={fetchMunicipios}
            loading={crudLoading}
          />
        </CrudModal>

        {/* Modal editar tercero */}
        <CrudModal
          isOpen={showEditModal}
          onClose={handleCloseModals}
          title="Editar Tercero"
        >
          <TerceroForm
            tercero={selectedTercero || undefined}
            paises={paises}
            departamentos={departamentos}
            municipios={municipios}
            tiposTercero={tiposTercero}
            onSubmit={handleSubmitTercero}
            onCancel={handleCloseModals}
            onDepartamentoChange={fetchDepartamentos}
            onMunicipioChange={fetchMunicipios}
            loading={crudLoading}
          />
        </CrudModal>

        {/* Modal ver tercero */}
        <CrudModal
          isOpen={showViewModal}
          onClose={handleCloseModals}
          title="Detalles del Tercero"
        >
          {selectedTercero && (
            <TerceroView
              tercero={selectedTercero}
              paises={paises}
              departamentos={departamentos}
              municipios={municipios}
              tiposTercero={tiposTercero}
              getTipoDocumentoLabel={terceroService.getTipoDocumentoLabel}
              getNombreCompleto={terceroService.getNombreCompleto}
              onEdit={() => {
                setShowViewModal(false);
                setShowEditModal(true);
              }}
              onClose={handleCloseModals}
            />
          )}
        </CrudModal>
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        title="Eliminar Tercero"
        message={`¿Estás seguro de que deseas eliminar el tercero "${selectedTercero ? terceroService.getNombreCompleto(selectedTercero) : ''}"? Esta acción no se puede deshacer.`}
        confirmText={crudLoading ? 'Eliminando...' : 'Eliminar'}
        cancelText="Cancelar"
        type="danger"
      />

      {/* Información de resultados */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Mostrando {filteredTerceros.length} de {terceros.length} terceros
          </span>
          {filters.searchTerm || filters.selectedTipoDocumento || filters.selectedTipoTercero || 
           filters.selectedEstado || filters.selectedProveedor ? (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}