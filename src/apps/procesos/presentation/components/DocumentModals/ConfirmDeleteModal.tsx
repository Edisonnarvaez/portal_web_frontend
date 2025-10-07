import React from 'react';
import type { Document } from '../../../domain/entities/Document';

interface ConfirmDeleteModalProps {
  document: Document;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  document,
  onConfirm,
  onCancel
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Confirmar Eliminación</h3>
        <p className="mb-6 text-gray-700 dark:text-gray-200">
          ¿Estás seguro de que deseas eliminar el documento "{document.nombre_documento}"?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}