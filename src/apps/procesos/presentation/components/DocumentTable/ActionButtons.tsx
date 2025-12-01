import {
  FaEye,
  FaDownload,
  FaFileAlt,
  FaEdit,
  FaTrash
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
  loadingExcel
}: ActionButtonsProps) {
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