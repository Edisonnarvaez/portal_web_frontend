import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import type { Criterio, CriterioCreate } from '../../domain/entities/Criterio';
import { useCriterio } from '../hooks/useCriterio';

interface CriterioFormModalProps {
  isOpen: boolean;
  criterio?: Criterio;
  onClose: () => void;
  onSuccess: () => void;
}

const CriterioFormModal: React.FC<CriterioFormModalProps> = ({
  isOpen,
  criterio,
  onClose,
  onSuccess,
}) => {
  const { createCriterio, updateCriterio } = useCriterio();
  const isEdit = !!criterio;

  // Memoize default form data
  const defaultFormData = useMemo(() => ({
    codigo: '',
    nombre: '',
    descripcion: '',
    complejidad: 'MEDIA' as const,
    es_mandatorio: false,
    requiere_evidencia_documental: false,
    notas_interpretacion: '',
    estandar_id: undefined,
  }), []);

  const [formData, setFormData] = useState<Partial<CriterioCreate>>(defaultFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (criterio) {
      setFormData({
        codigo: criterio.codigo,
        nombre: criterio.nombre,
        descripcion: criterio.descripcion,
        complejidad: criterio.complejidad || 'MEDIA',
        es_mandatorio: criterio.es_mandatorio || false,
        requiere_evidencia_documental: criterio.requiere_evidencia_documental || false,
        notas_interpretacion: criterio.notas_interpretacion || '',
        estandar_id: criterio.estandar_id,
      });
    } else {
      setFormData(defaultFormData);
    }
    setError('');
  }, [criterio, isOpen, defaultFormData]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.codigo || !formData.nombre) {
        setError('Código y nombre del criterio son obligatorios');
        setLoading(false);
        return;
      }

      if (formData.es_mandatorio && !formData.descripcion?.trim()) {
        setError('Los criterios mandatorios requieren una descripción');
        setLoading(false);
        return;
      }

      if (isEdit && criterio) {
        await updateCriterio(criterio.id, { id: criterio.id, ...formData });
      } else {
        await createCriterio(formData as CriterioCreate);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al guardar criterio';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [formData, isEdit, criterio, updateCriterio, createCriterio, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Criterio' : 'Nuevo Criterio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-4">
              Identificación del Criterio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo || ''}
                  onChange={handleChange}
                  placeholder="Ej: INF-001"
                  disabled={isEdit}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEdit 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ej: INF-001, TH-005, SA-002 | {isEdit ? 'No se puede cambiar' : 'Se asigna al crear'}
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONTENIDO */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-4">
              Contenido del Criterio
            </h3>
            
            {/* Nombre/Título */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre/Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                placeholder="Ej: Infraestructura Física"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Breve descripción del criterio (máx 100 caracteres)
              </p>
            </div>

            {/* Descripción Detallada */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción Detallada
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Explicación completa de qué trata este criterio, contexto y aplicabilidad..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notas de Interpretación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas de Interpretación (Opcional)
              </label>
              <textarea
                name="notas_interpretacion"
                value={formData.notas_interpretacion || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Aclaraciones sobre cómo interpretar y aplicar este criterio..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SECCIÓN 3: PROPIEDADES */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-4">
              Propiedades
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Complejidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Complejidad
                </label>
                <select
                  name="complejidad"
                  value={formData.complejidad || 'MEDIA'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="es_mandatorio"
                  checked={formData.es_mandatorio || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    es_mandatorio: e.target.checked
                  }))}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Criterio Mandatorio
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Obligatorio para todas las IPS)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiere_evidencia_documental"
                  checked={formData.requiere_evidencia_documental || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requiere_evidencia_documental: e.target.checked
                  }))}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Requiere Evidencia Documental
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Necesita documentación de respaldo)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Info criterio existente */}
          {isEdit && criterio && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>
                <strong>Código único:</strong> {criterio.codigo}
              </p>
              <p>
                <strong>Última actualización:</strong>{' '}
                {new Date(criterio.fecha_actualizacion).toLocaleDateString('es-CO')}
              </p>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors font-medium"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Criterio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(CriterioFormModal);
