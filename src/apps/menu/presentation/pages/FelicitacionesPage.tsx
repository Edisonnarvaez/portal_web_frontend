import React, { useState, useEffect } from "react";
import { HiGift, HiMagnifyingGlass, HiPlus, HiPencil, HiTrash, HiUser, HiCalendarDays, HiSparkles, HiCake, HiHeart } from "react-icons/hi2";
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import { FelicitacionCrudService } from "../../application/services/FelicitacionCrudService";
import { FuncionarioService } from "../../application/services/FuncionarioService";
import { useMenuPermissions } from "../hooks/useMenuPermissions";
import type { FelicitacionCumpleanios, Funcionario, CreateFelicitacionRequest, UpdateFelicitacionRequest } from "../../domain/types";
import CrudModal from "../components/CrudModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import FelicitacionForm from "../components/FelicitacionForm";
import { formatBirthdayDate } from "../../../../shared/utils/dateUtils";

export default function FelicitacionesPage() {
    const [felicitaciones, setFelicitaciones] = useState<FelicitacionCumpleanios[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [filteredFelicitaciones, setFilteredFelicitaciones] = useState<FelicitacionCumpleanios[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados CRUD
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFelicitacion, setSelectedFelicitacion] = useState<FelicitacionCumpleanios | null>(null);
    const [crudLoading, setCrudLoading] = useState(false);

    const menuRepository = new MenuRepository();
    const felicitacionCrudService = new FelicitacionCrudService();
    const funcionarioService = new FuncionarioService();
    const permissions = useMenuPermissions("menu");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = felicitaciones;

        if (searchTerm) {
            filtered = filtered.filter(felicitacion =>
                felicitacion.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${felicitacion.funcionario.nombres} ${felicitacion.funcionario.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredFelicitaciones(filtered);
    }, [felicitaciones, searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [felicitacionesData, funcionariosData] = await Promise.all([
                menuRepository.getAllFelicitaciones(),
                funcionarioService.getAllFuncionarios()
            ]);
            setFelicitaciones(felicitacionesData);
            setFilteredFelicitaciones(felicitacionesData);
            setFuncionarios(funcionariosData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: CreateFelicitacionRequest | UpdateFelicitacionRequest) => {
        setCrudLoading(true);

        let result;
        if ('id' in data) {
            result = await felicitacionCrudService.updateFelicitacion(data as UpdateFelicitacionRequest);
            if (result.success) {
                setShowEditModal(false);
                setSelectedFelicitacion(null);
                fetchData();
            }
        } else {
            result = await felicitacionCrudService.createFelicitacion(data as CreateFelicitacionRequest);
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
        if (!selectedFelicitacion) return;

        setCrudLoading(true);
        const result = await felicitacionCrudService.deleteFelicitacion(selectedFelicitacion.id);

        if (result.success) {
            setShowDeleteModal(false);
            setSelectedFelicitacion(null);
            fetchData();
        } else {
            console.error(result.message);
        }
        setCrudLoading(false);
    };

    const openEditModal = (felicitacion: FelicitacionCumpleanios) => {
        setSelectedFelicitacion(felicitacion);
        setShowEditModal(true);
    };

    const openDeleteModal = (felicitacion: FelicitacionCumpleanios) => {
        setSelectedFelicitacion(felicitacion);
        setShowDeleteModal(true);
    };

    const getProfilePicUrl = (foto: string) => {
        if (!foto) return null;
        if (foto.startsWith('http')) return foto;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000' ;
        return `${baseUrl}${foto}`;
    };

    // Obtener el día del cumpleaños para animaciones especiales
    const getBirthdayDay = (fecha: string) => {
        const today = new Date();
        const birthday = new Date(fecha);
        birthday.setFullYear(today.getFullYear());
        
        const todayStr = today.toDateString();
        const birthdayStr = birthday.toDateString();
        
        return todayStr === birthdayStr;
    };

    if (loading) {
        return <LoadingScreen message="Cargando felicitaciones..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
                
                <div className="relative p-6 flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 text-center">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                            <HiGift className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error al cargar felicitaciones</h3>
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Fondo decorativo animado */}
            <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000"></div>
            <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            
            <div className="relative z-10 p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-5">
                    {/* Header moderno - Responsivo */}
                    <div className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-rose-100/50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl sm:rounded-3xl transition-all duration-500 group-hover:from-pink-200/50 group-hover:to-rose-200/50 dark:group-hover:from-pink-800/30 dark:group-hover:to-rose-800/30"></div>
                        
                        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-5 md:p-6 transition-all duration-300 hover:shadow-2xl">
                            {/* Header principal - Flex column en móvil */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-5">
                                <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                                    <div className="relative">
                                        <div className="p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg">
                                            <HiGift className="w-6 h-6 sm:w-7 md:w-8 lg:w-10 text-white" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                                            <HiSparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-800" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-900 via-rose-800 to-pink-700 dark:from-pink-100 dark:via-rose-200 dark:to-pink-300 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                                            Gestión de Felicitaciones
                                        </h1>
                                        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 line-clamp-1">
                                            Administra las felicitaciones de cumpleaños del personal
                                        </p>
                                    </div>
                                </div>

                                {permissions.canCreate && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="group/btn relative overflow-hidden flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                                        <span className="relative z-10 hidden sm:inline">Nueva felicitación</span>
                                    </button>
                                )}
                            </div>

                            {/* Estadísticas mejoradas - Responsivas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-5">
                                <div className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/30 border border-pink-200/50 dark:border-pink-700/50 p-3 sm:p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 to-rose-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center gap-2.5 sm:gap-3 md:gap-4">
                                        <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-md flex-shrink-0">
                                            <HiGift className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-pink-600 dark:text-pink-400 font-semibold mb-0.5">Total Felicitaciones</p>
                                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-pink-700 dark:text-pink-300">{felicitaciones.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border border-blue-200/50 dark:border-blue-700/50 p-3 sm:p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center gap-2.5 sm:gap-3 md:gap-4">
                                        <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md flex-shrink-0">
                                            <HiUser className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold mb-0.5">Funcionarios</p>
                                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                {new Set(felicitaciones.map(f => f.funcionario.id)).size}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filtros mejorados - Compactos */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg sm:rounded-xl"></div>
                                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-600/50 p-3">
                                    <div className="relative">
                                        <HiMagnifyingGlass className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 sm:w-4 sm:h-4" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de felicitaciones mejorada */}
                    {filteredFelicitaciones.length === 0 ? (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl sm:rounded-3xl"></div>
                            
                            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 sm:p-12 md:p-16 text-center">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/50 dark:to-rose-800/50 rounded-2xl sm:rounded-3xl mx-auto mb-4 sm:mb-8 flex items-center justify-center">
                                    <HiGift className="w-12 h-12 sm:w-16 sm:h-16 text-pink-500 dark:text-pink-400" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4">
                                    {felicitaciones.length === 0 ? "No hay felicitaciones creadas" : "No se encontraron felicitaciones"}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    {felicitaciones.length === 0
                                        ? "Aún no hay felicitaciones de cumpleaños creadas. ¡Empieza creando la primera!"
                                        : "Intenta ajustar el término de búsqueda para encontrar las felicitaciones que buscas."
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                            {filteredFelicitaciones.map((felicitacion) => {
                                const funcionario = felicitacion.funcionario;
                                const photoUrl = getProfilePicUrl(funcionario.foto);
                                const isToday = getBirthdayDay(funcionario.fecha_nacimiento);

                                return (
                                    <div
                                        key={felicitacion.id}
                                        className={`
                                            group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 hover:shadow-xl hover:scale-[1.02] cursor-pointer
                                            ${isToday 
                                                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border border-yellow-300 dark:border-yellow-600 animate-pulse shadow-md shadow-yellow-200/50 dark:shadow-yellow-900/50' 
                                                : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-lg'
                                            }
                                        `}
                                    >
                                        {/* Efecto de brillo en hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                                        
                                        {/* Línea de acento lateral */}
                                        <div className={`absolute left-0 top-0 w-1 h-full transition-all duration-300 group-hover:w-1.5 ${isToday ? 'bg-yellow-500' : 'bg-gradient-to-b from-pink-500 to-rose-600'}`}></div>
                                        
                                        {/* Confetti para cumpleaños de hoy */}
                                        {isToday && (
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                                                <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                                                <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                                                <div className="absolute bottom-2 right-4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                                            </div>
                                        )}
                                        
                                        <div className="relative p-3 sm:p-4 md:p-5">
                                            <div className="flex flex-col gap-3">
                                                {/* Foto y información básica - Compacto */}
                                                <div className="flex items-start gap-3">
                                                    {/* Foto del funcionario más pequeña */}
                                                    <div className="relative flex-shrink-0">
                                                        {photoUrl ? (
                                                            <img
                                                                src={photoUrl}
                                                                alt={`${funcionario.nombres} ${funcionario.apellidos}`}
                                                                className={`
                                                    w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover border-2 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-2
                                                    ${isToday 
                                                        ? 'border-yellow-400 shadow-yellow-200 dark:border-yellow-500 dark:shadow-yellow-800' 
                                                        : 'border-pink-300 dark:border-pink-600 shadow-pink-200/50 dark:shadow-pink-900/50'
                                                    }
                                                `}
                                                            />
                                                        ) : (
                                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center border-2 shadow-md transition-all duration-300 group-hover:scale-105 ${isToday ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400' : 'bg-pink-100 dark:bg-pink-900 border-pink-300'}`}>
                                                                <HiUser className={`w-7 h-7 sm:w-8 sm:h-8 ${isToday ? 'text-yellow-600 dark:text-yellow-400' : 'text-pink-600 dark:text-pink-400'}`} />
                                                            </div>
                                                        )}
                                                        
                                                        {/* Indicador de cumpleaños de hoy */}
                                                        {isToday && (
                                                            <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-md animate-bounce">
                                                                <HiCake className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Información básica */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Tag de cumpleaños */}
                                                        {isToday && (
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <span className="flex items-center gap-0.5 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-md animate-pulse">
                                                                    <HiSparkles className="w-2.5 h-2.5" />
                                                                    ¡CUMPLEAÑOS!
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        <h3 className={`
                                                            text-sm sm:text-base font-bold mb-0.5 transition-colors duration-300 line-clamp-2
                                                            ${isToday 
                                                                ? 'text-yellow-800 dark:text-yellow-200 group-hover:text-yellow-900 dark:group-hover:text-yellow-100' 
                                                                : 'text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400'
                                                            }
                                                        `}>
                                                            {funcionario.nombres} {funcionario.apellidos}
                                                        </h3>
                                                        <div className="flex items-center gap-1 flex-wrap text-xs">
                                                            <span className={`
                                                                px-1.5 py-0.5 font-medium rounded-md line-clamp-1
                                                                ${isToday 
                                                                    ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' 
                                                                    : 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
                                                                }
                                                            `}>
                                                                {funcionario.cargo}
                                                            </span>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="text-gray-600 dark:text-gray-400 font-medium truncate text-xs">
                                                                {funcionario.sede.name}
                                                            </span>
                                                        </div>

                                                        <div className={`
                                                            flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-xs flex-shrink-0 mt-0.5 w-fit
                                                            ${isToday 
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' 
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                            }
                                                        `}>
                                                            <HiCalendarDays className="w-3 h-3" />
                                                            <span className="hidden sm:inline text-xs">{formatBirthdayDate(funcionario.fecha_nacimiento)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Mensaje de felicitación */}
                                                <div className={`
                                                    relative p-2.5 sm:p-3 rounded-lg transition-all duration-300 group-hover:shadow-md text-xs sm:text-sm
                                                    ${isToday 
                                                        ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/50 dark:to-yellow-800/30 border border-yellow-200 dark:border-yellow-700' 
                                                        : 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-800/20 border border-pink-200/50 dark:border-pink-700/50'
                                                    }
                                                `}>
                                                    <div className="absolute top-1.5 left-1.5">
                                                        <HiHeart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isToday ? 'text-yellow-500' : 'text-pink-500'}`} />
                                                    </div>
                                                    <blockquote className={`
                                                        italic leading-relaxed pl-4 line-clamp-3
                                                        ${isToday 
                                                            ? 'text-yellow-800 dark:text-yellow-200' 
                                                            : 'text-pink-800 dark:text-pink-200'
                                                        }
                                                    `}>
                                                        "{felicitacion.mensaje}"
                                                    </blockquote>
                                                </div>

                                                {/* Botones de acción compactos */}
                                                {(permissions.canEdit || permissions.canDelete) && (
                                                    <div className="flex gap-2">
                                                        {permissions.canEdit && (
                                                            <button
                                                                onClick={() => openEditModal(felicitacion)}
                                                                className="flex-1 group/edit flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                                            >
                                                                <HiPencil className="w-3 h-3 group-hover/edit:rotate-12 transition-transform duration-300" />
                                                                <span className="hidden sm:inline">Editar</span>
                                                            </button>
                                                        )}
                                                        {permissions.canDelete && (
                                                            <button
                                                                onClick={() => openDeleteModal(felicitacion)}
                                                                className="flex-1 group/delete flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                                            >
                                                                <HiTrash className="w-3 h-3 group-hover/delete:scale-110 transition-transform duration-300" />
                                                                <span className="hidden sm:inline">Eliminar</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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
                title="Crear Felicitación"
                loading={crudLoading}
                submitText="Crear"
            >
                <FelicitacionForm
                    funcionarios={funcionarios}
                    onSubmit={handleSubmit}
                    loading={crudLoading}
                />
            </CrudModal>

            <CrudModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedFelicitacion(null);
                }}
                title="Editar Felicitación"
                loading={crudLoading}
                submitText="Actualizar"
            >
                <FelicitacionForm
                    felicitacion={selectedFelicitacion}
                    funcionarios={funcionarios}
                    onSubmit={handleSubmit}
                    loading={crudLoading}
                />
            </CrudModal>

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedFelicitacion(null);
                }}
                onConfirm={handleDelete}
                loading={crudLoading}
                title="Eliminar Felicitación"
                message="¿Estás seguro de que deseas eliminar esta felicitación? Esta acción no se puede deshacer."
                itemName={selectedFelicitacion ? `Felicitación para ${selectedFelicitacion.funcionario.nombres} ${selectedFelicitacion.funcionario.apellidos}` : ''}
            />
        </div>
    );
}