import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import type { Autoevaluacion, AutoevaluacionCreate } from '../../domain/entities/Autoevaluacion';
import { ESTADOS_AUTOEVALUACION } from '../../domain/types';
import { useAutoevaluacion } from '../hooks/useAutoevaluacion';

interface AutoevaluacionFormModalProps {
  isOpen: boolean;
  autoevaluacion?: Autoevaluacion;
  datosPrestadorId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const AutoevaluacionFormModal: React.FC<AutoevaluacionFormModalProps> = ({
  isOpen,
  autoevaluacion,
  datosPrestadorId,
  onClose,
  onSuccess,
}) => {
  const { create, update } = useAutoevaluacion();
  const isEdit = !!autoevaluacion;

  const [formData, setFormData] = useState<Partial<AutoevaluacionCreate>>({
    datos_prestador_id: datosPrestadorId || 0,
    periodo: new Date().getFullYear(),
    version: 1,
    estado: 'BORRADOR',
    fecha_vencimiento: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (autoevaluacion) {
      setFormData({
        datos_prestador_id: autoevaluacion.datos_prestador?.id || datosPrestadorId || 0,
        periodo: autoevaluacion.periodo,
        version: autoevaluacion.version,
        estado: autoevaluacion.estado,
        fecha_vencimiento: autoevaluacion.fecha_vencimiento || '',
        observaciones: autoevaluacion.observaciones || '',
      });
    } else {
      setFormData({
        datos_prestador_id: datosPrestadorId || 0,
        periodo: new Date().getFullYear(),
        version: 1,
        estado: 'BORRADOR',
        fecha_vencimiento: '',
        observaciones: '',
      });
    }
    setError('');
  }, [autoevaluacion, datosPrestadorId, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'periodo' || name === 'version' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.periodo || !formData.fecha_vencimiento) {
        setError('Periodo y fecha de vencimiento son obligatorios');
        setLoading(false);
        return;
      }

      if (isEdit && autoevaluacion) {
        await update(autoevaluacion.id, { id: autoevaluacion.id, ...formData });
      } else {
        await create(formData as AutoevaluacionCreate);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al guardar autoevaluación';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Generar opciones de año (últimos 5 + próximos 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Autoevaluación' : 'Nueva Autoevaluación'}
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
            {/* Periodo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Periodo (Año) <span className="text-red-500">*</span>
              </label>
              <select
                name="periodo"
                value={formData.periodo || currentYear}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Versión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Versión
              </label>
              <input
                type="number"
                name="version"
                value={formData.version || 1}
                onChange={handleChange}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado || 'BORRADOR'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {ESTADOS_AUTOEVALUACION.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
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
              rows={3}
              placeholder="Observaciones adicionales sobre la autoevaluación..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Info autoevaluación existente */}
          {isEdit && autoevaluacion && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>N° Autoevaluación:</strong> {autoevaluacion.numero_autoevaluacion}
              </p>
              {autoevaluacion.fecha_inicio && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <strong>Fecha Inicio:</strong> {new Date(autoevaluacion.fecha_inicio).toLocaleDateString('es-CO')}
                </p>
              )}
              {autoevaluacion.fecha_completacion && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <strong>Fecha Completación:</strong> {new Date(autoevaluacion.fecha_completacion).toLocaleDateString('es-CO')}
                </p>
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Autoevaluación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoevaluacionFormModal;
