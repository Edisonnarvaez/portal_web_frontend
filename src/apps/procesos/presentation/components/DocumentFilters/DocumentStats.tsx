import React from 'react';
import { HiOutlineCollection } from 'react-icons/hi';
import { FaFileAlt } from 'react-icons/fa';
import type { Document } from '../../../domain/entities/Document';
import type { DocumentPermissions } from '../../../application/services/PermissionService';

interface DocumentStatsProps {
  documents: Document[];
  filteredDocuments: Document[];
  permissions: DocumentPermissions;
}

export default function DocumentStats({
  documents,
  filteredDocuments,
  permissions
}: DocumentStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 mb-0.5">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-1 transition-colors hover:shadow-sm">
        <div className="flex items-center gap-0.5">
          <HiOutlineCollection className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate leading-tight">
              {permissions.isAdmin ? 'Total Documentos' : 'Documentos Vigentes'}
            </p>
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 leading-tight">{filteredDocuments.length}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas específicas por rol */}
      {permissions.isAdmin && (
        <>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-1 transition-colors hover:shadow-sm">
            <div className="flex items-center gap-0.5">
              <div className="w-3.5 h-3.5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-1 h-1 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium truncate leading-tight">Vigentes</p>
                <p className="text-sm font-bold text-green-700 dark:text-green-300 leading-tight">
                  {documents.filter(d => d.estado === 'VIG').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-1 transition-colors hover:shadow-sm">
            <div className="flex items-center gap-0.5">
              <div className="w-3.5 h-3.5 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium truncate leading-tight">Obsoletos</p>
                <p className="text-sm font-bold text-red-700 dark:text-red-300 leading-tight">
                  {documents.filter(d => d.estado === 'OBS').length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Para gestores y usuarios */}
      {!permissions.isAdmin && (
        <>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-1 transition-colors hover:shadow-sm">
            <div className="flex items-center gap-0.5">
              <div className="w-3.5 h-3.5 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center flex-shrink-0">
                <FaFileAlt className="w-2 h-2 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium truncate leading-tight">Tipos</p>
                <p className="text-sm font-bold text-orange-700 dark:text-orange-300 leading-tight">
                  {new Set(filteredDocuments.map(d => d.tipo_documento)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-1 transition-colors hover:shadow-sm">
            <div className="flex items-center gap-0.5">
              <div className="w-3.5 h-3.5 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center flex-shrink-0">
                <HiOutlineCollection className="w-2 h-2 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium truncate leading-tight">Procesos</p>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300 leading-tight">
                  {new Set(filteredDocuments.map(d => d.proceso)).size}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}