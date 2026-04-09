import React from 'react';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

interface SoporteViewModalProps {
  isOpen: boolean;
  soporte: SoporteDocumental | null;
  onClose: () => void;
}

/**
 * Modal component for viewing supporting document details
 * Displays all information about a document with formatted dates and status badges
 */
const SoporteViewModal: React.FC<SoporteViewModalProps> = ({
  isOpen,
  soporte,
  onClose,
}) => {
  if (!isOpen || !soporte) return null;

  const isExpired = soporte.fecha_vencimiento && new Date(soporte.fecha_vencimiento) < new Date();
  const isExpiring = soporte.fecha_vencimiento && !isExpired && 
    new Date(soporte.fecha_vencimiento) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 dark:bg-blue-700 text-white p-3 sm:p-4 lg:p-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">Detalles del Documento</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl ml-2 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Document Name */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border-l-4 border-blue-600">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 break-words">
              {soporte.tipo_nombre || 'Documento sin nombre'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono truncate">
              {soporte.archivo?.split('/').pop() || 'Sin archivo'}
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
              v{soporte.version}
            </span>
            <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
              soporte.es_vigente 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}>
              {soporte.es_vigente ? '✓ Vigente' : '○ Histórico'}
            </span>
            <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
              {soporte.nivel}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Tipo Documento */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">Tipo</p>
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium mt-1">
                {soporte.tipo_nombre || 'N/A'}
              </p>
            </div>

            {/* Contexto */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">Contexto</p>
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium mt-1 truncate">
                {soporte.nivel} (ID: {soporte.empresa || soporte.sede || soporte.servicio || 'N/A'})
              </p>
            </div>

            {/* Fecha Emisión */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">Emitido</p>
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium mt-1">
                {formatDate(soporte.fecha_emision)}
              </p>
            </div>

            {/* Fecha Carga */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">Cargado</p>
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium mt-1">
                {formatDate(soporte.fecha_carga)}
              </p>
            </div>

            {/* Fecha Vencimiento */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">Vencimiento</p>
              <p className={`text-sm sm:text-base font-medium mt-1 ${
                isExpired ? 'text-red-600 dark:text-red-400' :
                isExpiring ? 'text-amber-600 dark:text-amber-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {formatDate(soporte.fecha_vencimiento) || 'Sin vencimiento'}
              </p>
            </div>

            {/* Observaciones */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">Notas</p>
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium mt-1 max-line-3">
                {soporte.observaciones || 'Sin notas'}
              </p>
            </div>
          </div>

          {/* Status Alerts */}
          {isExpired && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 sm:p-4">
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">🚨 DOCUMENTO VENCIDO</p>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">
                Este documento venció el {formatDate(soporte.fecha_vencimiento)}
              </p>
            </div>
          )}

          {isExpiring && !isExpired && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 sm:p-4">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">⏰ PRÓXIMO A VENCER</p>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
                Vence el {formatDate(soporte.fecha_vencimiento)}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {soporte.id}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoporteViewModal;
