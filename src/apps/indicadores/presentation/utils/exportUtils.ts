// src/apps/indicadores/presentation/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');
  XLSX.writeFile(workbook, 'resultados_indicadores.xlsx');
};

export const exportToPDF = (data: any[]) => {
  const doc = new jsPDF();
  doc.text('Resultados de Indicadores', 20, 10);
  
  const tableData = data.map(item => [
    item.indicatorName,
    item.headquarterName,
    item.calculatedValue?.toFixed(2) || '0',
    item.target,
    item.measurementUnit,
    item.year.toString()
  ]);

  (doc as any).autoTable({
    head: [['Indicador', 'Sede', 'Resultado', 'Meta', 'Unidad', 'Año']],
    body: tableData,
    startY: 20,
  });

  doc.save('resultados_indicadores.pdf');
};