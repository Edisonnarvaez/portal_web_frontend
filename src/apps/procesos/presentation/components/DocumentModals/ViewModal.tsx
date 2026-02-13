import React from 'react';
import { FaTimes, FaFileAlt } from 'react-icons/fa';
import type { Document } from '../../../domain/entities/Document';
import type { Process } from '../../../domain/entities/Process';
import type { DocumentPermissions } from '../../../application/services/PermissionService';
import type { DocumentService } from '../../../application/services/DocumentService';
import { Label } from '../Label';
import { TIPOS_DOCUMENTO, ESTADOS } from '../../../domain/types';

interface ViewModalProps {
  document: Document;
  processes: Process[];
  permissions: DocumentPermissions;
  documentService: DocumentService;
  onClose: () => void;
}

export default function ViewModal({
  document,
  processes,
  permissions,
  documentService,
  onClose
}: ViewModalProps) {
  const getTipoLabel = (tipo: string) => {
    return TIPOS_DOCUMENTO.find(t => t.value === tipo)?.label || tipo;
  };

  const getEstadoStyle = (estado: string) => {
    return ESTADOS.find(e => e.value === estado)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FaFileAlt className="text-blue-600 dark:text-blue-400" />
            Detalles del Documento
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 text-sm text-gray-800 dark:text-gray-200">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <Label title="Código:" value={document.codigo_documento} mono />
            <Label title="Nombre:" value={document.nombre_documento} />

            <Label title="Proceso:" value={documentService.getProcessName(processes, document.proceso)} />
            <Label title="Tipo:" value={getTipoLabel(document.tipo_documento)} />

            <Label
              title="Versión:"
              value={`v${document.version}`}
              badge
              badgeColor="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            />

            {permissions.isAdmin && (
              <Label
                title="Documento Padre:"
                value={documentService.getDocumentPadreName([document], document.documento_padre)}
              />
            )}

            <Label
              title="Estado:"
              value={ESTADOS.find(e => e.value === document.estado)?.label || ''}
              badge
              badgeColor={getEstadoStyle(document.estado)}
            />

            <Label
              title="Fecha de creación:"
              value={new Date(document.fecha_creacion).toLocaleString('es-CO', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
              mono
            />

            <Label
              title="Última actualización:"
              value={new Date(document.fecha_actualizacion).toLocaleString('es-CO', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
              mono
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}