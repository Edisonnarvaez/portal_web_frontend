import React from 'react';
import type { Document } from '../../../domain/entities/Document';
import type { Process } from '../../../domain/entities/Process';
import type { DocumentPermissions } from '../../../application/services/PermissionService';
import { FileHandlingService } from '../../../application/services/FileHandlingService';
import { TIPOS_DOCUMENTO, ESTADOS } from '../../../domain/types';
import ActionButtons from './ActionButtons';

interface DocumentRowProps {
  document: Document;
  processes: Process[];
  permissions: DocumentPermissions;
  onView: (doc: Document) => void;
  onViewDocument: (doc: Document, type: 'oficial' | 'editable') => void;
  onDownload: (doc: Document, type: 'oficial' | 'editable', name: string) => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  loadingExcel: boolean;
}

export default function DocumentRow({
  document,
  processes,
  permissions,
  onView,
  onViewDocument,
  onDownload,
  onEdit,
  onDelete,
  loadingExcel
}: DocumentRowProps) {
  const getTipoLabel = (tipo: string) => {
    return TIPOS_DOCUMENTO.find(t => t.value === tipo)?.label || tipo;
  };

  const getEstadoStyle = (estado: string) => {
    return ESTADOS.find(e => e.value === estado)?.color || 'bg-gray-100 text-gray-800';
  };

  const getProcessName = (processId: number) => {
    return processes.find(p => p.id === processId)?.name || 'N/A';
  };

  const renderFileIcon = (filename: string, label: string) => {
    const { Component, className } = FileHandlingService.getFileIcon(filename);
    return (
      <div className="flex items-center">
        <Component className={className} />
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
    );
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap ">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {document.codigo_documento}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-normal break-words max-w-[500px]">
            {document.nombre_documento}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {getProcessName(document.proceso)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {getTipoLabel(document.tipo_documento)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          v{document.version}
        </span>
      </td>
      {/* Columna de estado solo para admin */}
      {permissions.isAdmin && (
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyle(document.estado)}`}>
            {ESTADOS.find(e => e.value === document.estado)?.label}
          </span>
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          {renderFileIcon(document.archivo_oficial, 'Oficial')}
          {/* Solo mostrar archivo editable para admin */}
          {permissions.isAdmin && document.archivo_editable && 
            renderFileIcon(document.archivo_editable, 'Editable')
          }
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <ActionButtons
          document={document}
          permissions={permissions}
          onView={onView}
          onViewDocument={onViewDocument}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          loadingExcel={loadingExcel}
        />
      </td>
    </tr>
  );
}