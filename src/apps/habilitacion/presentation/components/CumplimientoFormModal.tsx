import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import type { Cumplimiento, CumplimientoCreate } from '../../domain/entities/Cumplimiento';
import { ESTADOS_CUMPLIMIENTO } from '../../domain/types';
import { useCumplimiento } from '../hooks/useCumplimiento';

interface CumplimientoFormModalProps {
  isOpen: boolean;
  cumplimiento?: Cumplimiento;
  autoevaluacionId?: number;
  servicioSedeId?: number;
  criterioId?: number;
  onClose: () => void;
  onSuccess: () => void;
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
  const { create, update } = useCumplimiento();
  const isEdit = !!cumplimiento;

  const [formData, setFormData] = useState<Partial<CumplimientoCreate>>({
    autoevaluacion_id: autoevaluacionId || 0,
    servicio_sede_id: servicioSedeId || 0,
    criterio_id: criterioId || 0,
    cumple: 'CUMPLE',
    hallazgo: '',
    plan_mejora: '',
    fecha_compromiso: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cumplimiento) {
      setFormData({
        autoevaluacion_id: cumplimiento.autoevaluacion?.id || autoevaluacionId || 0,
        servicio_sede_id: cumplimiento.servicio_sede?.id || servicioSedeId || 0,
        criterio_id: cumplimiento.criterio?.id || criterioId || 0,
        cumple: cumplimiento.cumple,
        hallazgo: cumplimiento.hallazgo || '',
        plan_mejora: cumplimiento.plan_mejora || '',
        responsable_mejora_id: cumplimiento.responsable_mejora?.id,
        fecha_compromiso: cumplimiento.fecha_compromiso || '',
      });
    } else {
      setFormData({
        autoevaluacion_id: autoevaluacionId || 0,
        servicio_sede_id: servicioSedeId || 0,
        criterio_id: criterioId || 0,
        cumple: 'CUMPLE',
        hallazgo: '',
        plan_mejora: '',
        fecha_compromiso: '',
      });
    }
    setError('');
  }, [cumplimiento, autoevaluacionId, servicioSedeId, criterioId, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.endsWith('_id') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.autoevaluacion_id || !formData.servicio_sede_id || !formData.criterio_id) {
        setError('Autoevaluación, servicio y criterio son obligatorios');
        setLoading(false);
        return;
      }

      if (isEdit && cumplimiento) {
        await update(cumplimiento.id, { id: cumplimiento.id, ...formData });
      } else {
        await create(formData as CumplimientoCreate);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al guardar cumplimiento';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar campos de hallazgo y plan solo si no cumple o parcialmente
  const showHallazgoFields = formData.cumple === 'NO_CUMPLE' || formData.cumple === 'PARCIALMENTE';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Cumplimiento' : 'Nuevo Cumplimiento'}
          </h2>
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

            {/* ID Servicio Sede */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Servicio Sede <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="servicio_sede_id"
                value={formData.servicio_sede_id || ''}
                onChange={handleChange}
                required
                disabled={!!servicioSedeId}
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

            {/* Estado de Cumplimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado de Cumplimiento <span className="text-red-500">*</span>
              </label>
              <select
                name="cumple"
                value={formData.cumple || 'CUMPLE'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {ESTADOS_CUMPLIMIENTO.map((ec) => (
                  <option key={ec.value} value={ec.value}>
                    {ec.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos condicionales para hallazgo y plan de mejora */}
          {showHallazgoFields && (
            <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Complete la información del hallazgo y plan de mejora
              </p>

              {/* Hallazgo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción del Hallazgo
                </label>
                <textarea
                  name="hallazgo"
                  value={formData.hallazgo || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Describa el hallazgo identificado..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Plan de Mejora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan de Mejora
                </label>
                <textarea
                  name="plan_mejora"
                  value={formData.plan_mejora || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Describa las acciones correctivas propuestas..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha Compromiso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Compromiso
                </label>
                <input
                  type="date"
                  name="fecha_compromiso"
                  value={formData.fecha_compromiso || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Info cumplimiento existente */}
          {isEdit && cumplimiento && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
              {cumplimiento.autoevaluacion && (
                <p><strong>Autoevaluación:</strong> {cumplimiento.autoevaluacion.numero_autoevaluacion}</p>
              )}
              {cumplimiento.servicio_sede && (
                <p><strong>Servicio:</strong> {cumplimiento.servicio_sede.nombre_servicio}</p>
              )}
              {cumplimiento.criterio && (
                <p><strong>Criterio:</strong> {cumplimiento.criterio.nombre}</p>
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar Cumplimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CumplimientoFormModal;
