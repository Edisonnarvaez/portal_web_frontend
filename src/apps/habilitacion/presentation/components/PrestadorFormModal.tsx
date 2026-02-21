import { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { CLASES_PRESTADOR, ESTADOS_HABILITACION } from '../../domain/types';
import type { DatosPrestador, DatosPrestadorCreate } from '../../domain/entities/DatosPrestador';
import { useDatosPrestador } from '../hooks/useDatosPrestador';
import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';

interface Headquarter {
  id: number;
  name: string;
}

interface PrestadorFormModalProps {
  isOpen: boolean;
  prestador?: DatosPrestador;
  headquartersId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PrestadorFormModal: React.FC<PrestadorFormModalProps> = ({ isOpen, prestador, headquartersId, onClose, onSuccess }) => {
  const { create, update } = useDatosPrestador();
  const [sedes, setSedes] = useState<Headquarter[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [formData, setFormData] = useState<Partial<DatosPrestadorCreate>>(
    prestador
      ? {
          headquarters_id: prestador.headquarters_id || prestador.headquarters_detail?.id || headquartersId || 0,
          codigo_reps: prestador.codigo_reps,
          clase_prestador: prestador.clase_prestador,
          estado_habilitacion: prestador.estado_habilitacion,
          fecha_inscripcion: prestador.fecha_inscripcion || '',
          fecha_renovacion: prestador.fecha_renovacion || '',
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
          fecha_inscripcion: new Date().toISOString().split('T')[0],
          fecha_renovacion: '',
          fecha_vencimiento_habilitacion: new Date().toISOString().split('T')[0],
          aseguradora_pep: '',
          numero_poliza: '',
          vigencia_poliza: new Date().toISOString().split('T')[0],
        }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar sedes disponibles
  useEffect(() => {
    if (isOpen && !headquartersId) {
      setLoadingSedes(true);
      axiosInstance.get('/companies/headquarters/')
        .then(res => setSedes(res.data))
        .catch(() => setSedes([]))
        .finally(() => setLoadingSedes(false));
    }
  }, [isOpen, headquartersId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'headquarters_id' ? Number(value) : value,
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
          {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sede / Headquarters selector */}
            {!headquartersId && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sede <span className="text-red-500">*</span>
                </label>
                <select
                  name="headquarters_id"
                  value={formData.headquarters_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingSedes ? 'Cargando sedes...' : 'Seleccione una sede'}
                  </option>
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Código REPS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código REPS <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codigo_reps"
                value={formData.codigo_reps || ''}
                onChange={handleChange}
                required
                placeholder="Ej: 123456789"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clase Prestador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            {/* Estado Habilitación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            {/* Fecha Inscripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Inscripción
              </label>
              <input
                type="date"
                name="fecha_inscripcion"
                value={formData.fecha_inscripcion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Renovación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Renovación
              </label>
              <input
                type="date"
                name="fecha_renovacion"
                value={formData.fecha_renovacion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Vencimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_vencimiento_habilitacion"
                value={formData.fecha_vencimiento_habilitacion || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Aseguradora PEP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            {/* Número Póliza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            {/* Vigencia Póliza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          </div>

          {/* Buttons */}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Guardando...' : prestador ? 'Actualizar' : 'Crear Prestador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrestadorFormModal;
