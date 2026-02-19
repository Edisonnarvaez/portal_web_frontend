import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import type { Autoevaluacion } from '../../domain/entities/Autoevaluacion';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';

interface ValidarAutoevaluacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoevaluacion: Autoevaluacion;
  cumplimientos: Cumplimiento[];
  onValidar: (id: number) => Promise<Autoevaluacion>;
  onSuccess: () => void;
}

interface CheckResult {
  label: string;
  ok: boolean;
  detail: string;
}

const ValidarAutoevaluacionModal: React.FC<ValidarAutoevaluacionModalProps> = ({
  isOpen,
  onClose,
  autoevaluacion,
  cumplimientos,
  onValidar,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validada, setValidada] = useState(false);

  const checks = useMemo<CheckResult[]>(() => {
    const results: CheckResult[] = [];

    // Check 1: Autoevaluación no esté ya validada
    const noValidada = autoevaluacion.estado !== 'VALIDADA';
    results.push({
      label: 'Estado actual permite validación',
      ok: noValidada,
      detail: noValidada
        ? `Estado actual: ${autoevaluacion.estado}`
        : 'La autoevaluación ya ha sido validada',
    });

    // Check 2: Tiene cumplimientos registrados
    const tieneCumplimientos = cumplimientos.length > 0;
    results.push({
      label: 'Cumplimientos registrados',
      ok: tieneCumplimientos,
      detail: tieneCumplimientos
        ? `${cumplimientos.length} cumplimiento(s) registrado(s)`
        : 'No hay cumplimientos registrados para evaluar',
    });

    // Check 3: Todos los cumplimientos han sido evaluados (cumple != undefined/null)
    const sinEvaluar = cumplimientos.filter(c => !c.cumple);
    const todosEvaluados = tieneCumplimientos && sinEvaluar.length === 0;
    results.push({
      label: 'Todos los criterios evaluados',
      ok: todosEvaluados,
      detail: todosEvaluados
        ? 'Todos los criterios tienen evaluación asignada'
        : sinEvaluar.length > 0
        ? `${sinEvaluar.length} criterio(s) sin evaluar`
        : 'No se puede verificar sin cumplimientos',
    });

    // Check 4: Porcentaje mínimo de cumplimiento
    const totalAplicables = cumplimientos.filter(c => c.cumple && c.cumple !== 'NO_APLICA').length;
    const cumple = cumplimientos.filter(c => c.cumple === 'CUMPLE').length;
    const pctCumple = totalAplicables > 0 ? Math.round((cumple / totalAplicables) * 100) : 0;
    results.push({
      label: 'Nivel de cumplimiento',
      ok: true, // informativo, no bloqueante
      detail: totalAplicables > 0
        ? `${pctCumple}% de cumplimiento (${cumple}/${totalAplicables} aplicables)`
        : 'Sin datos de cumplimiento',
    });

    // Check 5: Estado mínimo COMPLETADA o EN_CURSO
    const estadoValido = ['COMPLETADA', 'REVISADA', 'EN_CURSO'].includes(autoevaluacion.estado);
    results.push({
      label: 'Estado adecuado para validación',
      ok: estadoValido,
      detail: estadoValido
        ? `Estado "${autoevaluacion.estado}" permite validación`
        : `Estado "${autoevaluacion.estado}" no es adecuado — se requiere EN_CURSO, COMPLETADA o REVISADA`,
    });

    return results;
  }, [autoevaluacion, cumplimientos]);

  const puedeValidar = checks.filter(c => !c.ok).filter((_, i) => i !== 3).length === 0; // check 4 es informativo
  const checksBloqueo = checks.filter((c, i) => !c.ok && i !== 3); // excluyendo informativo

  const handleValidar = async () => {
    setLoading(true);
    setError(null);
    try {
      await onValidar(autoevaluacion.id);
      setValidada(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Error al validar la autoevaluación';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setValidada(false);
    setError(null);
    onSuccess();
    onClose();
  };

  const handleCancel = () => {
    setValidada(false);
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
          className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${validada ? 'bg-green-100 dark:bg-green-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                <HiOutlineShieldCheck className={`h-5 w-5 ${validada ? 'text-green-600 dark:text-green-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Validar Autoevaluación</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{autoevaluacion.numero_autoevaluacion}</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {!validada ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Se verificarán las condiciones necesarias antes de validar la autoevaluación. Al validar, el estado cambiará a <strong className="text-green-600">VALIDADA</strong>.
                </p>

                {/* Pre-validation checks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verificaciones previas</h4>
                  {checks.map((check, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        check.ok
                          ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30'
                          : 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30'
                      }`}
                    >
                      {check.ok ? (
                        <HiOutlineCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <HiOutlineXCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${check.ok ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                          {check.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${check.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {check.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {checksBloqueo.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <HiOutlineExclamationTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Hay {checksBloqueo.length} verificación(es) que no se cumplen. Corrija los problemas antes de validar.
                    </p>
                  </div>
                )}

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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Autoevaluación Validada</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  La autoevaluación <strong>{autoevaluacion.numero_autoevaluacion}</strong> ha sido validada exitosamente y su estado ha cambiado a <strong className="text-green-600">VALIDADA</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {!validada ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleValidar}
                  disabled={loading || !puedeValidar}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    puedeValidar
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Validando...
                    </>
                  ) : (
                    <>
                      <HiOutlineShieldCheck className="h-4 w-4" /> Validar
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

export default ValidarAutoevaluacionModal;
