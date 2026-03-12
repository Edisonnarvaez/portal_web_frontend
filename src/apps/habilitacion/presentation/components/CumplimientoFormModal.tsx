import React, { useState, useEffect } from 'react';
import { HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlineCheckCircle } from 'react-icons/hi2';
import type { Cumplimiento, CumplimientoCreate } from '../../domain/entities/Cumplimiento';
import type { ServicioSede } from '../../domain/entities/ServicioSede';
import { ESTADOS_CUMPLIMIENTO } from '../../domain/types';
import { useCumplimiento } from '../hooks/useCumplimiento';
import { useCriterio } from '../hooks/useCriterio';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

interface CumplimientoFormModalProps {
  isOpen: boolean;
  cumplimiento?: Cumplimiento;
  autoevaluacionId?: number;
  servicioSedeId?: number;
  criterioId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  autoevaluacion_id?: string;
  servicio_sede_id?: string;
  criterio_id?: string;
  cumple?: string;
  hallazgo?: string;
  plan_mejora?: string;
  fecha_compromiso?: string;
  responsable_mejora_id?: string;
}

const CumplimientoFormModal: React.FC<CumplimientoFormModalProps> = ({
  isOpen,
  cumplimiento,
  autoevaluacionId,
  servicioSedeId,
  criterioId,
  onClose,
  onSuccess,
}) => {
  const { create, update, getServiciosDeAutoevaluacion } = useCumplimiento();
  const { fetchCriterios, criterios: criteriosDelHook } = useCriterio();
  const isEdit = !!cumplimiento;

  const [formData, setFormData] = useState<Partial<CumplimientoCreate & { responsable_mejora_id?: number }>>({
    autoevaluacion_id: autoevaluacionId || 0,
    servicio_sede_id: servicioSedeId || 0,
    criterio_id: criterioId || 0,
    cumple: 'CUMPLE',
    hallazgo: '',
    plan_mejora: '',
    fecha_compromiso: '',
  });

  const [originalData, setOriginalData] = useState<Partial<CumplimientoCreate>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [servicios, setServicios] = useState<ServicioSede[]>([]);
  const [serviciosLoading, setServiciosLoading] = useState(false);
  const [criteriosLoading, setCriteriosLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Detectar si hay cambios sin guardar
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  useEffect(() => {
    if (cumplimiento) {
      const data: Partial<CumplimientoCreate & { responsable_mejora_id?: number }> = {
        autoevaluacion_id: cumplimiento.autoevaluacion?.id || autoevaluacionId || 0,
        servicio_sede_id: cumplimiento.servicio_sede?.id || servicioSedeId || 0,
        criterio_id: cumplimiento.criterio?.id || criterioId || 0,
        cumple: cumplimiento.cumple as any,
        hallazgo: cumplimiento.hallazgo || '',
        plan_mejora: cumplimiento.plan_mejora || '',
        responsable_mejora_id: cumplimiento.responsable_mejora?.id,
        fecha_compromiso: cumplimiento.fecha_compromiso || '',
      };
      setFormData(data);
      setOriginalData(data);
    } else {
      const data: Partial<CumplimientoCreate & { responsable_mejora_id?: number }> = {
        autoevaluacion_id: autoevaluacionId || 0,
        servicio_sede_id: servicioSedeId || 0,
        criterio_id: criterioId || 0,
        cumple: 'CUMPLE' as any,
        hallazgo: '',
        plan_mejora: '',
        fecha_compromiso: '',
      };
      setFormData(data);
      setOriginalData(data);
    }
    setError('');
    setSuccess('');
    setFormErrors({});
  }, [cumplimiento, autoevaluacionId, servicioSedeId, criterioId, isOpen]);

  // Cargar servicios disponibles para la autoevaluación
  useEffect(() => {
    if (!isOpen || !autoevaluacionId) {
      setServicios([]);
      return;
    }

    const loadServicios = async () => {
      try {
        setServiciosLoading(true);
        const serviciosData = await getServiciosDeAutoevaluacion(autoevaluacionId);
        
        if (Array.isArray(serviciosData)) {
          setServicios(serviciosData);
        } else if (serviciosData && typeof serviciosData === 'object') {
          const arr = serviciosData.results || serviciosData.data || [];
          setServicios(Array.isArray(arr) ? arr : []);
        } else {
          setServicios([]);
        }
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError('No se pudieron cargar los servicios. Intenta nuevamente.');
        setServicios([]);
      } finally {
        setServiciosLoading(false);
      }
    };

    loadServicios();
  }, [isOpen, autoevaluacionId, getServiciosDeAutoevaluacion]);

  // Cargar criterios disponibles
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadCriterios = async () => {
      try {
        setCriteriosLoading(true);
        await fetchCriterios();
      } catch (err) {
        console.error('Error al cargar criterios:', err);
        setError('No se pudieron cargar los criterios. Intenta nuevamente.');
      } finally {
        setCriteriosLoading(false);
      }
    };

    loadCriterios();
  }, [isOpen, fetchCriterios]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.endsWith('_id') ? (value ? Number(value) : 0) : value,
    }));
    // Limpiar error de este campo cuando cambia
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validar campos del formulario
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.autoevaluacion_id || formData.autoevaluacion_id <= 0) {
      errors.autoevaluacion_id = 'Autoevaluación es requerida';
    }
    if (!formData.servicio_sede_id || formData.servicio_sede_id <= 0) {
      errors.servicio_sede_id = 'Servicio es requerido';
    }
    if (!formData.criterio_id || formData.criterio_id <= 0) {
      errors.criterio_id = 'Criterio es requerido';
    }
    if (!formData.cumple) {
      errors.cumple = 'Estado de cumplimiento es requerido';
    }

    // Si no cumple o parcialmente, hallazgo y plan son requeridos
    const showHallazgoFields = formData.cumple === 'NO_CUMPLE' || formData.cumple === 'PARCIALMENTE';
    if (showHallazgoFields) {
      if (!formData.hallazgo || formData.hallazgo.trim().length === 0) {
        errors.hallazgo = 'Descripción del hallazgo es requerida';
      }
      if (!formData.plan_mejora || formData.plan_mejora.trim().length === 0) {
        errors.plan_mejora = 'Plan de mejora es requerido';
      }
      if (!formData.fecha_compromiso) {
        errors.fecha_compromiso = 'Fecha de compromiso es requerida';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEdit && cumplimiento) {
        await update(cumplimiento.id, { id: cumplimiento.id, ...formData });
        setSuccess('Cumplimiento actualizado exitosamente');
      } else {
        await create(formData as CumplimientoCreate);
        setSuccess('Cumplimiento registrado exitosamente');
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Error al guardar cumplimiento';
      setError(msg);
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if ((hasUnsavedChanges && !isEdit) || (hasUnsavedChanges && isEdit)) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  // Mostrar campos de hallazgo y plan solo si no cumple o parcialmente
  const showHallazgoFields = formData.cumple === 'NO_CUMPLE' || formData.cumple === 'PARCIALMENTE';

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Cumplimiento' : 'Nuevo Cumplimiento'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Cerrar"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex gap-3">
                <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Error al guardar</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex gap-3">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">{success}</p>
                </div>
              </div>
            )}

            {/* Información de contexto - Autoevaluación (Solo lectura) */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Información de la Autoevaluación (Autoevaluación ID: {formData.autoevaluacion_id})
              </p>
            </div>

            {/* Fila 1: Servicio y Criterio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Servicio / Departamento <span className="text-red-500">*</span>
                </label>
                {serviciosLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    Cargando servicios...
                  </div>
                ) : servicios.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                    ⚠️ No hay servicios disponibles para esta autoevaluación
                  </div>
                ) : (
                  <>
                    <select
                      name="servicio_sede_id"
                      value={formData.servicio_sede_id || ''}
                      onChange={handleChange}
                      required
                      disabled={!!servicioSedeId}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                        formErrors.servicio_sede_id
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">✓ Seleccione un servicio</option>
                      {servicios.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre_servicio} ({s.codigo_servicio})
                        </option>
                      ))}
                    </select>
                    {formErrors.servicio_sede_id && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.servicio_sede_id}</p>
                    )}
                  </>
                )}
              </div>

              {/* Criterio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Criterio de Evaluación <span className="text-red-500">*</span>
                </label>
                {criteriosLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    Cargando criterios...
                  </div>
                ) : criteriosDelHook.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                    ⚠️ No hay criterios disponibles
                  </div>
                ) : (
                  <>
                    <select
                      name="criterio_id"
                      value={formData.criterio_id || ''}
                      onChange={handleChange}
                      required
                      disabled={!!criterioId}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                        formErrors.criterio_id
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">✓ Seleccione un criterio</option>
                      {criteriosDelHook.map(c => (
                        <option key={c.id} value={c.id}>
                          #{c.numero_criterio} - {c.descripcion?.substring(0, 50)}
                        </option>
                      ))}
                    </select>
                    {formErrors.criterio_id && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.criterio_id}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Fila 2: Estado de Cumplimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado de Cumplimiento <span className="text-red-500">*</span>
              </label>
              <select
                name="cumple"
                value={formData.cumple || 'CUMPLE'}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                  formErrors.cumple
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {ESTADOS_CUMPLIMIENTO.map((ec) => (
                  <option key={ec.value} value={ec.value}>
                    {ec.label}
                  </option>
                ))}
              </select>
              {formErrors.cumple && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.cumple}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Selecciona "No Cumple" o "Parcialmente" para describir hallazgos y plan de mejora
              </p>
            </div>

            {/* Campos condicionales para hallazgo y plan de mejora */}
            {showHallazgoFields && (
              <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                  <HiOutlineExclamationTriangle className="w-5 h-5" />
                  Complete la información del hallazgo y plan de mejora (REQUERIDO)
                </p>

                {/* Hallazgo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción del Hallazgo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="hallazgo"
                    value={formData.hallazgo || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describa detalladamente qué no está cumpliendo o está cumpliendo parcialmente..."
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.hallazgo
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.hallazgo && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.hallazgo}</p>
                  )}
                </div>

                {/* Plan de Mejora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan de Mejora / Acción Correctiva <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="plan_mejora"
                    value={formData.plan_mejora || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describa las acciones específicas que se van a realizar para corregir el hallazgo..."
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.plan_mejora
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.plan_mejora && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.plan_mejora}</p>
                  )}
                </div>

                {/* Fecha Compromiso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Compromiso / Vigencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_compromiso"
                    value={formData.fecha_compromiso || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.fecha_compromiso
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.fecha_compromiso && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.fecha_compromiso}</p>
                  )}
                </div>
              </div>
            )}

            {/* Info cumplimiento existente */}
            {isEdit && cumplimiento && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><strong>Creado:</strong> {cumplimiento.fecha_creacion ? new Date(cumplimiento.fecha_creacion).toLocaleDateString() : 'N/A'}</p>
                {cumplimiento.plan_mejora && (
                  <p><strong>Plan de Mejora:</strong> {cumplimiento.plan_mejora.substring(0, 100)}...</p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success !== '' || servicios.length === 0 || criteriosDelHook.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Guardando...
                  </>
                ) : isEdit ? (
                  'Actualizar Cumplimiento'
                ) : (
                  'Registrar Cumplimiento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm dialog para cambios sin guardar */}
      <ConfirmDialog
        isOpen={showCloseConfirm}
        title="Cambios sin guardar"
        message="Tienes cambios que no se han guardado. ¿Quieres descartar estos cambios?"
        onConfirm={() => {
          setShowCloseConfirm(false);
          onClose();
        }}
        onClose={() => setShowCloseConfirm(false)}
        confirmText="Descartar"
        cancelText="Continuar editando"
      />
    </>
  );
};

export default CumplimientoFormModal;
