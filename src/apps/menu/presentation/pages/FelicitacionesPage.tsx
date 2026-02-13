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
            
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header moderno */}
                    <div className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-rose-100/50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-3xl transition-all duration-500 group-hover:from-pink-200/50 group-hover:to-rose-200/50 dark:group-hover:from-pink-800/30 dark:group-hover:to-rose-800/30"></div>
                        
                        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300 hover:shadow-2xl">
                            {/* Header principal */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl shadow-xl">
                                            <HiGift className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                                            <HiSparkles className="w-3 h-3 text-yellow-800" />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-900 via-rose-800 to-pink-700 dark:from-pink-100 dark:via-rose-200 dark:to-pink-300 bg-clip-text text-transparent mb-2">
                                            Gestión de Felicitaciones
                                        </h1>
                                        <p className="text-lg text-gray-600 dark:text-gray-400">
                                            Administra las felicitaciones de cumpleaños del personal
                                        </p>
                                    </div>
                                </div>

                                {permissions.canCreate && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="group/btn relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        <HiPlus className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                                        <span className="relative z-10">Nueva felicitación</span>
                                    </button>
                                )}
                            </div>

                            {/* Estadísticas mejoradas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/30 border-2 border-pink-200/50 dark:border-pink-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 to-rose-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center">
                                        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg mr-4">
                                            <HiGift className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-pink-600 dark:text-pink-400 font-semibold mb-1">Total Felicitaciones</p>
                                            <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{felicitaciones.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-2 border-blue-200/50 dark:border-blue-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mr-4">
                                            <HiUser className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Funcionarios Felicitados</p>
                                            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                                {new Set(felicitaciones.map(f => f.funcionario.id)).size}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filtros mejorados */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
                                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 p-4">
                                    <div className="relative">
                                        <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Buscar felicitaciones por nombre o mensaje..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-12 pr-6 py-4 w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 transition-all duration-300 text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de felicitaciones mejorada */}
                    {filteredFelicitaciones.length === 0 ? (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl"></div>
                            
                            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-16 text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/50 dark:to-rose-800/50 rounded-3xl mx-auto mb-8 flex items-center justify-center">
                                    <HiGift className="w-16 h-16 text-pink-500 dark:text-pink-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    {felicitaciones.length === 0 ? "No hay felicitaciones creadas" : "No se encontraron felicitaciones"}
                                </h3>
                                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    {felicitaciones.length === 0
                                        ? "Aún no hay felicitaciones de cumpleaños creadas. ¡Empieza creando la primera!"
                                        : "Intenta ajustar el término de búsqueda para encontrar las felicitaciones que buscas."
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredFelicitaciones.map((felicitacion) => {
                                const funcionario = felicitacion.funcionario;
                                const photoUrl = getProfilePicUrl(funcionario.foto);
                                const isToday = getBirthdayDay(funcionario.fecha_nacimiento);

                                return (
                                    <div
                                        key={felicitacion.id}
                                        className={`
                                            group relative overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer
                                            ${isToday 
                                                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border-2 border-yellow-300 dark:border-yellow-600 animate-pulse shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/50' 
                                                : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-white/20 dark:border-gray-700/50 shadow-xl'
                                            }
                                        `}
                                    >
                                        {/* Efecto de brillo en hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                                        
                                        {/* Línea de acento lateral */}
                                        <div className={`absolute left-0 top-0 w-2 h-full transition-all duration-300 group-hover:w-4 ${isToday ? 'bg-yellow-500' : 'bg-gradient-to-b from-pink-500 to-rose-600'}`}></div>
                                        
                                        {/* Confetti para cumpleaños de hoy */}
                                        {isToday && (
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                <div className="absolute top-4 left-8 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                                                <div className="absolute top-8 right-12 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                                                <div className="absolute bottom-8 left-12 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                                                <div className="absolute bottom-4 right-8 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                                            </div>
                                        )}
                                        
                                        <div className="relative p-8">
                                            <div className="flex items-start gap-6">
                                                {/* Foto del funcionario mejorada */}
                                                <div className="relative flex-shrink-0">
                                                    {photoUrl ? (
                                                        <img
                                                            src={photoUrl}
                                                            alt={`${funcionario.nombres} ${funcionario.apellidos}`}
                                                            className={`
                                                                w-20 h-20 rounded-2xl object-cover border-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                                                                ${isToday 
                                                                    ? 'border-yellow-400 shadow-yellow-200 dark:border-yellow-500 dark:shadow-yellow-800' 
                                                                    : 'border-pink-300 dark:border-pink-600 shadow-pink-200/50 dark:shadow-pink-900/50'
                                                                }
                                                            `}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-lg transition-all duration-300 group-hover:scale-110 ${photoUrl ? 'hidden' : ''} ${isToday ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400' : 'bg-pink-100 dark:bg-pink-900 border-pink-300'}`}>
                                                        <HiUser className={`w-10 h-10 ${isToday ? 'text-yellow-600 dark:text-yellow-400' : 'text-pink-600 dark:text-pink-400'}`} />
                                                    </div>
                                                    
                                                    {/* Indicador de cumpleaños de hoy */}
                                                    {isToday && (
                                                        <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg animate-bounce">
                                                            <HiCake className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contenido */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Tag de cumpleaños */}
                                                    {isToday && (
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg animate-pulse">
                                                                <HiSparkles className="w-4 h-4" />
                                                                ¡FELIZ CUMPLEAÑOS!
                                                            </span>
                                                            <div className="animate-bounce text-3xl">🎉</div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className={`
                                                                text-2xl font-bold mb-2 transition-colors duration-300
                                                                ${isToday 
                                                                    ? 'text-yellow-800 dark:text-yellow-200 group-hover:text-yellow-900 dark:group-hover:text-yellow-100' 
                                                                    : 'text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400'
                                                                }
                                                            `}>
                                                                {funcionario.nombres} {funcionario.apellidos}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className={`
                                                                    px-3 py-1 text-sm font-semibold rounded-xl
                                                                    ${isToday 
                                                                        ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' 
                                                                        : 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
                                                                    }
                                                                `}>
                                                                    {funcionario.cargo}
                                                                </span>
                                                                <span className="text-gray-500 dark:text-gray-400">•</span>
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                                    {funcionario.sede.name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className={`
                                                            flex items-center gap-2 px-4 py-2 rounded-xl font-medium
                                                            ${isToday 
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' 
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                            }
                                                        `}>
                                                            <HiCalendarDays className="w-4 h-4" />
                                                            <span>{formatBirthdayDate(funcionario.fecha_nacimiento)}</span>
                                                            {isToday && <span className="ml-2">🎂</span>}
                                                        </div>
                                                    </div>

                                                    {/* Mensaje de felicitación mejorado */}
                                                    <div className={`
                                                        relative p-6 rounded-2xl mb-6 transition-all duration-300 group-hover:shadow-md
                                                        ${isToday 
                                                            ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/50 dark:to-yellow-800/30 border-2 border-yellow-200 dark:border-yellow-700' 
                                                            : 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-800/20 border-2 border-pink-200/50 dark:border-pink-700/50'
                                                        }
                                                    `}>
                                                        <div className="absolute top-4 left-4">
                                                            <HiHeart className={`w-5 h-5 ${isToday ? 'text-yellow-500' : 'text-pink-500'}`} />
                                                        </div>
                                                        <blockquote className={`
                                                            text-lg italic leading-relaxed pl-8
                                                            ${isToday 
                                                                ? 'text-yellow-800 dark:text-yellow-200' 
                                                                : 'text-pink-800 dark:text-pink-200'
                                                            }
                                                        `}>
                                                            "{felicitacion.mensaje}"
                                                        </blockquote>
                                                    </div>

                                                    {/* Botones de acción mejorados */}
                                                    {(permissions.canEdit || permissions.canDelete) && (
                                                        <div className="flex gap-3">
                                                            {permissions.canEdit && (
                                                                <button
                                                                    onClick={() => openEditModal(felicitacion)}
                                                                    className="group/edit flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                                                >
                                                                    <HiPencil className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
                                                                    Editar
                                                                </button>
                                                            )}
                                                            {permissions.canDelete && (
                                                                <button
                                                                    onClick={() => openDeleteModal(felicitacion)}
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