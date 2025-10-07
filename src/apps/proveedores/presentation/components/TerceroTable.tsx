import React from 'react';
import { FaEye, FaEdit, FaTrash, FaUser, FaBuilding } from 'react-icons/fa';
import type { Tercero, TipoTercero } from '../../domain/entities/Tercero';
import { formatDisplayDate } from '../../../../shared/utils/dateUtils';

interface TerceroTableProps {
  terceros: Tercero[];
  tiposTercero: TipoTercero[];
  onView: (tercero: Tercero) => void;
  onEdit: (tercero: Tercero) => void;
  onDelete: (tercero: Tercero) => void;
  getTipoDocumentoLabel: (tipo: string) => string;
  getNombreCompleto: (tercero: Tercero) => string;
}

export default function TerceroTable({
  terceros,
  tiposTercero,
  onView,
  onEdit,
  onDelete,
  getTipoDocumentoLabel,
  getNombreCompleto
}: TerceroTableProps) {
  const getTipoTerceroNombre = (tipoId?: number) => {
    if (!tipoId) return 'Sin tipo';
    const tipo = tiposTercero.find(t => t.id === tipoId);
    return tipo?.nombre || 'Desconocido';
  };

  const esPersonaNatural = (tipoDoc: string) => {
    return ['CC', 'TI', 'CE', 'PA', 'RC'].includes(tipoDoc);
  };

  if (terceros.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <FaUser className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No se encontraron terceros</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tercero
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {terceros.map((tercero) => (
              <tr key={tercero.tercero_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        {esPersonaNatural(tercero.tercero_tipo_documento) ? (
                          <FaUser className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <FaBuilding className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getNombreCompleto(tercero)}
                      </div>
                      {tercero.tercero_direccion && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {tercero.tercero_direccion}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    <div className="font-medium">{tercero.tercero_codigo}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {getTipoDocumentoLabel(tercero.tercero_tipo_documento)}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {tercero.tercero_telefono && (
                      <div>{tercero.tercero_telefono}</div>
                    )}
                    {tercero.tercero_email && (
                      <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {tercero.tercero_email}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    <div>{getTipoTerceroNombre(tercero.tercero_tipo)}</div>
                    <div className="flex gap-1 mt-1">
                      {tercero.tercero_proveedor && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Proveedor
                        </span>
                      )}
                      {tercero.tercero_obligado_facturar && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Facturar
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tercero.tercero_estado
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {tercero.tercero_estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(tercero)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title="Ver detalles"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(tercero)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      title="Editar"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tercero)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}