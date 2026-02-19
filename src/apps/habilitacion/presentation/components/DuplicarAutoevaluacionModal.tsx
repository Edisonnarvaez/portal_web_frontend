import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark,
  HiOutlineDocumentDuplicate,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import type { Autoevaluacion } from '../../domain/entities/Autoevaluacion';

interface DuplicarAutoevaluacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoevaluacion: Autoevaluacion;
  onDuplicar: (id: number) => Promise<Autoevaluacion>;
  onSuccess: (nueva: Autoevaluacion) => void;
}

const DuplicarAutoevaluacionModal: React.FC<DuplicarAutoevaluacionModalProps> = ({
  isOpen,
  onClose,
  autoevaluacion,
  onDuplicar,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Autoevaluacion | null>(null);

  const handleDuplicar = async () => {
    setLoading(true);
    setError(null);
    try {
      const nueva = await onDuplicar(autoevaluacion.id);
      setResultado(nueva);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Error al duplicar la autoevaluación';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (resultado) {
      onSuccess(resultado);
    }
    setResultado(null);
    setError(null);
    onClose();
  };

  const handleCancel = () => {
    setResultado(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <HiOutlineDocumentDuplicate className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Duplicar Autoevaluación</h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {!resultado ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Se creará una nueva versión de la autoevaluación para el próximo período. La nueva autoevaluación se creará como <strong className="text-gray-900 dark:text-white">BORRADOR</strong>.
                </p>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Autoevaluación origen</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Número</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{autoevaluacion.numero_autoevaluacion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Período</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{autoevaluacion.periodo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Versión</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">v{autoevaluacion.version}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{autoevaluacion.estado}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <HiOutlineExclamationTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    La nueva autoevaluación se creará con versión incrementada y estado BORRADOR. Los criterios y cumplimientos no se copian automáticamente.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <HiOutlineXCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
              </>
            ) : (
              /* Resultado exitoso */
              <div className="space-y-4 text-center">
                <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <HiOutlineCheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Autoevaluación duplicada</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Se ha creado la nueva autoevaluación exitosamente.
                </p>
                <div className="space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Número</span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{resultado.numero_autoevaluacion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Período</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{resultado.periodo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Versión</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">v{resultado.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{resultado.estado}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {!resultado ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDuplicar}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Duplicando...
                    </>
                  ) : (
                    <>
                      <HiOutlineDocumentDuplicate className="h-4 w-4" /> Duplicar
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <HiOutlineCheckCircle className="h-4 w-4" /> Aceptar
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DuplicarAutoevaluacionModal;
