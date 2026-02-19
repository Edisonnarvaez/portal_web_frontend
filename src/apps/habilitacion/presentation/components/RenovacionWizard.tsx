import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineShieldCheck,
  HiOutlineDocumentCheck,
  HiOutlineRocketLaunch,
} from 'react-icons/hi2';
import type { DatosPrestador } from '../../domain/entities/DatosPrestador';

interface RenovacionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  prestador: DatosPrestador;
  diasRestantes: number | null;
  onIniciarRenovacion: (id: number) => Promise<DatosPrestador>;
  onSuccess: () => void;
}

type Step = 'verificacion' | 'confirmacion' | 'resultado';

const RenovacionWizard: React.FC<RenovacionWizardProps> = ({
  isOpen,
  onClose,
  prestador,
  diasRestantes,
  onIniciarRenovacion,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>('verificacion');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DatosPrestador | null>(null);

  const elegible = useMemo(() => {
    if (diasRestantes === null) return false;
    return diasRestantes <= 180;
  }, [diasRestantes]);

  const handleIniciarRenovacion = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await onIniciarRenovacion(prestador.id);
      setResultado(updated);
      setStep('resultado');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Error al iniciar la renovación';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setStep('verificacion');
    setError(null);
    setResultado(null);
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (step === 'resultado') {
      handleFinish();
      return;
    }
    setStep('verificacion');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('es-CO') : '—';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <HiOutlineArrowPath className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Renovación de Habilitación</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{prestador.codigo_reps}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              {(['verificacion', 'confirmacion', 'resultado'] as Step[]).map((s, i) => {
                const labels = ['Verificación', 'Confirmación', 'Resultado'];
                const isActive = s === step;
                const isPast = (['verificacion', 'confirmacion', 'resultado'].indexOf(step) > i);
                return (
                  <React.Fragment key={s}>
                    {i > 0 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isPast ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isActive ? 'bg-blue-600 text-white' : isPast ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {isPast ? '✓' : i + 1}
                      </span>
                      <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                        {labels[i]}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* ── Step 1: Verificación ── */}
            {step === 'verificacion' && (
              <div className="space-y-5">
                <div className="text-center">
                  {elegible ? (
                    <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                      <HiOutlineCheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="inline-flex p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                      <HiOutlineXCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {elegible ? 'Elegible para renovación' : 'No elegible para renovación'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {elegible
                      ? 'Este prestador cumple los requisitos para iniciar el proceso de renovación.'
                      : 'La renovación solo está disponible cuando faltan 180 días o menos para el vencimiento.'}
                  </p>
                </div>

                {/* Info Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estado actual</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{prestador.estado_habilitacion}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fecha de vencimiento</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(prestador.fecha_vencimiento_habilitacion)}</span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    diasRestantes !== null && diasRestantes <= 30
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : diasRestantes !== null && diasRestantes <= 180
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-gray-50 dark:bg-gray-900/50'
                  }`}>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Días restantes</span>
                    <span className={`text-sm font-bold ${
                      diasRestantes !== null && diasRestantes < 0 ? 'text-red-600' :
                      diasRestantes !== null && diasRestantes <= 30 ? 'text-red-600' :
                      diasRestantes !== null && diasRestantes <= 180 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {diasRestantes !== null ? (diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : `${diasRestantes} días`) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Última renovación</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(prestador.fecha_renovacion)}</span>
                  </div>
                </div>

                {!elegible && diasRestantes !== null && diasRestantes > 180 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <HiOutlineExclamationTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Podrá iniciar la renovación cuando falten 180 días o menos para el vencimiento.
                      Actualmente faltan <strong>{diasRestantes}</strong> días.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Confirmación ── */}
            {step === 'confirmacion' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
                    <HiOutlineRocketLaunch className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar Renovación</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Al iniciar la renovación, el prestador cambiará a estado <strong className="text-blue-600">EN_PROCESO</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-2">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">¿Qué sucederá?</h4>
                  <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-2">
                      <HiOutlineShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      El estado del prestador cambiará a <strong>EN_PROCESO</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <HiOutlineDocumentCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      Podrá crear una nueva autoevaluación para el período de renovación
                    </li>
                    <li className="flex items-start gap-2">
                      <HiOutlineArrowPath className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      Las fechas se actualizarán al completar el proceso
                    </li>
                  </ul>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <HiOutlineXCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3: Resultado ── */}
            {step === 'resultado' && resultado && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                    <HiOutlineCheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Renovación Iniciada</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    El proceso de renovación se ha iniciado correctamente.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nuevo estado</span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{resultado.estado_habilitacion}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Código REPS</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{resultado.codigo_reps}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Siguientes pasos</h4>
                  <ul className="space-y-1.5 text-sm text-indigo-700 dark:text-indigo-400">
                    <li>1. Crear una nueva autoevaluación para el período de renovación</li>
                    <li>2. Completar los criterios de cumplimiento</li>
                    <li>3. Validar la autoevaluación cuando esté completa</li>
                    <li>4. Actualizar las fechas de renovación y vencimiento</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {step === 'verificacion' && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep('confirmacion')}
                  disabled={!elegible}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    elegible
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continuar <HiOutlineArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {step === 'confirmacion' && (
              <>
                <button
                  onClick={() => { setStep('verificacion'); setError(null); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <HiOutlineArrowLeft className="h-4 w-4" /> Atrás
                </button>
                <button
                  onClick={handleIniciarRenovacion}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <HiOutlineArrowPath className="h-4 w-4" /> Iniciar Renovación
                    </>
                  )}
                </button>
              </>
            )}

            {step === 'resultado' && (
              <div className="w-full flex justify-end">
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <HiOutlineCheckCircle className="h-4 w-4" /> Finalizar
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RenovacionWizard;
