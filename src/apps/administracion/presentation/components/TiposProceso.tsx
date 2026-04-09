import { useEffect, useState } from "react";
import { useProcessType, useCompany } from "../hooks";
import type { ProcessType } from "../../domain/entities";
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import LoadingScreen from "../../../../shared/components/LoadingScreen";

export default function TiposProceso() {
    const { processTypes, loading: ptLoading, error: ptError, fetchProcessTypes, createProcessType, updateProcessType, deleteProcessType, toggleStatus } = useProcessType();
    const { companies, fetchCompanies } = useCompany();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [processTypeIdToDelete, setProcessTypeIdToDelete] = useState<number | null>(null);
    const [processTypeToToggle, setProcessTypeToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewResult, setViewResult] = useState<ProcessType | null>(null);
    const [mensaje, setMensaje] = useState("");
    const [formError, setFormError] = useState("");

    const [form, setForm] = useState<Partial<ProcessType>>({
        name: "",
        description: "",
        company: 0,
        status: true,
    });

    useEffect(() => {
        console.log('[TiposProceso] Iniciando carga de datos...');
        fetchProcessTypes()
            .then(data => {
                console.log('[TiposProceso] Datos cargados:', data);
            })
            .catch(err => {
                console.error('[TiposProceso] Error cargando tipos de proceso:', err);
            });
        fetchCompanies()
            .then(data => {
                console.log('[TiposProceso] Empresas cargadas:', data);
            })
            .catch(err => {
                console.error('[TiposProceso] Error cargando empresas:', err);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const validateForm = () => {
        if (!form.name || !form.description || !form.company) {
            setFormError("Todos los campos obligatorios deben estar completos.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setMensaje("");
        if (!validateForm()) return;

        try {
            if (isEditing && form.id) {
                await updateProcessType(form.id, form as ProcessType);
                setMensaje("Tipo de proceso actualizado exitosamente");
            } else {
                if (form && form.name && form.description && form.company) {
                    await createProcessType(form as ProcessType);
                    setMensaje("Tipo de proceso creado exitosamente");
                }
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            setFormError("Error al guardar el tipo de proceso.");
        }
    };

    const handleEdit = (processType: ProcessType) => {
        setForm(processType);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleView = (processType: ProcessType) => {
        setViewResult(processType);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setProcessTypeIdToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!processTypeIdToDelete) return;
        try {
            await deleteProcessType(processTypeIdToDelete);
            setMensaje("Tipo de proceso eliminado exitosamente");
        } catch {
            setFormError("Error al eliminar el tipo de proceso.");
        } finally {
            setProcessTypeIdToDelete(null);
            setIsConfirmModalOpen(false);
        }
    };

    const handleToggleStatus = (id: number, currentStatus: boolean) => {
        setProcessTypeToToggle({ id, currentStatus });
        setIsConfirmModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!processTypeToToggle) return;
        try {
            await toggleStatus(processTypeToToggle.id, !processTypeToToggle.currentStatus);
            setMensaje(`Tipo de proceso ${processTypeToToggle.currentStatus ? "inactivado" : "activado"} exitosamente`);
        } catch {
            setFormError("Error al cambiar el estado del tipo de proceso.");
        } finally {
            setProcessTypeToToggle(null);
            setIsConfirmModalOpen(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            company: 0,
            status: true,
        });
        setIsEditing(false);
        setIsModalOpen(false);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const getCompanyName = (companyId: number) => {
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : 'N/A';
    };

    if (ptLoading) {
        console.log('[TiposProceso] Estado: LOADING');
        return <LoadingScreen message="Cargando tipos de proceso..." />;
    }
    if (ptError) {
        console.log('[TiposProceso] Estado: ERROR -', ptError);
        return <div className="text-center py-8 text-red-600 dark:text-red-400">{ptError}</div>;
    }

    console.log('[TiposProceso] Estado: READY - Renderizando con', processTypes.length, 'tipos de proceso');

    return (
        <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tipos de Proceso</h2>
                <button
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                    onClick={openModal}
                >
                    Agregar Tipo de Proceso
                </button>
            </div>

            {mensaje && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:border-green-600 dark:text-green-200">
                    {mensaje}
                </div>
            )}

            {formError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-200">
                    {formError}
                </div>
            )}

            {/* Modal de formulario */}
            {isModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            {isEditing ? "Editar" : "Crear"} Tipo de Proceso
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name || ""}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Descripción *
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description || ""}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Empresa *
                                </label>
                                <select
                                    name="company"
                                    value={form.company || ""}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                >
                                    <option value="">Seleccione una empresa</option>
                                    {Array.isArray(companies) && companies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={form.status || false}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Activo
                                </label>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setIsModalOpen(false);
                                    }}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {isEditing ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de visualización */}
            {isViewModalOpen && viewResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Detalles del Tipo de Proceso
                            </h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Nombre:</span>
                                <span className="text-gray-900 dark:text-gray-100">{viewResult.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Descripción:</span>
                                <span className="text-gray-900 dark:text-gray-100 text-right max-w-xs">{viewResult.description}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Empresa:</span>
                                <span className="text-gray-900 dark:text-gray-100">{getCompanyName(viewResult.company)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                                <span className={`px-2 py-1 rounded text-xs ${viewResult.status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {viewResult.status ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            {viewResult.creationDate && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de creación:</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                        {new Date(viewResult.creationDate).toLocaleDateString("es-CO")}
                                    </span>
                                </div>
                            )}
                            {viewResult.updateDate && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Última actualización:</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                        {new Date(viewResult.updateDate).toLocaleDateString("es-CO")}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Fecha Creación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {processTypes.map((processType) => (
                                <tr key={processType.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {processType.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {processType.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {getCompanyName(processType.company)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${processType.status
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {processType.status ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {processType.creationDate
                                            ? new Date(processType.creationDate).toLocaleDateString("es-CO")
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleView(processType)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Ver detalles"
                                            >
                                                <FaEye size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(processType)}
                                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                title="Editar"
                                            >
                                                <FaEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(processType.id, processType.status)}
                                                className={`${processType.status
                                                    ? "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                    }`}
                                                title={processType.status ? 'Desactivar' : 'Activar'}
                                            >
                                                {processType.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(processType.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Eliminar"
                                            >
                                                <FaTrash size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {processTypes.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No se encontraron tipos de proceso.
                    </div>
                )}
            </div>

            {/* Modal de confirmación */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            {processTypeToToggle ? 'Cambiar Estado' : 'Confirmar Eliminación'}
                        </h3>
                        <p className="mb-6 text-gray-700 dark:text-gray-200">
                            {processTypeToToggle
                                ? `¿Estás seguro de que deseas ${processTypeToToggle.currentStatus ? 'desactivar' : 'activar'} este tipo de proceso?`
                                : '¿Estás seguro de que deseas eliminar este tipo de proceso? Esta acción no se puede deshacer.'
                            }
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    setProcessTypeIdToDelete(null);
                                    setProcessTypeToToggle(null);
                                }}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={processTypeToToggle ? confirmToggleStatus : confirmDelete}
                                className={`px-4 py-2 text-white rounded hover:opacity-90 ${processTypeToToggle
                                        ? (processTypeToToggle.currentStatus ? 'bg-red-600' : 'bg-green-600')
                                        : 'bg-red-600'
                                    }`}
                            >
                                {processTypeToToggle
                                    ? (processTypeToToggle.currentStatus ? 'Desactivar' : 'Activar')
                                    : 'Eliminar'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}