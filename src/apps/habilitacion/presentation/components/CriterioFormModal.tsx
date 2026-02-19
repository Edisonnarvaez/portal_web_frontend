import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import type { Criterio, CriterioCreate } from '../../domain/entities/Criterio';
import { CATEGORIAS_CRITERIO } from '../../domain/types';
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

  const [formData, setFormData] = useState<Partial<CriterioCreate>>({
    numero_criterio: '',
    descripcion: '',
    categoria: '',
    documento_referencia: '',
    requisito_normativo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (criterio) {
      setFormData({
        numero_criterio: criterio.numero_criterio,
        descripcion: criterio.descripcion,
        categoria: criterio.categoria || '',
        documento_referencia: criterio.documento_referencia || '',
        requisito_normativo: criterio.requisito_normativo,
      });
    } else {
      setFormData({
        numero_criterio: '',
        descripcion: '',
        categoria: '',
        documento_referencia: '',
        requisito_normativo: '',
      });
    }
    setError('');
  }, [criterio, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.numero_criterio || !formData.descripcion || !formData.requisito_normativo) {
        setError('Número de criterio, descripción y requisito normativo son obligatorios');
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
  };

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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de Criterio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Criterio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero_criterio"
                value={formData.numero_criterio || ''}
                onChange={handleChange}
                placeholder="Ej: CRI-001"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                name="categoria"
                value={formData.categoria || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar categoría...</option>
                {CATEGORIAS_CRITERIO.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
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
              placeholder="Descripción del criterio de habilitación..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Requisito Normativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requisito Normativo <span className="text-red-500">*</span>
            </label>
            <textarea
              name="requisito_normativo"
              value={formData.requisito_normativo || ''}
              onChange={handleChange}
              rows={3}
              required
              placeholder="Referencia a la norma aplicable (Ej: Resolución 3100 de 2019, Art. X)..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Documento de Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Documento de Referencia
            </label>
            <input
              type="text"
              name="documento_referencia"
              value={formData.documento_referencia || ''}
              onChange={handleChange}
              placeholder="Ej: Anexo técnico, Manual de estándares..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Info criterio existente */}
          {isEdit && criterio && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Criterio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriterioFormModal;
