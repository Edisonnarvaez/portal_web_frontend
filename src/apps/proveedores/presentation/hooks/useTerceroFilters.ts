import { useState, useMemo } from 'react';
import type { Tercero } from '../../domain/entities/Tercero';

export interface TerceroFilters {
  searchTerm: string;
  selectedTipoDocumento: string;
  selectedTipoTercero: string;
  selectedEstado: string;
  selectedProveedor: string;
}

export const useTerceroFilters = (terceros: Tercero[]) => {
  const [filters, setFilters] = useState<TerceroFilters>({
    searchTerm: '',
    selectedTipoDocumento: '',
    selectedTipoTercero: '',
    selectedEstado: '',
    selectedProveedor: '',
  });

  const filteredTerceros = useMemo(() => {
    return terceros.filter(tercero => {
      // Filtro por búsqueda
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = !filters.searchTerm || (
        tercero.tercero_codigo?.toLowerCase().includes(searchLower) ||
        tercero.tercero_nombre_completo?.toLowerCase().includes(searchLower) ||
        tercero.tercero_razon_social?.toLowerCase().includes(searchLower) ||
        tercero.tercero_email?.toLowerCase().includes(searchLower) ||
        tercero.tercero_telefono?.toLowerCase().includes(searchLower)
      );

      // Filtro por tipo de documento
      const matchesTipoDocumento = !filters.selectedTipoDocumento || 
        tercero.tercero_tipo_documento === filters.selectedTipoDocumento;

      // Filtro por tipo de tercero
      const matchesTipoTercero = !filters.selectedTipoTercero || 
        tercero.tercero_tipo?.toString() === filters.selectedTipoTercero;

      // Filtro por estado
      const matchesEstado = !filters.selectedEstado || 
        tercero.tercero_estado?.toString() === filters.selectedEstado;

      // Filtro por proveedor
      const matchesProveedor = !filters.selectedProveedor || 
        tercero.tercero_proveedor?.toString() === filters.selectedProveedor;

      return matchesSearch && matchesTipoDocumento && matchesTipoTercero && 
            matchesEstado && matchesProveedor;
    });
  }, [terceros, filters]);

  const updateFilter = (key: keyof TerceroFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTipoDocumento: '',
      selectedTipoTercero: '',
      selectedEstado: '',
      selectedProveedor: '',
    });
  };

  return {
    filters,
    filteredTerceros,
    updateFilter,
    clearFilters
  };
};