import React from 'react';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

interface SoporteChecklistProps {
  soportes: SoporteDocumental[];
  isLoading?: boolean;
}

/**
 * Component that displays a simple checklist of uploaded documents
 */
/**
 * Helper: Check if document is expired
 */
function isExpired(fechaVencimiento: string | null | undefined): boolean {
  if (!fechaVencimiento) return false;
  return new Date(fechaVencimiento) < new Date();
}

const SoporteChecklist: React.FC<SoporteChecklistProps> = ({
  soportes = [],
  isLoading = false,
}) => {
  const completados = soportes.filter((s) => s.es_vigente).length;
  const vencidos = soportes.filter((s) => isExpired(s.fecha_vencimiento)).length;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-bold text-gray-800 mb-3">Documentos Cargados</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">{soportes.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{completados}</p>
            <p className="text-xs text-gray-600">Vigentes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{vencidos}</p>
            <p className="text-xs text-gray-600">Vencidos</p>
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {soportes.map((doc) => (
          <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm text-gray-800">
                  {doc.tipo_nombre || 'Documento'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  v{doc.version} • {doc.es_vigente ? '✓ Vigente' : '○ Histórico'}
                </p>
              </div>
              {isExpired(doc.fecha_vencimiento) && <span className="text-red-600 font-bold">❌</span>}
              {!isExpired(doc.fecha_vencimiento) && doc.es_vigente && <span className="text-green-600 font-bold">✅</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoporteChecklist;
