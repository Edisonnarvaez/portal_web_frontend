import React, { useState, useEffect } from 'react';
import { HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import type { ServicioSede, ServicioSedeCreate } from '../../domain/entities/ServicioSede';
import { MODALIDADES_SERVICIO, COMPLEJIDADES_SERVICIO, ESTADOS_HABILITACION_SERVICIO } from '../../domain/types';
import { useServicioSede } from '../hooks/useServicioSede';
import { useDatosPrestador } from '../hooks/useDatosPrestador';

interface Prestador {
  id: number;
  codigo_reps: string;
  nombre_prestador?: string;
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

/**
 * ServicioFormModal
 * Modal para crear o editar servicios de salud habilitados en una sede
 * Sincronizado con modelo Django ServicioSede
 */
const ServicioFormModal: React.FC<ServicioFormModalProps> = ({
  isOpen,
  servicio,
  prestador,
  onClose,
  onSuccess,
}) => {
  const { create, update, validarDatos } = useServicioSede();
  const { datos: prestadores, fetchDatos: fetchPrestadores } = useDatosPrestador();
  const isEdit = !!servicio;

  const [formData, setFormData] = useState<Partial<ServicioSedeCreate>>({
    prestador_id: prestador?.id || servicio?.prestador_detail?.id || undefined,
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Cargar prestadores si el modal se abre sin prestador seleccionado
  useEffect(() => {
    if (isOpen && !prestador && !servicio) {
      fetchPrestadores();
    }
  }, [isOpen, prestador, servicio, fetchPrestadores]);

  useEffect(() => {
    if (servicio) {
      // Extraer prestador_id desde el servicio
      // El backend puede enviar el ID como prestador_id u obtenerlo del code
      const preId = servicio.prestador_id || prestador?.id;
      
      setFormData({
        prestador_id: preId,
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
      setFormData(prev => ({
        ...prev,
        prestador_id: prestador.id,
      }));
    }
    setError('');
    setFieldErrors({});
  }, [servicio, prestador, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Validar que prestador_id esté seleccionado
      if (!formData.prestador_id) {
        setError('Por favor selecciona un prestador');
        setFieldErrors({ prestador_id: 'El prestador es requerido' });
        setLoading(false);
        return;
      }

      // Validar datos antes de enviar
      const validacion = validarDatos(formData as ServicioSedeCreate);
      if (!validacion.valido) {
        // Mostrar errores por campo
        const errors: Record<string, string> = {};
        validacion.errores.forEach(err => {
          // Intentar asociar el error a un campo específico
          if (err.includes('prestador')) errors.prestador_id = err;
          else if (err.includes('código')) errors.codigo_servicio = err;
          else if (err.includes('nombre')) errors.nombre_servicio = err;
          else if (err.includes('Modalidad')) errors.modalidad = err;
          else if (err.includes('Complejidad')) errors.complejidad = err;
          else if (err.includes('Estado')) errors.estado_habilitacion = err;
          else errors.general = err;
        });
        setFieldErrors(errors);
        setError(validacion.errores[0] || 'Por favor verifica los datos ingresados');
        return;
      }

      if (isEdit && servicio) {
        await update(servicio.id, { id: servicio.id, ...formData });
      } else {
        await create(formData as ServicioSedeCreate);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error al guardar el servicio';
      setError(errorMessage);
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
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-3">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prestador - Solo lectura si ya está seleccionado */}
            {prestador && (
              <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Prestador</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{prestador.codigo_reps}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{prestador.nombre_prestador || 'Sin nombre'}</p>
              </div>
            )}

            {/* Dropdown para seleccionar prestador si no hay seleccionado */}
            {!prestador && !isEdit && (
              <div className={`md:col-span-2 ${fieldErrors.prestador_id ? 'border border-red-300 rounded-lg p-3' : ''}`}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prestador <span className="text-red-500">*</span>
                </label>
                <select
                  name="prestador_id"
                  value={formData.prestador_id || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, prestador_id: Number(e.target.value) || undefined }));
                    setFieldErrors(prev => ({ ...prev, prestador_id: '' }));
                  }}
                  required
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.prestador_id
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Seleccionar prestador...</option>
                  {prestadores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_reps} - {p.company_detail?.name || 'Sin nombre'}
                    </option>
                  ))}
                </select>
                {fieldErrors.prestador_id && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.prestador_id}</p>
                )}
              </div>
            )}

            <div className={fieldErrors.codigo_servicio ? 'border border-red-300 rounded-lg p-3' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código Servicio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codigo_servicio"
                value={formData.codigo_servicio || ''}
                onChange={handleChange}
                required
                disabled={isEdit}
                placeholder="Ej: 001-001"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  fieldErrors.codigo_servicio
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {fieldErrors.codigo_servicio && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.codigo_servicio}</p>
              )}
            </div>

            <div className={fieldErrors.nombre_servicio ? 'border border-red-300 rounded-lg p-3' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Servicio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_servicio"
                value={formData.nombre_servicio || ''}
                onChange={handleChange}
                required
                placeholder="Ej: Hospitalización Pediátrica"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.nombre_servicio
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {fieldErrors.nombre_servicio && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.nombre_servicio}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Descripción del servicio..."
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
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.modalidad
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar modalidad...</option>
                {MODALIDADES_SERVICIO.map((mod) => (
                  <option key={mod.value} value={mod.value}>{mod.label}</option>
                ))}
              </select>
              {fieldErrors.modalidad && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.modalidad}</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.complejidad
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar complejidad...</option>
                {COMPLEJIDADES_SERVICIO.map((comp) => (
                  <option key={comp.value} value={comp.value}>{comp.label}</option>
                ))}
              </select>
              {fieldErrors.complejidad && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.complejidad}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado Habilitación
              </label>
              <select
                name="estado_habilitacion"
                value={formData.estado_habilitacion || 'EN_PROCESO'}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.estado_habilitacion
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {ESTADOS_HABILITACION_SERVICIO.map((estado) => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
              {fieldErrors.estado_habilitacion && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.estado_habilitacion}</p>
              )}
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
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors disabled:cursor-not-allowed font-medium"
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
