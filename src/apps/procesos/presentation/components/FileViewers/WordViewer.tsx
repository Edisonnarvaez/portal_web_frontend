import React from 'react';
import { FaFileWord, FaDownload } from 'react-icons/fa';

interface WordViewerStandaloneProps {
  documentTitle: string;
  onDownload?: () => void;
}

export default function WordViewerStandalone({
  documentTitle,
  onDownload
}: WordViewerStandaloneProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <FaFileWord className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="text-center">
        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {documentTitle}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Los documentos de Word no se pueden previsualizar directamente en el navegador.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Sugerencia:</strong>
            <span> Descarga el documento para abrirlo en Microsoft Word o un editor compatible.</span>
          </p>
        </div>
      </div>

      {onDownload && (
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
        >
          <FaDownload size={16} />
          Descargar Word
        </button>
      )}
    </div>
  );
}