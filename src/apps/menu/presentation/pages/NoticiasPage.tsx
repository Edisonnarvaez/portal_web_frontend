import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingScreen from '../../../../shared/components/LoadingScreen';
import { HiMagnifyingGlass, HiPlus, HiPencil, HiTrash, HiCalendar, HiEye, HiBolt, HiSparkles, HiNewspaper, HiArrowLeft } from "react-icons/hi2";
import { HiSpeakerphone } from "react-icons/hi";
import { HiExclamationCircle } from "react-icons/hi";
import { ContenidoService } from "../../application/services/ContenidoService";
import { ContenidoCrudService } from "../../application/services/ContenidoCrudService";
import { useMenuPermissions } from "../hooks/useMenuPermissions";
import type { ContenidoInformativo, CreateContenidoRequest, UpdateContenidoRequest } from "../../domain/types";
import CrudModal from "../components/CrudModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ContenidoForm from "../components/ContenidoForm";
import { formatDisplayDate } from "../../../../shared/utils/dateUtils";

export default function NoticiasPage() {
  const { id } = useParams();
  const [contenidos, setContenidos] = useState<ContenidoInformativo[]>([]);
  const [contenidoDetalle, setContenidoDetalle] = useState<ContenidoInformativo | null>(null);
  const [filteredContenidos, setFilteredContenidos] = useState<ContenidoInformativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Estados CRUD
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContenido, setSelectedContenido] = useState<ContenidoInformativo | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  const contenidoService = new ContenidoService();
  const contenidoCrudService = new ContenidoCrudService();
  const permissions = useMenuPermissions("menu");

  useEffect(() => {
    if (id) {
      fetchContenidoDetalle(parseInt(id));
    } else {
      fetchContenidos();
    }
  }, [id]);

  useEffect(() => {
    let filtered = contenidos;

    if (searchTerm) {
      filtered = filtered.filter(contenido =>
        contenido.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contenido.contenido.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTipo) {
      filtered = filtered.filter(contenido => contenido.tipo === selectedTipo);
    }

    if (urgentOnly) {
      filtered = filtered.filter(contenido => contenido.urgente);
    }

    setFilteredContenidos(filtered);
  }, [contenidos, searchTerm, selectedTipo, urgentOnly]);

  const fetchContenidos = async () => {
    try {
      setLoading(true);
      const data = await contenidoService.getAllContenidos();
      setContenidos(data);
      setFilteredContenidos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContenidoDetalle = async (contenidoId: number) => {
    try {
      setLoading(true);
      const data = await contenidoService.getContenidoById(contenidoId);
      setContenidoDetalle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateContenidoRequest | UpdateContenidoRequest) => {
    setCrudLoading(true);

    let result;
    if ('id' in data) {
      result = await contenidoCrudService.updateContenido(data as UpdateContenidoRequest);
      if (result.success) {
        setShowEditModal(false);
        setSelectedContenido(null);
        fetchContenidos();
      }
    } else {
      result = await contenidoCrudService.createContenido(data as CreateContenidoRequest);
      if (result.success) {
        setShowCreateModal(false);
        fetchContenidos();
      }
    }

    if (!result.success) {
      console.error(result.message);
    }

    setCrudLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedContenido) return;

    setCrudLoading(true);
    const result = await contenidoCrudService.deleteContenido(selectedContenido.id);

    if (result.success) {
      setShowDeleteModal(false);
      setSelectedContenido(null);
      fetchContenidos();
    } else {
      console.error(result.message);
    }
    setCrudLoading(false);
  };

  const openEditModal = (contenido: ContenidoInformativo) => {
    setSelectedContenido(contenido);
    setShowEditModal(true);
  };

  const openDeleteModal = (contenido: ContenidoInformativo) => {
    setSelectedContenido(contenido);
    setShowDeleteModal(true);
  };

  const formatFecha = (fecha: string) => {
    return formatDisplayDate(fecha, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'comunicado' ? HiSpeakerphone : HiNewspaper;
  };

  const getTipoBgColor = (tipo: string, urgente: boolean) => {
    if (urgente) return 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-200/50 dark:border-red-700/50';
    return tipo === 'comunicado' 
      ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200/50 dark:border-blue-700/50' 
      : 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 border-emerald-200/50 dark:border-emerald-700/50';
  };

  const getIconBgColor = (tipo: string, urgente: boolean) => {
    if (urgente) return 'bg-gradient-to-br from-red-500 to-red-600';
    return tipo === 'comunicado' 
      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
      : 'bg-gradient-to-br from-emerald-500 to-emerald-600';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTipo('');
    setUrgentOnly(false);
  };

  if (loading) {
    return <LoadingScreen message="Cargando noticias..." />;
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
            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error al cargar noticias</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // **🆕 VISTA DE DETALLE DEL CONTENIDO**
  if (id && contenidoDetalle) {
    const IconComponent = getTipoIcon(contenidoDetalle.tipo);
    const isUrgent = contenidoDetalle.urgente;

    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000"></div>
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Botón volver */}
            <Link
              to="/noticias"
              className="group inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium transition-colors"
            >
              <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Volver a noticias
            </Link>

            {/* Card principal del detalle */}
            <div className={`
              relative overflow-hidden rounded-3xl border-2 shadow-2xl
              bg-gradient-to-br ${getTipoBgColor(contenidoDetalle.tipo, isUrgent)}
            `}>
              {/* Efecto especial para urgentes */}
              {isUrgent && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-8 left-8 w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                </div>
              )}

              <div className="relative p-8">
                {/* Header del contenido */}
                <div className="flex items-start gap-6 mb-8">
                  <div className={`
                    flex-shrink-0 p-4 rounded-2xl shadow-xl
                    ${getIconBgColor(contenidoDetalle.tipo, isUrgent)}
                  `}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    {/* Tags */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className={`
                        px-4 py-2 text-sm font-bold rounded-full shadow-lg
                        ${isUrgent 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse' 
                          : contenidoDetalle.tipo === 'comunicado' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                        }
                      `}>
                        {contenidoDetalle.tipo === 'comunicado' ? 'Comunicado Oficial' : 'Noticia'}
                      </span>
                      
                      {isUrgent && (
                        <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full animate-bounce shadow-lg">
                          <HiBolt className="w-4 h-4" />
                          URGENTE
                        </span>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-full">
                        <HiCalendar className="w-4 h-4" />
                        {formatFecha(contenidoDetalle.fecha)}
                      </div>
                    </div>
                    
                    {/* Título */}
                    <h1 className={`
                      text-4xl font-bold mb-4 leading-tight
                      ${isUrgent 
                        ? 'text-red-900 dark:text-red-100' 
                        : 'text-gray-900 dark:text-gray-100'
                      }
                    `}>
                      {contenidoDetalle.titulo}
                    </h1>
                  </div>
                </div>

                {/* Contenido principal */}
                <div className={`
                  relative p-8 rounded-2xl mb-8 shadow-lg border-2
                  ${isUrgent 
                    ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-700/50' 
                    : 'bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-600/50'
                  }
                `}>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className={`
                      text-lg leading-relaxed whitespace-pre-wrap
                      ${isUrgent 
                        ? 'text-red-900 dark:text-red-100' 
                        : 'text-gray-800 dark:text-gray-200'
                      }
                    `}>
                      {contenidoDetalle.contenido}
                    </div>
                  </div>
                </div>

                {/* Imagen del contenido */}
                {contenidoDetalle.imagen && (
                  <div className="mb-8">
                    <div className={`
                      relative rounded-2xl overflow-hidden shadow-lg border-2
                      ${isUrgent 
                        ? 'border-red-200 dark:border-red-700/50' 
                        : 'border-gray-200/50 dark:border-gray-600/50'
                      }
                    `}>
                      <img
                        src={contenidoDetalle.imagen}
                        alt={contenidoDetalle.titulo}
                        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                        style={{ maxHeight: '500px' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                )}

                {/* Enlaces externos */}
                {contenidoDetalle.enlace && (
                  <div className="text-center mb-8">
                    <a
                      href={contenidoDetalle.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        group inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105
                        ${isUrgent 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                          : contenidoDetalle.tipo === 'comunicado'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                        } text-white
                      `}
                    >
                      <HiEye className="w-5 h-5" />
                      Ver enlace externo
                      <HiSparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    </a>
                  </div>
                )}

                {/* Botones de administración 
                {canManageMenu && (
                  <div className="flex gap-4 justify-center border-t border-gray-200/50 dark:border-gray-600/50 pt-6">
                    <button
                      onClick={() => openEditModal(contenidoDetalle)}
                      className="group/edit flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <HiPencil className="w-5 h-5 group-hover/edit:rotate-12 transition-transform duration-300" />
                      Editar contenido
                    </button>
                    
                    <button
                      onClick={() => openDeleteModal(contenidoDetalle)}
                      className="group/delete flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <HiTrash className="w-5 h-5 group-hover/delete:scale-110 transition-transform duration-300" />
                      Eliminar contenido
                    </button>
                  </div>
                )}*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // **🆕 VISTA DE LISTA (código existente actualizado)**
  const tiposUnicos = [...new Set(contenidos.map(c => c.tipo))];
  const contenidosUrgentes = contenidos.filter(c => c.urgente).length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo decorativo animado */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
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
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl">
                      <HiSpeakerphone className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-bounce flex items-center justify-center">
                      <HiSparkles className="w-3 h-3 text-emerald-800" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-purple-800 to-blue-700 dark:from-blue-100 dark:via-purple-200 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                      Noticias y Comunicados
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Mantente informado con todas las actualizaciones y comunicaciones oficiales
                    </p>
                  </div>
                </div>

                {permissions.canCreate && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="group/btn relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <HiPlus className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                    <span className="relative z-10">Nuevo contenido</span>
                  </button>
                )}
              </div>

              {/* Estadísticas mejoradas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-2 border-blue-200/50 dark:border-blue-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mr-4">
                      <HiNewspaper className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Total Contenidos</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{contenidos.length}</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-2 border-red-200/50 dark:border-red-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg mr-4">
                      <HiBolt className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-1">Contenidos Urgentes</p>
                      <p className="text-3xl font-bold text-red-700 dark:text-red-300">{contenidosUrgentes}</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 border-2 border-emerald-200/50 dark:border-emerald-700/50 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg mr-4">
                      <HiSpeakerphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Tipos de Contenido</p>
                      <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{tiposUnicos.length}</p>
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
                        placeholder="Buscar contenidos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <select
                      value={selectedTipo}
                      onChange={(e) => setSelectedTipo(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                    >
                      <option value="">Todos los tipos</option>
                      {tiposUnicos.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo === 'comunicado' ? 'Comunicados' : 'Noticias'}
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600/80 transition-all duration-300">
                      <input
                        type="checkbox"
                        checked={urgentOnly}
                        onChange={(e) => setUrgentOnly(e.target.checked)}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Solo urgentes</span>
                    </label>

                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      Limpiar filtros
                    </button>

                    <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl border border-blue-200 dark:border-blue-700">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {filteredContenidos.length} resultado{filteredContenidos.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de contenidos mejorada */}
          {filteredContenidos.length === 0 ? (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl"></div>
              
              <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-16 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/50 dark:to-purple-800/50 rounded-3xl mx-auto mb-8 flex items-center justify-center">
                  <HiSpeakerphone className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {contenidos.length === 0 ? "No hay contenidos disponibles" : "No se encontraron contenidos"}
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {contenidos.length === 0
                    ? "Aún no hay noticias o comunicados publicados. ¡Empieza creando el primer contenido!"
                    : "Intenta ajustar los filtros de búsqueda para encontrar el contenido que buscas."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContenidos.map((contenido, index) => {
                const IconComponent = getTipoIcon(contenido.tipo);
                const isUrgent = contenido.urgente;
                
                return (
                  <div
                    key={contenido.id}
                    className={`
                      group relative overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer border-2
                      ${index === 0 && filteredContenidos.length > 1 ? 'lg:col-span-2' : ''}
                      bg-gradient-to-br ${getTipoBgColor(contenido.tipo, isUrgent)}
                    `}
                  >
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                    
                    {/* Línea de acento lateral */}
                    <div className={`absolute left-0 top-0 w-2 h-full transition-all duration-300 group-hover:w-4 ${isUrgent ? 'bg-red-500' : contenido.tipo === 'comunicado' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                    
                    {/* Efecto especial para urgentes */}
                    {isUrgent && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 right-4 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                        <div className="absolute top-6 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-6 left-8 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                      </div>
                    )}
                    
                    <div className="relative p-8">
                      <div className="flex items-start gap-6">
                        {/* Icono mejorado */}
                        <div className={`
                          flex-shrink-0 p-4 rounded-2xl shadow-xl
                          ${getIconBgColor(contenido.tipo, isUrgent)}
                        `}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Tags mejorados */}
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <span className={`
                              px-4 py-2 text-sm font-bold rounded-full shadow-md
                              ${isUrgent 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse' 
                                : contenido.tipo === 'comunicado' 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                              }
                            `}>
                              {contenido.tipo === 'comunicado' ? 'Comunicado' : 'Noticia'}
                            </span>
                            
                            {isUrgent && (
                              <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full animate-bounce shadow-lg">
                                <HiBolt className="w-4 h-4" />
                                URGENTE
                              </span>
                            )}
                            
                            {contenido.imagen && (
                              <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-md">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                Con imagen
                              </span>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <HiCalendar className="w-4 h-4" />
                              {formatFecha(contenido.fecha)}
                            </div>
                          </div>
                          
                          {/* Título mejorado */}
                          <h2 className={`
                            font-bold mb-4 transition-colors duration-300 line-clamp-2
                            ${index === 0 && filteredContenidos.length > 1 ? 'text-2xl' : 'text-xl'}
                            ${isUrgent 
                              ? 'text-red-800 dark:text-red-200' 
                              : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            }
                          `}>
                            {contenido.titulo}
                          </h2>
                          
                          {/* Contenido mejorado */}
                          <div className={`
                            p-6 rounded-2xl mb-6 transition-all duration-300 group-hover:shadow-md
                            ${isUrgent 
                              ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700' 
                              : 'bg-white/80 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-600/50'
                            }
                          `}>
                            <p className={`
                              leading-relaxed
                              ${index === 0 && filteredContenidos.length > 1 ? 'line-clamp-4' : 'line-clamp-3'}
                              ${isUrgent 
                                ? 'text-red-800 dark:text-red-200' 
                                : 'text-gray-700 dark:text-gray-300'
                              }
                            `}>
                              {contenido.contenido}
                            </p>
                          </div>
                          
                          {/* Footer mejorado */}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-3">
                              {/* **🆕 BOTÓN "LEER MÁS" ACTUALIZADO CON LINK** */}
                              <Link
                                to={`/noticias/${contenido.id}`}
                                className="group/view flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 font-medium rounded-xl hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/70 dark:hover:to-blue-700/70 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                              >
                                <HiEye className="w-4 h-4 group-hover/view:scale-110 transition-transform duration-300" />
                                Leer más
                              </Link>
                              
                              {contenido.enlace && (
                                <a
                                  href={contenido.enlace}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 underline decoration-dotted hover:decoration-solid"
                                >
                                  Enlace externo
                                </a>
                              )}
                            </div>
                            
                            {/* Botones CRUD */}
                            {(permissions.canEdit || permissions.canDelete) && (
                              <div className="flex gap-2">
                                {permissions.canEdit && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(contenido);
                                    }}
                                    className="group/edit flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                  >
                                    <HiPencil className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
                                    Editar
                                  </button>
                                )}
                                
                                {permissions.canDelete && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteModal(contenido);
                                    }}
                                    className="group/delete flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
        title="Crear Contenido"
        loading={crudLoading}
        submitText="Crear"
      >
        <ContenidoForm
          onSubmit={handleSubmit}
          loading={crudLoading}
        />
      </CrudModal>

      <CrudModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContenido(null);
        }}
        title="Editar Contenido"
        loading={crudLoading}
        submitText="Actualizar"
      >
        <ContenidoForm
          contenido={selectedContenido}
          onSubmit={handleSubmit}
          loading={crudLoading}
        />
      </CrudModal>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedContenido(null);
        }}
        onConfirm={handleDelete}
        loading={crudLoading}
        title="Eliminar Contenido"
        message="¿Estás seguro de que deseas eliminar este contenido? Esta acción no se puede deshacer."
        itemName={selectedContenido ? selectedContenido.titulo : ''}
      />
    </div>
  );
}