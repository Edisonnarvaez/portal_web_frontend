import { useState } from 'react';
import { HiOutlineDocumentText, HiRefresh } from 'react-icons/hi';
import { FaUpload, FaTimes } from 'react-icons/fa';
import LoadingScreen from '../../../../shared/components/LoadingScreen';

import { useDocumentCRUD } from '../hooks/useDocumentCRUD';
import { useDocumentPermissions } from '../hooks/useDocumentPermissions';
import { useDocumentFilters } from '../hooks/useDocumentFilters';
import { useFileHandling } from '../hooks/useFileHandling';

// Función auxiliar para procesar errores y generar mensajes específicos
const getSpecificErrorMessage = (error: any, action: string, context?: string): string => {
  // Errores HTTP del servidor - primero intentar obtener mensaje específico del backend
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    // Si ya es un mensaje específico, usarlo directamente
    if (typeof detail === 'string' && detail.length > 20) {
      return detail;
    }
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Errores por código HTTP específico con mensajes más detallados
  if (error.response?.status === 400) {
    return `Solicitud inválida: Verifica que todos los datos sean correctos. ${error.response?.data?.detail || ''}`;
  }

  if (error.response?.status === 403) {
    return `Acceso denegado: No tienes permisos para ${action}`;
  }

  if (error.response?.status === 404) {
    return `${context || 'El documento'} no fue encontrado. Puede haber sido eliminado.`;
  }

  if (error.response?.status === 409) {
    // Conflicto - generalmente es código duplicado
    const detail = error.response?.data?.detail || '';
    if (detail.includes('código') || detail.includes('codigo')) {
      return `El código de documento ya existe: ${detail}. Usa un código único.`;
    }
    return `Conflicto: ${detail || 'El documento ya existe o ha sido modificado. Intenta recargar los datos.'}`;
  }

  if (error.response?.status === 413) {
    return `El archivo es demasiado grande. Tamaño máximo permitido: ${error.response?.data?.max_size || 'verificar en configuración'}`;
  }

  if (error.response?.status === 422) {
    const errors = error.response?.data?.errors || error.response?.data?.detail || {};
    if (typeof errors === 'object') {
      const errorList = Object.entries(errors)
        .map(([field, msg]: any) => `${field}: ${msg}`)
        .join(' | ');
      return `Datos inválidos: ${errorList}`;
    }
    return `Datos incompletos o inválidos: ${errors}. Verifica que todos los campos requeridos estén completos.`;
  }

  if (error.response?.status === 500) {
    return `Error del servidor: La solicitud no pudo completarse. ${error.response?.data?.detail || 'Intenta nuevamente más tarde.'}`;
  }

  // Errores de validación o tipo de archivo
  if (error.message?.includes('File type')) {
    return `Tipo de archivo no válido. Verifica que sea un formato soportado (PDF, Excel, Word).`;
  }

  if (error.message?.includes('CORS')) {
    return `Error de seguridad al acceder al archivo. Contacta al administrador.`;
  }

  if (error.message?.includes('Network')) {
    return `Error de conexión: Verifica tu conexión a internet.`;
  }

  // Si es un error personalizado que ya tiene mensaje
  if (error.message && !error.message.includes('Error al')) {
    return error.message;
  }

  // Error genérico con acción para el usuario
  return `Error al ${action}${context ? ` de ${context}` : ''}. Intenta nuevamente.`;
};

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
    fetchProcesses
  } = useDocumentCRUD();

  const { filters, filteredDocuments, updateFilter, clearFilters } = useDocumentFilters(documents, processes, processTypes, permissions);
  const { handleDownload, handlePreview, processExcelFile } = useFileHandling();
  const [zoomInstance, setZoomInstance] = useState<any>(null);

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
    excelMerged: {} as { [key: string]: string[] },
    excelStyles: {} as any,
    currentWordDocument: null as Document | null,
    currentWordType: null as 'oficial' | 'editable' | null,
    wordBlob: undefined as Blob | undefined
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
      excelMerged: {},
      excelStyles: {},
      currentWordDocument: null,
      currentWordType: null,
      wordBlob: undefined
    });
  };

  // Función para recargar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(''); // Limpiar errores previos
    try {
      await Promise.all([fetchDocuments(), fetchProcesses()]);
      setMessage('Datos actualizados correctamente');
    } catch (error) {
      const errorMsg = getSpecificErrorMessage(error, 'actualizar los datos');
      setError(`Error al recargar: ${errorMsg}`);
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
      const tipoArchivo = type === 'oficial' ? 'oficial' : 'editable';
      setError(`No hay versión ${tipoArchivo} disponible para este documento. Verifica que se haya cargado correctamente.`);
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
      } else {
        setError(`Tipo de archivo no soportado: .${fileType}. Solo se pueden visualizar archivos PDF, Excel y Word.`);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError(`El archivo no fue encontrado. El documento "${document.nombre_documento}" puede haber sido eliminado del servidor.`);
      } else if (error.response?.status === 403) {
        setError(`No tienes permisos para acceder a este documento.`);
      } else if (error.message?.includes('Network')) {
        setError(`Error de conexión al cargar el archivo. Verifica tu conexión a internet.`);
      } else {
        const errorMsg = getSpecificErrorMessage(error, 'cargar el archivo', document.nombre_documento);
        setError(errorMsg);
      }
    }
  };

  const handleViewExcel = async (document: Document, type: 'oficial' | 'editable') => {
    setLoadingExcel(true);
    setError(''); // Limpiar errores previos
    try {
      const blob = await documentService.previewDocument(document.id, type);

      if (!blob || blob.size === 0) {
        setError('El archivo Excel está vacío o no se pudo procesar correctamente.');
        setLoadingExcel(false);
        return;
      }

      const { data, sheets, merged, styles } = await processExcelFile(blob);

      if (!sheets || sheets.length === 0) {
        setError('El archivo Excel no contiene hojas válidas para mostrar.');
        setLoadingExcel(false);
        return;
      }

      openModal('isExcelViewerOpen', {
        excelData: data,
        excelSheets: sheets,
        currentSheet: sheets[0],
        currentExcelDocument: document,
        currentExcelType: type,
        excelMerged: merged,
        excelStyles: styles
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError(`El archivo Excel no fue encontrado. Verifica que el documento "${document.nombre_documento}" aún existe.`);
      } else if (error.response?.status === 403) {
        setError(`No tienes permisos para visualizar este archivo.`);
      } else if (error.message?.includes('Invalid')) {
        setError(`El archivo Excel no es válido o está corrupto. Intenta descargarlo y verificarlo localmente.`);
      } else if (error.message?.includes('Network')) {
        setError(`Error de conexión al cargar el archivo. Verifica tu conexión a internet.`);
      } else {
        const errorMsg = getSpecificErrorMessage(error, 'procesar el archivo Excel', document.nombre_documento);
        setError(errorMsg);
      }
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleViewWord = async (document: Document, type: 'oficial' | 'editable') => {
    setLoadingExcel(true);
    setError(''); // Limpiar errores previos
    try {
      const blob = await documentService.previewDocument(document.id, type);

      if (!blob || blob.size === 0) {
        setError('El archivo Word está vacío o no se pudo procesar correctamente.');
        setLoadingExcel(false);
        return;
      }

      const title = `${document.codigo_documento} v${document.version} - ${document.nombre_documento}`;

      openModal('isWordViewerOpen', {
        currentDocumentTitle: title,
        currentWordDocument: document,
        currentWordType: type,
        wordBlob: blob
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError(`El archivo Word no fue encontrado. Verifica que el documento "${document.nombre_documento}" aún existe.`);
      } else if (error.response?.status === 403) {
        setError(`No tienes permisos para visualizar este archivo.`);
      } else if (error.message?.includes('Network')) {
        setError(`Error de conexión al cargar el archivo. Verifica tu conexión a internet.`);
      } else {
        const errorMsg = getSpecificErrorMessage(error, 'procesar el archivo Word', document.nombre_documento);
        setError(errorMsg);
      }
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (modals.isEditFormOpen && modalData.editingDocument) {
        if (!modalData.editingDocument.id) {
          throw new Error('ID de documento no válido');
        }
        await updateDocument(modalData.editingDocument.id, formData);
        setMessage('Documento actualizado exitosamente');
      } else {
        await createDocument(formData);
        setMessage('Documento creado exitosamente');
      }
      closeAllModals();
    } catch (error: any) {
      let errorMsg = '';

      // Intenta extraer el mensaje más específico posible del error
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMsg = 'No tienes permisos para realizar esta acción.';
      } else if (error.response?.status === 409) {
        errorMsg = `El código de documento ya existe. Por favor usa un código diferente.`;
      } else if (error.response?.status === 413) {
        errorMsg = 'El archivo es demasiado grande. Verifica el tamaño máximo permitido.';
      } else if (error.response?.status === 422) {
        // Extraer detalles de validación específicos
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const errorDetails = Object.entries(errors)
            .map(([field, msg]: any) => `• ${field}: ${msg}`)
            .join('\n');
          errorMsg = `Errores en los datos:\n${errorDetails}`;
        } else {
          errorMsg = 'Datos incompletos o inválidos. Verifica que todos los campos requeridos estén completos.';
        }
      } else if (error.response?.status === 400) {
        errorMsg = `Solicitud inválida: ${error.response?.data?.detail || 'Verifica los datos e intenta nuevamente.'}`;
      } else if (error.response?.status === 500) {
        errorMsg = `Error del servidor: ${error.response?.data?.detail || 'Intenta nuevamente más tarde.'}`;
      } else if (error.message?.includes('Network')) {
        errorMsg = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      } else if (error.message) {
        errorMsg = error.message;
      } else {
        const action = modals.isEditFormOpen ? 'actualizar' : 'crear';
        errorMsg = `Error al ${action} el documento. Intenta nuevamente.`;
      }

      // Lanzar el error para que sea capturado por el modal
      throw new Error(errorMsg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!modalData.deletingDocument) {
      setError('No se especificó qué documento eliminar.');
      return;
    }

    setError(''); // Limpiar errores previos
    try {
      await deleteDocument(modalData.deletingDocument.id);
      setMessage(`Documento "${modalData.deletingDocument.nombre_documento}" eliminado exitosamente`);
      closeAllModals();
    } catch (error: any) {
      let errorMsg = '';

      if (error.response?.status === 403) {
        errorMsg = 'No tienes permisos para eliminar este documento.';
      } else if (error.response?.status === 404) {
        errorMsg = `El documento "${modalData.deletingDocument.nombre_documento}" ya no existe. Puede haber sido eliminado por otro usuario.`;
      } else if (error.response?.status === 409) {
        errorMsg = 'No se puede eliminar este documento porque está siendo usado en otros procesos.';
      } else if (error.response?.status === 422) {
        errorMsg = 'El documento está en un estado que no permite su eliminación.';
      } else if (error.message?.includes('Network')) {
        errorMsg = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      } else {
        errorMsg = getSpecificErrorMessage(error, 'eliminar el documento', modalData.deletingDocument.nombre_documento);
      }

      setError(errorMsg);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando documentos..." />;
  }

  // Usar crudError en lugar de error para el error del hook
  if (crudError) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400 flex items-center justify-center h-screen">
        <div>
          <p className="text-lg font-semibold mb-2">Error al cargar</p>
          <p>{crudError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 sm:px-4 pt-3 pb-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-2">
        <div className="flex items-center mb-2 sm:mb-0 min-w-0">
          <HiOutlineDocumentText className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
              Sistema de Gestion Institucional
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
              {permissions.isAdmin ? 'Gestión completa de documentos del sistema de calidad' :
                permissions.isGestor ? 'Consulta y descarga de documentos del sistema de calidad' :
                  'Consulta de documentos del sistema de calidad'}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Botón de recarga - visible para todos los roles */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`
              group px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 justify-center text-xs sm:text-sm flex-1 sm:flex-none
              ${isRefreshing
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 active:scale-95'
              }
            `}
            title="Actualizar datos"
          >
            <HiRefresh
              size={14}
              className={`transition-transform duration-300 flex-shrink-0 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}
            />
            <span className="hidden sm:inline text-xs">
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </span>
          </button>

          {/* Botón subir documento - solo para admin */}
          {permissions.canManage && (
            <button
              onClick={() => openModal('isFormOpen')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 sm:gap-2 justify-center text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <FaUpload size={14} />
              <span className="hidden sm:inline">Subir</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal - flex sin scroll */}
      <div className="flex-1 flex flex-col overflow-hidden px-3 sm:px-4 pt-2 pb-2 gap-1">
        {/* Mensajes */}
        {message && (
          <div className="p-2 bg-green-100 border border-green-400 text-green-700 rounded text-xs sm:text-sm dark:bg-green-900 dark:border-green-600 dark:text-green-200 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="ml-2 text-green-700 dark:text-green-200 hover:text-green-900">×</button>
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs sm:text-sm dark:bg-red-900 dark:border-red-600 dark:text-red-200 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-2 text-red-700 dark:text-red-200 hover:text-red-900">×</button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex-shrink-0 overflow-x-auto">
          <DocumentFilters
            filters={filters}
            processes={processes}
            processTypes={processTypes}
            permissions={permissions}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Estadísticas - Ocultar en móvil para ahorrar espacio */}
        <div className="flex-shrink-0 hidden sm:block">
          <DocumentStats
            documents={documents}
            filteredDocuments={filteredDocuments}
            permissions={permissions}
          />
        </div>

        {/* Tabla - toma el espacio restante */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
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
        </div>
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full h-[90vh] sm:h-[90vh] sm:max-w-7xl flex flex-col overflow-hidden">

            {/* CABECERA (Se mantiene igual con los botones) */}
            <div className="flex justify-between items-center p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {modalData.currentDocumentTitle || "Vista previa del documento"}
                </h3>

                {zoomInstance && (
                  <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <zoomInstance.ZoomOut>
                      {(props: any) => (
                        <button onClick={props.onClick} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                      )}
                    </zoomInstance.ZoomOut>
                    <div className="text-xs font-bold min-w-[50px] text-center text-gray-500 dark:text-gray-400 border-x border-gray-200 dark:border-gray-700 px-2">
                      <zoomInstance.CurrentScale>{(props: any) => <>{Math.round(props.scale * 100)}%</>}</zoomInstance.CurrentScale>
                    </div>
                    <zoomInstance.ZoomIn>
                      {(props: any) => (
                        <button onClick={props.onClick} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      )}
                    </zoomInstance.ZoomIn>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setZoomInstance(null);
                  closeModal('isDocumentViewerOpen');
                }}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* CONTENEDOR CON EL PADDING RECUPERADO */}
            <div className="flex-1 p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
              <div className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white">
                <PdfViewer
                  fileUrl={modalData.currentDocumentUrl}
                  onPluginInit={(instance) => setZoomInstance(instance)}
                />
              </div>
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
        excelMerged={modalData.excelMerged}
        excelStyles={modalData.excelStyles}
        onSheetChange={(sheet) => setModalData(prev => ({ ...prev, currentSheet: sheet }))}
        onDownload={handleDownload}
        onClose={() => closeModal('isExcelViewerOpen')}
      />

      <WordViewer
        isOpen={modals.isWordViewerOpen}
        currentDocumentTitle={modalData.currentDocumentTitle}
        currentWordDocument={modalData.currentWordDocument}
        currentWordType={modalData.currentWordType}
        wordBlob={modalData.wordBlob}
        onDownload={handleDownload}
        onClose={() => closeModal('isWordViewerOpen')}
      />
    </div>
  );
}