import { useState } from 'react';
import {
  FaEye,
  FaDownload,
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaEllipsisV
} from 'react-icons/fa';
import type { Document } from '../../../domain/entities/Document';
import type { DocumentPermissions } from '../../../application/services/PermissionService';

interface ActionButtonsProps {
  document: Document;
  permissions: DocumentPermissions;
  onView: (doc: Document) => void;
  onViewDocument: (doc: Document, type: 'oficial' | 'editable') => void;
  onDownload: (doc: Document, type: 'oficial' | 'editable', name: string) => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  loadingExcel: boolean;
  isMobile?: boolean;
}

// Helper function para obtener el nombre de archivo con extensión
const getDownloadFilename = (
  codigoDocumento: string,
  archivoCompleto: string | null | undefined,
  suffix: string
): string => {
  if (!archivoCompleto) return `${codigoDocumento}${suffix}`;
  
  // Extraer extensión del archivo
  const extension = archivoCompleto.split('.').pop();
  
  // Retornar: codigo_documento + sufijo + extensión
  return extension 
    ? `${codigoDocumento}${suffix}.${extension}`
    : `${codigoDocumento}${suffix}`;
};

export default function ActionButtons({
  document,
  permissions,
  onView,
  onViewDocument,
  onDownload,
  onEdit,
  onDelete,
  loadingExcel,
  isMobile = false
}: ActionButtonsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
        >
          <FaEllipsisV size={14} />
          <span className="text-xs font-medium">Acciones</span>
        </button>

        {isMenuOpen && (
          <div className="absolute left-0 right-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-56 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {/* Ver detalles */}
            {permissions.canViewDocuments && (
              <button
                onClick={() => {
                  onView(document);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600"
              >
                <FaEye size={14} />
                <span>Ver detalles</span>
              </button>
            )}

            {/* Ver documento oficial */}
            {permissions.canViewDocuments && (
              <button
                onClick={() => {
                  onViewDocument(document, 'oficial');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600 disabled:opacity-50"
                disabled={loadingExcel}
              >
                <FaFileAlt size={14} />
                <span>Ver oficial</span>
              </button>
            )}

            {/* Descargar documento oficial */}
            {permissions.canDownloadByFormat(document.archivo_oficial || "") && (
              <button
                onClick={() => {
                  onDownload(document, 'oficial', getDownloadFilename(document.codigo_documento, document.archivo_oficial, '_oficial'));
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600"
              >
                <FaDownload size={14} />
                <span>Descargar oficial</span>
              </button>
            )}

            {/* Acciones solo para admin */}
            {permissions.isAdmin && (
              <>
                {/* Ver documento editable */}
                {document.archivo_editable && (
                  <button
                    onClick={() => {
                      onViewDocument(document, 'editable');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600 disabled:opacity-50"
                    disabled={loadingExcel}
                  >
                    <FaFileAlt size={14} />
                    <span>Ver editable</span>
                  </button>
                )}

                {/* Descargar archivo editable */}
                {document.archivo_editable && ['doc', 'docx', 'xls', 'xlsx', 'xlsb', 'xlsm'].includes(document.archivo_editable.toLowerCase().split('.').pop() || '') && (
                  <button
                    onClick={() => {
                      onDownload(document, 'editable', getDownloadFilename(document.codigo_documento, document.archivo_editable, '_editable'));
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600"
                  >
                    <FaDownload size={14} />
                    <span>Descargar editable</span>
                  </button>
                )}

                {/* Editar */}
                <button
                  onClick={() => {
                    onEdit(document);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600"
                >
                  <FaEdit size={14} />
                  <span>Editar</span>
                </button>

                {/* Eliminar */}
                <button
                  onClick={() => {
                    onDelete(document);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <FaTrash size={14} />
                  <span>Eliminar</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {/* Ver detalles - Todos los roles */}
      {permissions.canViewDocuments && (
        <button
          onClick={() => onView(document)}
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          title="Ver detalles"
        >
          <FaEye size={16} />
        </button>
      )}

      {/* Ver documento oficial - Todos los roles */}
      {permissions.canViewDocuments && (
        <button
          onClick={() => onViewDocument(document, 'oficial')}
          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
          title="Ver documento oficial"
          disabled={loadingExcel}
        >
          {loadingExcel ? (
            <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
          ) : (
            <FaFileAlt size={16} />
          )}
        </button>
      )}

      {/* Descargar documento oficial - Permisos específicos por formato */}
      {permissions.canDownloadByFormat(document.archivo_oficial || "") && (
        <button
          onClick={() => onDownload(document, 'oficial', getDownloadFilename(document.codigo_documento, document.archivo_oficial, '_oficial'))}
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          title="Descargar archivo oficial"
        >
          <FaDownload size={16} />
        </button>
      )}

      {/* Acciones solo para admin */}
      {permissions.isAdmin && (
        <>
          {/* Ver documento editable */}
          {document.archivo_editable && (
            <button
              onClick={() => onViewDocument(document, 'editable')}
              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
              title="Ver documento editable"
              disabled={loadingExcel}
            >
              {loadingExcel ? (
                <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              ) : (
                <FaEdit size={16} />
              )}
            </button>
          )}

          {/* Descargar archivo editable - Solo Word/Excel y solo admin */}
          {document.archivo_editable && ['doc', 'docx', 'xls', 'xlsx','xlsb','xlsm'].includes(document.archivo_editable.toLowerCase().split('.').pop() || '') && (
            <button
              onClick={() => onDownload(document, 'editable', getDownloadFilename(document.codigo_documento, document.archivo_editable, '_editable'))}
              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
              title="Descargar archivo editable"
            >
              <FaDownload size={16} />
            </button>
          )}

          <button
            onClick={() => onEdit(document)}
            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
            title="Editar documento"
          >
            <FaEdit size={16} />
          </button>

          <button
            onClick={() => onDelete(document)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title="Eliminar documento"
          >
            <FaTrash size={16} />
          </button>
        </>
      )}
    </div>
  );
}