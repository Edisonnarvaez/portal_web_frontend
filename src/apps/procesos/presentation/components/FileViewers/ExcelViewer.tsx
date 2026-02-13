import React, { useState, useMemo } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';

interface ExcelViewerStandaloneProps {
    data: { [key: string]: any[][] };
    sheets: string[];
    currentSheet: string;
    onSheetChange: (sheet: string) => void;
    merged?: { [key: string]: string[] };
    styles?: any;
}

// Function to format numbers like Excel does
const formatCellValue = (value: any, cellStyle: any): string => {
  if (value === null || value === undefined) return '-';
  
  const stringValue = String(value);
  const numFmt = cellStyle?.numFmt;
  
  // Try to parse as number
  const numValue = parseFloat(stringValue);
  
  if (!isNaN(numValue) && numFmt) {
    // Format percentages
    if (numFmt.includes('%')) {
      return (numValue * 100).toFixed(2) + '%';
    }
    // Format currency
    if (numFmt.includes('$') || numFmt.includes('€') || numFmt.includes('£')) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
      }).format(numValue);
    }
    // Format with decimals
    if (numFmt.includes('.') || numFmt.includes('0')) {
      const decimals = (numFmt.match(/0/g) || []).length - 1;
      return numValue.toFixed(Math.max(2, decimals));
    }
  }
  
  return stringValue;
};

export default function ExcelViewerStandalone({
  data,
  sheets,
  currentSheet,
  onSheetChange,
  merged = {},
  styles = {}
}: ExcelViewerStandaloneProps) {

  // Calcular si una celda está fusionada
  const isMergedCell = (row: number, col: number): boolean => {
    const mergedRanges = merged[currentSheet] || [];
    return mergedRanges.some(range => {
      const [start, end] = range.split(':');
      const startCell = XLSX.utils.decode_cell(start);
      const endCell = XLSX.utils.decode_cell(end);
      return row >= startCell.r && row <= endCell.r && col >= startCell.c && col <= endCell.c;
    });
  };

  // Obtener estilo de celda con mayor fidelidad estilo Office
  const getCellStyle = (row: number, col: number): React.CSSProperties => {
    const cellKey = XLSX.utils.encode_cell({ r: row, c: col });
    const cellStyle = styles[currentSheet]?.[cellKey];
    
    const style: React.CSSProperties = {
      textAlign: 'left',
      verticalAlign: 'middle',
      padding: '6px 8px'
    };
    
    if (cellStyle) {
      // Color de fondo
      if (cellStyle.fill?.fgColor?.rgb) {
        const color = cellStyle.fill.fgColor.rgb;
        const bgColor = `#${color.substring(2)}`;
        style.backgroundColor = bgColor;
        // Determinar color de texto automáticamente basado en contraste
        const rgb = parseInt(color.substring(2), 16);
        const r = (rgb >> 16) & 255;
        const g = (rgb >> 8) & 255;
        const b = rgb & 255;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        style.color = brightness > 128 ? '#000000' : '#ffffff';
      }
      
      // Fuente: Bold, Italic, Color
      if (cellStyle.font?.bold) {
        style.fontWeight = 'bold';
      }
      if (cellStyle.font?.italic) {
        style.fontStyle = 'italic';
      }
      if (cellStyle.font?.color?.rgb) {
        const color = cellStyle.font.color.rgb;
        style.color = `#${color.substring(2)}`;
      }
      if (cellStyle.font?.size) {
        style.fontSize = `${cellStyle.font.size}px`;
      }
      
      // Alineación horizontal
      if (cellStyle.alignment?.horizontal) {
        const align = cellStyle.alignment.horizontal;
        if (align === 'center') style.textAlign = 'center';
        else if (align === 'right') style.textAlign = 'right';
        else if (align === 'left') style.textAlign = 'left';
      }
      
      // Alineación vertical
      if (cellStyle.alignment?.vertical) {
        const vAlign = cellStyle.alignment.vertical;
        if (vAlign === 'top') style.verticalAlign = 'top';
        else if (vAlign === 'bottom') style.verticalAlign = 'bottom';
        else if (vAlign === 'center') style.verticalAlign = 'middle';
      }
      
      // Bordes
      const borderStyle = '1px solid';
      const borderColor = '#d1d5db';
      if (cellStyle.border) {
        if (cellStyle.border.left) style.borderLeft = `${borderStyle} ${borderColor}`;
        if (cellStyle.border.right) style.borderRight = `${borderStyle} ${borderColor}`;
        if (cellStyle.border.top) style.borderTop = `${borderStyle} ${borderColor}`;
        if (cellStyle.border.bottom) style.borderBottom = `${borderStyle} ${borderColor}`;
      }
      
      // Subrayado
      if (cellStyle.font?.underline) {
        style.textDecoration = 'underline';
      }
    }
    
    return style;
  };

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
  const previewRows = Math.min(totalRows, 25); // Mostrar máximo 25 filas en la preview

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
      </div>

      {/* Preview Visual - Como una "fotografía" de Excel */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden shadow-lg">
        {/* Tabla sin scroll - estilo screenshot */}
        <div className="overflow-y-auto max-h-[600px] bg-white dark:bg-slate-900">
          <table className="w-full border-collapse text-xs bg-white dark:bg-slate-900">
            {/* Header */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-800">
                {currentData[0]?.map((cell, colIndex) => (
                  <th
                    key={colIndex}
                    className="px-3 py-2 text-left text-white font-bold border border-slate-400 dark:border-slate-500 min-w-[100px] bg-slate-700 dark:bg-slate-700"
                  >
                    <div className="truncate max-w-[150px] text-xs">
                      {cell !== undefined && cell !== null ? String(cell) : `Col ${colIndex + 1}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body - primeras filas */}
            <tbody>
              {currentData.slice(1, previewRows).map((row, rowIndex) => (
                <tr
                  key={rowIndex + 1}
                  className={`border-b border-slate-300 dark:border-slate-600 ${
                    rowIndex % 2 === 0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  {row.map((cell, colIndex) => {
                    const actualRowIndex = rowIndex + 1;
                    const cellKey = XLSX.utils.encode_cell({ r: actualRowIndex, c: colIndex });
                    const cellStyle = getCellStyle(actualRowIndex, colIndex);
                    const cellStyleObj = styles[currentSheet]?.[cellKey];
                    const formattedValue = formatCellValue(cell, cellStyleObj);
                    
                    return (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className="px-3 py-2 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 min-w-[100px] text-xs font-500"
                        title={formattedValue}
                        style={cellStyle}
                      >
                        <div className="truncate max-w-[150px]">
                          {formattedValue}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indicador visual si hay más datos */}
        {totalRows > previewRows && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-t border-amber-300 dark:border-amber-700 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              📊 Mostrando primeras {previewRows - 1} de {totalRows - 1} filas de datos
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              {totalRows - previewRows}+ filas más...
            </span>
          </div>
        )}
      </div>

      {/* Info Message */}
      <div className="text-xs text-slate-500 dark:text-slate-400 px-4 py-3 bg-slate-100 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-600">
        <strong>💡 Vista previa optimizada:</strong> Se muestra una previsualizacion del documento. Se recomienda descargarlo para ver el contenido completo, incluidas todas las columnas y filas.
      </div>
    </div>
  );
}