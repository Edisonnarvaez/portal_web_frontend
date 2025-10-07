import React from 'react';
import { HiPencil, HiXMark } from 'react-icons/hi2';
import Button from '../../../../shared/components/Button';
import { formatDisplayDate } from '../../../../shared/utils/dateUtils';
import type { Tercero, Pais, Departamento, Municipio, TipoTercero } from '../../domain/entities/Tercero';

interface TerceroViewProps {
  tercero: Tercero;
  paises: Pais[];
  departamentos: Departamento[];
  municipios: Municipio[];
  tiposTercero: TipoTercero[];
  getTipoDocumentoLabel: (tipo: string) => string;
  getNombreCompleto: (tercero: Tercero) => string;
  onEdit: () => void;
  onClose: () => void;
}

export default function TerceroView({
  tercero,
  paises,
  departamentos,
  municipios,
  tiposTercero,
  getTipoDocumentoLabel,
  getNombreCompleto,
  onEdit,
  onClose
}: TerceroViewProps) {
  const getPaisNombre = (paisId?: number) => {
    if (!paisId) return 'No especificado';
    return paises.find(p => p.id === paisId)?.nombre || 'Desconocido';
  };

  const getDepartamentoNombre = (deptId?: number) => {
    if (!deptId) return 'No especificado';
    return departamentos.find(d => d.id === deptId)?.nombre || 'Desconocido';
  };

  const getMunicipioNombre = (munId?: number) => {
    if (!munId) return 'No especificado';
    return municipios.find(m => m.id === munId)?.nombre || 'Desconocido';
  };

  const getTipoTerceroNombre = (tipoId?: number) => {
    if (!tipoId) return 'No especificado';
    return tiposTercero.find(t => t.id === tipoId)?.nombre || 'Desconocido';
  };

  const esPersonaNatural = ['CC', 'TI', 'CE', 'PA', 'RC'].includes(tercero.tercero_tipo_documento);

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {getNombreCompleto(tercero).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {getNombreCompleto(tercero)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {getTipoDocumentoLabel(tercero.tercero_tipo_documento)} - {tercero.tercero_codigo}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={onEdit}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <HiPencil className="w-4 h-4" />
            Editar
          </Button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Información personal */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Información Personal
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Documento
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {getTipoDocumentoLabel(tercero.tercero_tipo_documento)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código/Documento
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {tercero.tercero_codigo}
            </p>
          </div>

          {esPersonaNatural && tercero.tercero_nombre_completo && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Completo
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {tercero.tercero_nombre_completo}
              </p>
            </div>
          )}

          {!esPersonaNatural && tercero.tercero_razon_social && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Razón Social
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {tercero.tercero_razon_social}
              </p>
            </div>
          )}

          {tercero.tercero_fecha_nacimiento && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Nacimiento
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDisplayDate(tercero.tercero_fecha_nacimiento)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Tercero
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {getTipoTerceroNombre(tercero.tercero_tipo)}
            </p>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Información de Contacto
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tercero.tercero_telefono && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {tercero.tercero_telefono}
              </p>
            </div>
          )}

          {tercero.tercero_email && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {tercero.tercero_email}
              </p>
            </div>
          )}

          {tercero.tercero_direccion && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {tercero.tercero_direccion}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información de ubicación */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Ubicación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              País
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {getPaisNombre(tercero.tercero_pais)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Departamento
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {getDepartamentoNombre(tercero.tercero_departamento)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Municipio
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {getMunicipioNombre(tercero.tercero_municipio)}
            </p>
          </div>
        </div>
      </div>

      {/* Información de configuración */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Configuración
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tercero.tercero_estado
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {tercero.tercero_estado ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Es Proveedor
            </label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tercero.tercero_proveedor
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {tercero.tercero_proveedor ? 'Sí' : 'No'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Obligado a Facturar
            </label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tercero.tercero_obligado_facturar
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {tercero.tercero_obligado_facturar ? 'Sí' : 'No'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={onEdit}
          variant="primary"
          className="flex items-center gap-2"
        >
          <HiPencil className="w-4 h-4" />
          Editar Tercero
        </Button>
        <Button
          onClick={onClose}
          variant="secondary"
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
}