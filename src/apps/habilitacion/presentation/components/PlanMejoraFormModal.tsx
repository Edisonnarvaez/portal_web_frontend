import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import type { PlanMejora, PlanMejoraCreate } from '../../domain/entities/PlanMejora';
import { ESTADOS_PLAN_MEJORA } from '../../domain/types';
import { usePlanMejora } from '../hooks/usePlanMejora';

interface PlanMejoraFormModalProps {
  isOpen: boolean;
  planMejora?: PlanMejora;
  autoevaluacionId?: number;
  criterioId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PlanMejoraFormModal: React.FC<PlanMejoraFormModalProps> = ({
  isOpen,
  planMejora,
  autoevaluacionId,
  criterioId,
  onClose,
  onSuccess,
}) => {
  const { createPlan, updatePlan } = usePlanMejora();
  const isEdit = !!planMejora;

  const [formData, setFormData] = useState<Partial<PlanMejoraCreate>>({
    numero_plan: '',
    descripcion: '',
    criterio_id: criterioId || 0,
    autoevaluacion_id: autoevaluacionId || 0,
    estado_cumplimiento_actual: '',
    objetivo_mejorado: '',
    acciones_implementar: '',
    responsable: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    porcentaje_avance: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (planMejora) {
      setFormData({
        numero_plan: planMejora.numero_plan,
        descripcion: planMejora.descripcion,
        criterio_id: planMejora.criterio_id || criterioId || 0,
        autoevaluacion_id: planMejora.autoevaluacion_id || autoevaluacionId || 0,
        estado_cumplimiento_actual: planMejora.estado_cumplimiento_actual || '',
        objetivo_mejorado: planMejora.objetivo_mejorado || '',
        acciones_implementar: planMejora.acciones_implementar,
        responsable: planMejora.responsable || '',
        fecha_inicio: planMejora.fecha_inicio || '',
        fecha_vencimiento: planMejora.fecha_vencimiento || '',
        porcentaje_avance: planMejora.porcentaje_avance || 0,
      });
    } else {
      setFormData({
        numero_plan: '',
        descripcion: '',
        criterio_id: criterioId || 0,
        autoevaluacion_id: autoevaluacionId || 0,
        estado_cumplimiento_actual: '',
        objetivo_mejorado: '',
        acciones_implementar: '',
        responsable: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        porcentaje_avance: 0,
      });
    }
    setError('');
  }, [planMejora, autoevaluacionId, criterioId, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'porcentaje_avance' || name.endsWith('_id') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.numero_plan || !formData.descripcion || !formData.acciones_implementar) {
        setError('Número de plan, descripción y acciones a implementar son obligatorios');
        setLoading(false);
        return;
      }

      if (!formData.fecha_inicio || !formData.fecha_vencimiento) {
        setError('Las fechas de inicio y vencimiento son obligatorias');
        setLoading(false);
        return;
      }

      if (isEdit && planMejora) {
        await updatePlan(planMejora.id, { id: planMejora.id, ...formData });
      } else {
        await createPlan(formData as PlanMejoraCreate);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al guardar plan de mejora';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Determinar color del estado
  const estadoActual = isEdit && planMejora
    ? ESTADOS_PLAN_MEJORA.find(e => e.value === planMejora.estado)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Plan de Mejora' : 'Nuevo Plan de Mejora'}
            </h2>
            {estadoActual && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${estadoActual.color}`}>
                {estadoActual.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Plan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero_plan"
                value={formData.numero_plan || ''}
                onChange={handleChange}
                placeholder="Ej: PM-2026-001"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsable
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable || ''}
                onChange={handleChange}
                placeholder="Nombre del responsable"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ID Autoevaluación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Autoevaluación <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="autoevaluacion_id"
                value={formData.autoevaluacion_id || ''}
                onChange={handleChange}
                required
                disabled={!!autoevaluacionId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>

            {/* ID Criterio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Criterio <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="criterio_id"
                value={formData.criterio_id || ''}
                onChange={handleChange}
                required
                disabled={!!criterioId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Vencimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Porcentaje de Avance */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Porcentaje de Avance: {formData.porcentaje_avance || 0}%
              </label>
              <input
                type="range"
                name="porcentaje_avance"
                value={formData.porcentaje_avance || 0}
                onChange={handleChange}
                min={0}
                max={100}
                step={5}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows={2}
              required
              placeholder="Descripción del plan de mejora..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estado de cumplimiento actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado de Cumplimiento Actual
            </label>
            <input
              type="text"
              name="estado_cumplimiento_actual"
              value={formData.estado_cumplimiento_actual || ''}
              onChange={handleChange}
              placeholder="Descripción del estado actual de cumplimiento..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Objetivo Mejorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Objetivo Mejorado
            </label>
            <input
              type="text"
              name="objetivo_mejorado"
              value={formData.objetivo_mejorado || ''}
              onChange={handleChange}
              placeholder="Resultado esperado tras la mejora..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Acciones a Implementar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Acciones a Implementar <span className="text-red-500">*</span>
            </label>
            <textarea
              name="acciones_implementar"
              value={formData.acciones_implementar || ''}
              onChange={handleChange}
              rows={3}
              required
              placeholder="Detalle de acciones correctivas o preventivas..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Info plan existente */}
          {isEdit && planMejora && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p><strong>Creado:</strong> {new Date(planMejora.fecha_creacion).toLocaleDateString('es-CO')}</p>
              <p><strong>Última actualización:</strong> {new Date(planMejora.fecha_actualizacion).toLocaleDateString('es-CO')}</p>
              {planMejora.fecha_implementacion && (
                <p><strong>Fecha implementación:</strong> {new Date(planMejora.fecha_implementacion).toLocaleDateString('es-CO')}</p>
              )}
              {planMejora.evidencia && (
                <p><strong>Evidencia:</strong> {planMejora.evidencia}</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Plan de Mejora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanMejoraFormModal;
