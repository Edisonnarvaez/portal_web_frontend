import { useState, useMemo } from 'react';
import type { Document } from '../../domain/entities/Document';
import type { Process } from '../../domain/entities/Process';
import type { ProcessType } from '../../domain/entities/ProcessType';
import type { DocumentPermissions } from '../../application/services/PermissionService';

export interface DocumentFilters {
  searchTerm: string;
  selectedTipo: string;
  selectedEstado: string;
  selectedProceso: string;
  selectedTipoProceso: string;
}


export const useDocumentFilters = (
  documents: Document[], 
  processes: Process[], 
  processTypes: ProcessType[], 
  permissions: DocumentPermissions
) => {
  const [filters, setFilters] = useState<DocumentFilters>({
    searchTerm: '',
    selectedTipo: '',
    selectedEstado: '',
    selectedProceso: '',
    selectedTipoProceso: ''
  });

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Filtro básico por búsqueda, tipo y proceso
      const matchesBasicFilters = (
        doc.nombre_documento.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
        doc.codigo_documento.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) &&
        (filters.selectedTipo === "" || doc.tipo_documento === filters.selectedTipo) &&
        (filters.selectedProceso === "" || doc.proceso.toString() === filters.selectedProceso);

      // Filtro por tipo de proceso
      let matchesProcessType = true;
      if (filters.selectedTipoProceso !== "") {
        const process = processes.find(p => p.id === doc.proceso);
        if (process && process.processType) {
          matchesProcessType = process.processType.toString() === filters.selectedTipoProceso;
        } else {
          matchesProcessType = false;
        }
      }

      const combinedFilters = matchesBasicFilters && matchesProcessType;

      // Filtro por estado según el rol
      if (permissions.isUser || permissions.isGestor) {
        // Usuarios básicos y gestores solo ven documentos vigentes
        return combinedFilters && doc.estado === 'VIG';
      } else if (permissions.isAdmin) {
        // Admin puede ver todos los estados (aplicar filtro de estado seleccionado)
        return combinedFilters && (filters.selectedEstado === "" || doc.estado === filters.selectedEstado);
      }

      return false;
    });
  }, [documents, processes, processTypes, filters, permissions]);

  const updateFilter = (key: keyof DocumentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTipo: '',
      selectedEstado: '',
      selectedProceso: '',
      selectedTipoProceso: ''
    });
  };

  return {
    filters,
    filteredDocuments,
    updateFilter,
    clearFilters
  };
};