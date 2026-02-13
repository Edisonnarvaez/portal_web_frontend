import React, { useState, useEffect } from "react";
import { HiUsers, HiPhone, HiUserCircle, HiPlus, HiPencil, HiTrash, HiStar, HiGift, HiMagnifyingGlass, HiSparkles, HiAcademicCap } from "react-icons/hi2";
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { HiOfficeBuilding, HiMail } from "react-icons/hi";
import { FuncionarioService } from "../../application/services/FuncionarioService";
import { FuncionarioCrudService } from "../../application/services/FuncionarioCrudService";
import { ReconocimientoCrudService } from "../../application/services/ReconocimientoCrudService";
import { FelicitacionCrudService } from "../../application/services/FelicitacionCrudService";
import { useMenuPermissions } from "../hooks/useMenuPermissions";
import type { Funcionario, CreateFuncionarioRequest, UpdateFuncionarioRequest, Reconocimiento, FelicitacionCumpleanios, CreateReconocimientoRequest, UpdateReconocimientoRequest, CreateFelicitacionRequest, UpdateFelicitacionRequest } from "../../domain/types";
import CrudModal from "../components/CrudModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import FuncionarioForm from "../components/FuncionarioForm";
import ReconocimientoForm from "../components/ReconocimientoForm";
import FelicitacionForm from "../components/FelicitacionForm";
import { formatBirthdayDate } from "../../../../shared/utils/dateUtils";

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSede, setSelectedSede] = useState<number>(0);
  const [selectedCargo, setSelectedCargo] = useState('');

  // Estados CRUD Funcionarios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  // Estados CRUD Reconocimientos
  const [showCreateReconocimientoModal, setShowCreateReconocimientoModal] = useState(false);
  const [showEditReconocimientoModal, setShowEditReconocimientoModal] = useState(false);
  const [showDeleteReconocimientoModal, setShowDeleteReconocimientoModal] = useState(false);
  const [selectedReconocimiento, setSelectedReconocimiento] = useState<Reconocimiento | null>(null);
  const [funcionarioParaReconocimiento, setFuncionarioParaReconocimiento] = useState<Funcionario | null>(null);

  // Estados CRUD Felicitaciones
  const [showCreateFelicitacionModal, setShowCreateFelicitacionModal] = useState(false);
  const [showEditFelicitacionModal, setShowEditFelicitacionModal] = useState(false);
  const [showDeleteFelicitacionModal, setShowDeleteFelicitacionModal] = useState(false);
  const [selectedFelicitacion, setSelectedFelicitacion] = useState<FelicitacionCumpleanios | null>(null);
  const [funcionarioParaFelicitacion, setFuncionarioParaFelicitacion] = useState<Funcionario | null>(null);

  // Nuevo estado para almacenar las felicitaciones existentes
  const [felicitacionesExistentes, setFelicitacionesExistentes] = useState<FelicitacionCumpleanios[]>([]);

  const funcionarioService = new FuncionarioService();
  const funcionarioCrudService = new FuncionarioCrudService();
  const reconocimientoCrudService = new ReconocimientoCrudService();
  const felicitacionCrudService = new FelicitacionCrudService();
  const permissions = useMenuPermissions("menu");

  useEffect(() => {
    const loadData = async () => {
      await fetchFuncionarios();
      await fetchFelicitaciones();
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = funcionarios;

    if (searchTerm) {
      filtered = funcionarioService.searchFuncionarios(filtered, searchTerm);
    }

    if (selectedSede && selectedSede !== 0) {
      filtered = filtered.filter(funcionario => funcionario.sede.id === selectedSede);
    }

    if (selectedCargo) {
      filtered = filtered.filter(funcionario => funcionario.cargo === selectedCargo);
    }

    setFilteredFuncionarios(filtered);
  }, [funcionarios, searchTerm, selectedSede, selectedCargo, funcionarioService]);

  // Función para cargar las felicitaciones existentes
  const fetchFelicitaciones = async () => {
    try {
      const felicitaciones = await felicitacionCrudService.getAllFelicitaciones();
      setFelicitacionesExistentes(felicitaciones);
    } catch (error) {
      console.error('Error al cargar felicitaciones:', error);
    }
  };

  const fetchFuncionarios = async () => {
    try {
      setLoading(true);
      const data = await funcionarioService.getAllFuncionarios();
      setFuncionarios(data);
      setFilteredFuncionarios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para reconocimientos
  const handleSubmitReconocimiento = async (data: CreateReconocimientoRequest | UpdateReconocimientoRequest) => {
    setCrudLoading(true);
    
    let result;
    if ('id' in data) {
      result = await reconocimientoCrudService.updateReconocimiento(data as UpdateReconocimientoRequest);
      if (result.success) {
        setShowEditReconocimientoModal(false);
        setSelectedReconocimiento(null);
        setFuncionarioParaReconocimiento(null);
      }
    } else {
      result = await reconocimientoCrudService.createReconocimiento(data as CreateReconocimientoRequest);
      if (result.success) {
        setShowCreateReconocimientoModal(false);
        setFuncionarioParaReconocimiento(null);
      }
    }
    
    if (!result.success) {
      console.error('Error en reconocimiento:', result.message);
    }
    
    setCrudLoading(false);
  };

  const handleDeleteReconocimiento = async () => {
    if (!selectedReconocimiento) return;

    setCrudLoading(true);
    const result = await reconocimientoCrudService.deleteReconocimiento(selectedReconocimiento.id);

    if (result.success) {
      setShowDeleteReconocimientoModal(false);
      setSelectedReconocimiento(null);
    } else {
      console.error(result.message);
    }
    setCrudLoading(false);
  };

  // Handlers para felicitaciones
  const handleSubmitFelicitacion = async (data: CreateFelicitacionRequest | UpdateFelicitacionRequest) => {
    setCrudLoading(true);
    
    // Solo permitir actualizaciones
    if ('id' in data) {
      const result = await felicitacionCrudService.updateFelicitacion(data as UpdateFelicitacionRequest);
      if (result.success) {
        setShowEditFelicitacionModal(false);
        setSelectedFelicitacion(null);
        setFuncionarioParaFelicitacion(null);
        // Recargar felicitaciones después de actualizar
        await fetchFelicitaciones();
      } else {
        console.error('Error al actualizar felicitación:', result.message);
      }
    } else {
      console.error('Error: Solo se permiten actualizaciones de felicitaciones');
    }
    
    setCrudLoading(false);
  };

  const handleDeleteFelicitacion = async () => {
    if (!selectedFelicitacion) return;

    setCrudLoading(true);
    const result = await felicitacionCrudService.deleteFelicitacion(selectedFelicitacion.id);

    if (result.success) {
      setShowDeleteFelicitacionModal(false);
      setSelectedFelicitacion(null);
      // Recargar felicitaciones después de eliminar
      await fetchFelicitaciones();
    } else {
      console.error(result.message);
    }
    setCrudLoading(false);
  };

  // Handlers para abrir modales
  const openCreateReconocimientoModal = (funcionario: Funcionario) => {
    setFuncionarioParaReconocimiento(funcionario);
    setShowCreateReconocimientoModal(true);
  };

  // Función modificada para manejar felicitaciones - SOLO EDITAR
  const handleFelicitacionAction = async (funcionario: Funcionario) => {
    // Siempre buscar la felicitación existente (debe existir porque el backend la crea automáticamente)
    const felicitacionExistente = felicitacionesExistentes.find(
      fel => fel.funcionario.id === funcionario.id
    );

    if (felicitacionExistente) {
      // Abrir modal de edición
      setSelectedFelicitacion(felicitacionExistente);
      setFuncionarioParaFelicitacion(funcionario);
      setShowEditFelicitacionModal(true);
    } else {
      // Si por alguna razón no existe, recargar felicitaciones e intentar de nuevo
      console.warn('Felicitación no encontrada, recargando datos...');
      await fetchFelicitaciones();
      
      // Buscar nuevamente después de recargar
      const felicitacionActualizada = felicitacionesExistentes.find(
        fel => fel.funcionario.id === funcionario.id
      );
      
      if (felicitacionActualizada) {
        setSelectedFelicitacion(felicitacionActualizada);
        setFuncionarioParaFelicitacion(funcionario);
        setShowEditFelicitacionModal(true);
      } else {
        console.error('No se encontró la felicitación automática para este funcionario');
        // Opcional: mostrar un mensaje de error al usuario
      }
    }
  };

  // Función para obtener el texto del botón - SIEMPRE "Editar"
  const getFelicitacionButtonText = (funcionario: Funcionario) => {
    return 'Editar';
  };

  // Función para obtener el título del botón - SIEMPRE "Editar"
  const getFelicitacionButtonTitle = (funcionario: Funcionario) => {
    return 'Editar mensaje de felicitación';
  };

  // Función para obtener el ícono del botón - SIEMPRE lápiz
  const getFelicitacionButtonIcon = (funcionario: Funcionario) => {
    return <HiPencil className="w-3 h-3 group-hover/gift:rotate-12 transition-transform duration-300" />;
  };

  // Función para verificar si el funcionario tiene felicitación
  const funcionarioTieneFelicitacion = (funcionario: Funcionario) => {
    return felicitacionesExistentes.some(fel => fel.funcionario.id === funcionario.id);
  };

  // Handlers existentes de funcionarios
  const handleSubmit = async (data: CreateFuncionarioRequest | UpdateFuncionarioRequest) => {
    setCrudLoading(true);
    
    let result;
    if ('id' in data) {
      result = await funcionarioCrudService.updateFuncionario(data as UpdateFuncionarioRequest);
      if (result.success) {
        setShowEditModal(false);
        setSelectedFuncionario(null);
        await fetchFuncionarios();
      }
    } else {
      result = await funcionarioCrudService.createFuncionario(data as CreateFuncionarioRequest);
      if (result.success) {
        setShowCreateModal(false);
        await fetchFuncionarios();
        // Recargar felicitaciones después de crear funcionario (para obtener la felicitación auto-generada)
        await fetchFelicitaciones();
      }
    }
    
    if (!result.success) {
      console.error('Error en funcionario:', result.message);
    }
    
    setCrudLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedFuncionario) return;

    setCrudLoading(true);
    const result = await funcionarioCrudService.deleteFuncionario(selectedFuncionario.id);

    if (result.success) {
      setShowDeleteModal(false);
      setSelectedFuncionario(null);
      fetchFuncionarios();
    } else {
      console.error(result.message);
    }
    setCrudLoading(false);
  };

  const openEditModal = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowEditModal(true);
  };

  const openDeleteModal = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowDeleteModal(true);
  };

  const getProfilePicUrl = (foto: string) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}${foto}`;
  };

  const formatFechaNacimiento = (fecha: string) => {
    return formatBirthdayDate(fecha);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSede(0);
    setSelectedCargo('');
  };

  if (loading) {
    return <LoadingScreen message="Cargando funcionarios..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        
        <div className="relative p-6 flex items-center justify-center min-h-screen">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <HiUsers className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error al cargar funcionarios</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const sedesUnicas = funcionarioService.getUniqueSedes(funcionarios);
  const cargos = funcionarioService.getUniqueValues(funcionarios, 'cargo');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo decorativo animado */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-green-400/5 to-blue-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header moderno */}
          <div className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl transition-all duration-500 group-hover:from-blue-200/50 group-hover:to-indigo-200/50 dark:group-hover:from-blue-800/30 dark:group-hover:to-indigo-800/30"></div>
            
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300 hover:shadow-2xl">
              {/* Header principal */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl">
                      <HiUsers className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-bounce flex items-center justify-center">
                      <HiSparkles className="w-3 h-3 text-green-800" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-700 dark:from-blue-100 dark:via-indigo-200 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                      Directorio de Funcionarios
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Encuentra la información de contacto de todos los miembros del equipo
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {permissions.canCreate && (
                    <button
                      onClick={() => setShowCreateReconocimientoModal(true)}
                      className="group/btn relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <HiStar className="w-5 h-5 relative z-10 group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span className="relative z-10">Reconocimiento</span>
                    </button>
                  )}
                  {permissions.canCreate && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="group/btn relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <HiPlus className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                      <span className="relative z-10">Nuevo funcionario</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Estadísticas mejoradas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-2 border-blue-200/50 dark:border-blue-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mr-4">
                      <HiUsers className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Total Funcionarios</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{funcionarios.length}</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-2 border-green-200/50 dark:border-green-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg mr-4">
                      <HiOfficeBuilding className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">Sedes Activas</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-300">{sedesUnicas.length}</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border-2 border-purple-200/50 dark:border-purple-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg mr-4">
                      <HiAcademicCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-1">Cargos Diferentes</p>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{cargos.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros mejorados */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                      <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar funcionarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <select
                      value={selectedSede}
                      onChange={(e) => setSelectedSede(parseInt(e.target.value) || 0)}
                      className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                    >
                      <option value={0}>Todas las sedes</option>
                      {sedesUnicas.map(sede => (
                        <option key={sede.id} value={sede.id}>
                          {sede.name} - {sede.city}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCargo}
                      onChange={(e) => setSelectedCargo(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                    >
                      <option value="">Todos los cargos</option>
                      {cargos.map(cargo => (
                        <option key={cargo} value={cargo}>{cargo}</option>
                      ))}
                    </select>

                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de funcionarios mejorada */}
          {filteredFuncionarios.length === 0 ? (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl"></div>
              
              <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-16 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-800/50 rounded-3xl mx-auto mb-8 flex items-center justify-center">
                  <HiUsers className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {funcionarios.length === 0 ? "No hay funcionarios registrados" : "No se encontraron funcionarios"}
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {funcionarios.length === 0
                    ? "Aún no hay funcionarios registrados en el sistema. ¡Empieza agregando el primer funcionario!"
                    : "Intenta ajustar los filtros de búsqueda para encontrar los funcionarios que buscas."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredFuncionarios.map((funcionario) => {
                const photoUrl = getProfilePicUrl(funcionario.foto);
                
                return (
                  <div 
                    key={funcionario.id} 
                    className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    {/* Efecto de brillo sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                    
                    {/* Línea de acento superior */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-4">
                      {/* Header compacto */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Foto más pequeña */}
                        <div className="relative flex-shrink-0">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={`${funcionario.nombres} ${funcionario.apellidos}`}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-blue-200 dark:border-blue-600 shadow-sm transition-all duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-blue-200 dark:border-blue-600 shadow-sm bg-blue-50 dark:bg-blue-900/50 transition-all duration-300 group-hover:scale-105 ${photoUrl ? 'hidden' : ''}`}>
                            <HiUserCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                          </div>
                          
                          {/* Indicador online más pequeño */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
                        </div>

                        {/* Información básica */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {funcionario.nombres} {funcionario.apellidos}
                          </h3>
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md">
                            {funcionario.cargo}
                          </span>
                        </div>
                      </div>

                      {/* Información de contacto compacta */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <HiOfficeBuilding className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{funcionario.sede.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <HiPhone className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="truncate">{funcionario.telefono}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <HiMail className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{funcionario.correo}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                          <HiGift className="w-3 h-3 text-pink-500 flex-shrink-0" />
                          <span className="text-xs">{formatFechaNacimiento(funcionario.fecha_nacimiento)}</span>
                        </div>
                      </div>

                      {/* Botones de acción compactos */}
                      {(permissions.canEdit || permissions.canDelete) && (
                        <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          {permissions.canEdit && (
                            <button
                              onClick={() => openEditModal(funcionario)}
                              className="group/edit flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                              title="Editar funcionario"
                            >
                              <HiPencil className="w-3 h-3 group-hover/edit:rotate-12 transition-transform duration-300" />
                              <span className="text-xs">Editar</span>
                            </button>
                          )}
                          
                          {permissions.canDelete && (
                            <button
                              onClick={() => openDeleteModal(funcionario)}
                              className="group/delete flex items-center justify-center px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                              title="Eliminar funcionario"
                            >
                              <HiTrash className="w-3 h-3 group-hover/delete:scale-110 transition-transform duration-300" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Botones de reconocimiento y felicitación */}
                      {permissions.canCreate && (
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => openCreateReconocimientoModal(funcionario)}
                            className="group/star flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                            title="Crear reconocimiento"
                          >
                            <HiStar className="w-3 h-3 group-hover/star:rotate-12 transition-transform duration-300" />
                            <span className="text-xs">Reconocer</span>
                          </button>
                          
                          <button
                            onClick={() => handleFelicitacionAction(funcionario)}
                            className={`group/gift flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                              funcionarioTieneFelicitacion(funcionario)
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            title={getFelicitacionButtonTitle(funcionario)}
                            disabled={!funcionarioTieneFelicitacion(funcionario)}
                          >
                            
                            <HiGift className="w-4 h-4 group-hover/gift:scale-110 transition-transform duration-300" />
                                Felicitar

                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modales CRUD Funcionarios */}
      <CrudModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Funcionario"
        loading={crudLoading}
        submitText="Crear"
      >
        <FuncionarioForm
          onSubmit={handleSubmit}
          loading={crudLoading}
        />
      </CrudModal>

      <CrudModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedFuncionario(null);
        }}
        title="Editar Funcionario"
        loading={crudLoading}
        submitText="Actualizar"
      >
        <FuncionarioForm
          funcionario={selectedFuncionario}
          onSubmit={handleSubmit}
          loading={crudLoading}
        />
      </CrudModal>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedFuncionario(null);
        }}
        onConfirm={handleDelete}
        loading={crudLoading}
        title="Eliminar Funcionario"
        message="¿Estás seguro de que deseas eliminar este funcionario? Esta acción no se puede deshacer."
        itemName={selectedFuncionario ? `${selectedFuncionario.nombres} ${selectedFuncionario.apellidos}` : ''}
      />

      {/* Modales CRUD Reconocimientos */}
      <CrudModal
        isOpen={showCreateReconocimientoModal}
        onClose={() => {
          setShowCreateReconocimientoModal(false);
          setFuncionarioParaReconocimiento(null);
        }}
        title={funcionarioParaReconocimiento ? `Crear Reconocimiento - ${funcionarioParaReconocimiento.nombres} ${funcionarioParaReconocimiento.apellidos}` : "Crear Reconocimiento"}
        loading={crudLoading}
        submitText="Crear Reconocimiento"
      >
        <ReconocimientoForm
          funcionarioPreseleccionado={funcionarioParaReconocimiento}
          funcionarios={funcionarios}
          onSubmit={handleSubmitReconocimiento}
          loading={crudLoading}
        />
      </CrudModal>

      <CrudModal
        isOpen={showEditReconocimientoModal}
        onClose={() => {
          setShowEditReconocimientoModal(false);
          setSelectedReconocimiento(null);
          setFuncionarioParaReconocimiento(null);
        }}
        title="Editar Reconocimiento"
        loading={crudLoading}
        submitText="Actualizar"
      >
        <ReconocimientoForm
          reconocimiento={selectedReconocimiento}
          funcionarios={funcionarios}
          onSubmit={handleSubmitReconocimiento}
          loading={crudLoading}
        />
      </CrudModal>

      <DeleteConfirmModal
        isOpen={showDeleteReconocimientoModal}
        onClose={() => {
          setShowDeleteReconocimientoModal(false);
          setSelectedReconocimiento(null);
        }}
        onConfirm={handleDeleteReconocimiento}
        loading={crudLoading}
        title="Eliminar Reconocimiento"
        message="¿Estás seguro de que deseas eliminar este reconocimiento? Esta acción no se puede deshacer."
        itemName={selectedReconocimiento ? selectedReconocimiento.titulo : ''}
      />

      {/* Modales CRUD Felicitaciones */}
      <CrudModal
        isOpen={showEditFelicitacionModal}
        onClose={() => {
          setShowEditFelicitacionModal(false);
          setSelectedFelicitacion(null);
          setFuncionarioParaFelicitacion(null);
        }}
        title="Editar Mensaje de Felicitación"
        loading={crudLoading}
        submitText="Actualizar Mensaje"
      >
        <FelicitacionForm
          felicitacion={selectedFelicitacion}
          funcionarios={funcionarios}
          onSubmit={handleSubmitFelicitacion}
          loading={crudLoading}
        />
      </CrudModal>

      <DeleteConfirmModal
        isOpen={showDeleteFelicitacionModal}
        onClose={() => {
          setShowDeleteFelicitacionModal(false);
          setSelectedFelicitacion(null);
        }}
        onConfirm={handleDeleteFelicitacion}
        loading={crudLoading}
        title="Eliminar Felicitación"
        message="¿Estás seguro de que deseas eliminar esta felicitación? Esta acción no se puede deshacer."
        itemName={selectedFelicitacion ? "Felicitación de cumpleaños" : ''}
      />
    </div>
  );
}
