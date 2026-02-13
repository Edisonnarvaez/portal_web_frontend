import React from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import type { Document } from '../../../domain/entities/Document';
import ExcelViewerStandalone from '../FileViewers/ExcelViewer';

interface ExcelViewerProps {
  isOpen: boolean;
  excelData: { [key: string]: any[][] };
  excelSheets: string[];
  currentSheet: string;
  currentExcelDocument: Document | null;
  currentExcelType: 'oficial' | 'editable' | null;
  onSheetChange: (sheet: string) => void;
  onDownload: (doc: Document, type: 'oficial' | 'editable', name: string) => void;
  onClose: () => void;
  excelMerged?: { [key: string]: string[] };
  excelStyles?: any;
}

export default function ExcelViewer({
  isOpen,
  excelData,
  excelSheets,
  currentSheet,
  currentExcelDocument,
  currentExcelType,
  onSheetChange,
  onDownload,
  onClose,
  excelMerged = {},
  excelStyles = {}
}: ExcelViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Vista Previa Excel
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
          {excelData[currentSheet] && excelData[currentSheet].length > 0 ? (
            <ExcelViewerStandalone
              data={excelData}
              sheets={excelSheets}
              currentSheet={currentSheet}
              onSheetChange={onSheetChange}
              merged={excelMerged}
              styles={excelStyles}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                No se pudo cargar el contenido
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                El archivo Excel no contiene datos válidos
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2">
          {currentExcelDocument && (
            <button
              onClick={() => {
                const tipoArchivo = currentExcelType || 'oficial';
                onDownload(currentExcelDocument, tipoArchivo, `${currentExcelDocument.codigo_documento}_${tipoArchivo}`);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 flex items-center gap-2"
            >
              <FaDownload size={16} />
              Descargar Excel
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