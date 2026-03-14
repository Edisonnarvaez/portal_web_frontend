import React, { useEffect, useMemo, useState } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import type { Estandar, EstandarCreate } from '../../domain/entities/Estandar';
import { useEstandar } from '../hooks/useEstandar';
import { extractErrorMessage } from '../../shared/utils/error';

interface EstandarFormModalProps {
  isOpen: boolean;
  estandar?: Estandar;
  onClose: () => void;
  onSuccess: () => void;
}

const EstandarFormModal: React.FC<EstandarFormModalProps> = ({ isOpen, estandar, onClose, onSuccess }) => {
  const { createEstandar, updateEstandar, deleteEstandar } = useEstandar();
  const isEdit = Boolean(estandar);

  const initialForm = useMemo<EstandarCreate>(
    () => ({
      codigo: '',
      nombre: '',
      descripcion: '',
      version_resolucion: '3100/2019',
      estado: true,
    }),
    []
  );

  const [formData, setFormData] = useState<EstandarCreate>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (estandar) {
      setFormData({
        codigo: estandar.codigo,
        nombre: estandar.nombre,
        descripcion: estandar.descripcion || '',
        version_resolucion: estandar.version_resolucion || '3100/2019',
        estado: estandar.estado ?? true,
      });
    } else {
      setFormData(initialForm);
    }

    setError('');
  }, [isOpen, estandar, initialForm]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      setError('Código y nombre son obligatorios');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && estandar) {
        await updateEstandar(estandar.id, { id: estandar.id, ...formData });
      } else {
        await createEstandar(formData);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'No fue posible guardar el estándar'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!estandar?.id) return;

    setLoading(true);
    setError('');
    try {
      await deleteEstandar(estandar.id);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'No fue posible eliminar el estándar'));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Editar estándar' : 'Nuevo estándar'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Código *</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ej: INF"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Versión normativa</label>
              <input
                type="text"
                name="version_resolucion"
                value={formData.version_resolucion || ''}
                onChange={handleChange}
                placeholder="Ej: 3100/2019"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
            <select
              name="estado"
              value={formData.estado ? 'true' : 'false'}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  estado: e.target.value === 'true',
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear estándar'}
              </button>
            </div>
          </div>
        </form>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Eliminar estándar"
          message={`¿Deseas eliminar el estándar ${estandar?.codigo || ''}? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default EstandarFormModal;
