import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SoporteExpiration from '../components/SoporteExpiration';
import SoporteCategories from '../components/SoporteCategories';
import SoporteUploadModal from '../components/SoporteUploadModal';
import SoporteViewModal from '../components/SoporteViewModal';
import SoporteEditModal from '../components/SoporteEditModal';
import SoporteChecklist from '../components/SoporteChecklist';
import SoporteCard from '../components/SoporteCard';
import { useSoporte } from '../hooks/useSoporte';
import { SoporteService } from '../../application/services/SoporteService';
import { SoporteRepository } from '../../infrastructure/repositories/SoporteRepository';
import type { CategoriaSoporte } from '../../domain/entities/SoporteDocumental';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

/**
 * Integrated page for managing supporting documents (Soportes)
 * Combines all 5 Soportes components into a cohesive interface
 */
const SoportesPage: React.FC = () => {
  const { prestadorId } = useParams<{ prestadorId?: string }>();

  // State management
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [selectedSoporte, setSelectedSoporte] = useState<SoporteDocumental | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  // Hook for Soportes data
  const {
    soportes,
    loading: isLoading,
    error: loadError,
    fetchSoportes,
    createCategoria,
  } = useSoporte();

  // Initialize SoporteService for operations not exposed by hook
  const soporteRepository = new SoporteRepository() as any;
  const soporteService = new SoporteService(soporteRepository);

  // Load data on component mount
  useEffect(() => {
    fetchSoportes();
  }, []);

  // TODO: Filter soportes by selected category once type relationships are properly loaded
  const filteredSoportes = soportes;

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    // Refresh the list
    await fetchSoportes();
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
    try {
      await soporteService.updateSoporte(soporte.id, updates);
      // Refresh the list
      await fetchSoportes();
      // Close modal
      setShowEditModal(false);
      setSelectedSoporte(null);
      alert('✅ Documento actualizado exitosamente');
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
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

      // Delete the document
      await soporteService.deleteSoporte(documentId);

      // Refresh the list
      await fetchSoportes();
      
      // Show success message
      alert('✅ Documento eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el documento';
      console.error('Error deleting document:', error);
      alert(`❌ Error al eliminar documento: ${errorMessage}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Fully Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            {/* Title + Toggle Sidebar Button */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Soportes
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                  Administra y controla todos los documentos requeridos
                </p>
              </div>
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                title="Mostrar/ocultar categorías"
              >
                📂
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm sm:text-base"
            >
              + Subir Documento
            </button>
          </div>

          {/* Error Message - Responsive */}
          {loadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 text-red-700 dark:text-red-400 text-xs sm:text-sm">
              ⚠️ {loadError}
            </div>
          )}
        </div>

        {/* Alerts Section - Critical Expiration Warnings */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
              ⏰ Estado de Vencimientos
            </h2>
            <div className="overflow-x-auto scrollbar-thin">
              <SoporteExpiration
                soportes={soportes}
                showDismissible={true}
                compact={false}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid - Responsive with Mobile Sidebar Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Sidebar - Categories - Mobile Modal / Desktop Sticky */}
          {/* Desktop Version: Always Visible */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 lg:p-6 lg:sticky lg:top-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <SoporteCategories
                prestadorId={Number(prestadorId) || 0}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategoryId}
                showCreateForm={true}
                onCreateCategory={handleCategoryCreate}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Mobile Version: Collapsible Modal */}
          {showMobileSidebar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
              <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg rounded-r-lg overflow-y-auto p-4">
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
                  showCreateForm={true}
                  onCreateCategory={handleCategoryCreate}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* Main Area - Documents */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* View Mode Toggle - Responsive */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-3 lg:p-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {filteredSoportes.length} documento(s)
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  📋 Lista
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  🃏 Tarjetas
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
                  />
                </div>
              </div>
            )}

            {/* Documents Cards View - Fully Responsive */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                {filteredSoportes.length === 0 ? (
                  <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 lg:p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                      {selectedCategoryId
                        ? 'No hay documentos en esta categoría'
                        : 'No hay documentos cargados'}
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-3 sm:mt-4 px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-xs sm:text-sm"
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
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={handleUploadSuccess}
            nivel="EMPRESA"
            contextId={Number(prestadorId) || 0}
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
