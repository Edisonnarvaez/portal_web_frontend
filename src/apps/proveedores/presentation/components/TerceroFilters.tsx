import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import type { TipoTercero } from '../../domain/entities/Tercero';
import { TIPOS_DOCUMENTO } from '../../domain/entities/Tercero';

export interface TerceroFilters {
  searchTerm: string;
  selectedTipoDocumento: string;
  selectedTipoTercero: string;
  selectedEstado: string;
  selectedProveedor: string;
}

interface TerceroFiltersProps {
  filters: TerceroFilters;
  tiposTercero: TipoTercero[];
  onUpdateFilter: (key: keyof TerceroFilters, value: string) => void;
  onClearFilters: () => void;
}

export default function TerceroFiltersComponent({
  filters,
  tiposTercero,
  onUpdateFilter,
  onClearFilters
}: TerceroFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Tipo de documento */}
        <select
          value={filters.selectedTipoDocumento}
          onChange={(e) => onUpdateFilter('selectedTipoDocumento', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
        >
          <option value="">Todos los documentos</option>
          {TIPOS_DOCUMENTO.map(tipo => (
            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
          ))}
        </select>

        {/* Tipo de tercero */}
        <select
          value={filters.selectedTipoTercero}
          onChange={(e) => onUpdateFilter('selectedTipoTercero', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
        >
          <option value="">Todos los tipos</option>
          {tiposTercero.map(tipo => (
            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
          ))}
        </select>

        {/* Estado */}
        <select
          value={filters.selectedEstado}
          onChange={(e) => onUpdateFilter('selectedEstado', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        {/* Proveedor */}
        <select
          value={filters.selectedProveedor}
          onChange={(e) => onUpdateFilter('selectedProveedor', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
        >
          <option value="">Todos</option>
          <option value="true">Es proveedor</option>
          <option value="false">No es proveedor</option>
        </select>

        {/* Búsqueda */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar terceros..."
            value={filters.searchTerm}
            onChange={(e) => onUpdateFilter('searchTerm', e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Botón limpiar */}
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 justify-center"
        >
          <FaTimes size={14} />
          Limpiar
        </button>
      </div>
    </div>
  );
}