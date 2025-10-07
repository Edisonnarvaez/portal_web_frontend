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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
        <div className="flex items-center">
          <HiOutlineCollection className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {permissions.isAdmin ? 'Total Documentos' : 'Documentos Vigentes'}
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{filteredDocuments.length}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas específicas por rol */}
      {permissions.isAdmin && (
        <>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3">
                <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Vigentes</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {documents.filter(d => d.estado === 'VIG').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mr-3">
                <div className="w-3 h-3 bg-red-600 dark:bg-red-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Obsoletos</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
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
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 transition-colors">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center mr-3">
                <FaFileAlt className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Tipos Disponibles</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {new Set(filteredDocuments.map(d => d.tipo_documento)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 transition-colors">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mr-3">
                <HiOutlineCollection className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Procesos Activos</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
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