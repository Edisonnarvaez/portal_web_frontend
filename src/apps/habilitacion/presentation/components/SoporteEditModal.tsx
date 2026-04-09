import React, { useState, useEffect } from 'react';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

interface SoporteEditModalProps {
  isOpen: boolean;
  soporte: SoporteDocumental | null;
  onClose: () => void;
  onSave: (soporte: SoporteDocumental, updates: Partial<SoporteDocumental>) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Modal component for editing supporting document metadata
 * Allows updating expiration date, description, and other editable fields
 */
const SoporteEditModal: React.FC<SoporteEditModalProps> = ({
  isOpen,
  soporte,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    fechaVencimiento: '',
    observaciones: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when soporte changes
  useEffect(() => {
    if (soporte) {
      setFormData({
        fechaVencimiento: soporte.fecha_vencimiento 
          ? new Date(soporte.fecha_vencimiento).toISOString().split('T')[0]
          : '',
        observaciones: soporte.observaciones || '',
      });
      setError(null);
    }
  }, [soporte]);

  if (!isOpen || !soporte) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);
      
      // Validate date format
      if (formData.fechaVencimiento && !/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaVencimiento)) {
        setError('Formato de fecha inválido. Use YYYY-MM-DD');
        return;
      }

      setIsSaving(true);

      const updates: Partial<SoporteDocumental> = {};
      
      if (formData.fechaVencimiento) {
        updates.fecha_vencimiento = formData.fechaVencimiento;
      }
      
      if (formData.observaciones) {
        updates.observaciones = formData.observaciones;
      }

      await onSave(soporte, updates);
      
      // Show success and close
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (err) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
    }
  };

  const hasChanges = 
    formData.fechaVencimiento !== (soporte.fecha_vencimiento 
      ? new Date(soporte.fecha_vencimiento).toISOString().split('T')[0]
      : '') ||
    formData.observaciones !== (soporte.observaciones || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-amber-600 dark:bg-amber-700 text-white p-3 sm:p-4 lg:p-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">Editar Documento</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-white hover:text-gray-200 text-2xl ml-2 flex-shrink-0 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
          {/* Document Info (Read-only) */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">Documento</p>
            <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium mt-1 break-words">
              {soporte.tipo_nombre || 'Sin nombre'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono truncate">
              {soporte.archivo?.split('/').pop() || 'N/A'}
            </p>
          </div>

          {/* Fecha Vencimiento */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleInputChange}
              disabled={isSaving}
              className="w-full px-3 sm:px-4 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Vencimiento actual: {soporte.fecha_vencimiento 
                ? new Date(soporte.fecha_vencimiento).toLocaleDateString('es-CO')
                : 'Sin vencimiento'}
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              disabled={isSaving}
              placeholder="Ingresa observaciones o notas sobre el documento..."
              className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 resize-none"
              rows={2}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">❌ {error}</p>
            </div>
          )}

          {/* Info Alert */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-2 sm:p-3">
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
              ℹ️ Puedes editar la fecha de vencimiento y observaciones. Otros campos son de solo lectura.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || isLoading}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-600 text-white rounded-lg hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              {isSaving ? '⏳ Guardando...' : '✓ Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoporteEditModal;
