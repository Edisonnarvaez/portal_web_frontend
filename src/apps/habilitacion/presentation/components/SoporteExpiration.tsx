import React, { useEffect, useState } from 'react';
import type { SoporteDocumental } from '../../domain/entities/SoporteDocumental';

interface SoporteExpirationProps {
  soportes: SoporteDocumental[];
  onExpiredDocuments?: (documents: SoporteDocumental[]) => void;
  onExpiringDocuments?: (documents: SoporteDocumental[]) => void;
  showDismissible?: boolean;
  compact?: boolean;
  onViewExpiringClick?: () => void;
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
  onViewExpiringClick,
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <div>
            <p className="font-bold text-red-800 text-xs sm:text-sm">
              ⚠️ {totalAlerts} documento(s) requiere atención
            </p>
            {expired.length > 0 && (
              <p className="text-xs text-red-700 mt-0.5">
                {expired.length} vencido(s)
              </p>
            )}
            {critical.length > 0 && (
              <p className="text-xs text-orange-700 mt-0.5">
                {critical.length} próximos a vencer
              </p>
            )}
          </div>
          <button
            onClick={onViewExpiringClick}
            className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-0.5 rounded hover:bg-red-100 flex-shrink-0"
          >
            Ver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Expired Documents Alert */}
      {expired.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded p-2 sm:p-3">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl flex-shrink-0">🚨</div>
              <div>
                <h3 className="font-bold text-red-900 text-sm">Vencidos</h3>
                <p className="text-xs text-red-700 mt-0.5">
                  {expired.length} doc. expirados
                </p>
              </div>
            </div>
            {showDismissible && (
              <button
                onClick={() => expired.forEach((d) => handleDismissAlert(d.id))}
                className="text-red-600 hover:text-red-800 text-xs font-medium flex-shrink-0"
              >
                Descartar
              </button>
            )}
          </div>

          <div className="space-y-1 sm:space-y-2 ml-7 sm:ml-9">
            {expired
              .filter((doc) => !dismissedAlerts.includes(doc.id))
              .map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded p-1.5 sm:p-2 border border-red-200 flex items-center justify-between gap-1"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                      {doc.tipo_nombre || 'Documento'}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">
                      ❌ Vencido {formatDate(doc.fecha_vencimiento)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(doc.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm flex-shrink-0"
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
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded p-2 sm:p-3">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl flex-shrink-0">🔴</div>
              <div>
                <h3 className="font-bold text-orange-900 text-sm">Crítico</h3>
                <p className="text-xs text-orange-700 mt-0.5">
                  {critical.length} doc. en menos de 7d
                </p>
              </div>
            </div>
            {showDismissible && (
              <button
                onClick={() => critical.forEach((d) => handleDismissAlert(d.id))}
                className="text-orange-600 hover:text-orange-800 text-xs font-medium flex-shrink-0"
              >
                Descartar
              </button>
            )}
          </div>

          <div className="space-y-1 sm:space-y-2 ml-7 sm:ml-9">
            {critical
              .filter((doc) => !dismissedAlerts.includes(doc.id))
              .map((doc) => {
                const daysLeft = getDaysUntilExpiry(doc.fecha_vencimiento);
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded p-1.5 sm:p-2 border border-orange-200 flex items-center justify-between gap-1"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {doc.tipo_nombre || 'Documento'}
                      </p>
                      <p className="text-xs text-orange-600 mt-0.5">
                        ⏰ {daysLeft}d
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismissAlert(doc.id)}
                      className="text-orange-600 hover:text-orange-800 font-medium text-sm flex-shrink-0"
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
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-2 sm:p-3">
          <div className="flex items-start gap-2 sm:gap-3 mb-2">
            <div className="text-xl sm:text-2xl flex-shrink-0">🟡</div>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Próximos</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                {expiring.length} por vencer en 8-30 días
              </p>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2 ml-7 sm:ml-9">
            {expiring
              .filter((doc) => !dismissedAlerts.includes(doc.id))
              .map((doc) => {
                const daysLeft = getDaysUntilExpiry(doc.fecha_vencimiento);
                return (
                  <div key={doc.id} className="bg-white rounded p-1.5 sm:p-2 border border-amber-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                      {doc.tipo_nombre || 'Documento'}
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      📅 {daysLeft}d
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* No Issues */}
      {expired.length === 0 && critical.length === 0 && expiring.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 sm:p-2 text-center">
          <p className="text-green-800 font-medium text-xs sm:text-sm">✅ Documentos vigentes</p>
        </div>
      )}

      {/* Refresh Button */}
      {hasAnyIssues && (
        <div className="text-center">
          <button
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium underline"
          >
            ↻ Actualizar
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
