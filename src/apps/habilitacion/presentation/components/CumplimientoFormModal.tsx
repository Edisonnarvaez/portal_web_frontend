import React, { useState, useEffect, useMemo } from 'react';
import { HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlineCheckCircle } from 'react-icons/hi2';
import type { Cumplimiento, CumplimientoCreate } from '../../domain/entities/Cumplimiento';
import type { ServicioSede } from '../../domain/entities/ServicioSede';
import type { Document } from '../../../procesos/domain/entities/Document';
import { ESTADOS_CUMPLIMIENTO } from '../../domain/types';
import { useCumplimiento } from '../hooks/useCumplimiento';
import { useCriterio } from '../hooks/useCriterio';
import { useAsyncState } from '../hooks/useAsyncState';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { extractErrorMessage } from '../../shared/utils/error';
import { formatDateForInput } from './utils/formModalUtils';
import { useNotifications } from '../../../../shared/hooks/useNotifications';
import { DocumentRepository } from '../../../procesos/infrastructure/repositories/DocumentRepository';

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

const resolveEntityId = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && value > 0) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
      const nestedId = (value as { id?: unknown }).id;
      if (typeof nestedId === 'number' && nestedId > 0) return nestedId;
      if (typeof nestedId === 'string') {
        const parsed = Number(nestedId);
        if (!Number.isNaN(parsed) && parsed > 0) return parsed;
      }
    }
  }
  return 0;
};

const normalizeServicioOption = (servicio: any): ServicioSede => ({
  id: Number(servicio.id) || 0,
  codigo_servicio: servicio.codigo_servicio || servicio.codigo || '',
  nombre_servicio: servicio.nombre_servicio || servicio.nombre || '',
  modalidad: (servicio.modalidad as ServicioSede['modalidad']) || 'INTRAMURAL',
  complejidad: (servicio.complejidad as ServicioSede['complejidad']) || 'BAJA',
  estado_habilitacion: (servicio.estado_habilitacion || servicio.estado) as ServicioSede['estado_habilitacion'] || 'EN_PROCESO',
  fecha_creacion: servicio.fecha_creacion || '',
  fecha_actualizacion: servicio.fecha_actualizacion || '',
});

const getCumplimientoServicioId = (cumplimiento: Cumplimiento): number =>
  resolveEntityId(cumplimiento.servicio_sede_detail, cumplimiento.servicio_sede, cumplimiento.servicio_sede_id);

const getCumplimientoCriterioId = (cumplimiento: Cumplimiento): number =>
  resolveEntityId(cumplimiento.criterio_detail, cumplimiento.criterio, cumplimiento.criterio_id);

const getCumplimientoAutoevaluacionId = (cumplimiento: Cumplimiento): number =>
  resolveEntityId(cumplimiento.autoevaluacion_detail, cumplimiento.autoevaluacion, cumplimiento.autoevaluacion_id);

const extractDocumentoIds = (documentos: unknown): number[] => {
  if (!Array.isArray(documentos)) return [];

  const ids = documentos
    .map((doc) => resolveEntityId(doc, (doc as { id?: unknown })?.id))
    .filter((id) => id > 0);

  return Array.from(new Set(ids));
};

const toDocumentList = (raw: unknown): Document[] => {
  if (Array.isArray(raw)) return raw as Document[];
  if (raw && typeof raw === 'object') {
    const payload = raw as { results?: unknown[]; data?: unknown[]; items?: unknown[] };
    if (Array.isArray(payload.results)) return payload.results as Document[];
    if (Array.isArray(payload.data)) return payload.data as Document[];
    if (Array.isArray(payload.items)) return payload.items as Document[];
  }
  return [];
};

const isDocumentoVigente = (doc: Document): boolean => {
  const estado = String(doc.estado || '').trim().toUpperCase();

  // Compatibilidad con distintas convenciones del backend.
  // Procesos usa códigos (VIG/OBS/ARC), pero algunos endpoints devuelven texto.
  return estado === 'VIG' || estado === 'VIGENTE' || (!estado && doc.activo === true);
};

const CumplimientoFormModal: React.FC<CumplimientoFormModalProps> = ({
  isOpen,
  cumplimiento,
  autoevaluacionId,
  servicioSedeId,
  criterioId,
  onClose,
  onSuccess,
}) => {
  const { create, update, delete: deleteCumplimiento, getServiciosDeAutoevaluacion, getCumplimiento, service } = useCumplimiento();
  const { fetchCriterios, criterios: criteriosDelHook } = useCriterio();
  const { notifySuccess } = useNotifications();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [criteriosEvaluadosPorServicio, setCriteriosEvaluadosPorServicio] = useState<Set<string>>(new Set());
  const [documentosDisponibles, setDocumentosDisponibles] = useState<Document[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [errorDocumentos, setErrorDocumentos] = useState('');
  const [filtroDocumentoTexto, setFiltroDocumentoTexto] = useState('');
  const [filtroDocumentoTipo, setFiltroDocumentoTipo] = useState('');
  const initialServicios = useMemo<ServicioSede[]>(() => [], []);
  const serviciosAsync = useAsyncState<ServicioSede[]>(initialServicios);
  const criteriosAsync = useAsyncState<boolean>(false);
  const { state: serviciosState, setLoading: setServiciosLoading, setSuccess: setServiciosSuccess, setError: setServiciosError, reset: resetServicios } = serviciosAsync;
  const { state: criteriosState, setLoading: setCriteriosLoading, setSuccess: setCriteriosSuccess, setError: setCriteriosError, reset: resetCriterios } = criteriosAsync;
  
  // Estado para cumplimiento "expandido" con detalles del backend
  const [expandedCumplimiento, setExpandedCumplimiento] = useState<Cumplimiento | null>(null);
  const documentRepository = useMemo(() => new DocumentRepository(), []);

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

    const fetchFullCumplimiento = async () => {
      try {
        const fullCumplimiento = await getCumplimiento(cumplimiento.id);
        
        // ✅ IMPORTANTE: Actualizar formData directamente con los datos completos
        const updatedData: Partial<CumplimientoCreate> = {
          autoevaluacion_id: resolveEntityId(
            fullCumplimiento.autoevaluacion_detail,
            fullCumplimiento.autoevaluacion,
            fullCumplimiento.autoevaluacion_id,
            autoevaluacionId
          ),
          servicio_sede_id: resolveEntityId(
            fullCumplimiento.servicio_sede_detail,
            fullCumplimiento.servicio_sede,
            fullCumplimiento.servicio_sede_id,
            servicioSedeId
          ),
          criterio_id: resolveEntityId(
            fullCumplimiento.criterio_detail,
            fullCumplimiento.criterio,
            fullCumplimiento.criterio_id,
            criterioId
          ),
          cumple: fullCumplimiento.cumple as CumplimientoCreate['cumple'],
          hallazgo: fullCumplimiento.hallazgo || '',
          plan_mejora: fullCumplimiento.plan_mejora || '',
          fecha_compromiso: formatDateForInput(fullCumplimiento.fecha_compromiso),
          documentos_evidencia: extractDocumentoIds(
            fullCumplimiento.documentos_evidencia_list || fullCumplimiento.documentos_evidencia,
          ),
        };
        setFormData(updatedData);
        setOriginalData(updatedData);
        
        setExpandedCumplimiento(fullCumplimiento);
      } catch (err: unknown) {
        // Si falla, usar el que ya tenemos
        setExpandedCumplimiento(cumplimiento as Cumplimiento);
      }
    };

    fetchFullCumplimiento();
  }, [isOpen, cumplimiento?.id, getCumplimiento]);

  useEffect(() => {
    if (!isOpen) {
      resetServicios();
      resetCriterios();
      return;
    }
    
    // Usar expandedCumplimiento si está disponible (tiene detalles), sino usar cumplimiento
    const cumplimientoToUse = expandedCumplimiento || cumplimiento;
    
    if (cumplimientoToUse) {
      // MODO EDICIÓN: Cargar todos los datos del cumplimiento existente
      // Usar los campos *_detail si están disponibles (desde detail endpoint)
      // Fallback a los campos simples si están disponibles
      // Fallback final a los parámetros de props
      const autoId = resolveEntityId(
        cumplimientoToUse.autoevaluacion_detail,
        cumplimientoToUse.autoevaluacion,
        cumplimientoToUse.autoevaluacion_id,
        autoevaluacionId
      );
      const servicioId = resolveEntityId(
        cumplimientoToUse.servicio_sede_detail,
        cumplimientoToUse.servicio_sede,
        cumplimientoToUse.servicio_sede_id,
        servicioSedeId
      );
      const criterioId_val = resolveEntityId(
        cumplimientoToUse.criterio_detail,
        cumplimientoToUse.criterio,
        cumplimientoToUse.criterio_id,
        criterioId
      );
      
      const data: Partial<CumplimientoCreate> = {
        autoevaluacion_id: autoId,
        servicio_sede_id: servicioId,
        criterio_id: criterioId_val,
        cumple: cumplimientoToUse.cumple as CumplimientoCreate['cumple'],
        hallazgo: cumplimientoToUse.hallazgo || '',
        plan_mejora: cumplimientoToUse.plan_mejora || '',
        fecha_compromiso: formatDateForInput(cumplimientoToUse.fecha_compromiso),
        documentos_evidencia: extractDocumentoIds(
          cumplimientoToUse.documentos_evidencia_list || cumplimientoToUse.documentos_evidencia,
        ),
      };

      setFormData(data);
      setOriginalData(data);
      // NOTA: Los servicios se cargarán en el segundo useEffect desde servicios_disponibles
    } else {
      // MODO CREACIÓN: Usar los IDs de las props
      const data: Partial<CumplimientoCreate> = {
        autoevaluacion_id: autoevaluacionId || 0,
        servicio_sede_id: servicioSedeId || 0,
        criterio_id: criterioId || 0,
        cumple: 'CUMPLE',
        hallazgo: '',
        plan_mejora: '',
        fecha_compromiso: '',
        documentos_evidencia: [],
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
          // Preferir payload ya resuelto por backend para evitar una llamada adicional.
          setServiciosSuccess(expandedCumplimiento.servicios_disponibles.map(normalizeServicioOption));
          return;
        }

        // Segundo: si en modo edición pero no tenemos servicios_disponibles, cargar desde API
        const autoId = resolveEntityId(
          expandedCumplimiento?.autoevaluacion_detail,
          expandedCumplimiento?.autoevaluacion,
          autoevaluacionId
        );

        if (!autoId || autoId <= 0) {
          resetServicios();
          return;
        }

        setServiciosLoading();
        const response = await getServiciosDeAutoevaluacion(autoId);
        
        // Estructura mejorada del backend:
        // { autoevaluacion, prestador, servicios, total_servicios }
        if (response && response.servicios) {
          if (response.servicios.length === 0) {
            setServiciosSuccess([]);
          } else {
            // Normalizar payload compacto del endpoint a la forma esperada en la UI.
            const serviciosNormalizados = response.servicios.map(normalizeServicioOption);
            setServiciosSuccess(serviciosNormalizados);
          }
        } else {
          setServiciosError(new Error('Formato de respuesta inesperado del servidor.'), 'Formato de respuesta inesperado del servidor.');
        }
      } catch (err: unknown) {
        setServiciosError(err, 'No se pudieron cargar los servicios.');
      }
    };

    loadServicios();
  }, [
    isOpen,
    expandedCumplimiento,
    autoevaluacionId,
    getServiciosDeAutoevaluacion,
    isEdit,
    setServiciosSuccess,
    resetServicios,
    setServiciosLoading,
    setServiciosError,
  ]);

  // Cargar criterios disponibles
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadCriterios = async () => {
      try {
        setCriteriosLoading();
        await fetchCriterios();
        setCriteriosSuccess(true);
      } catch (err) {
        setCriteriosError(err, 'No se pudieron cargar los criterios. Intenta nuevamente.');
      }
    };

    loadCriterios();
  }, [isOpen, fetchCriterios, setCriteriosLoading, setCriteriosSuccess, setCriteriosError]);

  // Cargar documentos disponibles para asociar como soporte/evidencia.
  useEffect(() => {
    if (!isOpen) {
      setDocumentosDisponibles([]);
      setErrorDocumentos('');
      return;
    }

    const loadDocumentos = async () => {
      try {
        setLoadingDocumentos(true);
        setErrorDocumentos('');
        const response = await documentRepository.getAll();
        setDocumentosDisponibles(toDocumentList(response).filter(isDocumentoVigente));
      } catch {
        setDocumentosDisponibles([]);
        setErrorDocumentos('No se pudieron cargar los documentos para evidencia.');
      } finally {
        setLoadingDocumentos(false);
      }
    };

    loadDocumentos();
  }, [isOpen, documentRepository]);

  // Cargar pares (servicio, criterio) ya evaluados para la autoevaluación activa.
  useEffect(() => {
    if (!isOpen) {
      setCriteriosEvaluadosPorServicio(new Set());
      return;
    }

    const loadEvaluados = async () => {
      const autoId = resolveEntityId(
        expandedCumplimiento?.autoevaluacion_detail,
        expandedCumplimiento?.autoevaluacion,
        formData.autoevaluacion_id,
        autoevaluacionId,
      );

      if (!autoId || autoId <= 0) {
        setCriteriosEvaluadosPorServicio(new Set());
        return;
      }

      try {
        const data = await service.getCumplimientos({ autoevaluacion_id: autoId });
        const editId = cumplimiento?.id;
        const pairs = new Set<string>();

        data.forEach((item) => {
          if (editId && item.id === editId) return;

          // Asegurar por frontend que solo se consideren cumplimientos de la autoevaluación actual,
          // incluso si el backend retorna datos no filtrados.
          const itemAutoId = getCumplimientoAutoevaluacionId(item);
          if (!itemAutoId || itemAutoId !== autoId) return;

          const servicioId = getCumplimientoServicioId(item);
          const critId = getCumplimientoCriterioId(item);
          if (servicioId > 0 && critId > 0) {
            pairs.add(`${servicioId}-${critId}`);
          }
        });

        setCriteriosEvaluadosPorServicio(pairs);
      } catch {
        setCriteriosEvaluadosPorServicio(new Set());
      }
    };

    loadEvaluados();
  }, [
    isOpen,
    service,
    autoevaluacionId,
    formData.autoevaluacion_id,
    expandedCumplimiento,
    cumplimiento?.id,
  ]);

  const servicioSeleccionadoId = Number(formData.servicio_sede_id || 0);
  const criterioSeleccionadoId = Number(formData.criterio_id || 0);
  const selectedPairKey = `${servicioSeleccionadoId}-${criterioSeleccionadoId}`;
  const selectedPairAlreadyEvaluated =
    servicioSeleccionadoId > 0 &&
    criterioSeleccionadoId > 0 &&
    criteriosEvaluadosPorServicio.has(selectedPairKey);

  const documentosSeleccionados = (formData.documentos_evidencia || []) as number[];
  const criterioSeleccionado = useMemo(
    () => criteriosDelHook.find((c) => c.id === criterioSeleccionadoId),
    [criteriosDelHook, criterioSeleccionadoId],
  );

  const tiposDocumentoDisponibles = useMemo(() => {
    const tipos = new Set<string>();
    documentosDisponibles.forEach((doc) => {
      if (doc.tipo_documento) tipos.add(doc.tipo_documento);
    });
    return Array.from(tipos).sort((a, b) => a.localeCompare(b));
  }, [documentosDisponibles]);

  const documentosFiltrados = useMemo(() => {
    const text = filtroDocumentoTexto.trim().toLowerCase();
    return documentosDisponibles.filter((doc) => {
      const matchTipo = !filtroDocumentoTipo || doc.tipo_documento === filtroDocumentoTipo;
      const matchText =
        !text ||
        doc.codigo_documento?.toLowerCase().includes(text) ||
        doc.nombre_documento?.toLowerCase().includes(text);
      return matchTipo && matchText;
    });
  }, [documentosDisponibles, filtroDocumentoTexto, filtroDocumentoTipo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    let finalValue: string | number = value;
    
    // Convertir IDs a números
    if (name.endsWith('_id')) {
      finalValue = value ? Number(value) : 0;
    }
    // Formatear fecha si es necesario
    else if (name === 'fecha_compromiso' && value) {
      finalValue = formatDateForInput(value);
    }
    
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

  const toggleDocumento = (documentoId: number) => {
    setFormData((prev) => {
      const current = new Set((prev.documentos_evidencia || []) as number[]);
      if (current.has(documentoId)) {
        current.delete(documentoId);
      } else {
        current.add(documentoId);
      }

      return {
        ...prev,
        documentos_evidencia: Array.from(current),
      };
    });
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

    if (selectedPairAlreadyEvaluated) {
      setFormErrors((prev) => ({
        ...prev,
        criterio_id: 'Este criterio ya fue evaluado para el servicio seleccionado en esta autoevaluación.',
      }));
      setError('Ya existe un cumplimiento para este servicio y criterio en la autoevaluación actual.');
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

      // Compatibilidad: algunos backends esperan *_ids para relaciones M2M.
      const payload: CumplimientoCreate & { documentos_evidencia_ids?: number[] } = {
        ...dataToSend,
        documentos_evidencia: documentosSeleccionados,
        documentos_evidencia_ids: documentosSeleccionados,
      };
      
      if (isEdit && cumplimiento) {
        await update(cumplimiento.id, { id: cumplimiento.id, ...payload });
        setSuccess('Cumplimiento actualizado exitosamente');
        notifySuccess('Cumplimiento actualizado satisfactoriamente');
      } else {
        await create(payload);
        setSuccess('Cumplimiento registrado exitosamente');
        notifySuccess('Cumplimiento creado satisfactoriamente');
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err: unknown) {
      // Obtener el mensaje de error más detallado posible
      const backendErrors = (err as { response?: { data?: unknown } })?.response?.data;
      const backendErrorMap =
        backendErrors && typeof backendErrors === 'object'
          ? (backendErrors as Record<string, unknown>)
          : null;
      let errorMsg = 'Error al guardar cumplimiento';
      
      if (backendErrors) {
        // Verificar si es error de unicidad
        if (backendErrorMap?.non_field_errors && Array.isArray(backendErrorMap.non_field_errors)) {
          errorMsg = `${String(backendErrorMap.non_field_errors[0])}\n\n💡 Este cumplimiento ya existe. Puedes:\n• Editar el cumplimiento existente\n• Seleccionar otro servicio o criterio`;
        }
        // Si es un objeto con múltiples errores (Django DRF)
        else if (backendErrorMap) {
          const errorLines = Object.entries(backendErrorMap)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${String(value)}`;
            });
          errorMsg = errorLines.join('\n');
        } else {
          errorMsg = String(backendErrors);
        }
      } else {
        errorMsg = extractErrorMessage(err, errorMsg);
      }
      
      setError(errorMsg);
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

  const handleDelete = async () => {
    if (!cumplimiento?.id) return;

    setLoading(true);
    setError('');
    try {
      await deleteCumplimiento(cumplimiento.id);
      notifySuccess('Cumplimiento eliminado satisfactoriamente');
      onSuccess?.();
      onClose?.();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error eliminando cumplimiento'));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
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
                {serviciosState.status === 'loading' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    Cargando servicios...
                  </div>
                ) : serviciosState.status === 'success' && serviciosState.data.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">⚠️ No hay servicios disponibles</p>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
                      No hay servicios registrados para esta institución. Debe crear al menos un servicio antes de registrar cumplimientos.
                    </p>
                    <a 
                      href="/habilitacion/servicios" 
                      className="inline-block text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline mt-2"
                    >
                      ➜ Ir a Gestión de Servicios
                    </a>
                  </div>
                ) : serviciosState.status === 'error' ? (
                  <div className="w-full px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">❌ Error al cargar servicios</p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-2">{serviciosState.error}</p>
                  </div>
                ) : serviciosState.status === 'success' ? (
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
                      {serviciosState.data.map(s => {
                        const id = s.id;
                        const nombre = s.nombre_servicio || (s as any).nombre || '';
                        const codigo = s.codigo_servicio || (s as any).codigo || '';
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
                {criteriosState.status === 'loading' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    Cargando criterios...
                  </div>
                ) : criteriosState.status === 'error' ? (
                  <div className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                    ⚠️ {criteriosState.error}
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
                      {criteriosDelHook.map(c => {
                        const alreadyEvaluated =
                          servicioSeleccionadoId > 0 &&
                          criteriosEvaluadosPorServicio.has(`${servicioSeleccionadoId}-${c.id}`);

                        return (
                          <option
                            key={c.id}
                            value={c.id}
                            disabled={!isEdit && alreadyEvaluated}
                          >
                            {c.codigo && c.nombre
                              ? `${c.codigo} - ${c.nombre}`
                              : c.nombre || c.codigo || `Criterio ${c.id}`}
                            {alreadyEvaluated ? ' ⚠️ Ya evaluado en este servicio' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {formErrors.criterio_id && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.criterio_id}</p>
                    )}
                    {!servicioSeleccionadoId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Selecciona primero un servicio para validar si el criterio ya fue evaluado.
                      </p>
                    )}
                    {selectedPairAlreadyEvaluated && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        ⚠️ Este criterio ya tiene evaluación para el servicio seleccionado en esta autoevaluación.
                      </p>
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

            {/* Soportes documentales */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Documentos de Soporte / Evidencia
              </label>

              {loadingDocumentos ? (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                  Cargando documentos...
                </div>
              ) : errorDocumentos ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errorDocumentos}</p>
              ) : documentosDisponibles.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No hay documentos disponibles para asociar. Puedes crearlos en Gestión de Documentos.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={filtroDocumentoTexto}
                      onChange={(e) => setFiltroDocumentoTexto(e.target.value)}
                      placeholder="Buscar por código o nombre"
                      className="md:col-span-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={filtroDocumentoTipo}
                      onChange={(e) => setFiltroDocumentoTipo(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todos los tipos</option>
                      {tiposDocumentoDisponibles.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-44 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1 bg-white dark:bg-gray-700">
                    {documentosFiltrados.map((documento) => {
                      const checked = documentosSeleccionados.includes(documento.id);
                      return (
                        <label
                          key={documento.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDocumento(documento.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                            {documento.codigo_documento} - {documento.nombre_documento} (v{documento.version})
                          </span>
                        </label>
                      );
                    })}
                    {documentosFiltrados.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-2">
                        No hay documentos que coincidan con los filtros.
                      </p>
                    )}
                  </div>
                </>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Seleccionados: {documentosSeleccionados.length}
                {criterioSeleccionado?.requiere_evidencia_documental
                  ? ' · Este criterio requiere evidencia documental.'
                  : ''}
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
              {isEdit && cumplimiento && (
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
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success !== '' || serviciosState.data.length === 0 || criteriosDelHook.length === 0}
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
      {/* Confirm dialog para eliminar cumplimiento */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Cumplimiento"
        message="¿Estás seguro de que deseas eliminar este cumplimiento? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default CumplimientoFormModal;
