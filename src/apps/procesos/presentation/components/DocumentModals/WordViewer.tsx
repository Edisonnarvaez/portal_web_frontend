import React from 'react';
import { FaFileWord, FaTimes, FaDownload } from 'react-icons/fa';
import type { Document } from '../../../domain/entities/Document';

interface WordViewerProps {
  isOpen: boolean;
  currentDocumentTitle: string;
  currentWordDocument: Document | null;
  currentWordType: 'oficial' | 'editable' | null;
  onDownload: (doc: Document, type: 'oficial' | 'editable', name: string) => void;
  onClose: () => void;
}

export default function WordViewer({
  isOpen,
  currentDocumentTitle,
  currentWordDocument,
  currentWordType,
  onDownload,
  onClose
}: WordViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-auto max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <FaFileWord className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Documento Word
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FaFileWord className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {currentDocumentTitle}
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
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              {currentWordDocument && (
                <>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Código:</span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md font-mono">
                      {currentWordDocument.codigo_documento}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Versión:</span>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-md font-mono">
                      v{currentWordDocument.version}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Tipo:</span>
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-md font-mono">
                      {currentWordType}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-2">
              {/* Botón de descarga */}
              {currentWordDocument && (
                <button
                  onClick={() => {
                    const tipoArchivo = currentWordType || 'oficial';
                    onDownload(currentWordDocument, tipoArchivo, `${currentWordDocument.codigo_documento}_${tipoArchivo}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <FaDownload size={16} />
                  Descargar Word
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}