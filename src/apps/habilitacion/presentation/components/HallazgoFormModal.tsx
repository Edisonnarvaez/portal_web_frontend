import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import type { Hallazgo, HallazgoCreate } from '../../domain/entities/Hallazgo';
import type { OrigenTipo } from '../../domain/entities/PlanMejora';
import { TIPOS_HALLAZGO, SEVERIDADES_HALLAZGO, ESTADOS_HALLAZGO, ORIGENES_TIPO } from '../../domain/types';
import { useHallazgo } from '../hooks/useHallazgo';

interface HallazgoFormModalProps {
  isOpen: boolean;
  hallazgo?: Hallazgo;
  autoevaluacionId?: number;
  datosPrestadorId?: number;
  criterioId?: number;
  planMejoraId?: number;
  origenTipo?: OrigenTipo;
  onClose: () => void;
  onSuccess: () => void;
}

const HallazgoFormModal: React.FC<HallazgoFormModalProps> = ({
  isOpen,
  hallazgo,
  autoevaluacionId,
  datosPrestadorId,
  criterioId,
  planMejoraId,
  origenTipo: defaultOrigenTipo,
  onClose,
  onSuccess,
}) => {
  const { createHallazgo, updateHallazgo } = useHallazgo();
  const isEdit = !!hallazgo;

  const [formData, setFormData] = useState<Partial<HallazgoCreate>>({
    numero_hallazgo: '',
    descripcion: '',
    tipo: 'HALLAZGO',
    severidad: 'MEDIA',
    origen_tipo: defaultOrigenTipo || 'HABILITACION',
    area_responsable: '',
    autoevaluacion: autoevaluacionId || undefined,
    datos_prestador: datosPrestadorId,
    criterio: criterioId,
    plan_mejora: planMejoraId,
    fecha_identificacion: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hallazgo) {
      setFormData({
        numero_hallazgo: hallazgo.numero_hallazgo,
        descripcion: hallazgo.descripcion,
        tipo: hallazgo.tipo,
        severidad: hallazgo.severidad,
        origen_tipo: hallazgo.origen_tipo || defaultOrigenTipo || 'HABILITACION',
        area_responsable: hallazgo.area_responsable || '',
        autoevaluacion: hallazgo.autoevaluacion_id || autoevaluacionId || undefined,
        datos_prestador: hallazgo.datos_prestador_id || datosPrestadorId,
        criterio: hallazgo.criterio_id || criterioId,
        plan_mejora: hallazgo.plan_mejora_id || planMejoraId,
        fecha_identificacion: hallazgo.fecha_identificacion || '',
        observaciones: hallazgo.observaciones || '',
      });
    } else {
      setFormData({
        numero_hallazgo: '',
        descripcion: '',
        tipo: 'HALLAZGO',
        severidad: 'MEDIA',
        origen_tipo: defaultOrigenTipo || 'HABILITACION',
        area_responsable: '',
        autoevaluacion: autoevaluacionId || undefined,
        datos_prestador: datosPrestadorId,
        criterio: criterioId,
        plan_mejora: planMejoraId,
        fecha_identificacion: new Date().toISOString().split('T')[0],
        observaciones: '',
      });
    }
    setError('');
  }, [hallazgo, autoevaluacionId, datosPrestadorId, criterioId, planMejoraId, defaultOrigenTipo, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ['autoevaluacion', 'datos_prestador', 'criterio', 'plan_mejora', 'auditoria', 'resultado_indicador'];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.numero_hallazgo || !formData.descripcion) {
        setError('Número y descripción del hallazgo son obligatorios');
        setLoading(false);
        return;
      }

      if (!formData.origen_tipo) {
        setError('El origen del hallazgo es obligatorio');
        setLoading(false);
        return;
      }

      if (isEdit && hallazgo) {
        await updateHallazgo(hallazgo.id, { id: hallazgo.id, ...formData });
      } else {
        await createHallazgo(formData as HallazgoCreate);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al guardar hallazgo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Color de severidad para indicador visual
  const severidadInfo = SEVERIDADES_HALLAZGO.find(s => s.value === formData.severidad);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}
            </h2>
            {isEdit && hallazgo && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                ESTADOS_HALLAZGO.find(e => e.value === hallazgo.estado)?.color || ''
              }`}>
                {ESTADOS_HALLAZGO.find(e => e.value === hallazgo.estado)?.label || hallazgo.estado}
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
            {/* Número de Hallazgo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Hallazgo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero_hallazgo"
                value={formData.numero_hallazgo || ''}
                onChange={handleChange}
                placeholder="Ej: HAL-2026-001"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Identificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Identificación <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_identificacion"
                value={formData.fecha_identificacion || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Hallazgo <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo"
                value={formData.tipo || 'HALLAZGO'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {TIPOS_HALLAZGO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severidad <span className="text-red-500">*</span>
                {severidadInfo && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${severidadInfo.color}`}>
                    {severidadInfo.label}
                  </span>
                )}
              </label>
              <select
                name="severidad"
                value={formData.severidad || 'MEDIA'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {SEVERIDADES_HALLAZGO.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Área Responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área Responsable
              </label>
              <input
                type="text"
                name="area_responsable"
                value={formData.area_responsable || ''}
                onChange={handleChange}
                placeholder="Ej: Calidad, Infraestructura..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Origen <span className="text-red-500">*</span>
              </label>
              <select
                name="origen_tipo"
                value={formData.origen_tipo || 'HABILITACION'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {ORIGENES_TIPO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos condicionales de Habilitación */}
          {formData.origen_tipo === 'HABILITACION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID Autoevaluación
                </label>
                <input
                  type="number"
                  name="autoevaluacion"
                  value={formData.autoevaluacion || ''}
                  onChange={handleChange}
                  disabled={!!autoevaluacionId}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID Criterio
                </label>
                <input
                  type="number"
                  name="criterio"
                  value={formData.criterio || ''}
                  onChange={handleChange}
                  disabled={!!criterioId}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {/* IDs opcionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Prestador
              </label>
              <input
                type="number"
                name="datos_prestador"
                value={formData.datos_prestador || ''}
                onChange={handleChange}
                disabled={!!datosPrestadorId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Plan de Mejora
              </label>
              <input
                type="number"
                name="plan_mejora"
                value={formData.plan_mejora || ''}
                onChange={handleChange}
                disabled={!!planMejoraId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
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
              rows={3}
              required
              placeholder="Descripción detallada del hallazgo..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones || ''}
              onChange={handleChange}
              rows={2}
              placeholder="Observaciones adicionales..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Info hallazgo existente */}
          {isEdit && hallazgo && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
              {hallazgo.origen_tipo_display && (
                <p><strong>Origen:</strong> {hallazgo.origen_tipo_display}</p>
              )}
              {hallazgo.tipo_display && (
                <p><strong>Tipo:</strong> {hallazgo.tipo_display}</p>
              )}
              {hallazgo.severidad_display && (
                <p><strong>Severidad:</strong> {hallazgo.severidad_display}</p>
              )}
              {hallazgo.criterio_codigo && (
                <p><strong>Criterio:</strong> {hallazgo.criterio_codigo} — {hallazgo.criterio_nombre}</p>
              )}
              <p><strong>Creado:</strong> {new Date(hallazgo.fecha_creacion).toLocaleDateString('es-CO')}</p>
              <p><strong>Última actualización:</strong> {new Date(hallazgo.fecha_actualizacion).toLocaleDateString('es-CO')}</p>
              {hallazgo.fecha_cierre && (
                <p><strong>Fecha de cierre:</strong> {new Date(hallazgo.fecha_cierre).toLocaleDateString('es-CO')}</p>
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar Hallazgo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HallazgoFormModal;
