import { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { CLASES_PRESTADOR, ESTADOS_HABILITACION_PRESTADOR } from '../../domain/types';
import type { DatosPrestador, DatosPrestadorCreate } from '../../domain/entities/DatosPrestador';
import { useDatosPrestador } from '../hooks/useDatosPrestador';
import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { extractErrorMessage } from '../../shared/utils/error';
import { useNotifications } from '../../../../shared/hooks/useNotifications';

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
  const { create, update, delete: deleteDatos } = useDatosPrestador();
  const { notifySuccess } = useNotifications();
  const isEdit = !!prestador;
  const [sedes, setSedes] = useState<Headquarter[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [formData, setFormData] = useState<Partial<DatosPrestadorCreate>>(
    prestador
      ? {
          headquarters_id: prestador.headquarters_detail?.id || headquartersId || 0,
          codigo_reps: prestador.codigo_reps,
          nombre_prestador: prestador.nombre_prestador,
          sede_principal: prestador.sede_principal || false,
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
          nombre_prestador: '',
          sede_principal: false,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    const { name, value, type } = e.target;
    const inputElement = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? inputElement.checked : name === 'headquarters_id' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (prestador) {
        await update(prestador.id, { id: prestador.id, ...formData });
        notifySuccess('Prestador actualizado satisfactoriamente');
      } else {
        await create(formData as DatosPrestadorCreate);
        notifySuccess('Prestador creado satisfactoriamente');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al guardar'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!prestador?.id) return;

    setLoading(true);
    setError('');
    try {
      await deleteDatos(prestador.id);
      notifySuccess('Prestador eliminado satisfactoriamente');
      onSuccess?.();
      onClose?.();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error eliminando prestador'));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {prestador ? 'Editar Prestador' : 'Crear Prestador'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="">{loadingSedes ? 'Cargando sedes...' : 'Seleccione una sede'}</option>
                  {sedes.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
            )}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Prestador <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_prestador"
                value={formData.nombre_prestador || ''}
                onChange={handleChange}
                required
                placeholder="Ej: Clínica XYZ"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="sede_principal"
                checked={formData.sede_principal || false}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Es Sede Principal
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clase Prestador</label>
              <select
                name="clase_prestador"
                value={formData.clase_prestador || 'IPS'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {CLASES_PRESTADOR.map((clase) => (<option key={clase.value} value={clase.value}>{clase.label}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado Habilitación</label>
              <select
                name="estado_habilitacion"
                value={formData.estado_habilitacion || 'HABILITADA'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {ESTADOS_HABILITACION_PRESTADOR.map((estado) => (<option key={estado.value} value={estado.value}>{estado.label}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inscripción</label>
              <input
                type="date"
                name="fecha_inscripcion"
                value={formData.fecha_inscripcion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Renovación</label>
              <input
                type="date"
                name="fecha_renovacion"
                value={formData.fecha_renovacion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aseguradora PEP</label>
              <input
                type="text"
                name="aseguradora_pep"
                value={formData.aseguradora_pep || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número Póliza</label>
              <input
                type="text"
                name="numero_poliza"
                value={formData.numero_poliza || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vigencia Póliza</label>
              <input
                type="date"
                name="vigencia_poliza"
                value={formData.vigencia_poliza || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {isEdit && prestador && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 transition-colors font-medium"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
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
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Eliminar Prestador"
          message="¿Estás seguro de que deseas eliminar este prestador? Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default PrestadorFormModal;
