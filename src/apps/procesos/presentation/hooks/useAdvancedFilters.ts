import { useState } from 'react';
import type { Document } from '../../domain/entities/Document';
import { ReportUtils } from '../utils/reportUtils';

/**
 * Interfaz extendida de filtros con filtros de fechas
 */
export interface AdvancedDocumentFilters {
  searchTerm: string;
  selectedTipo: string;
  selectedEstado: string;
  selectedProceso: string;
  selectedTipoProceso: string;
  creationDateStart: string; // formato ISO YYYY-MM-DD
  creationDateEnd: string;
  updateDateStart: string;
  updateDateEnd: string;
}

export const useAdvancedFilters = () => {
  const [filters, setFilters] = useState<AdvancedDocumentFilters>({
    searchTerm: '',
    selectedTipo: '',
    selectedEstado: '',
    selectedProceso: '',
    selectedTipoProceso: '',
    creationDateStart: '',
    creationDateEnd: '',
    updateDateStart: '',
    updateDateEnd: ''
  });

  const [activeTab, setActiveTab] = useState<'basicos' | 'fechas'>('basicos');

  const updateFilter = (key: keyof AdvancedDocumentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTipo: '',
      selectedEstado: '',
      selectedProceso: '',
      selectedTipoProceso: '',
      creationDateStart: '',
      creationDateEnd: '',
      updateDateStart: '',
      updateDateEnd: ''
    });
    setActiveTab('basicos');
  };

  const clearDateFilters = () => {
    setFilters(prev => ({
      ...prev,
      creationDateStart: '',
      creationDateEnd: '',
      updateDateStart: '',
      updateDateEnd: ''
    }));
  };

  const applyDateFilters = (documents: Document[]): Document[] => {
    let result = documents;

    // Filtros de fecha de creación
    if (filters.creationDateStart) {
      const startDate = ReportUtils.inputFormatToDate(filters.creationDateStart);
      result = result.filter(doc => new Date(doc.fecha_creacion) >= startDate);
    }

    if (filters.creationDateEnd) {
      const endDate = ReportUtils.inputFormatToDate(filters.creationDateEnd);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(doc => new Date(doc.fecha_creacion) <= endOfDay);
    }

    // Filtros de fecha de actualización
    if (filters.updateDateStart) {
      const startDate = ReportUtils.inputFormatToDate(filters.updateDateStart);
      result = result.filter(doc => new Date(doc.fecha_actualizacion) >= startDate);
    }

    if (filters.updateDateEnd) {
      const endDate = ReportUtils.inputFormatToDate(filters.updateDateEnd);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(doc => new Date(doc.fecha_actualizacion) <= endOfDay);
    }

    return result;
  };

  const hasActiveFilters = (): boolean => {
    return (
      filters.searchTerm !== '' ||
      filters.selectedTipo !== '' ||
      filters.selectedEstado !== '' ||
      filters.selectedProceso !== '' ||
      filters.selectedTipoProceso !== '' ||
      filters.creationDateStart !== '' ||
      filters.creationDateEnd !== '' ||
      filters.updateDateStart !== '' ||
      filters.updateDateEnd !== ''
    );
  };

  const hasActiveDateFilters = (): boolean => {
    return (
      filters.creationDateStart !== '' ||
      filters.creationDateEnd !== '' ||
      filters.updateDateStart !== '' ||
      filters.updateDateEnd !== ''
    );
  };

  return {
    filters,
    activeTab,
    setActiveTab,
    updateFilter,
    clearFilters,
    clearDateFilters,
    applyDateFilters,
    hasActiveFilters,
    hasActiveDateFilters
  };
};
