import React, { useState, useEffect } from 'react';
import { HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlineCheckCircle } from 'react-icons/hi2';
import type { Autoevaluacion, AutoevaluacionCreate } from '../../domain/entities/Autoevaluacion';
import type { DatosPrestador } from '../../domain/entities/DatosPrestador';
import { ESTADOS_AUTOEVALUACION } from '../../domain/types';
import { useAutoevaluacion } from '../hooks/useAutoevaluacion';
import { useDatosPrestador } from '../hooks/useDatosPrestador';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { extractErrorMessage } from '../../shared/utils/error';

interface AutoevaluacionFormModalProps {
  isOpen: boolean;
  autoevaluacion?: Autoevaluacion;
  datosPrestadorId?: number;
  onClose: () => void;
  onSuccess: (autoevaluacion?: Autoevaluacion) => void;
}

const AutoevaluacionFormModal: React.FC<AutoevaluacionFormModalProps> = ({
  isOpen,
  autoevaluacion,
  datosPrestadorId,
  onClose,
  onSuccess,
}) => {
  const { create, update, delete: deleteAutoevaluacion, autoevaluaciones } = useAutoevaluacion();
  const { datos: prestadores } = useDatosPrestador();
  const isEdit = !!autoevaluacion;

  interface PrestadorOption extends DatosPrestador {}

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
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [prestadoresFiltered, setPrestadoresFiltered] = useState<PrestadorOption[]>([]);
  const [selectedPrestador, setSelectedPrestador] = useState<DatosPrestador | null>(null);

  // Calcular fecha de vencimiento por defecto (365 días a partir de hoy)
  const calcularFechaVencimientoDefecto = (): string => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 365);
    return fecha.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      setPrestadoresFiltered(prestadores as PrestadorOption[]);
      
      if (autoevaluacion) {
        const vencimiento = autoevaluacion.fecha_vencimiento || '';
        setFormData({
          datos_prestador_id: autoevaluacion.datos_prestador?.id || datosPrestadorId || 0,
          periodo: autoevaluacion.periodo,
          version: autoevaluacion.version,
          estado: autoevaluacion.estado,
          fecha_vencimiento: vencimiento,
          observaciones: autoevaluacion.observaciones || '',
        });
        
        // Preseleccionar prestador si es edit
        if (autoevaluacion.datos_prestador?.id) {
          const prestador = prestadores.find(p => p.id === autoevaluacion.datos_prestador?.id);
          if (prestador) setSelectedPrestador(prestador);
        }
      } else {
        const vencimientoDefecto = calcularFechaVencimientoDefecto();
        setFormData({
          datos_prestador_id: datosPrestadorId || 0,
          periodo: new Date().getFullYear(),
          version: 1,
          estado: 'BORRADOR',
          fecha_vencimiento: vencimientoDefecto,
          observaciones: '',
        });
      }
      setError('');
      setValidationWarnings([]);
    }
  }, [isOpen, autoevaluacion, datosPrestadorId, prestadores]);

  // Validar cambios en periodo y prestador
  useEffect(() => {
    if (!isOpen || !formData.datos_prestador_id || !formData.periodo) return;

    const warnings: string[] = [];
    
    // Verificar si ya existe una autoevaluación del mismo prestador en el mismo periodo
    const existeDuplicado = autoevaluaciones.some(a => 
      a.datos_prestador?.id === formData.datos_prestador_id &&
      a.periodo === formData.periodo &&
      (!isEdit || a.id !== autoevaluacion?.id) // No contar la misma al editar
    );

    if (existeDuplicado) {
      warnings.push(`Ya existe una autoevaluación para este prestador en el período ${formData.periodo}`);
    }

    // Validar fecha vencimiento no sea en el pasado
    if (formData.fecha_vencimiento) {
      const fechaVencimiento = new Date(formData.fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVencimiento < hoy && !isEdit) {
        warnings.push('La fecha de vencimiento no puede ser en el pasado');
      }
    }

    setValidationWarnings(warnings);
  }, [formData.datos_prestador_id, formData.periodo, formData.fecha_vencimiento, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'datos_prestador_id') {
      const prestador = prestadoresFiltered.find(p => p.id === Number(value));
      setSelectedPrestador(prestador || null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'periodo' || name === 'version' || name === 'datos_prestador_id' ? Number(value) : value,
    }));
  };

  const handleAutoFechaVencimiento = () => {
    const vencimientoDefecto = calcularFechaVencimientoDefecto();
    setFormData(prev => ({
      ...prev,
      fecha_vencimiento: vencimientoDefecto,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones finales
      if (!formData.periodo) {
        setError('Periodo es obligatorio');
        setLoading(false);
        return;
      }

      if (!formData.fecha_vencimiento) {
        setError('Fecha de vencimiento es obligatoria');
        setLoading(false);
        return;
      }

      if (!formData.datos_prestador_id) {
        setError('Debe seleccionar un prestador');
        setLoading(false);
        return;
      }

      // Verificar duplicado antes de crear
      if (!isEdit) {
        const existeDuplicado = autoevaluaciones.some(a => 
          a.datos_prestador?.id === formData.datos_prestador_id &&
          a.periodo === formData.periodo
        );

        if (existeDuplicado) {
          setError('Ya existe una autoevaluación para este prestador en el período indicado');
          setLoading(false);
          return;
        }
      }

      if (isEdit && autoevaluacion) {
        const updated = await update(autoevaluacion.id, { id: autoevaluacion.id, ...formData });
        onSuccess(updated);
      } else {
        const created = await create(formData as AutoevaluacionCreate);
        onSuccess(created);
      }
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al guardar autoevaluación'));
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
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex gap-2">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <ul className="space-y-1">
                {validationWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-300 flex gap-2">
                    <span>⚠</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prestador Selector (solo si no viene como prop) */}
            {!datosPrestadorId && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prestador <span className="text-red-500">*</span>
                </label>
                <select
                  name="datos_prestador_id"
                  value={formData.datos_prestador_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un prestador</option>
                  {prestadoresFiltered.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_reps} - {p.company_name || `Prestador #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Info prestador seleccionado */}
            {selectedPrestador && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex gap-2 items-start">
                  <HiOutlineCheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-300 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-200">{selectedPrestador.company_name}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Código: {selectedPrestador.codigo_reps}</p>
                    {selectedPrestador.clase_prestador && (
                      <p className="text-xs text-blue-700 dark:text-blue-300">Clase: {selectedPrestador.clase_prestador}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                disabled={isEdit}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-900"
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
                disabled={!isEdit}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-900"
              >
                {ESTADOS_AUTOEVALUACION.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Vencimiento */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Vencimiento <span className="text-red-500">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleAutoFechaVencimiento}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    Auto (Hoy + 365 días)
                  </button>
                )}
              </div>
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
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>N° Autoevaluación:</strong> {autoevaluacion.numero_autoevaluacion}
              </p>
              {autoevaluacion.fecha_inicio && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Fecha Inicio:</strong> {new Date(autoevaluacion.fecha_inicio).toLocaleDateString('es-CO')}
                </p>
              )}
              {autoevaluacion.fecha_completacion && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Fecha Completación:</strong> {new Date(autoevaluacion.fecha_completacion).toLocaleDateString('es-CO')}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {isEdit && autoevaluacion && (
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
              disabled={loading || validationWarnings.length > 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Autoevaluación'}
            </button>
          </div>
        </form>
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Eliminar Autoevaluación"
          message="¿Estás seguro de que deseas eliminar esta autoevaluación? Esta acción no se puede deshacer."
          onConfirm={() => {
            if (autoevaluacion?.id) {
              deleteAutoevaluacion(autoevaluacion.id).then(() => {
                onSuccess?.(autoevaluacion);
                onClose?.();
              }).catch(() => setError('Error eliminando autoevaluación'));
            }
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default AutoevaluacionFormModal;
