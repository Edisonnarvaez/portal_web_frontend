import React, { useState, useCallback } from 'react';
import { HiOutlineDocumentText, HiRefresh } from 'react-icons/hi';
import { FaUpload, FaTimes } from 'react-icons/fa';

import { useDocumentCRUD } from '../hooks/useDocumentCRUD';
import { useDocumentPermissions } from '../hooks/useDocumentPermissions';
import { useDocumentFilters } from '../hooks/useDocumentFilters';
import { useFileHandling } from '../hooks/useFileHandling';

import DocumentTable from '../components/DocumentTable/DocumentTable';
import DocumentFilters from '../components/DocumentFilters/DocumentFilters';
import DocumentStats from '../components/DocumentFilters/DocumentStats';
import FormModal from '../components/DocumentModals/FormModal';
import ViewModal from '../components/DocumentModals/ViewModal';
import ExcelViewer from '../components/DocumentModals/ExcelViewer';
import WordViewer from '../components/DocumentModals/WordViewer';
import ConfirmDeleteModal from '../components/DocumentModals/ConfirmDeleteModal';
import PdfViewer from '../components/PdfViewer';

import type { Document } from '../../domain/entities/Document';
import { FileHandlingService } from '../../application/services/FileHandlingService';

export default function ProcesosPage() {
  //const permissions = useDocumentPermissions();
  const permissions = useDocumentPermissions("procesos");
  const {
    documents,
    processes,
    processTypes,
    loading,
    error: crudError, // Renombrar para evitar conflicto
    createDocument,
    updateDocument,
    deleteDocument,
    documentService,
    fetchDocuments,
    fetchProcesses,
    fetchProcessTypes
  } = useDocumentCRUD();

  const { filters, filteredDocuments, updateFilter, clearFilters } = useDocumentFilters(documents, processes, processTypes, permissions);
  const { handleDownload, handlePreview, processExcelFile } = useFileHandling();

  // Estados para modales
  const [modals, setModals] = useState({
    isFormOpen: false,
    isEditFormOpen: false,
    isViewOpen: false,
    isConfirmDeleteOpen: false,
    isDocumentViewerOpen: false,
    isExcelViewerOpen: false,
    isWordViewerOpen: false
  });

  // Estados para datos de modales
  const [modalData, setModalData] = useState({
    editingDocument: null as Document | null,
    viewingDocument: null as Document | null,
    deletingDocument: null as Document | null,
    currentDocumentUrl: '',
    currentDocumentTitle: '',
    excelData: {} as { [key: string]: any[][] },
    excelSheets: [] as string[],
    currentSheet: '',
    currentExcelDocument: null as Document | null,
    currentExcelType: null as 'oficial' | 'editable' | null,
    currentWordDocument: null as Document | null,
    currentWordType: null as 'oficial' | 'editable' | null
  });

  const [loadingExcel, setLoadingExcel] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // Estado local para errores específicos del componente
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handlers para modales
  const openModal = (modalName: keyof typeof modals, data?: any) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (data) {
      setModalData(prev => ({ ...prev, ...data }));
    }
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    // Limpiar datos específicos del modal
    if (modalName === 'isDocumentViewerOpen') {
      if (modalData.currentDocumentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(modalData.currentDocumentUrl);
      }
      setModalData(prev => ({ ...prev, currentDocumentUrl: '', currentDocumentTitle: '' }));
    }
  };

  const closeAllModals = () => {
    setModals({
      isFormOpen: false,
      isEditFormOpen: false,
      isViewOpen: false,
      isConfirmDeleteOpen: false,
      isDocumentViewerOpen: false,
      isExcelViewerOpen: false,
      isWordViewerOpen: false
    });
    setModalData({
      editingDocument: null,
      viewingDocument: null,
      deletingDocument: null,
      currentDocumentUrl: '',
      currentDocumentTitle: '',
      excelData: {},
      excelSheets: [],
      currentSheet: '',
      currentExcelDocument: null,
      currentExcelType: null,
      currentWordDocument: null,
      currentWordType: null
    });
  };

  // Función para recargar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchDocuments(), fetchProcesses()]);
      setMessage('Datos actualizados correctamente');
    } catch (error) {
      setError('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handlers para acciones
  const handleView = (document: Document) => {
    openModal('isViewOpen', { viewingDocument: document });
  };

  const handleEdit = (document: Document) => {
    if (!permissions.canManage) return;
    openModal('isEditFormOpen', { editingDocument: document });
  };

  const handleDelete = (document: Document) => {
    if (!permissions.canManage) return;
    openModal('isConfirmDeleteOpen', { deletingDocument: document });
  };

  const handleViewDocument = async (document: Document, type: 'oficial' | 'editable' = 'oficial') => {
    const archivoUrl = type === 'oficial' ? document.archivo_oficial : document.archivo_editable;
    if (!archivoUrl) {
      setMessage("No hay archivo disponible para visualizar");
      return;
    }

    const fileType = FileHandlingService.getFileExtension(archivoUrl);

    try {
      if (fileType === 'pdf') {
        const url = await handlePreview(document.id, type);
        openModal('isDocumentViewerOpen', {
          currentDocumentUrl: url,
          currentDocumentTitle: `${document.codigo_documento} v${document.version} - ${document.nombre_documento} (${type})`
        });
      } else if (['xls', 'xlsx'].includes(fileType)) {
        await handleViewExcel(document, type);
      } else if (['doc', 'docx'].includes(fileType)) {
        await handleViewWord(document, type);
      }
    } catch (error) {
      setError('Error al cargar el archivo');
    }
  };

  const handleViewExcel = async (document: Document, type: 'oficial' | 'editable') => {
    setLoadingExcel(true);
    try {
      const blob = await documentService.previewDocument(document.id, type);
      const { data, sheets } = await processExcelFile(blob);

      openModal('isExcelViewerOpen', {
        excelData: data,
        excelSheets: sheets,
        currentSheet: sheets[0],
        currentExcelDocument: document,
        currentExcelType: type
      });
    } catch (error) {
      setError('Error al cargar el archivo Excel');
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleViewWord = async (document: Document, type: 'oficial' | 'editable') => {
    const title = `${document.codigo_documento} v${document.version} - ${document.nombre_documento}`;

    openModal('isWordViewerOpen', {
      currentDocumentTitle: title,
      currentWordDocument: document,
      currentWordType: type
    });
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (modals.isEditFormOpen && modalData.editingDocument) {
        await updateDocument(modalData.editingDocument.id, formData);
        setMessage('Documento actualizado exitosamente');
      } else {
        await createDocument(formData);
        setMessage('Documento creado exitosamente');
      }
      closeAllModals();
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al guardar el documento');
    }
  };

  const handleConfirmDelete = async () => {
    if (!modalData.deletingDocument) return;

    try {
      await deleteDocument(modalData.deletingDocument.id);
      setMessage('Documento eliminado exitosamente');
      closeAllModals();
    } catch (error) {
      setError('Error al eliminar el documento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Usar crudError en lugar de error para el error del hook
  if (crudError) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        {crudError}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <HiOutlineDocumentText className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sistema de Gestion Institucional
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {permissions.isAdmin ? 'Gestión completa de documentos del sistema de calidad' :
                permissions.isGestor ? 'Consulta y descarga de documentos del sistema de calidad' :
                  'Consulta de documentos del sistema de calidad'}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Botón de recarga - visible para todos los roles */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`
    group px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 justify-center
    ${isRefreshing
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 active:scale-95'
              }
  `}
            title="Actualizar datos"
          >
            <HiRefresh
              size={16}
              className={`transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </span>
          </button>

          {/* Botón subir documento - solo para admin */}
          {permissions.canManage && (
            <button
              onClick={() => openModal('isFormOpen')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
            >
              <FaUpload size={16} />
              Subir Documento
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:border-green-600 dark:text-green-200">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Filtros */}
      <DocumentFilters
        filters={filters}
        processes={processes}
        processTypes={processTypes}
        permissions={permissions}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />

      {/* Estadísticas */}
      <DocumentStats
        documents={documents}
        filteredDocuments={filteredDocuments}
        permissions={permissions}
      />

      {/* Tabla */}
      <DocumentTable
        documents={filteredDocuments}
        processes={processes}
        permissions={permissions}
        onView={handleView}
        onViewDocument={handleViewDocument}
        onDownload={handleDownload}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loadingExcel={loadingExcel}
      />

      {/* Modales */}
      {modals.isFormOpen && (
        <FormModal
          documents={documents}
          processes={processes}
          documentService={documentService}
          onSubmit={handleFormSubmit}
          onCancel={() => closeModal('isFormOpen')}
        />
      )}

      {modals.isEditFormOpen && modalData.editingDocument && (
        <FormModal
          isEdit={true}
          document={modalData.editingDocument}
          documents={documents}
          processes={processes}
          documentService={documentService}
          onSubmit={handleFormSubmit}
          onCancel={() => closeModal('isEditFormOpen')}
        />
      )}

      {modals.isViewOpen && modalData.viewingDocument && (
        <ViewModal
          document={modalData.viewingDocument}
          processes={processes}
          permissions={permissions}
          documentService={documentService}
          onClose={() => closeModal('isViewOpen')}
        />
      )}

      {modals.isConfirmDeleteOpen && modalData.deletingDocument && (
        <ConfirmDeleteModal
          document={modalData.deletingDocument}
          onConfirm={handleConfirmDelete}
          onCancel={() => closeModal('isConfirmDeleteOpen')}
        />
      )}

      {modals.isDocumentViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {modalData.currentDocumentTitle || "Vista previa del documento"}
              </h3>
              <button
                onClick={() => closeModal('isDocumentViewerOpen')}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <PdfViewer fileUrl={modalData.currentDocumentUrl} />
            </div>
          </div>
        </div>
      )}

      <ExcelViewer
        isOpen={modals.isExcelViewerOpen}
        excelData={modalData.excelData}
        excelSheets={modalData.excelSheets}
        currentSheet={modalData.currentSheet}
        currentExcelDocument={modalData.currentExcelDocument}
        currentExcelType={modalData.currentExcelType}
        onSheetChange={(sheet) => setModalData(prev => ({ ...prev, currentSheet: sheet }))}
        onDownload={handleDownload}
        onClose={() => closeModal('isExcelViewerOpen')}
      />

      <WordViewer
        isOpen={modals.isWordViewerOpen}
        currentDocumentTitle={modalData.currentDocumentTitle}
        currentWordDocument={modalData.currentWordDocument}
        currentWordType={modalData.currentWordType}
        onDownload={handleDownload}
        onClose={() => closeModal('isWordViewerOpen')}
      />
    </div>
  );
}