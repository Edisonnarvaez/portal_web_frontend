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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 transition-colors hover:shadow-md">
        <div className="flex items-center gap-1.5">
          <HiOutlineCollection className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
              {permissions.isAdmin ? 'Total Docs' : 'Docs Vigentes'}
            </p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{filteredDocuments.length}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas específicas por rol */}
      {permissions.isAdmin && (
        <>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 transition-colors hover:shadow-md">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium truncate">Vigentes</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {documents.filter(d => d.estado === 'VIG').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 transition-colors hover:shadow-md">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium truncate">Obsoletos</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">
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
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-2 transition-colors hover:shadow-md">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center flex-shrink-0">
                <FaFileAlt className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium truncate">Tipos</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {new Set(filteredDocuments.map(d => d.tipo_documento)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-2 transition-colors hover:shadow-md">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center flex-shrink-0">
                <HiOutlineCollection className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium truncate">Procesos</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
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