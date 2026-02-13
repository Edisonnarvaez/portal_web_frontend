import { useState, useMemo } from 'react';
import type { Document } from '../../domain/entities/Document';
import type { Process } from '../../domain/entities/Process';
import type { ProcessType } from '../../domain/entities/ProcessType';
import {
  ReportUtils,
  type DocumentsByMonth,
  type DocumentsByType,
  type DocumentsByProcessType,
  type DocumentsByProcessName,
  type DocumentStatistics
} from '../utils/reportUtils';

export const useDocumentReports = (
  documents: Document[],
  processes: Process[],
  processTypes: ProcessType[]
) => {
  const [dateFilterType, setDateFilterType] = useState<'creation' | 'update'>('creation');
  const [creationDateStart, setCreationDateStart] = useState<Date | null>(null);
  const [creationDateEnd, setCreationDateEnd] = useState<Date | null>(null);
  const [updateDateStart, setUpdateDateStart] = useState<Date | null>(null);
  const [updateDateEnd, setUpdateDateEnd] = useState<Date | null>(null);

  // Aplicar filtros de fecha a los documentos
  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (dateFilterType === 'creation') {
      result = ReportUtils.filterByCreationDate(result, creationDateStart, creationDateEnd);
    } else {
      result = ReportUtils.filterByUpdateDate(result, updateDateStart, updateDateEnd);
    }

    return result;
  }, [documents, dateFilterType, creationDateStart, creationDateEnd, updateDateStart, updateDateEnd]);

  // Datos de reportes
  const documentsByMonth = useMemo(
    () => ReportUtils.getDocumentsByMonth(filteredDocuments),
    [filteredDocuments]
  );

  const documentsByDocType = useMemo(
    () => ReportUtils.getDocumentsByDocType(filteredDocuments),
    [filteredDocuments]
  );

  const documentsByProcessType = useMemo(
    () => ReportUtils.getDocumentsByProcessType(filteredDocuments, processes, processTypes),
    [filteredDocuments, processes, processTypes]
  );

  const documentsByProcessName = useMemo(
    () => ReportUtils.getDocumentsByProcessName(filteredDocuments, processes),
    [filteredDocuments, processes]
  );

  const statistics = useMemo(
    () => ReportUtils.getStatistics(filteredDocuments),
    [filteredDocuments]
  );

  // Setters para filtros
  const setCreationDateRange = (start: Date | null, end: Date | null) => {
    setCreationDateStart(start);
    setCreationDateEnd(end);
  };

  const setUpdateDateRange = (start: Date | null, end: Date | null) => {
    setUpdateDateStart(start);
    setUpdateDateEnd(end);
  };

  const clearDateFilters = () => {
    setCreationDateStart(null);
    setCreationDateEnd(null);
    setUpdateDateStart(null);
    setUpdateDateEnd(null);
  };

  return {
    // Datos reportes
    documentsByMonth,
    documentsByDocType,
    documentsByProcessType,
    documentsByProcessName,
    statistics,
    filteredDocuments,

    // Estado de filtros
    dateFilterType,
    creationDateStart,
    creationDateEnd,
    updateDateStart,
    updateDateEnd,

    // Setters
    setDateFilterType,
    setCreationDateRange,
    setUpdateDateRange,
    clearDateFilters
  };
};
