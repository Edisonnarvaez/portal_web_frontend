import React from "react";
import { FaFileAlt } from "react-icons/fa";
import type { Document } from "../../../domain/entities/Document";
import type { Process } from "../../../domain/entities/Process";
import type { DocumentPermissions } from "../../../application/services/PermissionService";
import { PermissionService } from "../../../application/services/PermissionService";
import DocumentRow from "./DocumentRow";
import DocumentCards from "./DocumentCards";
import { TIPOS_DOCUMENTO } from "../../../domain/types"; // importa tu archivo index.ts

interface DocumentTableProps {
  documents: Document[];
  processes: Process[];
  permissions: DocumentPermissions;
  onView: (doc: Document) => void;
  onViewDocument: (doc: Document, type: "oficial" | "editable") => void;
  onDownload: (
    doc: Document,
    type: "oficial" | "editable",
    name: string
  ) => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  loadingExcel: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function DocumentTable({
  documents,
  processes,
  permissions,
  onView,
  onViewDocument,
  onDownload,
  onEdit,
  onDelete,
  loadingExcel,
}: DocumentTableProps) {
  const getEmptyMessage = () => {
    const role = permissions.isAdmin
      ? "admin"
      : permissions.isGestor
      ? "gestor"
      : "user";
    return PermissionService.getPermissionMessage(role, "emptyState");
  };

  // Crear mapa de orden para TIPOS_DOCUMENTO
  const tipoOrden: Record<string, number> = React.useMemo(() => {
    return TIPOS_DOCUMENTO.reduce((acc, tipo, index) => {
      acc[tipo.value] = index;
      return acc;
    }, {} as Record<string, number>);
  }, []);

  // Ordenar documentos por proceso y luego por tipo (usando TIPOS_DOCUMENTO) y codigo del documento
  const sortedDocuments = React.useMemo(() => {
  return [...documents].sort((a, b) => {
    // 1. ORDEN POR PROCESO
    const processA =
      processes.find((p) => p.id === a.proceso)?.name.toLowerCase() || "";
    const processB =
      processes.find((p) => p.id === b.proceso)?.name.toLowerCase() || "";

    if (processA < processB) return -1;
    if (processA > processB) return 1;

    // 2. ORDEN POR TIPO DE DOCUMENTO
    const tipoA = tipoOrden[a.tipo_documento] ?? Number.MAX_SAFE_INTEGER;
    const tipoB = tipoOrden[b.tipo_documento] ?? Number.MAX_SAFE_INTEGER;

    if (tipoA !== tipoB) return tipoA - tipoB;

    // 3. ORDEN POR CÓDIGO DEL DOCUMENTO
    const codigoA = a.codigo_documento?.toLowerCase?.() || "";
    const codigoB = b.codigo_documento?.toLowerCase?.() || "";

    if (codigoA < codigoB) return -1;
    if (codigoA > codigoB) return 1;

    return 0;
  });
}, [documents, processes, tipoOrden]);


  return (
    <div className="bg-white dark:bg-gray-800 flex flex-col h-full overflow-hidden">
      <h2 className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        Listado Maestro de Documentos
      </h2>

      {/* Vista mobile - Cards */}
      <div className="md:hidden flex-1 flex flex-col overflow-hidden">
        <DocumentCards
          documents={sortedDocuments}
          processes={processes}
          permissions={permissions}
          onView={onView}
          onViewDocument={onViewDocument}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          loadingExcel={loadingExcel}
        />
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:flex flex-col h-full overflow-hidden">
        <div className="flex-1 document-scroll">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-normal break-words max-w-[200px]">Documento</th>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Proceso</th>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Versión</th>
                  {permissions.isAdmin && (
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  )}
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Archivos</th>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedDocuments.map((document) => (
                  <DocumentRow
                    key={document.id}
                    document={document}
                    processes={processes}
                    permissions={permissions}
                    onView={onView}
                    onViewDocument={onViewDocument}
                    onDownload={onDownload}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    loadingExcel={loadingExcel}
                  />
                ))}
            </tbody>
          </table>

          {sortedDocuments.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              <FaFileAlt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm font-medium">No se encontraron documentos</p>
              <p className="text-xs">{getEmptyMessage()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje vacío para móvil */}
      {documents.length === 0 && (
        <div className="md:hidden flex flex-col items-center justify-center h-full text-center py-8 text-gray-500 dark:text-gray-400">
          <FaFileAlt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm font-medium">No se encontraron documentos</p>
          <p className="text-xs">{getEmptyMessage()}</p>
        </div>
      )}
    </div>
  );
}
