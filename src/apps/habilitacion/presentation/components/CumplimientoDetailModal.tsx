import React, { useEffect, useMemo, useState } from 'react';
import { HiOutlineEye, HiOutlineXMark, HiOutlineArrowDownTray } from 'react-icons/hi2';
import type { Cumplimiento } from '../../domain/entities';
import { useCumplimiento } from '../hooks';
import { getEstadoColor, getEstadoLabel, formatDate } from '../utils/formatters';
import { DocumentService } from '../../../procesos/application/services/DocumentService';
import { DocumentRepository } from '../../../procesos/infrastructure/repositories/DocumentRepository';
import { extractErrorMessage } from '../../shared/utils/error';

interface CumplimientoDetailModalProps {
  isOpen: boolean;
  cumplimiento?: Cumplimiento;
  onClose: () => void;
}

interface DocRef {
  id: number;
  nombre: string;
}

const documentService = new DocumentService(new DocumentRepository());

const CumplimientoDetailModal: React.FC<CumplimientoDetailModalProps> = ({ isOpen, cumplimiento, onClose }) => {
  const { getCumplimiento } = useCumplimiento();
  const [detail, setDetail] = useState<Cumplimiento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyDocId, setBusyDocId] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!isOpen || !cumplimiento?.id) return;
      setLoading(true);
      setError('');
      try {
        const data = await getCumplimiento(cumplimiento.id);
        setDetail(data);
      } catch (err: unknown) {
        setDetail(cumplimiento);
        setError(extractErrorMessage(err, 'No fue posible cargar el detalle completo del cumplimiento'));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isOpen, cumplimiento, getCumplimiento]);

  const current = detail || cumplimiento;

  const documentos = useMemo<DocRef[]>(() => {
    if (!current) return [];
    const list = Array.isArray(current.documentos_evidencia_list)
      ? current.documentos_evidencia_list
      : Array.isArray(current.documentos_evidencia)
      ? current.documentos_evidencia
      : [];

    return list
      .filter((d): d is { id: number; nombre?: string } => !!d && typeof d.id === 'number')
      .map((d) => ({ id: d.id, nombre: d.nombre || `Documento ${d.id}` }));
  }, [current]);

  const handlePreview = async (documentId: number) => {
    setBusyDocId(documentId);
    try {
      const blob = await documentService.previewDocument(documentId, 'oficial');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'No se pudo previsualizar el documento'));
    } finally {
      setBusyDocId(null);
    }
  };

  const handleDownload = async (documentId: number, nombre: string) => {
    setBusyDocId(documentId);
    try {
      const blob = await documentService.downloadDocument(documentId, 'oficial');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nombre || `documento-${documentId}`}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'No se pudo descargar el documento'));
    } finally {
      setBusyDocId(null);
    }
  };

  if (!isOpen || !cumplimiento) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle de Cumplimiento</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Registro #{cumplimiento.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Cerrar"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {loading && (
              <div className="text-sm text-gray-500 dark:text-gray-400">Cargando detalle...</div>
            )}

            {error && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
                {error}
              </div>
            )}

            {current && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Estado"
                    value={
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${getEstadoColor(current.cumple)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {getEstadoLabel(current.cumple)}
                      </span>
                    }
                  />
                  <Field
                    label="Fecha compromiso"
                    value={current.fecha_compromiso ? formatDate(current.fecha_compromiso) : 'Sin fecha'}
                  />
                  <Field
                    label="Servicio"
                    value={
                      current.servicio_sede_detail?.nombre ||
                      current.servicio_sede?.nombre_servicio ||
                      current.servicio_nombre ||
                      'No disponible'
                    }
                  />
                  <Field
                    label="Criterio"
                    value={
                      current.criterio_detail?.codigo
                        ? `${current.criterio_detail.codigo} - ${current.criterio_detail.nombre}`
                        : current.criterio?.codigo
                        ? `${current.criterio.codigo} - ${current.criterio.nombre}`
                        : current.criterio_nombre || current.criterio?.nombre || 'No disponible'
                    }
                  />
                </div>

                <Field
                  label="Hallazgo / Observación"
                  value={current.hallazgo || 'Sin observaciones registradas'}
                  multiline
                />

                <Field
                  label="Plan de mejora"
                  value={current.plan_mejora || 'Sin plan de mejora asociado'}
                  multiline
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Soportes asociados</p>
                  {documentos.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-3">
                      Este cumplimiento no tiene soportes asociados.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documentos.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                            {doc.nombre}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreview(doc.id)}
                              disabled={busyDocId === doc.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              <HiOutlineEye className="h-4 w-4" />
                              Ver
                            </button>
                            <button
                              onClick={() => handleDownload(doc.id, doc.nombre)}
                              disabled={busyDocId === doc.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
                            >
                              <HiOutlineArrowDownTray className="h-4 w-4" />
                              Descargar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: React.ReactNode; multiline?: boolean }> = ({ label, value, multiline = false }) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <div className={`text-sm text-gray-900 dark:text-gray-100 ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value}</div>
  </div>
);

export default CumplimientoDetailModal;
