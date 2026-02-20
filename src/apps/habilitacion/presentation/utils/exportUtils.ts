// src/apps/habilitacion/presentation/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';
import type { Autoevaluacion, AutoevaluacionResumen } from '../../domain/entities/Autoevaluacion';
import type { DatosPrestador } from '../../domain/entities/DatosPrestador';
import type { PlanMejora } from '../../domain/entities/PlanMejora';
import type { Hallazgo } from '../../domain/entities/Hallazgo';
import { getEstadoLabel, formatDate } from './formatters';

// ─── Excel Exports ──────────────────────────────────────────────

export const exportCumplimientosExcel = (
  cumplimientos: Cumplimiento[],
  autoevaluacion?: Autoevaluacion,
) => {
  const data = cumplimientos.map((c) => ({
    'Autoevaluación': c.autoevaluacion?.numero_autoevaluacion || 'N/A',
    'Servicio': c.servicio_sede?.nombre_servicio || 'N/A',
    'Criterio': c.criterio?.nombre || 'N/A',
    'Estado': getEstadoLabel(c.cumple),
    'Hallazgo': c.hallazgo || '',
    'Plan de Mejora': c.plan_mejora || '',
    'Responsable': c.responsable_mejora?.username || '',
    'Fecha Compromiso': c.fecha_compromiso ? formatDate(c.fecha_compromiso) : '',
    'Fecha Creación': formatDate(c.fecha_creacion),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ajustar anchos de columna
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 20),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = autoevaluacion
    ? `Cumplimiento ${autoevaluacion.periodo}`
    : 'Cumplimientos';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

  const filename = autoevaluacion
    ? `cumplimientos_${autoevaluacion.numero_autoevaluacion}_${autoevaluacion.periodo}.xlsx`
    : 'cumplimientos_habilitacion.xlsx';
  XLSX.writeFile(workbook, filename);
};

export const exportPlanesMejoraExcel = (planes: PlanMejora[]) => {
  const data = planes.map((p) => ({
    'Nº Plan': p.numero_plan,
    'Descripción': p.descripcion,
    'Estado': getEstadoLabel(p.estado),
    'Avance (%)': p.porcentaje_avance,
    'Responsable': p.responsable_nombre || '',
    'Fecha Inicio': formatDate(p.fecha_inicio),
    'Fecha Vencimiento': formatDate(p.fecha_vencimiento),
    'Acciones': p.acciones_implementar,
    'Observaciones': p.observaciones || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 18),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Planes de Mejora');
  XLSX.writeFile(workbook, 'planes_mejora_habilitacion.xlsx');
};

export const exportHallazgosExcel = (hallazgos: Hallazgo[]) => {
  const data = hallazgos.map((h) => ({
    'Nº Hallazgo': h.numero_hallazgo,
    'Descripción': h.descripcion,
    'Tipo': getEstadoLabel(h.tipo),
    'Severidad': getEstadoLabel(h.severidad),
    'Estado': getEstadoLabel(h.estado),
    'Área Responsable': h.area_responsable || '',
    'Fecha Identificación': formatDate(h.fecha_identificacion),
    'Fecha Cierre': h.fecha_cierre ? formatDate(h.fecha_cierre) : 'Pendiente',
    'Observaciones': h.observaciones || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 18),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hallazgos');
  XLSX.writeFile(workbook, 'hallazgos_habilitacion.xlsx');
};

export const exportReporteCompletoExcel = (
  prestador: DatosPrestador,
  cumplimientos: Cumplimiento[],
  planes: PlanMejora[],
  hallazgos: Hallazgo[],
  resumen?: AutoevaluacionResumen,
) => {
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Resumen
  const resumenData = [
    { Campo: 'Código REPS', Valor: prestador.codigo_reps },
    { Campo: 'Estado Habilitación', Valor: getEstadoLabel(prestador.estado_habilitacion) },
    { Campo: 'Clase Prestador', Valor: prestador.clase_prestador },
    { Campo: 'Sede', Valor: prestador.sede?.nombre || 'N/A' },
    { Campo: 'Empresa', Valor: prestador.company?.nombre || 'N/A' },
    { Campo: 'Fecha Renovación', Valor: formatDate(prestador.fecha_renovacion) },
    { Campo: 'Fecha Vencimiento', Valor: formatDate(prestador.fecha_vencimiento_habilitacion) },
    ...(resumen
      ? [
          { Campo: '─── Resumen Autoevaluación ───', Valor: '' },
          { Campo: '% Cumplimiento', Valor: `${resumen.porcentaje_cumplimiento}%` },
          { Campo: 'Total Criterios', Valor: String(resumen.total_criterios) },
          { Campo: 'Criterios Cumplidos', Valor: String(resumen.cumplidos) },
          { Campo: 'No Cumplidos', Valor: String(resumen.no_cumplidos) },
          { Campo: 'Parcialmente', Valor: String(resumen.parcialmente_cumplidos) },
          { Campo: 'No Aplica', Valor: String(resumen.no_aplica) },
          { Campo: 'Planes Mejora Pendientes', Valor: String(resumen.planes_mejora_pendientes) },
          { Campo: 'Mejoras Vencidas', Valor: String(resumen.mejoras_vencidas) },
        ]
      : []),
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumenData);
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

  // Hoja 2: Cumplimientos
  if (cumplimientos.length > 0) {
    const cumplData = cumplimientos.map((c) => ({
      'Servicio': c.servicio_sede?.nombre_servicio || 'N/A',
      'Criterio': c.criterio?.nombre || 'N/A',
      'Estado': getEstadoLabel(c.cumple),
      'Hallazgo': c.hallazgo || '',
      'Responsable': c.responsable_mejora?.username || '',
      'Fecha Compromiso': c.fecha_compromiso ? formatDate(c.fecha_compromiso) : '',
    }));
    const wsCumpl = XLSX.utils.json_to_sheet(cumplData);
    wsCumpl['!cols'] = Object.keys(cumplData[0]).map((k) => ({ wch: Math.max(k.length, 18) }));
    XLSX.utils.book_append_sheet(workbook, wsCumpl, 'Cumplimientos');
  }

  // Hoja 3: Planes de Mejora
  if (planes.length > 0) {
    const planData = planes.map((p) => ({
      'Nº Plan': p.numero_plan,
      'Descripción': p.descripcion,
      'Estado': getEstadoLabel(p.estado),
      'Avance (%)': p.porcentaje_avance,
      'Responsable': p.responsable_nombre || '',
      'Vencimiento': formatDate(p.fecha_vencimiento),
    }));
    const wsPlanes = XLSX.utils.json_to_sheet(planData);
    wsPlanes['!cols'] = Object.keys(planData[0]).map((k) => ({ wch: Math.max(k.length, 18) }));
    XLSX.utils.book_append_sheet(workbook, wsPlanes, 'Planes de Mejora');
  }

  // Hoja 4: Hallazgos
  if (hallazgos.length > 0) {
    const hallData = hallazgos.map((h) => ({
      'Nº Hallazgo': h.numero_hallazgo,
      'Tipo': getEstadoLabel(h.tipo),
      'Severidad': getEstadoLabel(h.severidad),
      'Estado': getEstadoLabel(h.estado),
      'Descripción': h.descripcion,
      'Área': h.area_responsable || '',
    }));
    const wsHallazgos = XLSX.utils.json_to_sheet(hallData);
    wsHallazgos['!cols'] = Object.keys(hallData[0]).map((k) => ({ wch: Math.max(k.length, 18) }));
    XLSX.utils.book_append_sheet(workbook, wsHallazgos, 'Hallazgos');
  }

  const filename = `reporte_habilitacion_${prestador.codigo_reps}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// ─── PDF Exports ────────────────────────────────────────────────

export const exportCumplimientosPDF = (
  cumplimientos: Cumplimiento[],
  autoevaluacion?: Autoevaluacion,
  resumen?: AutoevaluacionResumen,
) => {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Título
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('Reporte de Cumplimiento - Habilitación', 14, 15);

  // Subtítulo
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  if (autoevaluacion) {
    doc.text(
      `Autoevaluación: ${autoevaluacion.numero_autoevaluacion} | Período: ${autoevaluacion.periodo} | Estado: ${getEstadoLabel(autoevaluacion.estado)}`,
      14,
      23,
    );
  }
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 29);

  // Resumen si existe
  let startY = 35;
  if (resumen) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`% Cumplimiento: ${resumen.porcentaje_cumplimiento}%`, 14, startY);
    doc.text(`Criterios: ${resumen.total_criterios} total | ${resumen.cumplidos} cumplidos | ${resumen.no_cumplidos} no cumplidos`, 100, startY);
    doc.text(`Planes pendientes: ${resumen.planes_mejora_pendientes} | Mejoras vencidas: ${resumen.mejoras_vencidas}`, 14, startY + 6);
    startY += 14;
  }

  // Tabla de cumplimientos
  const tableData = cumplimientos.map((c) => [
    c.autoevaluacion?.numero_autoevaluacion || 'N/A',
    c.servicio_sede?.nombre_servicio || 'N/A',
    c.criterio?.nombre || 'N/A',
    getEstadoLabel(c.cumple),
    c.hallazgo || '',
    c.responsable_mejora?.username || '',
    c.fecha_compromiso ? formatDate(c.fecha_compromiso) : '',
  ]);

  (doc as any).autoTable({
    head: [['Autoevaluación', 'Servicio', 'Criterio', 'Estado', 'Hallazgo', 'Responsable', 'Fecha']],
    body: tableData,
    startY,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 50 },
      3: { cellWidth: 25 },
      4: { cellWidth: 50 },
      5: { cellWidth: 30 },
      6: { cellWidth: 25 },
    },
  });

  const filename = autoevaluacion
    ? `reporte_cumplimiento_${autoevaluacion.numero_autoevaluacion}.pdf`
    : 'reporte_cumplimiento_habilitacion.pdf';
  doc.save(filename);
};

export const exportReportePrestadorPDF = (
  prestador: DatosPrestador,
  cumplimientos: Cumplimiento[],
  planes: PlanMejora[],
  hallazgos: Hallazgo[],
  resumen?: AutoevaluacionResumen,
) => {
  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text('Reporte de Habilitación', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 27);

  // Información del prestador
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Información del Prestador', 14, 38);

  (doc as any).autoTable({
    body: [
      ['Código REPS', prestador.codigo_reps],
      ['Estado', getEstadoLabel(prestador.estado_habilitacion)],
      ['Clase', prestador.clase_prestador],
      ['Sede', prestador.sede?.nombre || 'N/A'],
      ['Empresa', prestador.company?.nombre || 'N/A'],
      ['Fecha Renovación', formatDate(prestador.fecha_renovacion)],
      ['Fecha Vencimiento', formatDate(prestador.fecha_vencimiento_habilitacion)],
    ],
    startY: 42,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 140 },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Resumen de cumplimiento
  if (resumen) {
    doc.setFontSize(12);
    doc.text('Resumen de Cumplimiento', 14, currentY);

    (doc as any).autoTable({
      body: [
        ['% Cumplimiento', `${resumen.porcentaje_cumplimiento}%`],
        ['Total Criterios', String(resumen.total_criterios)],
        ['Cumplidos', String(resumen.cumplidos)],
        ['No Cumplidos', String(resumen.no_cumplidos)],
        ['Parcialmente', String(resumen.parcialmente_cumplidos)],
        ['No Aplica', String(resumen.no_aplica)],
        ['Planes Pendientes', String(resumen.planes_mejora_pendientes)],
        ['Mejoras Vencidas', String(resumen.mejoras_vencidas)],
      ],
      startY: currentY + 4,
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 140 },
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Hallazgos
  if (hallazgos.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.text('Hallazgos', 14, currentY);

    (doc as any).autoTable({
      head: [['Nº', 'Tipo', 'Severidad', 'Estado', 'Descripción']],
      body: hallazgos.map((h) => [
        h.numero_hallazgo,
        getEstadoLabel(h.tipo),
        getEstadoLabel(h.severidad),
        getEstadoLabel(h.estado),
        h.descripcion.substring(0, 60) + (h.descripcion.length > 60 ? '...' : ''),
      ]),
      startY: currentY + 4,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Planes de mejora
  if (planes.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.text('Planes de Mejora', 14, currentY);

    (doc as any).autoTable({
      head: [['Nº Plan', 'Estado', 'Avance', 'Responsable', 'Vencimiento']],
      body: planes.map((p) => [
        p.numero_plan,
        getEstadoLabel(p.estado),
        `${p.porcentaje_avance}%`,
        p.responsable_nombre || 'N/A',
        formatDate(p.fecha_vencimiento),
      ]),
      startY: currentY + 4,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] },
    });
  }

  doc.save(`reporte_habilitacion_${prestador.codigo_reps}.pdf`);
};
