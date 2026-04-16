import React, { useState, useRef, useEffect } from 'react';
import type { SoporteDocumentalCreate } from '../../domain/entities/SoporteDocumental';
import { useSoporte } from '../hooks/useSoporte';
import { useDatosPrestador } from '../hooks/useDatosPrestador';
import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';

interface SoporteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (soporte: any) => void;
  prestadorId: number; // ✅ NUEVO: Requerido - Prestador propietario
  nivel?: 'EMPRESA' | 'SEDE' | 'SERVICIO'; // ✅ Ahora opcional - usuario puede seleccionar
  contextId?: number; // ✅ Ahora opcional - usuario puede ingresar
}

interface Empresa {
  id: number;
  name: string;
}

interface Sede {
  id: number;
  nombre_prestador?: string;
  razon_social?: string;
  nombre?: string;
  name?: string;
  company_detail?: { id: number; name: string };
  headquarters_detail?: { id: number; name: string };
}

interface Servicio {
  id: number;
  nombre?: string;
  nombre_servicio?: string;
  nombre_completo?: string;
  codigo_servicio?: string;
  descripcion?: string;
  sede?: number;
}

interface DatosPrestador {
  id: number;
  nombre_prestador?: string;
  nombre?: string;
}

/**
 * Modal component for uploading supporting documents
 * Handles file selection, validation, and upload with progress tracking
 */
const SoporteUploadModal: React.FC<SoporteUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  prestadorId, // ✅ NUEVO
  nivel: initialNivel = 'EMPRESA', // ✅ Default a EMPRESA
  contextId: initialContextId = 0,
}) => {
  // ========== STATE ==========
  const [nivelSeleccionado, setNivelSeleccionado] = useState<'EMPRESA' | 'SEDE' | 'SERVICIO'>(initialNivel);
  const [contextId, setContextId] = useState<number>(initialContextId);
  const [categoriaId, setCategoriaId] = useState<number | ''>(''); // ✅ NUEVO: Selector de categoría
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumentoId, setTipoDocumentoId] = useState<number | ''>('');
  const [fechaEmision, setFechaEmision] = useState<string>('');
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(''); // ✅ NUEVO
  const [observaciones, setObservaciones] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ NUEVO: Estados para datos dinámicos
  const [prestadorNombre, setPrestadorNombre] = useState<string>('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number>(0);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<number>(0);
  const [prestadorSedeId, setPrestadorSedeId] = useState<number>(0); // ✅ NUEVO: Prestador de la sede seleccionada
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(false);

  const { uploadSoporte, categorias, tiposDocumento, loading: loadingTipos, fetchTipos, fetchCategorias } = useSoporte(); // ✅ NUEVO: + categorias, fetchCategorias
  const { getPrestador } = useDatosPrestador(); // ✅ NUEVO: Para obtener nombre del prestador

  // ✅ FILTRO MEJORADO: Filtrar tipos por nivel_aplica (REQUERIDO) + categoría opcional
  // ✅ Backend valida que tipo.nivel_aplica === soporte.nivel
  const tiposFiltrados = tiposDocumento.filter(
    (tipo) => {
      const matcheLevel = tipo.nivel_aplica === nivelSeleccionado;
      const matchCategory = categoriaId === '' || tipo.categoria === Number(categoriaId);
      return matcheLevel && matchCategory;
    }
  );

  // ✅ VALIDACIONES: Tipos disponibles por nivel
  const tiposDisponiblesPorNivel = tiposDocumento.filter(
    (tipo) => tipo.nivel_aplica === nivelSeleccionado
  );

  // Load types and categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTipos().catch(err => {
        console.error('Error loading document types:', err);
      });
      fetchCategorias().catch(err => { // ✅ NUEVO
        console.error('Error loading categories:', err);
      });
    }
  }, [isOpen, fetchTipos, fetchCategorias]);

  // ✅ NUEVO: Cargar nombre del prestador
  useEffect(() => {
    if (isOpen && prestadorId) {
      const loadPrestadorData = async () => {
        try {
          setLoadingData(true);
          console.log('📍 Cargando datos del prestador ID:', prestadorId);
          const prestadorData = await getPrestador(prestadorId);
          console.log('✅ Prestador cargado:', prestadorData);
          setPrestadorNombre(prestadorData.nombre_prestador || `ID: ${prestadorId}`);
        } catch (error) {
          console.error('❌ Error loading prestador data:', error);
          setPrestadorNombre(`ID: ${prestadorId}`);
        } finally {
          setLoadingData(false);
        }
      };
      loadPrestadorData();
    }
  }, [isOpen, prestadorId, getPrestador]);

  // ✅ NUEVO: Cargar empresas SIEMPRE (necesarias en todos los casos)
  useEffect(() => {
    if (isOpen) {
      const loadEmpresas = async () => {
        try {
          setLoadingData(true);
          const response = await axiosInstance.get('/companies/companies/');
          const empresasData = Array.isArray(response.data) ? response.data : response.data?.results || [];
          setEmpresas(empresasData);
        } catch (error) {
          console.error('Error loading empresas:', error);
          setEmpresas([]);
        } finally {
          setLoadingData(false);
        }
      };
      loadEmpresas();
    }
  }, [isOpen]);

  // ✅ NUEVO: Cargar DatosPrestador (Sedes/Prestadores) cuando nivel es SEDE o SERVICIO
  // Filtrar por empresa seleccionada
  useEffect(() => {
    if (isOpen && (nivelSeleccionado === 'SEDE' || nivelSeleccionado === 'SERVICIO')) {
      const loadSedes = async () => {
        try {
          setLoadingData(true);
          console.log('📍 Cargando prestadores (sedes) para empresa:', empresaSeleccionada);
          
          // Cargar DatosPrestador (estos son los "Prestadores/Sedes" pertenecientes a la empresa)
          const params: any = {};
          if (empresaSeleccionada > 0) {
            // Filtrar por company usando company_detail relación
            params.company_detail__id = empresaSeleccionada;
          }
          const response = await axiosInstance.get('/habilitacion/prestadores/', { params });
          const sedesData = Array.isArray(response.data) ? response.data : response.data?.results || [];
          console.log('✅ Prestadores/Sedes cargados:', sedesData);
          // 🔍 DEBUG: Mostrar estructura exacta del primer elemento
          if (sedesData.length > 0) {
            console.log('🔍 ESTRUCTURA DEL PRIMER PRESTADOR/SEDE:');
            console.log(JSON.stringify(sedesData[0], null, 2));
            console.log('📋 CAMPOS DISPONIBLES:', Object.keys(sedesData[0]));
          }
          setSedes(sedesData);
          setSedeSeleccionada(0); // Reset sede
          setServicios([]); // Reset servicios
        } catch (error) {
          console.error('❌ Error loading sedes:', error);
          setSedes([]);
        } finally {
          setLoadingData(false);
        }
      };
      loadSedes();
    }
  }, [isOpen, nivelSeleccionado, empresaSeleccionada]);

  // ✅ NUEVO: Cuando se selecciona una sede (DatosPrestador), usar su ID directamente
  useEffect(() => {
    if (sedeSeleccionada > 0) {
      console.log('📍 Sede (DatosPrestador) seleccionada:', sedeSeleccionada);
      // sedeSeleccionada ya ES el ID del DatosPrestador, así que usarlo directamente
      setPrestadorSedeId(sedeSeleccionada);
    }
  }, [sedeSeleccionada]);

  // ✅ NUEVO: Cargar servicios usando el prestador_id de la sede
  useEffect(() => {
    if (isOpen && nivelSeleccionado === 'SERVICIO' && prestadorSedeId > 0) {
      const loadServicios = async () => {
        try {
          setLoadingData(true);
          console.log('📍 Cargando servicios para prestador:', prestadorSedeId);
          const response = await axiosInstance.get('/habilitacion/servicios/', {
            params: { prestador: prestadorSedeId }
          });
          console.log('✅ Servicios cargados:', response.data);
          const serviciosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
          // 🔍 DEBUG: Mostrar estructura exacta del primer elemento
          if (serviciosData.length > 0) {
            console.log('🔍 ESTRUCTURA DEL PRIMER SERVICIO:');
            console.log(JSON.stringify(serviciosData[0], null, 2));
            console.log('📋 CAMPOS DISPONIBLES:', Object.keys(serviciosData[0]));
          }
          console.log('📊 Servicios filtrados:', serviciosData);
          setServicios(serviciosData);
          setServicioSeleccionado(0); // Reset servicio
        } catch (error) {
          console.error('❌ Error loading servicios:', error);
          setServicios([]);
        } finally {
          setLoadingData(false);
        }
      };
      loadServicios();
    }
  }, [isOpen, nivelSeleccionado, prestadorSedeId]);

  if (!isOpen) return null;

  // 🔧 FUNCIONES AUXILIARES: Extraer nombres de forma robusta
  const getSedeDisplayName = (sede: Sede): string => {
    // Intenta múltiples campos en orden de prioridad
    if (sede.nombre_prestador) return sede.nombre_prestador;
    if (sede.razon_social) return sede.razon_social;
    if (sede.nombre) return sede.nombre;
    if (sede.name) return sede.name;
    // Si nada funciona, muestra el ID
    return `Prestador ${sede.id}`;
  };

  const getServicioDisplayName = (servicio: Servicio): string => {
    // Intenta múltiples campos en orden de prioridad
    if (servicio.nombre) return servicio.nombre;
    if (servicio.nombre_servicio) return servicio.nombre_servicio;
    if (servicio.descripcion) return (servicio as any).descripcion;
    if (servicio.nombre_completo) return (servicio as any).nombre_completo;
    // Si nada funciona, muestra el código
    return `Servicio ${servicio.codigo_servicio || servicio.id}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('El archivo no puede exceder 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Tipo de archivo no permitido. Use PDF, JPG, PNG o DOC');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !tipoDocumentoId) {
      setUploadError('Por favor seleccione un archivo y tipo de documento');
      return;
    }

    // ✅ VALIDAR: Determinar contextId según nivel
    let finalContextId: number = 0;
    if (nivelSeleccionado === 'EMPRESA') {
      finalContextId = empresaSeleccionada;
      if (!finalContextId || empresas.length === 0) {
        setUploadError('Por favor seleccione una empresa válida.');
        return;
      }
    } else if (nivelSeleccionado === 'SEDE') {
      // Validar que ambos empresa y sede estén seleccionados
      if (!empresaSeleccionada || empresaSeleccionada <= 0) {
        setUploadError('Por favor seleccione una empresa válida.');
        return;
      }
      finalContextId = sedeSeleccionada;
      if (!sedeSeleccionada || sedeSeleccionada <= 0 || sedes.length === 0) {
        setUploadError('Por favor seleccione una sede válida.');
        return;
      }
    } else if (nivelSeleccionado === 'SERVICIO') {
      // Validar que empresa, sede y servicio estén seleccionados
      if (!empresaSeleccionada || empresaSeleccionada <= 0) {
        setUploadError('Por favor seleccione una empresa válida.');
        return;
      }
      if (!sedeSeleccionada || sedeSeleccionada <= 0) {
        setUploadError('Por favor seleccione una sede primero.');
        return;
      }
      finalContextId = servicioSeleccionado;
      if (!finalContextId || servicios.length === 0) {
        setUploadError('Por favor seleccione un servicio válido.');
        return;
      }
    }

    // ✅ VALIDAR: Nivel y context ID (doble validación)
    if (!nivelSeleccionado || finalContextId <= 0) {
      setUploadError(`Por favor seleccione ${nivelSeleccionado.toLowerCase()} válido (ID debe ser > 0)`);
      return;
    }

    // ✅ VALIDACIÓN CRÍTICA: Verificar que el tipo tiene nivel_aplica que coincida
    const tipoSeleccionado = tiposFiltrados.find(t => t.id === Number(tipoDocumentoId));
    if (!tipoSeleccionado) {
      setUploadError('Tipo seleccionado no válido para este nivel. Seleccione otro.');
      return;
    }
    if (tipoSeleccionado.nivel_aplica !== nivelSeleccionado) {
      setUploadError(
        `El tipo "${tipoSeleccionado.nombre}" aplica solo para nivel ${tipoSeleccionado.nivel_aplica}, no ${nivelSeleccionado}`
      );
      return;
    }

    // ✅ VALIDAR: Si el tipo requiere vencimiento, debe estar completo
    if (tipoSeleccionado.requiere_vencimiento && !fechaVencimiento) {
      setUploadError('Este documento requiere una fecha de vencimiento');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Simulate progress for UX feedback
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 200);

      // ✅ Construir objeto solo con campos necesarios (evitar undefined)
      const soporteDataBase: any = {
        prestador: prestadorId,
        tipo_documento: tipoDocumentoId as number,
        nivel: nivelSeleccionado,
        archivo: selectedFile,
      };

      // ✅ Agregar contexto según nivel
      // Caso 1: EMPRESA - solo empresa
      if (nivelSeleccionado === 'EMPRESA' && empresaSeleccionada > 0) {
        soporteDataBase.empresa = empresaSeleccionada;
      }
      // Caso 2: SEDE - empresa + sede
      else if (nivelSeleccionado === 'SEDE') {
        if (empresaSeleccionada > 0) soporteDataBase.empresa = empresaSeleccionada;
        if (sedeSeleccionada > 0) soporteDataBase.sede = sedeSeleccionada;
      }
      // Caso 3: SERVICIO - empresa + sede + servicio
      else if (nivelSeleccionado === 'SERVICIO') {
        if (empresaSeleccionada > 0) soporteDataBase.empresa = empresaSeleccionada;
        if (sedeSeleccionada > 0) soporteDataBase.sede = sedeSeleccionada;
        if (servicioSeleccionado > 0) soporteDataBase.servicio = servicioSeleccionado;
      }

      // ✅ Agregar fechas opcionales
      if (fechaEmision) soporteDataBase.fecha_emision = fechaEmision;
      if (fechaVencimiento) soporteDataBase.fecha_vencimiento = fechaVencimiento;
      if (observaciones) soporteDataBase.observaciones = observaciones;

      const soporteData: SoporteDocumentalCreate = soporteDataBase;

      // 📍 DEBUG: Log datos que se envían
      console.log('📤 Enviando soporte:', {
        prestador: soporteData.prestador,
        tipo_documento: soporteData.tipo_documento,
        nivel: soporteData.nivel,
        empresa: (soporteData as any).empresa,
        sede: (soporteData as any).prestador,
        servicio: (soporteData as any).servicio,
        archivo: soporteData.archivo?.name,
        fecha_emision: soporteData.fecha_emision,
        fecha_vencimiento: soporteData.fecha_vencimiento,
      });

      const result = await uploadSoporte(soporteData as any);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setCategoriaId(''); // ✅ NUEVO
        setTipoDocumentoId('');
        setFechaEmision('');
        setFechaVencimiento(''); // ✅ LIMPIAR
        setObservaciones('');
        setNivelSeleccionado(initialNivel);
        setEmpresaSeleccionada(0);
        setSedeSeleccionada(0);
        setServicioSeleccionado(0);
        setUploadProgress(0);

        if (onUploadSuccess) {
          onUploadSuccess(result);
        }

        onClose();
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      
      // 📍 DEBUG: Log error detallado
      console.error('❌ Error al cargar soporte:', error);
      if (error instanceof Error) {
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
      }
      
      // Mostrar error más detallado
      let errorMessage = 'Error al cargar el archivo';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Si es error de red, intenta extraer más detalles
        if (error.message.includes('404')) {
          errorMessage = 'Error: Endpoint no encontrado. Verificar servidor.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Error: Datos inválidos. Verifica los campos.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Error: No tienes permisos para cargar documentos.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Error: Problema en el servidor. Intenta más tarde.';
        }
      }
      
      setUploadError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setCategoriaId(''); // ✅ NUEVO
      setTipoDocumentoId('');
      setFechaEmision('');
      setFechaVencimiento(''); // ✅ LIMPIAR
      setObservaciones('');
      setNivelSeleccionado(initialNivel);
      setEmpresaSeleccionada(0);
      setSedeSeleccionada(0);
      setPrestadorSedeId(0); // ✅ NUEVO
      setServicioSeleccionado(0);
      setUploadError(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2 lg:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[95vh] overflow-y-auto">
        {/* Header - Responsive */}
        <div className="sticky top-0 bg-blue-600 dark:bg-blue-700 text-white p-2 sm:p-3 lg:p-4 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold">Cargar Documento</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-white hover:text-gray-200 text-xl sm:text-2xl disabled:opacity-50 ml-2 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content - Responsive Padding */}
        <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
          {/* Prestador Info - ✅ ACTUALIZADO con nombre */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide font-medium">Prestador</p>
            <p className="text-xs sm:text-sm text-purple-900 dark:text-purple-100 font-semibold mt-1">
              {prestadorNombre || `Cargando...`}
            </p>
          </div>

          {/* Level Selection - ✅ PERMITE SELECTOR */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
              Nivel de Documento *
            </label>
            <select
              value={nivelSeleccionado}
              onChange={(e) => {
                setNivelSeleccionado(e.target.value as 'EMPRESA' | 'SEDE' | 'SERVICIO');
                setTipoDocumentoId(''); // Reset tipo cuando cambia nivel
                setEmpresaSeleccionada(0);
                setSedeSeleccionada(0);
                setPrestadorSedeId(0);
                setServicioSeleccionado(0);
              }}
              disabled={isUploading || loadingData}
              className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            >
              <option value="EMPRESA">Empresa</option>
              <option value="SEDE">Sede</option>
              <option value="SERVICIO">Servicio</option>
            </select>
          </div>

          {/* ✅ NUEVO: Selector dinámico según nivel - EMPRESA */}
          {nivelSeleccionado === 'EMPRESA' && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                Empresa *
              </label>
              <select
                value={empresaSeleccionada || ''}
                onChange={(e) => setEmpresaSeleccionada(parseInt(e.target.value) || 0)}
                disabled={isUploading || loadingData}
                className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              >
                <option value="">Seleccione una empresa</option>
                {loadingData ? (
                  <option disabled>Cargando empresas...</option>
                ) : (
                  empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.name} (ID: {empresa.id})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* ✅ NUEVO: Selector dinámico según nivel - SEDE */}
          {nivelSeleccionado === 'SEDE' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                  Empresa *
                </label>
                <select
                  value={empresaSeleccionada || ''}
                  onChange={(e) => {
                    setEmpresaSeleccionada(parseInt(e.target.value) || 0);
                    setSedeSeleccionada(0); // Reset sede when empresa changes
                    setPrestadorSedeId(0); // ✅ NUEVO
                  }}
                  disabled={isUploading || loadingData}
                  className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="">Seleccione una empresa</option>
                  {loadingData ? (
                    <option disabled>Cargando empresas...</option>
                  ) : (
                    empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.name} (ID: {empresa.id})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                  Sede *
                </label>
                <select
                  value={sedeSeleccionada || ''}
                  onChange={(e) => setSedeSeleccionada(parseInt(e.target.value) || 0)}
                  disabled={isUploading || loadingData || empresaSeleccionada === 0}
                  className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="">
                    {empresaSeleccionada === 0
                      ? 'Primero seleccione una empresa'
                      : loadingData
                      ? 'Cargando sedes...'
                      : 'Seleccione una sede'}
                  </option>
                  {sedes.map(sede => (
                    <option key={sede.id} value={sede.id}>
                      {getSedeDisplayName(sede)} (ID: {sede.id})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* ✅ NUEVO: Selectores dinámicos según nivel - SERVICIO */}
          {nivelSeleccionado === 'SERVICIO' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                  Empresa *
                </label>
                <select
                  value={empresaSeleccionada || ''}
                  onChange={(e) => {
                    setEmpresaSeleccionada(parseInt(e.target.value) || 0);
                    setSedeSeleccionada(0); // Reset sede when empresa changes
                    setPrestadorSedeId(0);
                    setServicioSeleccionado(0); // Reset servicio
                  }}
                  disabled={isUploading || loadingData}
                  className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="">Seleccione una empresa</option>
                  {loadingData ? (
                    <option disabled>Cargando empresas...</option>
                  ) : (
                    empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.name} (ID: {empresa.id})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                  Sede *
                </label>
                <select
                  value={sedeSeleccionada || ''}
                  onChange={(e) => {
                    setSedeSeleccionada(parseInt(e.target.value) || 0);
                    setServicioSeleccionado(0); // Reset servicio
                  }}
                  disabled={isUploading || loadingData || empresaSeleccionada === 0}
                  className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="">
                    {empresaSeleccionada === 0
                      ? 'Primero seleccione una empresa'
                      : loadingData
                      ? 'Cargando sedes...'
                      : 'Seleccione una sede'}
                  </option>
                  {sedes.map(sede => (
                    <option key={sede.id} value={sede.id}>
                      {getSedeDisplayName(sede)} (ID: {sede.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                  Servicio *
                </label>
                <select
                  value={servicioSeleccionado || ''}
                  onChange={(e) => setServicioSeleccionado(parseInt(e.target.value) || 0)}
                  disabled={isUploading || loadingData || sedeSeleccionada === 0 || servicios.length === 0}
                  className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="">
                    {sedeSeleccionada === 0 
                      ? 'Primero seleccione una sede' 
                      : loadingData 
                      ? 'Cargando servicios...' 
                      : 'Seleccione un servicio'}
                  </option>
                  {servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id}>
                      {getServicioDisplayName(servicio)} ({servicio.codigo_servicio})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Category Selection - ✅ NUEVO */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
              Categoría (opcional)
            </label>
            <select
              value={categoriaId}
              onChange={(e) => {
                setCategoriaId(e.target.value ? Number(e.target.value) : '');
                setTipoDocumentoId(''); // Reset tipo when category changes
              }}
              disabled={isUploading || categorias.length === 0}
              className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            >
              <option value="">Ver todos los tipos...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Selecciona una categoría para filtrar tipos
            </p>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
              Tipo de Documento *
              {tiposDisponiblesPorNivel.length > 0 && (
                <span className="text-xs font-normal text-gray-500">
                  {' '}({tiposDisponiblesPorNivel.length} disponible
                  {tiposDisponiblesPorNivel.length !== 1 ? 's' : ''} para {nivelSeleccionado})
                </span>
              )}
            </label>
            {loadingTipos && (
              <div className="w-full px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                ⏳ Cargando tipos...
              </div>
            )}
            {!loadingTipos && tiposFiltrados.length === 0 && (
              <div className="w-full px-2 sm:px-3 py-2 border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                  ⚠️ Sin tipos disponibles para {nivelSeleccionado}
                </p>
                {categoriaId && tiposDisponiblesPorNivel.length > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Intenta limpiando el filtro de categoría
                  </p>
                )}
              </div>
            )}
            {!loadingTipos && tiposFiltrados.length > 0 && (
              <select
                value={tipoDocumentoId}
                onChange={(e) => setTipoDocumentoId(e.target.value ? Number(e.target.value) : '')}
                disabled={isUploading || loadingTipos || tiposFiltrados.length === 0}
                className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              >
                <option value="">Seleccionar tipo...</option>
                {tiposFiltrados.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                    {tipo.es_obligatorio ? ' (Oblig.)' : ''}
                    {tipo.requiere_vencimiento ? ' [Vencible]' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* File Input */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
              Archivo *
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 sm:p-3 text-center hover:border-blue-400 transition min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
              {selectedFile ? (
                <div className="space-y-1 w-full">
                  <div className="text-xl sm:text-2xl">📄</div>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" title={selectedFile.name}>{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium underline disabled:opacity-50"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div
                  className="cursor-pointer space-y-1 w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-2xl sm:text-3xl">📁</div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Haz clic aquí</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Máx. 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
              Fecha de Emisión (opcional)
            </label>
            <input
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
              disabled={isUploading}
              className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Fecha de emisión del documento
            </p>
          </div>

          {/* Expiration Warning - ✅ NUEVO */}
          {tipoDocumentoId && tiposFiltrados.find(t => t.id === Number(tipoDocumentoId))?.requiere_vencimiento && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                ⏰ Requiere fecha de vencimiento
              </p>
            </div>
          )}

          {/* Fecha Vencimiento - ✅ NUEVO - Mostrar cuando sea requerido */}
          {tipoDocumentoId && tiposFiltrados.find(t => t.id === Number(tipoDocumentoId))?.requiere_vencimiento && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 mb-1 sm:mb-1.5">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={isUploading}
                className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-2 border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={isUploading}
              placeholder="Notas..."
              className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 resize-none"
              rows={2}
            />
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">❌ {uploadError}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {/* Action Buttons - Responsive */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !tipoDocumentoId}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              {isUploading ? '⏳ Cargando...' : '📤 Cargar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoporteUploadModal;
