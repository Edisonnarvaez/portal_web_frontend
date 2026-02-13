import React from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import type { Document } from '../../../domain/entities/Document';
import WordViewerStandalone from '../FileViewers/WordViewer';

interface WordViewerProps {
  isOpen: boolean;
  currentDocumentTitle: string;
  currentWordDocument: Document | null;
  currentWordType: 'oficial' | 'editable' | null;
  wordBlob?: Blob;
  onDownload: (doc: Document, type: 'oficial' | 'editable', name: string) => void;
  onClose: () => void;
}

export default function WordViewer({
  isOpen,
  currentDocumentTitle,
  currentWordDocument,
  currentWordType,
  wordBlob,
  onDownload,
  onClose
}: WordViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Vista Previa - {currentDocumentTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Contenido con WordViewerStandalone */}
        <div className="flex-1 p-6 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <WordViewerStandalone
            documentBlob={wordBlob}
            documentTitle={currentDocumentTitle}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2">
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
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}