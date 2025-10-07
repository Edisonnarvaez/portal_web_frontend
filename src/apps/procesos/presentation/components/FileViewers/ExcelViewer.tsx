import React from 'react';
import { FaFileExcel } from 'react-icons/fa';

interface ExcelViewerStandaloneProps {
    data: { [key: string]: any[][] };
    sheets: string[];
  currentSheet: string;
  onSheetChange: (sheet: string) => void;
}

export default function ExcelViewerStandalone({
  data,
  sheets,
  currentSheet,
  onSheetChange
}: ExcelViewerStandaloneProps) {
  if (!data[currentSheet] || data[currentSheet].length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <FaFileExcel className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          No se pudo cargar el contenido
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
          El archivo Excel no contiene datos válidos
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Selector de hojas */}
      {sheets.length > 1 && (
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Hoja:</span>
          <select
            value={currentSheet}
            onChange={(e) => onSheetChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
          >
            {sheets.map(sheet => (
              <option key={sheet} value={sheet}>{sheet}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabla */}
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data[currentSheet].slice(0, 100).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors ${
                  rowIndex === 0
                    ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold sticky top-0 z-10'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-sm border-r border-gray-200 dark:border-gray-600 max-w-xs ${
                      rowIndex === 0
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

      {/* Información de limitación */}
      {data[currentSheet].length > 100 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Vista limitada:</strong> Se muestran las primeras 100 filas de {data[currentSheet].length} total.
          </p>
        </div>
      )}
    </div>
  );
}