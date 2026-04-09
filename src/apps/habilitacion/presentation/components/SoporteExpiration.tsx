import React, { useEffect, useState } from 'react';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

interface SoporteExpirationProps {
  soportes: SoporteDocumental[];
  onExpiredDocuments?: (documents: SoporteDocumental[]) => void;
  onExpiringDocuments?: (documents: SoporteDocumental[]) => void;
  showDismissible?: boolean;
  compact?: boolean;
}

/**
 * Helper to check if date is expired
 */
function isExpiredDate(fechaVencimiento: string | null | undefined): boolean {
  if (!fechaVencimiento) return false;
  return new Date(fechaVencimiento) < new Date();
}

/**
 * Component that displays expiration alerts for supporting documents
 * Shows critical alerts for expired and soon-to-expire documents
 */
const SoporteExpiration: React.FC<SoporteExpirationProps> = ({
  soportes = [],
  onExpiredDocuments,
  onExpiringDocuments,
  showDismissible = true,
  compact = false,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const expired = soportes.filter((doc) => isExpiredDate(doc.fecha_vencimiento));
  const critical = soportes.filter((doc) => {
    const daysLeft = getDaysUntilExpiry(doc.fecha_vencimiento);
    return !isExpiredDate(doc.fecha_vencimiento) && daysLeft > 0 && daysLeft <= 7;
  });
  const expiring = soportes.filter((doc) => {
    const daysLeft = getDaysUntilExpiry(doc.fecha_vencimiento);
    return !isExpiredDate(doc.fecha_vencimiento) && daysLeft > 7 && daysLeft <= 30;
  });

  useEffect(() => {
    if (onExpiredDocuments && expired.length > 0) {
      onExpiredDocuments(expired);
    }
    if (onExpiringDocuments && [...critical, ...expiring].length > 0) {
      onExpiringDocuments([...critical, ...expiring]);
    }
  }, [soportes]);

  const handleDismissAlert = (documentId: number) => {
    setDismissedAlerts([...dismissedAlerts, documentId]);
  };

  const handleRefresh = () => {
    setDismissedAlerts([]);
  };

  const totalAlerts = expired.length + critical.length;
  const hasAnyIssues = totalAlerts > 0;

  if (!hasAnyIssues && dismissedAlerts.length === 0) {
    return null;
  }

  if (compact && hasAnyIssues) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-red-800">
              ⚠️ {totalAlerts} documento(s) requiere(n) atención inmediata
            </p>
            {expired.length > 0 && (
              <p className="text-sm text-red-700 mt-1">
                {expired.length} vencido(s)
              </p>
            )}
            {critical.length > 0 && (
              <p className="text-sm text-orange-700 mt-1">
                {critical.length} por vencer en menos de 7 días
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-100"
          >
            Ver detalles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Expired Documents Alert */}
      {expired.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚨</div>
              <div>
                <h3 className="font-bold text-red-900">Documentos Vencidos</h3>
                <p className="text-sm text-red-700 mt-1">
                  {expired.length} documento(s) ya no son válidos
                </p>
              </div>
            </div>
            {showDismissible && (
              <button
                onClick={() => expired.forEach((d) => handleDismissAlert(d.id))}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Descartar
              </button>
            )}
          </div>

          <div className="space-y-2 ml-11">
            {expired
              .filter((doc) => !dismissedAlerts.includes(doc.id))
              .map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded p-3 border border-red-200 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {doc.tipo_nombre || 'Documento'}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Vencido desde {formatDate(doc.fecha_vencimiento)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(doc.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm ml-2"
                    title="Renovar"
                  >
                    🔄
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Critical Expiration Alert (< 7 days) */}
      {critical.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔴</div>
              <div>
                <h3 className="font-bold text-orange-900">Vencimiento Crítico</h3>
                <p className="text-sm text-orange-700 mt-1">
                  {critical.length} documento(s) vence(n) en menos de 7 días
                </p>
              </div>
            </div>
            {showDismissible && (
              <button
                onClick={() => critical.forEach((d) => handleDismissAlert(d.id))}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
              >
                Descartar
              </button>
            )}
          </div>

          <div className="space-y-2 ml-11">
            {critical
              .filter((doc) => !dismissedAlerts.includes(doc.id))
              .map((doc) => {
                const daysLeft = getDaysUntilExpiry(doc.fecha_vencimiento);
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded p-3 border border-orange-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {doc.tipo_nombre || 'Documento'}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        ⏰ Vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'} ({formatDate(doc.fecha_vencimiento)})
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismissAlert(doc.id)}
                      className="text-orange-600 hover:text-orange-800 font-medium text-sm ml-2"
                      title="Renovar"
                    >
                      🔄
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Expiring Soon Alert (7-30 days) */}
      {expiring.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🟡</div>
              <div>
                <h3 className="font-bold text-amber-900">Próximos a Vencer</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {expiring.length} documento(s) vence(n) en 8-30 días
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 ml-11">
            {expiring
              .filter((doc) => !dismissedAlerts.includes(doc.id))
              .map((doc) => {
                const daysLeft = getDaysUntilExpiry(doc.fecha_vencimiento);
                return (
                  <div key={doc.id} className="bg-white rounded p-3 border border-amber-200">
                    <p className="text-sm font-medium text-gray-800">
                      {doc.tipo_nombre || 'Documento'}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      📅 Vence en {daysLeft} días ({formatDate(doc.fecha_vencimiento)})
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* No Issues */}
      {expired.length === 0 && critical.length === 0 && expiring.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">✅ Todos los documentos están vigentes</p>
        </div>
      )}

      {/* Refresh Button */}
      {hasAnyIssues && (
        <div className="text-center">
          <button
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            ↻ Actualizar estado de documentos
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to format dates
 */
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * Helper function to calculate days until expiry
 */
function getDaysUntilExpiry(vencimiento: string | Date | null | undefined): number {
  if (!vencimiento) return 999;
  try {
    const vencDate = new Date(vencimiento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    vencDate.setHours(0, 0, 0, 0);
    const differenceTime = vencDate.getTime() - today.getTime();
    return Math.ceil(differenceTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

export default SoporteExpiration;
