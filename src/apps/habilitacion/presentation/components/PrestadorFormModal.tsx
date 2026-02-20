import { useState } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { CLASES_PRESTADOR, ESTADOS_HABILITACION } from '../../domain/types';
import type { DatosPrestador, DatosPrestadorCreate } from '../../domain/entities/DatosPrestador';
import { useDatosPrestador } from '../hooks/useDatosPrestador';

interface PrestadorFormModalProps {
  isOpen: boolean;
  prestador?: DatosPrestador;
  headquartersId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PrestadorFormModal: React.FC<PrestadorFormModalProps> = ({ isOpen, prestador, headquartersId, onClose, onSuccess }) => {
  const { create, update } = useDatosPrestador();
  const [formData, setFormData] = useState<Partial<DatosPrestadorCreate>>(
    prestador
      ? {
          headquarters_id: prestador.headquarters_id || prestador.sede?.id || headquartersId || 0,
          codigo_reps: prestador.codigo_reps,
          clase_prestador: prestador.clase_prestador,
          estado_habilitacion: prestador.estado_habilitacion,
          fecha_vencimiento_habilitacion: prestador.fecha_vencimiento_habilitacion,
          aseguradora_pep: prestador.aseguradora_pep,
          numero_poliza: prestador.numero_poliza,
          vigencia_poliza: prestador.vigencia_poliza,
        }
      : {
          headquarters_id: headquartersId || 0,
          codigo_reps: '',
          clase_prestador: 'IPS',
          estado_habilitacion: 'HABILITADA',
          fecha_vencimiento_habilitacion: new Date().toISOString().split('T')[0],
          aseguradora_pep: '',
          numero_poliza: '',
          vigencia_poliza: new Date().toISOString().split('T')[0],
        }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (prestador) {
        await update(prestador.id, { id: prestador.id, ...formData });
      } else {
        await create(formData as DatosPrestadorCreate);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {prestador ? 'Editar Prestador' : 'Crear Prestador'}
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
          {error && <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código REPS
            </label>
            <input
              type="text"
              name="codigo_reps"
              value={formData.codigo_reps || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Clase Prestador
            </label>
            <select
              name="clase_prestador"
              value={formData.clase_prestador || 'IPS'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {CLASES_PRESTADOR.map((clase) => (
                <option key={clase.value} value={clase.value}>
                  {clase.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado Habilitación
            </label>
            <select
              name="estado_habilitacion"
              value={formData.estado_habilitacion || 'HABILITADA'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {ESTADOS_HABILITACION.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Vencimiento
            </label>
            <input
              type="date"
              name="fecha_vencimiento_habilitacion"
              value={formData.fecha_vencimiento_habilitacion || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aseguradora PEP
            </label>
            <input
              type="text"
              name="aseguradora_pep"
              value={formData.aseguradora_pep || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número Póliza
            </label>
            <input
              type="text"
              name="numero_poliza"
              value={formData.numero_poliza || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vigencia Póliza
            </label>
            <input
              type="date"
              name="vigencia_poliza"
              value={formData.vigencia_poliza || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
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
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrestadorFormModal;
