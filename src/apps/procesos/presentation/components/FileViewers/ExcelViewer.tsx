import React, { useState, useMemo } from 'react';
import { FaFileExcel, FaChevronLeft, FaChevronRight, FaDownload } from 'react-icons/fa';

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [frozenRow, setFrozenRow] = useState(0);

  const currentData = useMemo(() => data[currentSheet] || [], [data, currentSheet]);
  
  if (!currentData || currentData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600">
        <FaFileExcel className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">
          No se pudo cargar el contenido
        </p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
          El archivo Excel no contiene datos válidos
        </p>
      </div>
    );
  }

  const totalRows = currentData.length;
  const totalCols = Math.max(...currentData.map(row => row.length), 0);
  const displayRows = Math.min(totalRows, 50);

  const handleExportCSV = () => {
    const csv = currentData
      .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSheet}.csv`;
    a.click();
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FaFileExcel className="text-green-600 dark:text-green-400 text-lg" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentSheet}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalRows} filas × {totalCols} columnas
          </p>
        </div>

        {/* Sheet Selector */}
        {sheets.length > 1 && (
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Hoja:</span>
            <select
              value={currentSheet}
              onChange={(e) => onSheetChange(e.target.value)}
              className="px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              {sheets.map(sheet => (
                <option key={sheet} value={sheet}>{sheet}</option>
              ))}
            </select>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FaDownload className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Sticky Header y contenido scrollable */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full border-collapse text-sm">
            {/* Fixed Header */}
            <thead>
              <tr className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
                {currentData[0]?.map((cell, colIndex) => (
                  <th
                    key={colIndex}
                    className="px-4 py-3 text-left text-white font-bold whitespace-nowrap border-r border-blue-700 dark:border-blue-800 bg-blue-600 dark:bg-blue-800 min-w-[100px] first:rounded-none last:rounded-none"
                  >
                    <div className="truncate max-w-[300px]" title={String(cell || '')}>
                      {cell !== undefined && cell !== null ? String(cell) : (
                        <span className="text-blue-300">Col {colIndex + 1}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body with alternating rows */}
            <tbody>
              {currentData.slice(1, displayRows).map((row, rowIndex) => (
                <tr
                  key={rowIndex + 1}
                  className={`border-b border-slate-200 dark:border-slate-700 transition-colors ${
                    rowIndex % 2 === 0
                      ? 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {row.map((cell, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className="px-4 py-3 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 whitespace-normal break-words min-w-[100px]"
                      title={String(cell || '')}
                    >
                      <div className="line-clamp-3 max-w-[300px]">
                        {cell !== undefined && cell !== null ? String(cell) : (
                          <span className="text-slate-400 dark:text-slate-600 italic">vacío</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with Info */}
      <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Mostrando <span className="text-blue-600 dark:text-blue-400 font-bold">{displayRows - 1}</span> de <span className="text-blue-600 dark:text-blue-400 font-bold">{totalRows - 1}</span> filas
        </div>

        {totalRows > displayRows && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-200 dark:border-amber-800">
            ⚠️ Vista limitada: {totalRows - displayRows} filas adicionales no mostradas
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-500">
          Total de columnas: <span className="font-bold text-slate-700 dark:text-slate-300">{totalCols}</span>
        </div>
      </div>

      {/* Info Message */}
      <div className="text-xs text-slate-500 dark:text-slate-400 px-4 py-2 bg-slate-100 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-600">
        💡 <strong>Nota:</strong> La visualización muestra los datos en formato de tabla. Para una experiencia completa con formatos y estilos, se recomienda descargar y abrir en Microsoft Excel.
      </div>
    </div>
  );
}