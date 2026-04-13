import React from 'react';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

interface SoporteChecklistProps {
  soportes: SoporteDocumental[];
  isLoading?: boolean;
  onViewDetails?: (soporte: SoporteDocumental) => void;
  onEdit?: (soporte: SoporteDocumental) => void;
  onDelete?: (id: number) => void;
}

/**
 * Component that displays a simple checklist of uploaded documents
 */
/**
 * Helper: Check if document is expired
 */
function isExpired(fechaVencimiento: string | null | undefined): boolean {
  if (!fechaVencimiento) return false;
  return new Date(fechaVencimiento) < new Date();
}

const SoporteChecklist: React.FC<SoporteChecklistProps> = ({
  soportes = [],
  isLoading = false,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const completados = soportes.filter((s) => s.es_vigente).length;
  const vencidos = soportes.filter((s) => isExpired(s.fecha_vencimiento)).length;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded p-1 border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 text-xs">📋 Docs</h3>
        <div className="grid grid-cols-3 gap-1">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{soportes.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          </div>
          <div>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">{completados}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">✓</p>
          </div>
          <div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{vencidos}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">✗</p>
          </div>
        </div>
      </div>

      {/* Document list - Scrollable on mobile - ✅ MEJORADO: Agregar acciones */}
      <div className="space-y-0.5">
        {soportes.map((doc) => (
          <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded p-1 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <div className="flex items-start justify-between gap-0.5 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs text-gray-800 dark:text-gray-100 truncate">
                  {doc.tipo_nombre || 'Doc'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  v{doc.version} • {doc.es_vigente ? '✓' : '○'}
                  {doc.fecha_vencimiento && ` • ${new Date(doc.fecha_vencimiento).toLocaleDateString('es-CO')}`}
                </p>
              </div>
              
              {/* Status icons */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {isExpired(doc.fecha_vencimiento) && (
                  <span className="text-red-600 font-bold text-sm">❌</span>
                )}
                {!isExpired(doc.fecha_vencimiento) && doc.es_vigente && (
                  <span className="text-green-600 font-bold text-sm">✅</span>
                )}
              </div>

              {/* Action buttons - ✅ NUEVO */}
              <div className="flex gap-0.5 flex-shrink-0 ml-1">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(doc)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition text-sm"
                    title="Ver"
                  >
                    📋
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(doc)}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded transition text-base"
                    title="Editar"
                  >
                    ✏️
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition text-base"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoporteChecklist;
