import React from 'react';
import { FaFileExcel, FaTimes, FaDownload } from 'react-icons/fa';
import type { Document } from '../../../domain/entities/Document';

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
  onClose
}: ExcelViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFileExcel className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Vista Previa Excel
              </h3>
            </div>
            {excelSheets.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hoja:</span>
                <select
                  value={currentSheet}
                  onChange={(e) => onSheetChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                >
                  {excelSheets.map(sheet => (
                    <option key={sheet} value={sheet}>{sheet}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
          {excelData[currentSheet] && excelData[currentSheet].length > 0 ? (
            <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="excel-table-container max-h-[calc(90vh-200px)] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {excelData[currentSheet].slice(0, 100).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`transition-colors ${rowIndex === 0
                          ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold sticky top-0 z-10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                      >
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className={`px-4 py-3 text-sm border-r border-gray-200 dark:border-gray-600 max-w-xs ${rowIndex === 0
                              ? 'text-blue-900 dark:text-blue-100 font-semibold bg-blue-50 dark:bg-blue-900/30'
                              : 'text-gray-900 dark:text-gray-100'
                              }`}
                            title={String(cell || '')}
                          >
                            <div className="truncate max-w-[200px]">
                              {cell !== undefined && cell !== null ? String(cell) : ""}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mensaje de limitación */}
              {excelData[currentSheet].length > 100 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5">
                      ⚠️
                    </div>
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        <strong>Vista limitada:</strong> Se muestran las primeras 100 filas de {excelData[currentSheet].length} total.
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Para ver el contenido completo, descarga el archivo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <FaFileExcel className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm">
              {excelData[currentSheet] && (
                <>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Filas:</span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md font-mono">
                      {excelData[currentSheet].length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Columnas:</span>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-md font-mono">
                      {excelData[currentSheet][0]?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Hoja:</span>
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-md font-mono">
                      {currentSheet}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              {/* Botón de descarga */}
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