import React from 'react';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

interface SoporteCardProps {
  soporte: SoporteDocumental;
  onEdit?: (soporte: SoporteDocumental) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (soporte: SoporteDocumental) => void;
  isLoading?: boolean;
}

/**
 * Component that displays service enablement information in a card format
 * Shows status, modality, complexity, and expiration information
 */
const SoporteCard: React.FC<SoporteCardProps> = ({
  soporte,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
}) => {
  const isExpiring = soporte.fecha_vencimiento && isNearExpiration(soporte.fecha_vencimiento);
  const isExpired = soporte.fecha_vencimiento && new Date(soporte.fecha_vencimiento) < new Date();

  const handleEdit = () => {
    if (onEdit) onEdit(soporte);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(soporte.id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) onViewDetails(soporte);
  };

  const estadoColor = { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-blue-400 transition-all hover:shadow-lg p-1 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header - Responsive */}
      <div className="flex flex-col gap-1 mb-1">
        <div className="flex justify-between items-start gap-0.5">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 break-words">
              {soporte.tipo_nombre || 'Doc sin nombre'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {soporte.archivo?.split('/').pop() || 'N/A'}
            </p>
          </div>
          {/* Buttons - Responsive Touch Areas */}
          <div className="flex gap-0.5 flex-shrink-0">
            <button
              onClick={() => { if (soporte.archivo) window.open(soporte.archivo, '_blank'); }}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm p-0.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition"
              title="Descargar/abrir"
            >
              ⬇️
            </button>
            <button
              onClick={handleViewDetails}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition"
              title="Ver"
            >
              📋
            </button>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded transition"
                title="Editar"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                title="Eliminar"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Badges - Responsive */}
      <div className="flex flex-wrap gap-0.5 mb-1">
        <span className={`inline-block px-1 py-0 rounded-full text-xs font-medium ${estadoColor.bg} ${estadoColor.text}`}>
          v{soporte.version}
        </span>
        <span className={`inline-block px-1 py-0 rounded-full text-xs font-medium ${soporte.es_vigente ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
          {soporte.es_vigente ? '✓' : '○'}
        </span>
      </div>

      {/* Service Details Grid - Responsive (1 column mobile, 2 desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-1">
        {/* Prestador - ✅ NUEVO */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight">Prestador</p>
          <p className="text-xs font-medium text-purple-700 dark:text-purple-400 truncate" title={soporte.prestador_nombre || `ID: ${soporte.prestador}`}>
            {soporte.prestador_nombre || `ID: ${soporte.prestador}`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight">Vence</p>
          <p className={`text-xs font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : isExpiring ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatDate(soporte.fecha_vencimiento) || 'S/V'}
          </p>
        </div>
      </div>

      {/* Expiration Warning - Responsive */}
      {isExpired && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded p-1 mb-1">
          <p className="text-xs font-semibold text-red-800 dark:text-red-400">⚠️ VENCIDO</p>
        </div>
      )}

      {isExpiring && !isExpired && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded p-1 mb-1">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">⏰ POR VENCER</p>
        </div>
      )}

      {/* Footer Info - Responsive */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          ID: {soporte.id}
        </p>
      </div>
    </div>
  );
};

/**
 * Helper function to format dates
 */
function formatDate(date: string | Date | null | undefined): string {
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
}

/**
 * Check if service is expiring within 30 days
 */
function isNearExpiration(vencimiento: string | Date | null | undefined): boolean {
  if (!vencimiento) return false;
  try {
    const vencDate = new Date(vencimiento);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return vencDate <= thirtyDaysFromNow && vencDate > today;
  } catch {
    return false;
  }
}

export default SoporteCard;
