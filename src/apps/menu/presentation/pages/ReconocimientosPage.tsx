import React, { useState, useEffect } from "react";
import { HiStar, HiMagnifyingGlass, HiPlus, HiPencil, HiTrash, HiEye, HiCalendarDays, HiUser, HiSparkles, HiTrophy, HiUserCircle } from "react-icons/hi2";
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { HiExclamationCircle } from "react-icons/hi";
import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import { ReconocimientoCrudService } from "../../application/services/ReconocimientoCrudService";
import { FuncionarioService } from "../../application/services/FuncionarioService";
import { useMenuPermissions } from "../hooks/useMenuPermissions";
import type { Reconocimiento, Funcionario, CreateReconocimientoRequest, UpdateReconocimientoRequest } from "../../domain/types";
import CrudModal from "../components/CrudModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ReconocimientoForm from "../components/ReconocimientoForm";
import { formatDisplayDate } from "../../../../shared/utils/dateUtils";

export default function ReconocimientosPage() {
    const [reconocimientos, setReconocimientos] = useState<Reconocimiento[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [filteredReconocimientos, setFilteredReconocimientos] = useState<Reconocimiento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedPublicar, setSelectedPublicar] = useState('');

    // Estados CRUD
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedReconocimiento, setSelectedReconocimiento] = useState<Reconocimiento | null>(null);
    const [crudLoading, setCrudLoading] = useState(false);

    const menuRepository = new MenuRepository();
    const reconocimientoCrudService = new ReconocimientoCrudService();
    const funcionarioService = new FuncionarioService();
    const permissions = useMenuPermissions("menu");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = reconocimientos;

        if (searchTerm) {
            filtered = filtered.filter(reconocimiento =>
                reconocimiento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reconocimiento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${reconocimiento.funcionario.nombres} ${reconocimiento.funcionario.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedTipo) {
            filtered = filtered.filter(reconocimiento => reconocimiento.tipo === selectedTipo);
        }

        if (selectedPublicar !== '') {
            const isPublicar = selectedPublicar === 'true';
            filtered = filtered.filter(reconocimiento => reconocimiento.publicar === isPublicar);
        }

        setFilteredReconocimientos(filtered);
    }, [reconocimientos, searchTerm, selectedTipo, selectedPublicar]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reconocimientosData, funcionariosData] = await Promise.all([
                menuRepository.getAllReconocimientos(),
                funcionarioService.getAllFuncionarios()
            ]);
            setReconocimientos(reconocimientosData);
            setFilteredReconocimientos(reconocimientosData);
            setFuncionarios(funcionariosData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: CreateReconocimientoRequest | UpdateReconocimientoRequest) => {
        setCrudLoading(true);

        let result;
        if ('id' in data) {
            result = await reconocimientoCrudService.updateReconocimiento(data as UpdateReconocimientoRequest);
            if (result.success) {
                setShowEditModal(false);
                setSelectedReconocimiento(null);
                fetchData();
            }
        } else {
            result = await reconocimientoCrudService.createReconocimiento(data as CreateReconocimientoRequest);
            if (result.success) {
                setShowCreateModal(false);
                fetchData();
            }
        }

        if (!result.success) {
            console.error(result.message);
        }

        setCrudLoading(false);
    };

    const handleDelete = async () => {
        if (!selectedReconocimiento) return;

        setCrudLoading(true);
        const result = await reconocimientoCrudService.deleteReconocimiento(selectedReconocimiento.id);

        if (result.success) {
            setShowDeleteModal(false);
            setSelectedReconocimiento(null);
            fetchData();
        } else {
            console.error(result.message);
        }
        setCrudLoading(false);
    };

    const openEditModal = (reconocimiento: Reconocimiento) => {
        setSelectedReconocimiento(reconocimiento);
        setShowEditModal(true);
    };

    const openDeleteModal = (reconocimiento: Reconocimiento) => {
        setSelectedReconocimiento(reconocimiento);
        setShowDeleteModal(true);
    };

    const getProfilePicUrl = (foto: string) => {
        if (!foto) return null;
        if (foto.startsWith('http')) return foto;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        return `${baseUrl}${foto}`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedTipo('');
        setSelectedPublicar('');
    };

    // Obtener tipos únicos
    const tiposUnicos = [...new Set(reconocimientos.map(r => r.tipo).filter(Boolean))];

    if (loading) {
        return <LoadingScreen message="Cargando reconocimientos..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
                
                <div className="relative p-6 flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 text-center">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                            <HiExclamationCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error al cargar reconocimientos</h3>
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Fondo decorativo animado */}
            <div className="fixed inset-0 bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000"></div>
            <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header moderno */}
                    <div className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/50 to-orange-100/50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-3xl transition-all duration-500 group-hover:from-yellow-200/50 group-hover:to-orange-200/50 dark:group-hover:from-yellow-800/30 dark:group-hover:to-orange-800/30"></div>
                        
                        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300 hover:shadow-2xl">
                            {/* Header principal */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl shadow-xl">
                                            <HiStar className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full animate-bounce flex items-center justify-center">
                                            <HiSparkles className="w-3 h-3 text-orange-800" />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-900 via-orange-800 to-yellow-700 dark:from-yellow-100 dark:via-orange-200 dark:to-yellow-300 bg-clip-text text-transparent mb-2">
                                            Gestión de Reconocimientos
                                        </h1>
                                        <p className="text-lg text-gray-600 dark:text-gray-400">
                                            Celebra y reconoce los logros excepcionales de nuestro equipo
                                        </p>
                                    </div>
                                </div>

                                {permissions.canCreate && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="group/btn relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        <HiPlus className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                                        <span className="relative z-10">Nuevo reconocimiento</span>
                                    </button>
                                )}
                            </div>

                            {/* Estadísticas mejoradas */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border-2 border-yellow-200/50 dark:border-yellow-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center">
                                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg mr-4">
                                            <HiStar className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold mb-1">Total Reconocimientos</p>
                                            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{reconocimientos.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-2 border-green-200/50 dark:border-green-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center">
                                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg mr-4">
                                            <HiEye className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">Publicados</p>
                                            <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                                                {reconocimientos.filter(r => r.publicar).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-2 border-blue-200/50 dark:border-blue-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mr-4">
                                            <HiTrophy className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Funcionarios Reconocidos</p>
                                            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                                {new Set(reconocimientos.map(r => r.funcionario.id)).size}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filtros mejorados */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
                                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <div className="relative">
                                            <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Buscar reconocimientos..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-12 pr-6 py-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 transition-all duration-300"
                                            />
                                        </div>

                                        <select
                                            value={selectedTipo}
                                            onChange={(e) => setSelectedTipo(e.target.value)}
                                            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 transition-all duration-300"
                                        >
                                            <option value="">Todos los tipos</option>
                                            {tiposUnicos.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedPublicar}
                                            onChange={(e) => setSelectedPublicar(e.target.value)}
                                            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 transition-all duration-300"
                                        >
                                            <option value="">Estado de publicación</option>
                                            <option value="true">Publicados</option>
                                            <option value="false">No publicados</option>
                                        </select>

                                        <button
                                            onClick={clearFilters}
                                            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                                        >
                                            Limpiar filtros
                                        </button>

                                        <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                                {filteredReconocimientos.length} resultado{filteredReconocimientos.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de reconocimientos mejorada */}
                    {filteredReconocimientos.length === 0 ? (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl"></div>
                            
                            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-16 text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/50 dark:to-orange-800/50 rounded-3xl mx-auto mb-8 flex items-center justify-center">
                                    <HiStar className="w-16 h-16 text-yellow-500 dark:text-yellow-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    {reconocimientos.length === 0 ? "No hay reconocimientos registrados" : "No se encontraron reconocimientos"}
                                </h3>
                                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    {reconocimientos.length === 0
                                        ? "Aún no hay reconocimientos creados. ¡Empieza reconociendo los logros del equipo!"
                                        : "Intenta ajustar los filtros de búsqueda para encontrar los reconocimientos que buscas."
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredReconocimientos.map((reconocimiento) => {
                                const funcionario = reconocimiento.funcionario;
                                const photoUrl = getProfilePicUrl(funcionario.foto);

                                return (
                                    <div 
                                        key={reconocimiento.id} 
                                        className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-white/20 dark:border-gray-700/50 shadow-xl"
                                    >
                                        {/* Efecto de brillo en hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                                        
                                        {/* Línea de acento lateral */}
                                        <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-yellow-500 to-orange-600 transition-all duration-300 group-hover:w-4"></div>
                                        
                                        {/* Efectos de partículas para reconocimientos especiales */}
                                        {reconocimiento.publicar && (
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                                                <div className="absolute top-8 right-8 w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                                <div className="absolute bottom-8 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                                            </div>
                                        )}
                                        
                                        <div className="relative p-8">
                                            <div className="flex items-start gap-6">
                                                {/* Foto del funcionario mejorada */}
                                                <div className="flex-shrink-0 relative">
                                                    <div className="relative">
                                                        {photoUrl ? (
                                                            <img
                                                                src={photoUrl}
                                                                alt={`${funcionario.nombres} ${funcionario.apellidos}`}
                                                                className="w-20 h-20 rounded-2xl object-cover border-4 border-yellow-200 dark:border-yellow-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-yellow-200 dark:border-yellow-600 shadow-lg bg-yellow-100 dark:bg-yellow-900 transition-all duration-300 group-hover:scale-110 ${photoUrl ? 'hidden' : ''}`}>
                                                            <HiUserCircle className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Icono de estrella flotante */}
                                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center">
                                                        <HiStar className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>

                                                {/* Contenido principal */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            {/* Título del reconocimiento */}
                                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">
                                                                {reconocimiento.titulo}
                                                            </h3>
                                                            
                                                            {/* Información del funcionario */}
                                                            <div className="flex items-center gap-4 mb-3">
                                                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                                                                    <HiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                                        {funcionario.nombres} {funcionario.apellidos}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                                    {funcionario.cargo}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Tags de estado */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {reconocimiento.publicar ? (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-700 dark:text-green-300 shadow-sm">
                                                                    <HiEye className="w-4 h-4 mr-1" />
                                                                    Publicado
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 shadow-sm">
                                                                    Borrador
                                                                </span>
                                                            )}

                                                            {reconocimiento.tipo && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 text-yellow-700 dark:text-yellow-300 shadow-sm">
                                                                    <HiTrophy className="w-4 h-4 mr-1" />
                                                                    {reconocimiento.tipo}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Descripción */}
                                                    <div className="p-6 rounded-2xl mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200/50 dark:border-yellow-700/50 transition-all duration-300 group-hover:shadow-md">
                                                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                                            {reconocimiento.descripcion}
                                                        </p>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <HiCalendarDays className="w-4 h-4" />
                                                            <span>{formatDisplayDate(reconocimiento.fecha)}</span>
                                                        </div>

                                                        {/* Botones de acción */}
                                                        {(permissions.canEdit || permissions.canDelete) && (
                                                            <div className="flex gap-2">
                                                                {permissions.canEdit && (
                                                                    <button
                                                                        onClick={() => openEditModal(reconocimiento)}
                                                                        className="group/edit flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                                                    >
                                                                        <HiPencil className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
                                                                        Editar
                                                                    </button>
                                                                )}
                                                                {permissions.canDelete && (
                                                                    <button
                                                                        onClick={() => openDeleteModal(reconocimiento)}
                                                                        className="group/delete flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                                                    >
                                                                        <HiTrash className="w-4 h-4 group-hover/delete:scale-110 transition-transform duration-300" />
                                                                        Eliminar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modales CRUD mejorados */}
            <CrudModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Crear Reconocimiento"
                loading={crudLoading}
                submitText="Crear"
            >
                <ReconocimientoForm
                    funcionarios={funcionarios}
                    onSubmit={handleSubmit}
                    loading={crudLoading}
                />
            </CrudModal>

            <CrudModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedReconocimiento(null);
                }}
                title="Editar Reconocimiento"
                loading={crudLoading}
                submitText="Actualizar"
            >
                <ReconocimientoForm
                    reconocimiento={selectedReconocimiento}
                    funcionarios={funcionarios}
                    onSubmit={handleSubmit}
                    loading={crudLoading}
                />
            </CrudModal>

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedReconocimiento(null);
                }}
                onConfirm={handleDelete}
                loading={crudLoading}
                title="Eliminar Reconocimiento"
                message="¿Estás seguro de que deseas eliminar este reconocimiento? Esta acción no se puede deshacer."
                itemName={selectedReconocimiento ? selectedReconocimiento.titulo : ''}
            />
        </div>
    );
}