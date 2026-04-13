import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import SoporteExpiration from '../components/SoporteExpiration';
import SoporteCategories from '../components/SoporteCategories';
import SoporteUploadModal from '../components/SoporteUploadModal';
import SoporteViewModal from '../components/SoporteViewModal';
import SoporteEditModal from '../components/SoporteEditModal';
import SoporteChecklist from '../components/SoporteChecklist';
import SoporteCard from '../components/SoporteCard';
import { useSoporte } from '../hooks/useSoporte';
import { useDatosPrestador } from '../hooks';
import { SoporteService } from '../../application/services/SoporteService';
import { SoporteRepository } from '../../infrastructure/repositories/SoporteRepository';
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import type { CategoriaSoporte } from '../../domain/entities/SoporteDocumental';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

/**
 * Integrated page for managing supporting documents (Soportes)
 * Combines all 5 Soportes components into a cohesive interface
 * 
 * TODO (Future Improvement): Replace alert() with toast notifications library
 * - Consider using: react-toastify, sonner, or custom toast system
 * - Better UX than browser alerts
 */
const SoportesPage: React.FC = () => {
  const { prestadorId } = useParams<{ prestadorId?: string }>();
  const navigate = useNavigate();

  // State management
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [selectedSoporte, setSelectedSoporte] = useState<SoporteDocumental | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [pageError, setPageError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<'delete' | 'edit' | null>(null);
  const [filterByExpiring, setFilterByExpiring] = useState(false);

  // Hooks
  const {
    soportes,
    loading: isLoading,
    error: loadError,
    fetchSoportesByPrestador, // ✅ NUEVO
    tiposDocumento, // ✅ NUEVO: Cargar tipos para filtrado
    fetchTipos, // ✅ NUEVO: Método para cargar tipos
    createCategoria,
  } = useSoporte();

  const {
    datos: prestadores,
    loading: loadingPrestadores,
    fetchDatos: fetchPrestadores,
  } = useDatosPrestador();

  // Initialize SoporteService for operations not exposed by hook
  const soporteRepository = new SoporteRepository() as any;
  const soporteService = new SoporteService(soporteRepository);

  // Load data on component mount and when prestadorId changes
  useEffect(() => {
    // If no prestadorId, load all prestadores for selection
    if (!prestadorId) {
      setPageError(null);
      fetchPrestadores();
      return;
    }

    const prestadorIdNum = Number(prestadorId);
    if (isNaN(prestadorIdNum) || prestadorIdNum <= 0) {
      setPageError('ID de prestador inválido. Por favor verifique la URL.');
      return;
    }

    // Clear error and load data
    setPageError(null);
    fetchSoportesByPrestador(prestadorIdNum); // ✅ USO fetchSoportesByPrestador
    fetchTipos(); // ✅ NUEVO: Cargar tipos para usar en filtrado
  }, [prestadorId, fetchSoportesByPrestador, fetchPrestadores, fetchTipos]);

  // ✅ NUEVO: Crear un mapa de tipo_documento_id -> categoria_id para filtrado eficiente
  const tipoToCategoriaMap = React.useMemo(() => {
    const map = new Map<number, number>();
    tiposDocumento.forEach(tipo => {
      map.set(tipo.id, tipo.categoria);
    });
    return map;
  }, [tiposDocumento]);

  // Helper to get days until expiry
  const getDaysUntilExpiry = (fechaVencimiento: string | null | undefined): number => {
    if (!fechaVencimiento) return 999;
    const today = new Date();
    const expiryDate = new Date(fechaVencimiento);
    const diff = expiryDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Filter soportes by selected category
  // ✅ MEJORADO: Usar mapa de tipos para obtener categoría de cada documento
  // ✅ NUEVO: También filtrar por documentos próximos a vencer si está activado
  const filteredSoportes = React.useMemo(() => {
    let result = soportes;

    // Apply category filter
    if (selectedCategoryId) {
      result = result.filter((soporte) => {
        const categoriaId = tipoToCategoriaMap.get(soporte.tipo_documento);
        return categoriaId === selectedCategoryId;
      });
    }

    // Apply expiring filter
    if (filterByExpiring) {
      result = result.filter((soporte) => {
        const daysLeft = getDaysUntilExpiry(soporte.fecha_vencimiento);
        return daysLeft <= 30 && daysLeft >= 0;
      });
    }

    return result;
  }, [soportes, selectedCategoryId, tipoToCategoriaMap, filterByExpiring]);

  const handleCategorySelect = (categoryId: number) => {
    if (categoryId === 0) {
      // "Mostrar todos" clicked
      setSelectedCategoryId(undefined);
    } else {
      setSelectedCategoryId(categoryId);
    }
  };

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    // Refresh the list
    try {
      const prestadorIdNum = Number(prestadorId);
      await fetchSoportesByPrestador(prestadorIdNum); // ✅ ACTUALIZADO
      alert('✅ Documento subido exitosamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al recargar documentos';
      alert(`⚠️  Documento subido pero hubo error al recargar la lista: ${message}`);
    }
  };

  const handleViewDocument = (soporte: SoporteDocumental) => {
    setSelectedSoporte(soporte);
    setShowViewModal(true);
  };

  const handleEditDocument = (soporte: SoporteDocumental) => {
    setSelectedSoporte(soporte);
    setShowEditModal(true);
  };

  const handleSaveEditDocument = async (soporte: SoporteDocumental, updates: Partial<SoporteDocumental>) => {
    setOperationLoading('edit');
    try {
      await soporteService.updateSoporte(soporte.id, updates);
      // Refresh the list
      const prestadorIdNum = Number(prestadorId);
      await fetchSoportesByPrestador(prestadorIdNum); // ✅ ACTUALIZADO
      // Close modal
      setShowEditModal(false);
      setSelectedSoporte(null);
      alert('✅ Documento actualizado exitosamente');
    } catch (error) {
      console.error('Error saving document:', error);
      alert(
        error instanceof Error
          ? `❌ Error: ${error.message}`
          : '❌ Error al actualizar el documento'
      );
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      // Request confirmation from user
      const confirmed = window.confirm(
        '¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.'
      );
      
      if (!confirmed) {
        // User canceled
        return;
      }

      setOperationLoading('delete');

      // Delete the document
      await soporteService.deleteSoporte(documentId);

      // Refresh the list
      const prestadorIdNum = Number(prestadorId);
      await fetchSoportesByPrestador(prestadorIdNum); // ✅ ACTUALIZADO
      
      // Show success message
      alert('✅ Documento eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el documento';
      console.error('Error deleting document:', error);
      alert(`❌ Error al eliminar documento: ${errorMessage}`);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleCategoryCreate = async (category: Partial<CategoriaSoporte>) => {
    try {
      // Validate required fields
      if (!category.nombre || category.nombre.trim().length === 0) {
        alert('❌ El nombre de la categoría es requerido');
        return;
      }

      // Create the category using hook method
      const newCategory = await createCategoria(category);
      
      // Show success message
      alert(`✅ Categoría "${newCategory.nombre}" creada exitosamente`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la categoría';
      console.error('Error creating category:', error);
      alert(`❌ Error al crear categoría: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error al cargar la página</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{pageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!prestadorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Gestionar Soportes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Selecciona un prestador para gestionar sus documentos de soporte
            </p>
          </div>

          {/* Loading State */}
          {loadingPrestadores ? (
            <LoadingScreen />
          ) : prestadores.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No hay prestadores disponibles
              </p>
            </div>
          ) : (
            /* Prestadores Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {prestadores.map((prestador) => (
                <button
                  key={prestador.id}
                  onClick={() => navigate(`/habilitacion/soportes/${prestador.id}`)}
                  className="group text-left bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {prestador.codigo_reps}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 truncate mt-1">
                        {prestador.company_name || 'Sin nombre'}
                      </p>
                    </div>
                    <HiOutlineArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Sede:</span>
                      <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                        {prestador.headquarters_detail?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Clase:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {prestador.clase_prestador}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          prestador.estado_habilitacion === 'HABILITADA'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : prestador.estado_habilitacion === 'EN_PROCESO'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {prestador.estado_habilitacion}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                      Click para gestionar soportes →
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-1.5 sm:p-2 lg:p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header - Fully Responsive */}
        <div className="mb-1">
          <div className="flex flex-col gap-1 mb-1">
            {/* Title + Toggle Sidebar Button */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  Gestión Soportes
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                  Docs
                </p>
              </div>
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden px-1.5 py-0.5 bg-blue-600 text-white rounded text-sm font-medium transition-colors flex-shrink-0"
              title="Categorías"
            >
              📂
            </button>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full px-1.5 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 font-semibold shadow-md transition-colors text-xs"
            >
              ↑ Subir
            </button>
          </div>

          {/* Error Message - Responsive */}
          {loadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3 text-red-700 dark:text-red-400 text-xs sm:text-sm">
              ⚠️ {loadError}
            </div>
          )}
        </div>

        {/* Alerts Section - Critical Expiration Warnings */}
        <div className="mb-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1.5">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1.5">
              ⏰ Vencimientos
            </h2>
            <div className="overflow-x-auto scrollbar-thin">
              <SoporteExpiration
                soportes={soportes}
                showDismissible={true}
                compact={true}
                onViewExpiringClick={() => setFilterByExpiring(!filterByExpiring)}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid - Responsive with Mobile Sidebar Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 lg:gap-2">
          {/* Sidebar - Categories - Mobile Modal / Desktop Sticky */}
          {/* Desktop Version: Always Visible */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1.5 lg:sticky lg:top-2">
              <SoporteCategories
                prestadorId={Number(prestadorId) || 0}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
                showCreateForm={false}
                onCreateCategory={handleCategoryCreate}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Mobile Version: Collapsible Modal */}
          {showMobileSidebar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden">
              <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-lg rounded-r-lg overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Categorías</h3>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <SoporteCategories
                  prestadorId={Number(prestadorId) || 0}
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={(catId) => {
                    setSelectedCategoryId(catId);
                    setShowMobileSidebar(false);
                  }}
                  showCreateForm={false}
                  onCreateCategory={handleCategoryCreate}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* Main Area - Documents */}
          <div className="lg:col-span-2 space-y-1">
            {/* View Mode Toggle - Responsive */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {filteredSoportes.length}
                </div>
                {filterByExpiring && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                    ⏰ Filtrando
                  </span>
                )}
              </div>
              <div className="flex gap-0.5 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-none px-1 py-0.5 rounded text-xs transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  📋
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 sm:flex-none px-1 py-0.5 rounded text-xs transition-colors ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  🃏
                </button>
              </div>
            </div>

            {/* Documents List View */}
            {viewMode === 'list' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <SoporteChecklist
                    soportes={filteredSoportes}
                    isLoading={isLoading}
                    onViewDetails={handleViewDocument}
                    onEdit={handleEditDocument}
                    onDelete={handleDeleteDocument}
                  />
                </div>
              </div>
            )}

            {/* Documents Cards View - Fully Responsive */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-1">
                {filteredSoportes.length === 0 ? (
                  <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-3 lg:p-4 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                      {selectedCategoryId
                        ? 'No hay documentos en esta categoría'
                        : 'No hay documentos cargados'}
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-2 sm:mt-3 px-2 sm:px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-xs"
                    >
                      Subir primer documento
                    </button>
                  </div>
                ) : (
                  filteredSoportes.map((soporte) => (
                    <SoporteCard
                      key={soporte.id}
                      soporte={soporte}
                      onViewDetails={handleViewDocument}
                      onEdit={handleEditDocument}
                      onDelete={handleDeleteDocument}
                      isLoading={operationLoading !== null}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <SoporteUploadModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
            }}
            onUploadSuccess={handleUploadSuccess}
            prestadorId={Number(prestadorId) || 0} // ✅ NUEVO: Pasar prestadorId
          />
        )}

        {/* View Modal */}
        {showViewModal && (
          <SoporteViewModal
            isOpen={showViewModal}
            soporte={selectedSoporte}
            onClose={() => {
              setShowViewModal(false);
              setSelectedSoporte(null);
            }}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <SoporteEditModal
            isOpen={showEditModal}
            soporte={selectedSoporte}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSoporte(null);
            }}
            onSave={handleSaveEditDocument}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default SoportesPage;
