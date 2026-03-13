import React, { useState, useEffect } from 'react';
import { HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlineCheckCircle } from 'react-icons/hi2';
import type { Cumplimiento, CumplimientoCreate } from '../../domain/entities/Cumplimiento';
import type { ServicioSede } from '../../domain/entities/ServicioSede';
import { ESTADOS_CUMPLIMIENTO } from '../../domain/types';
import { useCumplimiento } from '../hooks/useCumplimiento';
import { useCriterio } from '../hooks/useCriterio';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

// Función para convertir fecha ISO a formato YYYY-MM-DD
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    // Si ya está en formato YYYY-MM-DD, devolverlo como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Si es ISO string (YYYY-MM-DDTHH:MM:SSZ), extraer la parte de fecha
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

interface CumplimientoFormModalProps {
  isOpen: boolean;
  cumplimiento?: Cumplimiento;
  autoevaluacionId?: number;
  servicioSedeId?: number;
  criterioId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  autoevaluacion_id?: string;
  servicio_sede_id?: string;
  criterio_id?: string;
  cumple?: string;
  hallazgo?: string;
  plan_mejora?: string;
  fecha_compromiso?: string;
}

const CumplimientoFormModal: React.FC<CumplimientoFormModalProps> = ({
  isOpen,
  cumplimiento,
  autoevaluacionId,
  servicioSedeId,
  criterioId,
  onClose,
  onSuccess,
}) => {
  const { create, update, getServiciosDeAutoevaluacion, service } = useCumplimiento();
  const { fetchCriterios, criterios: criteriosDelHook } = useCriterio();
  const isEdit = !!cumplimiento;

  const [formData, setFormData] = useState<Partial<CumplimientoCreate>>({
    autoevaluacion_id: autoevaluacionId || 0,
    servicio_sede_id: servicioSedeId || 0,
    criterio_id: criterioId || 0,
    cumple: 'CUMPLE',
    hallazgo: '',
    plan_mejora: '',
    fecha_compromiso: '',
  });

  const [originalData, setOriginalData] = useState<Partial<CumplimientoCreate>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [servicios, setServicios] = useState<ServicioSede[]>([]);
  
  // Estados mejorados para servicios
  const [serviciosState, setServiciosState] = useState<'idle' | 'loading' | 'success' | 'no_servicios' | 'error'>('idle');
  const [serviciosMensaje, setServiciosMensaje] = useState<string>('');
  
  const [criteriosLoading, setCriteriosLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
  // Estado para cumplimiento "expandido" con detalles del backend
  const [expandedCumplimiento, setExpandedCumplimiento] = useState<Cumplimiento | null>(null);

  // Detectar si hay cambios sin guardar
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // NUEVO: Fetch automático del cumplimiento completo si viene del list endpoint
  useEffect(() => {
    if (!isOpen || !cumplimiento) {
      setExpandedCumplimiento(null);
      return;
    }

    // Si ya tiene servicio_sede_detail, no hace falta hacer fetch
    if (cumplimiento.servicio_sede_detail || expandedCumplimiento?.id === cumplimiento.id) {
      setExpandedCumplimiento(cumplimiento as Cumplimiento);
      return;
    }

    console.log('🔄 Cumplimiento incompleto, haciendo fetch de detalles... ID:', cumplimiento.id);
    
    const fetchFullCumplimiento = async () => {
      try {
        const fullCumplimiento = await service.getCumplimiento(cumplimiento.id);
        console.log('✅ Cumplimiento completo descargado:', fullCumplimiento);
        console.log('🔍 DETALLES DEL OBJETO COMPLETO:', {
          hallazgo: fullCumplimiento.hallazgo,
          plan_mejora: fullCumplimiento.plan_mejora,
          hallazgo_type: typeof fullCumplimiento.hallazgo,
          plan_mejora_type: typeof fullCumplimiento.plan_mejora,
          todas_las_keys: Object.keys(fullCumplimiento)
        });
        
        // ✅ IMPORTANTE: Actualizar formData directamente con los datos completos
        const updatedData: Partial<CumplimientoCreate> = {
          autoevaluacion_id: fullCumplimiento.autoevaluacion_detail?.id || fullCumplimiento.autoevaluacion?.id || fullCumplimiento.autoevaluacion_id,
          servicio_sede_id: fullCumplimiento.servicio_sede_detail?.id || fullCumplimiento.servicio_sede?.id || fullCumplimiento.servicio_sede_id,
          criterio_id: fullCumplimiento.criterio_detail?.id || fullCumplimiento.criterio?.id || fullCumplimiento.criterio_id,
          cumple: fullCumplimiento.cumple as any,
          hallazgo: fullCumplimiento.hallazgo || '',
          plan_mejora: fullCumplimiento.plan_mejora || '',
          fecha_compromiso: formatDateForInput(fullCumplimiento.fecha_compromiso),
        };
        console.log('✅ FormData actualizado con datos completos:', updatedData);
        setFormData(updatedData);
        setOriginalData(updatedData);
        
        setExpandedCumplimiento(fullCumplimiento);
      } catch (err: any) {
        console.error('❌ Error al traer cumplimiento completo:', err);
        // Si falla, usar el que ya tenemos
        setExpandedCumplimiento(cumplimiento as Cumplimiento);
      }
    };

    fetchFullCumplimiento();
  }, [isOpen, cumplimiento?.id, service]);

  // DEBUG: Loguear estado cuando cambian datos importantes
  useEffect(() => {
    if (!isOpen) return;
    console.log('📊 === ESTADO DEL MODAL ===');
    console.log('Modo:', isEdit ? 'EDICIÓN' : 'CREACIÓN');
    console.log('Servicios State:', serviciosState, '| Servicios count:', servicios.length);
    console.log('Criterios count:', criteriosDelHook.length, '| Criterios Loading:', criteriosLoading);
    console.log('ExpandedCumplimiento:', !!expandedCumplimiento, expandedCumplimiento ? {
      id: expandedCumplimiento.id,
      servicio_sede_detail: expandedCumplimiento.servicio_sede_detail,
      criterio_detail: expandedCumplimiento.criterio_detail,
      tiene_servicios_disponibles: !!expandedCumplimiento.servicios_disponibles?.length
    } : null);
    console.log('FormData:', {
      servicio_sede_id: formData.servicio_sede_id,
      criterio_id: formData.criterio_id,
      cumple: formData.cumple,
      fecha_compromiso: formData.fecha_compromiso,
      hallazgo: formData.hallazgo?.substring(0, 50),
      plan_mejora: formData.plan_mejora?.substring(0, 50),
    });
    if (servicios.length > 0) {
      console.log('Servicios disponibles:', servicios.map((s: any) => `${s.id}: ${s.nombre_servicio || s.nombre}`));
    }
    if (criteriosDelHook.length > 0) {
      console.log('Criterios disponibles:', criteriosDelHook.map((c: any) => `${c.id}: ${c.descripcion?.substring(0, 30)}`));
    }
    console.log('=====================');
  }, [isOpen, servicios, criteriosDelHook, formData, serviciosState, criteriosLoading, isEdit, expandedCumplimiento]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    console.log('🔍 PRIMER USEEFFECT - Inicializando formData');
    console.log('cumplimiento existe?', !!cumplimiento);
    console.log('expandedCumplimiento existe?', !!expandedCumplimiento);
    
    // Usar expandedCumplimiento si está disponible (tiene detalles), sino usar cumplimiento
    const cumplimientoToUse = expandedCumplimiento || cumplimiento;
    
    if (cumplimientoToUse) {
      console.log('cumplimiento object:', cumplimientoToUse);
      console.log('cumplimiento.servicio_sede_detail:', cumplimientoToUse.servicio_sede_detail);
      console.log('cumplimiento.criterio_detail:', cumplimientoToUse.criterio_detail);
      
      // MODO EDICIÓN: Cargar todos los datos del cumplimiento existente
      // Usar los campos *_detail si están disponibles (desde detail endpoint)
      // Fallback a los campos simples si están disponibles
      // Fallback final a los parámetros de props
      const autoId = cumplimientoToUse.autoevaluacion_detail?.id || cumplimientoToUse.autoevaluacion?.id || cumplimientoToUse.autoevaluacion_id || autoevaluacionId || 0;
      const servicioId = cumplimientoToUse.servicio_sede_detail?.id || cumplimientoToUse.servicio_sede?.id || cumplimientoToUse.servicio_sede_id || servicioSedeId || 0;
      const criterioId_val = cumplimientoToUse.criterio_detail?.id || cumplimientoToUse.criterio?.id || cumplimientoToUse.criterio_id || criterioId || 0;
      
      console.log('Valores extraídos:', { autoId, servicioId, criterioId_val });
      console.log('Otros datos:', {
        hallazgo: cumplimientoToUse.hallazgo,
        plan_mejora: cumplimientoToUse.plan_mejora,
        cumple: cumplimientoToUse.cumple,
      });
      
      const data: Partial<CumplimientoCreate> = {
        autoevaluacion_id: autoId,
        servicio_sede_id: servicioId,
        criterio_id: criterioId_val,
        cumple: cumplimientoToUse.cumple as any,
        hallazgo: cumplimientoToUse.hallazgo || '',
        plan_mejora: cumplimientoToUse.plan_mejora || '',
        fecha_compromiso: formatDateForInput(cumplimientoToUse.fecha_compromiso),
      };
      
      console.log('Data a setear:', data);
      setFormData(data);
      setOriginalData(data);
      // NOTA: Los servicios se cargarán en el segundo useEffect desde servicios_disponibles
    } else {
      console.log('MODO CREACIÓN - usando props:', { autoevaluacionId, servicioSedeId, criterioId });
      // MODO CREACIÓN: Usar los IDs de las props
      const data: Partial<CumplimientoCreate> = {
        autoevaluacion_id: autoevaluacionId || 0,
        servicio_sede_id: servicioSedeId || 0,
        criterio_id: criterioId || 0,
        cumple: 'CUMPLE' as any,
        hallazgo: '',
        plan_mejora: '',
        fecha_compromiso: '',
      };
      setFormData(data);
      setOriginalData(data);
    }
    
    setError('');
    setSuccess('');
    setFormErrors({});
  }, [expandedCumplimiento, cumplimiento, autoevaluacionId, servicioSedeId, criterioId, isOpen]);

  // Cargar servicios disponibles para la autoevaluación
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadServicios = async () => {
      try {
        // Primero: si estamos en modo edición y tenemos servicios_disponibles en el objeto expandido, usarlos
        if (isEdit && expandedCumplimiento?.servicios_disponibles && expandedCumplimiento.servicios_disponibles.length > 0) {
          console.log('✅ Cargando servicios desde servicios_disponibles:', expandedCumplimiento.servicios_disponibles);
          setServicios(expandedCumplimiento.servicios_disponibles as unknown as ServicioSede[]);
          setServiciosState('success');
          setServiciosMensaje('');
          return;
        }

        // Segundo: si en modo edición pero no tenemos servicios_disponibles, cargar desde API
        const autoId = isEdit && expandedCumplimiento?.autoevaluacion_detail?.id 
          ? expandedCumplimiento.autoevaluacion_detail.id 
          : isEdit && expandedCumplimiento?.autoevaluacion?.id
          ? expandedCumplimiento.autoevaluacion.id
          : autoevaluacionId;

        if (!autoId || autoId <= 0) {
          setServicios([]);
          setServiciosState('idle');
          return;
        }

        console.log('🔄 Cargando servicios desde API para autoId:', autoId);
        setServiciosState('loading');
        const response = await getServiciosDeAutoevaluacion(autoId);
        
        // Estructura mejorada del backend:
        // { autoevaluacion, prestador, servicios, total_servicios }
        if (response && response.servicios) {
          if (response.servicios.length === 0) {
            setServicios([]);
            setServiciosState('no_servicios');
            setServiciosMensaje(
              `No hay servicios registrados para esta institución. ` +
              `Debe crear al menos un servicio antes de registrar cumplimientos.`
            );
          } else {
            console.log('✅ Servicios cargados desde API:', response.servicios);
            setServicios(response.servicios);
            setServiciosState('success');
            setServiciosMensaje('');
          }
        } else if (Array.isArray(response)) {
          // Fallback: si backend retorna array directo
          if (response.length === 0) {
            setServicios([]);
            setServiciosState('no_servicios');
            setServiciosMensaje('No hay servicios registrados para esta autoevaluación.');
          } else {
            console.log('✅ Servicios cargados (formato array):', response);
            setServicios(response);
            setServiciosState('success');
            setServiciosMensaje('');
          }
        } else {
          setServicios([]);
          setServiciosState('error');
          setServiciosMensaje('Formato de respuesta inesperado del servidor.');
        }
      } catch (err: any) {
        console.error('❌ Error al cargar servicios:', err);
        setServicios([]);
        setServiciosState('error');
        setServiciosMensaje(err.message || 'No se pudieron cargar los servicios.');
      }
    };

    loadServicios();
  }, [isOpen, expandedCumplimiento, autoevaluacionId, getServiciosDeAutoevaluacion]);

  // Cargar criterios disponibles
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadCriterios = async () => {
      try {
        console.log('🔄 Cargando criterios...');
        setCriteriosLoading(true);
        await fetchCriterios();
        console.log('✅ Criterios cargados');
      } catch (err) {
        console.error('❌ Error al cargar criterios:', err);
        setError('No se pudieron cargar los criterios. Intenta nuevamente.');
      } finally {
        setCriteriosLoading(false);
      }
    };

    loadCriterios();
  }, [isOpen, fetchCriterios]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    let finalValue: any = value;
    
    // Convertir IDs a números
    if (name.endsWith('_id')) {
      finalValue = value ? Number(value) : 0;
    }
    // Formatear fecha si es necesario
    else if (name === 'fecha_compromiso' && value) {
      finalValue = formatDateForInput(value);
    }
    
    console.log(`📝 Cambio: ${name} = ${finalValue}`);
    
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    
    // Limpiar error de este campo cuando cambia
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validar campos del formulario
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.autoevaluacion_id || formData.autoevaluacion_id <= 0) {
      errors.autoevaluacion_id = 'Autoevaluación es requerida';
    }
    if (!formData.servicio_sede_id || formData.servicio_sede_id <= 0) {
      errors.servicio_sede_id = 'Servicio es requerido';
    }
    if (!formData.criterio_id || formData.criterio_id <= 0) {
      errors.criterio_id = 'Criterio es requerido';
    }
    if (!formData.cumple) {
      errors.cumple = 'Estado de cumplimiento es requerido';
    }

    // Si no cumple o parcialmente, hallazgo y plan son requeridos
    const showHallazgoFields = formData.cumple === 'NO_CUMPLE' || formData.cumple === 'PARCIALMENTE';
    if (showHallazgoFields) {
      if (!formData.hallazgo || formData.hallazgo.trim().length === 0) {
        errors.hallazgo = 'Descripción del hallazgo es requerida';
      }
      if (!formData.plan_mejora || formData.plan_mejora.trim().length === 0) {
        errors.plan_mejora = 'Plan de mejora es requerido';
      }
      if (!formData.fecha_compromiso) {
        errors.fecha_compromiso = 'Fecha de compromiso es requerida';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha_compromiso)) {
        errors.fecha_compromiso = 'Formato de fecha inválido. Use YYYY-MM-DD';
      } else {
        // Validar que sea una fecha válida
        const date = new Date(formData.fecha_compromiso + 'T00:00:00');
        if (isNaN(date.getTime())) {
          errors.fecha_compromiso = 'Fecha inválida';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Crear copia de datos para enviar, asegurar formato correcto de fecha
      const dataToSend: CumplimientoCreate = {
        ...formData,
        fecha_compromiso: formData.fecha_compromiso ? formatDateForInput(formData.fecha_compromiso) : undefined,
      } as CumplimientoCreate;
      
      console.log('📤 Enviando cumplimiento:', JSON.stringify(dataToSend, null, 2));
      
      if (isEdit && cumplimiento) {
        await update(cumplimiento.id, { id: cumplimiento.id, ...dataToSend });
        setSuccess('Cumplimiento actualizado exitosamente');
      } else {
        await create(dataToSend);
        setSuccess('Cumplimiento registrado exitosamente');
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      // Obtener el mensaje de error más detallado posible
      const backendErrors = err.response?.data;
      let errorMsg = 'Error al guardar cumplimiento';
      
      if (backendErrors) {
        // Verificar si es error de unicidad
        if (backendErrors.non_field_errors && Array.isArray(backendErrors.non_field_errors)) {
          errorMsg = backendErrors.non_field_errors[0] + '\n\n💡 Este cumplimiento ya existe. Puedes:\n• Editar el cumplimiento existente\n• Seleccionar otro servicio o criterio';
        }
        // Si es un objeto con múltiples errores (Django DRF)
        else if (typeof backendErrors === 'object') {
          const errorLines = Object.entries(backendErrors)
            .map(([key, value]: [string, any]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${String(value)}`;
            });
          errorMsg = errorLines.join('\n');
        } else {
          errorMsg = String(backendErrors);
        }
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      console.error('❌ Error en handleSubmit:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        formData: formData
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if ((hasUnsavedChanges && !isEdit) || (hasUnsavedChanges && isEdit)) {
      setShowCloseConfirm(true);
    } else {
      setExpandedCumplimiento(null);
      onClose();
    }
  };

  // Mostrar campos de hallazgo y plan solo si no cumple o parcialmente
  const showHallazgoFields = formData.cumple === 'NO_CUMPLE' || formData.cumple === 'PARCIALMENTE';

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Cumplimiento' : 'Nuevo Cumplimiento'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Cerrar"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex gap-3">
                <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Error al guardar</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1 whitespace-pre-line">{error}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex gap-3">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">{success}</p>
                </div>
              </div>
            )}

            {/* Información de contexto - Autoevaluación (Solo lectura) */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Información de la Autoevaluación (Autoevaluación ID: {formData.autoevaluacion_id})
              </p>
            </div>

            {/* Fila 1: Servicio y Criterio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Servicio del Prestador <span className="text-red-500">*</span>
                </label>
                {serviciosState === 'loading' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    Cargando servicios...
                  </div>
                ) : serviciosState === 'no_servicios' ? (
                  <div className="w-full px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">⚠️ No hay servicios disponibles</p>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">{serviciosMensaje}</p>
                    <a 
                      href="/habilitacion/servicios" 
                      className="inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline mt-2"
                    >
                      ➜ Ir a Gestión de Servicios
                    </a>
                  </div>
                ) : serviciosState === 'error' ? (
                  <div className="w-full px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">❌ Error al cargar servicios</p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-2">{serviciosMensaje}</p>
                  </div>
                ) : serviciosState === 'success' ? (
                  <>
                    <select
                      name="servicio_sede_id"
                      value={formData.servicio_sede_id || 0}
                      onChange={handleChange}
                      required
                      disabled={!isEdit && !!servicioSedeId}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                        formErrors.servicio_sede_id
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value={0}>✓ Seleccione un servicio</option>
                      {servicios.map(s => {
                        // Manejo de ambas estructuras: desde servicios_disponibles y desde getServiciosDeAutoevaluacion
                        const id = s.id;
                        const nombre = (s as any).nombre_servicio || (s as any).nombre || '';
                        const codigo = (s as any).codigo_servicio || (s as any).codigo || '';
                        return (
                          <option key={id} value={id}>
                            {nombre} ({codigo})
                          </option>
                        );
                      })}
                    </select>
                    {formErrors.servicio_sede_id && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.servicio_sede_id}</p>
                    )}
                  </>
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">
                    Cargando...
                  </div>
                )}
              </div>

              {/* Criterio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Criterio de Evaluación <span className="text-red-500">*</span>
                </label>
                {criteriosLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    Cargando criterios...
                  </div>
                ) : criteriosDelHook.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                    ⚠️ No hay criterios disponibles
                  </div>
                ) : (
                  <>
                    <select
                      name="criterio_id"
                      value={formData.criterio_id || 0}
                      onChange={handleChange}
                      required
                      disabled={!isEdit && !!criterioId}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                        formErrors.criterio_id
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value={0}>✓ Seleccione un criterio</option>
                      {criteriosDelHook.map(c => (
                        <option key={c.id} value={c.id}>
                          #{c.numero_criterio} - {c.descripcion?.substring(0, 50)}
                        </option>
                      ))}
                    </select>
                    {formErrors.criterio_id && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.criterio_id}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Fila 2: Estado de Cumplimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado de Cumplimiento <span className="text-red-500">*</span>
              </label>
              <select
                name="cumple"
                value={formData.cumple || 'CUMPLE'}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                  formErrors.cumple
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {ESTADOS_CUMPLIMIENTO.map((ec) => (
                  <option key={ec.value} value={ec.value}>
                    {ec.label}
                  </option>
                ))}
              </select>
              {formErrors.cumple && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.cumple}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Selecciona "No Cumple" o "Parcialmente" para describir hallazgos y plan de mejora
              </p>
            </div>

            {/* Campos condicionales para hallazgo y plan de mejora */}
            {showHallazgoFields && (
              <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                  <HiOutlineExclamationTriangle className="w-5 h-5" />
                  Complete la información del hallazgo y plan de mejora (REQUERIDO)
                </p>

                {/* Hallazgo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción del Hallazgo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="hallazgo"
                    value={formData.hallazgo || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describa detalladamente qué no está cumpliendo o está cumpliendo parcialmente..."
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.hallazgo
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.hallazgo && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.hallazgo}</p>
                  )}
                </div>

                {/* Plan de Mejora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan de Mejora / Acción Correctiva <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="plan_mejora"
                    value={formData.plan_mejora || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describa las acciones específicas que se van a realizar para corregir el hallazgo..."
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.plan_mejora
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.plan_mejora && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.plan_mejora}</p>
                  )}
                </div>

                {/* Fecha Compromiso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Compromiso / Vigencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_compromiso"
                    value={formData.fecha_compromiso || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.fecha_compromiso
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.fecha_compromiso && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.fecha_compromiso}</p>
                  )}
                </div>
              </div>
            )}

            {/* Info cumplimiento existente */}
            {isEdit && cumplimiento && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><strong>Creado:</strong> {cumplimiento.fecha_creacion ? new Date(cumplimiento.fecha_creacion).toLocaleDateString() : 'N/A'}</p>
                {cumplimiento.plan_mejora && (
                  <p><strong>Plan de Mejora:</strong> {cumplimiento.plan_mejora.substring(0, 100)}...</p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success !== '' || servicios.length === 0 || criteriosDelHook.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Guardando...
                  </>
                ) : isEdit ? (
                  'Actualizar Cumplimiento'
                ) : (
                  'Registrar Cumplimiento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm dialog para cambios sin guardar */}
      <ConfirmDialog
        isOpen={showCloseConfirm}
        title="Cambios sin guardar"
        message="Tienes cambios que no se han guardado. ¿Quieres descartar estos cambios?"
        onConfirm={() => {
          setShowCloseConfirm(false);
          setExpandedCumplimiento(null);
          onClose();
        }}
        onClose={() => setShowCloseConfirm(false)}
        confirmText="Descartar"
        cancelText="Continuar editando"
      />
    </>
  );
};

export default CumplimientoFormModal;
