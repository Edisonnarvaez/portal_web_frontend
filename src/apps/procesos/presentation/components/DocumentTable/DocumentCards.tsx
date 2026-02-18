import React from "react";
import { FaFileAlt } from "react-icons/fa";
import type { Document } from "../../../domain/entities/Document";
import type { Process } from "../../../domain/entities/Process";
import type { DocumentPermissions } from "../../../application/services/PermissionService";
import { FileHandlingService } from "../../../application/services/FileHandlingService";
import { TIPOS_DOCUMENTO, ESTADOS } from "../../../domain/types";
import ActionButtons from "./ActionButtons";

interface DocumentCardsProps {
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
}

export default function DocumentCards({
  documents,
  processes,
  permissions,
  onView,
  onViewDocument,
  onDownload,
  onEdit,
  onDelete,
  loadingExcel,
}: DocumentCardsProps) {
  const getTipoLabel = (tipo: string) => {
    return TIPOS_DOCUMENTO.find((t) => t.value === tipo)?.label || tipo;
  };

  const getEstadoStyle = (estado: string) => {
    return ESTADOS.find((e) => e.value === estado)?.color || "bg-gray-100 text-gray-800";
  };

  const getProcessName = (processId: number) => {
    return processes.find((p) => p.id === processId)?.name || "N/A";
  };

  const renderFileIcon = (filename: string, label: string) => {
    const { Component, className } = FileHandlingService.getFileIcon(filename);
    return (
      <div className="flex items-center gap-1">
        <Component className={className} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    );
  };

  // Crear mapa de orden para TIPOS_DOCUMENTO
  const tipoOrden: Record<string, number> = React.useMemo(() => {
    return TIPOS_DOCUMENTO.reduce((acc, tipo, index) => {
      acc[tipo.value] = index;
      return acc;
    }, {} as Record<string, number>);
  }, []);

  // Ordenar documentos igual que en DocumentTable
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

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
        <FaFileAlt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-sm font-medium">No se encontraron documentos</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 document-scroll flex-1 overflow-hidden">
      {sortedDocuments.map((document) => (
        <div
          key={document.id}
          className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow-md transition-shadow relative"
        >
          {/* Código y nombre del documento */}
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {document.codigo_documento}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {document.nombre_documento}
            </p>
          </div>

          {/* Info en dos columnas */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs border-y border-gray-200 dark:border-gray-600 py-2">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Proceso</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {getProcessName(document.proceso)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Tipo</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {getTipoLabel(document.tipo_documento)}
              </p>
            </div>
          </div>

          {/* Versión y Estado */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              v{document.version}
            </span>
            {permissions.isAdmin && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoStyle(document.estado)}`}>
                {ESTADOS.find((e) => e.value === document.estado)?.label}
              </span>
            )}
          </div>

          {/* Archivos disponibles */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
            {renderFileIcon(document.archivo_oficial, "Oficial")}
            {permissions.isAdmin && document.archivo_editable && renderFileIcon(document.archivo_editable, "Editable")}
          </div>

          {/* Acciones */}
          <div className="flex gap-2 flex-wrap">
            <ActionButtons
              document={document}
              permissions={permissions}
              onView={onView}
              onViewDocument={onViewDocument}
              onDownload={onDownload}
              onEdit={onEdit}
              onDelete={onDelete}
              loadingExcel={loadingExcel}
              isMobile={true}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
