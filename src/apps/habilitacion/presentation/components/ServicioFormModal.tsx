import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import type { ServicioSede, ServicioSedeCreate } from '../../domain/entities/ServicioSede';
import { MODALIDADES_SERVICIO, COMPLEJIDADES_SERVICIO, ESTADOS_HABILITACION_SERVICIO } from '../../domain/types';
import { useServicioSede } from '../hooks/useServicioSede';

interface Prestador {
  id: number;
  codigo_reps: string;
  headquarters_detail?: {
    id: number;
    name: string;
  };
}

interface ServicioFormModalProps {
  isOpen: boolean;
  servicio?: ServicioSede;
  prestador?: Prestador;
  onClose: () => void;
  onSuccess: () => void;
}

const ServicioFormModal: React.FC<ServicioFormModalProps> = ({
  isOpen,
  servicio,
  prestador,
  onClose,
  onSuccess,
}) => {
  const { create, update } = useServicioSede();
  const isEdit = !!servicio;

  const [formData, setFormData] = useState<Partial<ServicioSedeCreate>>({
    prestador_id: prestador?.id || servicio?.prestador?.id || 0,
    codigo_servicio: '',
    nombre_servicio: '',
    descripcion: '',
    modalidad: 'INTRAMURAL',
    complejidad: 'BAJA',
    estado_habilitacion: 'EN_PROCESO',
    fecha_habilitacion: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (servicio) {
      setFormData({
        prestador_id: servicio.prestador.id || prestador?.id || 0,
        codigo_servicio: servicio.codigo_servicio,
        nombre_servicio: servicio.nombre_servicio,
        descripcion: servicio.descripcion || '',
        modalidad: servicio.modalidad,
        complejidad: servicio.complejidad,
        estado_habilitacion: servicio.estado_habilitacion,
        fecha_habilitacion: servicio.fecha_habilitacion || '',
        fecha_vencimiento: servicio.fecha_vencimiento || '',
      });
    } else if (prestador) {
      setFormData({
        prestador_id: prestador.id,
        codigo_servicio: '',
        nombre_servicio: '',
        descripcion: '',
        modalidad: 'INTRAMURAL',
        complejidad: 'BAJA',
        estado_habilitacion: 'EN_PROCESO',
        fecha_habilitacion: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
      });
    }
    setError('');
  }, [servicio, prestador, isOpen]);

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
      if (isEdit && servicio) {
        await update(servicio.id, { id: servicio.id, ...formData });
      } else {
        await create(formData as ServicioSedeCreate);
      }

      onSuccess();
      onClose();
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Servicio' : 'Crear Servicio'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código Servicio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codigo_servicio"
                value={formData.codigo_servicio || ''}
                onChange={handleChange}
                required
                placeholder="Ej: 001-001"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Servicio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_servicio"
                value={formData.nombre_servicio || ''}
                onChange={handleChange}
                required
                placeholder="Ej: Hospitalización"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modalidad <span className="text-red-500">*</span>
              </label>
              <select
                name="modalidad"
                value={formData.modalidad || 'INTRAMURAL'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {MODALIDADES_SERVICIO.map((mod) => (
                  <option key={mod.value} value={mod.value}>{mod.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Complejidad <span className="text-red-500">*</span>
              </label>
              <select
                name="complejidad"
                value={formData.complejidad || 'BAJA'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {COMPLEJIDADES_SERVICIO.map((comp) => (
                  <option key={comp.value} value={comp.value}>{comp.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado Habilitación
              </label>
              <select
                name="estado_habilitacion"
                value={formData.estado_habilitacion || 'EN_PROCESO'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {ESTADOS_HABILITACION_SERVICIO.map((estado) => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Habilitación
              </label>
              <input
                type="date"
                name="fecha_habilitacion"
                value={formData.fecha_habilitacion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Vencimiento
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicioFormModal;
