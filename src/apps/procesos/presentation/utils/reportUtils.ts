import type { Document } from '../../domain/entities/Document';
import type { Process } from '../../domain/entities/Process';
import type { ProcessType } from '../../domain/entities/ProcessType';

/**
 * Tipos para los datos de reportes
 */
export interface DocumentsByMonth {
  month: string;
  count: number;
  fecha: string;
}

export interface DocumentsByType {
  tipo: string;
  count: number;
}

export interface DocumentsByProcessType {
  tipo_proceso: string;
  count: number;
}

export interface DocumentsByProcessName {
  nombre_proceso: string;
  count: number;
}

export interface DocumentStatistics {
  total: number;
  vigentes: number;
  obsoletos: number;
  archivados: number;
  promedio_por_mes: number;
}

/**
 * Utilities para procesamiento de reportes
 */
export class ReportUtils {
  /**
   * Obtiene documentos agrupados por mes
   */
  static getDocumentsByMonth(documents: Document[]): DocumentsByMonth[] {
    const monthMap = new Map<string, { count: number; fecha: string }>();

    documents.forEach(doc => {
      const fecha = new Date(doc.fecha_creacion);
      // Formato: YYYY-MM para agrupar
      const monthKey = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
      const monthLabel = this.formatMonth(fecha);

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { count: 0, fecha: monthLabel });
      }

      const entry = monthMap.get(monthKey)!;
      entry.count += 1;
    });

    // Convertir a array y ordenar cronológicamente
    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({
        month: value.fecha,
        count: value.count,
        fecha: key
      }));
  }

  /**
   * Obtiene documentos por tipo de documento
   */
  static getDocumentsByDocType(documents: Document[]): DocumentsByType[] {
    const typeMap = new Map<string, number>();

    documents.forEach(doc => {
      const tipo = doc.tipo_documento || 'Sin tipo';
      typeMap.set(tipo, (typeMap.get(tipo) || 0) + 1);
    });

    return Array.from(typeMap.entries())
      .map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Obtiene documentos por tipo de proceso
   */
  static getDocumentsByProcessType(
    documents: Document[],
    processes: Process[],
    processTypes: ProcessType[]
  ): DocumentsByProcessType[] {
    const processTypeMap = new Map<string, number>();

    documents.forEach(doc => {
      const process = processes.find(p => p.id === doc.proceso);
      if (process && process.processType) {
        const procType = processTypes.find(pt => pt.id === process.processType);
        const tipo = procType?.name || 'Sin tipo de proceso';
        processTypeMap.set(tipo, (processTypeMap.get(tipo) || 0) + 1);
      }
    });

    return Array.from(processTypeMap.entries())
      .map(([tipo_proceso, count]) => ({ tipo_proceso, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Obtiene documentos por nombre de proceso
   */
  static getDocumentsByProcessName(
    documents: Document[],
    processes: Process[]
  ): DocumentsByProcessName[] {
    const processMap = new Map<string, number>();

    documents.forEach(doc => {
      const process = processes.find(p => p.id === doc.proceso);
      const nombre = process?.name || 'Proceso desconocido';
      processMap.set(nombre, (processMap.get(nombre) || 0) + 1);
    });

    return Array.from(processMap.entries())
      .map(([nombre_proceso, count]) => ({ nombre_proceso, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Obtiene estadísticas generales de documentos
   */
  static getStatistics(documents: Document[]): DocumentStatistics {
    const total = documents.length;
    const vigentes = documents.filter(d => d.estado === 'VIG').length;
    const obsoletos = documents.filter(d => d.estado === 'OBS').length;
    const archivados = documents.filter(d => d.estado === 'ARC').length;

    // Calcular meses únicos para promedios
    const uniqueMonths = new Set<string>();
    documents.forEach(doc => {
      const fecha = new Date(doc.fecha_creacion);
      const monthKey = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
      uniqueMonths.add(monthKey);
    });

    const promedio_por_mes = uniqueMonths.size > 0 ? Math.round(total / uniqueMonths.size) : 0;

    return {
      total,
      vigentes,
      obsoletos,
      archivados,
      promedio_por_mes
    };
  }

  /**
   * Filtra documentos por rango de fechas de creación
   */
  static filterByCreationDate(
    documents: Document[],
    startDate: Date | null,
    endDate: Date | null
  ): Document[] {
    if (!startDate && !endDate) return documents;

    return documents.filter(doc => {
      const docDate = new Date(doc.fecha_creacion);

      if (startDate && docDate < startDate) return false;
      if (endDate) {
        // Incluir todo el día final
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (docDate > endOfDay) return false;
      }

      return true;
    });
  }

  /**
   * Filtra documentos por rango de fechas de actualización
   */
  static filterByUpdateDate(
    documents: Document[],
    startDate: Date | null,
    endDate: Date | null
  ): Document[] {
    if (!startDate && !endDate) return documents;

    return documents.filter(doc => {
      const docDate = new Date(doc.fecha_actualizacion);

      if (startDate && docDate < startDate) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (docDate > endOfDay) return false;
      }

      return true;
    });
  }

  /**
   * Obtiene documentos creados en el mes especificado
   */
  static getDocumentsBySpecificMonth(documents: Document[], year: number, month: number): Document[] {
    return documents.filter(doc => {
      const fecha = new Date(doc.fecha_creacion);
      return fecha.getFullYear() === year && fecha.getMonth() + 1 === month;
    });
  }

  /**
   * Formatea una fecha a formato legible de mes-año
   */
  static formatMonth(date: Date): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Formatea una fecha a formato legible completo
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return formatter.format(date);
  }

  /**
   * Convierte fecha a formato ISO para inputs date
   */
  static dateToInputFormat(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte string de input date a Date
   */
  static inputFormatToDate(dateString: string): Date {
    return new Date(dateString + 'T00:00:00');
  }

  /**
   * Obtiene los últimos N meses
   */
  static getLastNMonths(n: number): { year: number; month: number; label: string }[] {
    const months = [];
    const today = new Date();

    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: this.formatMonth(date)
      });
    }

    return months;
  }
}
