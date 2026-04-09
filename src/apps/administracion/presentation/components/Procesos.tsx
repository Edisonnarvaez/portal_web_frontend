import { useEffect, useState } from "react";
import { useProcess, useProcessType, useDepartment } from "../hooks";
import type { Process } from "../../domain/entities";
import { useAuthContext } from "../../../auth/presentation/context/AuthContext";
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import LoadingScreen from "../../../../shared/components/LoadingScreen";

export default function Procesos() {
    const { user } = useAuthContext();
    const { processes, loading: procLoading, error: procError, fetchProcesses, createProcess, updateProcess, deleteProcess, toggleStatus } = useProcess();
    const { processTypes, fetchProcessTypes } = useProcessType();
    const { departments, fetchDepartments } = useDepartment();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [processIdToDelete, setProcessIdToDelete] = useState<number | null>(null);
    const [processToToggle, setProcessToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewResult, setViewResult] = useState<Process | null>(null);
    const [mensaje, setMensaje] = useState("");
    const [formError, setFormError] = useState("");

    const [form, setForm] = useState<Partial<Process>>({
        name: "",
        description: "",
        code: "",
        version: "",
        status: true,
        processType: 0,
        department: 0,
    });

    useEffect(() => {
        console.log('[Procesos] Iniciando carga de datos...');
        fetchProcesses()
            .then(data => {
                console.log('[Procesos] Datos cargados:', data);
            })
            .catch(err => {
                console.error('[Procesos] Error cargando procesos:', err);
            });
        fetchProcessTypes()
            .then(data => {
                console.log('[Procesos] Tipos de proceso cargados:', data);
            })
            .catch(err => {
                console.error('[Procesos] Error cargando tipos de proceso:', err);
            });
        fetchDepartments()
            .then(data => {
                console.log('[Procesos] Departamentos cargados:', data);
            })
            .catch(err => {
                console.error('[Procesos] Error cargando departamentos:', err);
            });
    }, []);

    // Actualizar el usuario en el formulario cuando cambie el usuario autenticado
    useEffect(() => {
        if (user?.id) {
            setForm(prev => ({
                ...prev,
                user: user.id
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked :
                name === "version" ? Number(value) : value,
        }));
    };

    const validateForm = () => {
        if (!form.name || !form.description || !form.code || !form.version || !form.processType || !form.department) {
            setFormError("Todos los campos obligatorios deben estar completos.");
            return false;
        }
        if (!user?.id) {
            setFormError("Error: Usuario no autenticado.");
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
                await updateProcess(form.id, form as Process);
                setMensaje("Proceso actualizado exitosamente");
            } else {
                if (form && form.name && form.description && form.code && form.version && form.processType && form.department) {
                    await createProcess(form as Process);
                    setMensaje("Proceso creado exitosamente");
                }
            }
            await fetchProcesses();
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            setFormError("Error al guardar el proceso.");
        }
    };

    const handleEdit = (process: Process) => {
        setForm({
            ...process,
            user: user?.id || process.user, // Mantener usuario actual para la edición
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleView = (process: Process) => {
        setViewResult(process);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setProcessIdToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!processIdToDelete) return;
        try {
            await deleteProcess(processIdToDelete);
            await fetchProcesses();
            setMensaje("Proceso eliminado exitosamente");
        } catch {
            setFormError("Error al eliminar el proceso.");
        } finally {
            setProcessIdToDelete(null);
            setIsConfirmModalOpen(false);
        }
    };

    const handleToggleStatus = (id: number, currentStatus: boolean) => {
        setProcessToToggle({ id, currentStatus });
        setIsConfirmModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!processToToggle) return;
        try {
            await toggleStatus(processToToggle.id, !processToToggle.currentStatus);
            await fetchProcesses();
            setMensaje(`Proceso ${processToToggle.currentStatus ? "inactivado" : "activado"} exitosamente`);
        } catch {
            setFormError("Error al cambiar el estado del proceso.");
        } finally {
            setProcessToToggle(null);
            setIsConfirmModalOpen(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            code: "",
            version: "",
            status: true,
            processType: 0,
            department: 0,
            user: user?.id || 0, // Resetear con el usuario autenticado
        });
        setIsEditing(false);
        setIsModalOpen(false);
        setFormError("");
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // Función para obtener el nombre del tipo de proceso
    const getProcessTypeName = (processTypeId: number) => {
        const processType = processTypes.find(pt => pt.id === processTypeId);
        return processType ? processType.name : 'N/A';
    };

    // Función para obtener el nombre del departamento
    const getDepartmentName = (departmentId: number) => {
        const department = departments.find(d => d.id === departmentId);
        return department ? department.name : 'N/A';
    };

    if (procLoading) {
        console.log('[Procesos] Estado: LOADING');
        return <LoadingScreen message="Cargando procesos..." fullScreen={true} />;
    }

    if (procError) {
        console.log('[Procesos] Estado: ERROR -', procError);
        return (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
                {procError}
                <button
                    onClick={() => window.location.reload()}
                    className="block mx-auto mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    console.log('[Procesos] Estado: READY - Renderizando con', processes.length, 'procesos');

    return (
        <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Procesos</h2>
                <button
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                    onClick={openModal}
                >
                    Agregar Proceso
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
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
                            <h2 className="text-2xl font-bold">{isEditing ? "Editar" : "Agregar"} Proceso</h2>
                            <p className="text-blue-100 text-sm mt-1">Completa los datos del proceso</p>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {formError && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                                        ⚠️ {formError}
                                    </div>
                                )}

                                {/* Sección 1: Información General */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                                        📋 Información General
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Nombre *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Ej: Proceso Administrativo"
                                                value={form.name || ""}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Código *</label>
                                            <input
                                                type="text"
                                                name="code"
                                                placeholder="Ej: PRO-001"
                                                value={form.code || ""}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Versión *</label>
                                            <input
                                                type="text"
                                                name="version"
                                                placeholder="Ej: 1.0.0"
                                                value={form.version || ""}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Descripción *</label>
                                            <textarea
                                                name="description"
                                                placeholder="Describe el proceso..."
                                                value={form.description || ""}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition resize-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 2: Clasificación */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                                        🏷️ Clasificación
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Tipo de Proceso *</label>
                                            <select
                                                name="processType"
                                                value={form.processType || ""}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                                required
                                            >
                                                <option value="">Selecciona un tipo</option>
                                                {Array.isArray(processTypes) && processTypes.map(type => (
                                                    <option key={type.id} value={type.id}>{type.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Departamento *</label>
                                            <select
                                                name="department"
                                                value={form.department || ""}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                                required
                                            >
                                                <option value="">Selecciona un departamento</option>
                                                {Array.isArray(departments) && departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 3: Configuración */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                                        ⚙️ Configuración
                                    </h3>
                                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="status"
                                            checked={form.status || false}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                                            id="status"
                                        />
                                        <label htmlFor="status" className="ml-3 font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                                            Proceso activo
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 px-6 sm:px-8 pb-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                className="flex-1 px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕ Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition"
                                onClick={handleSubmit}
                            >
                                💾 {isEditing ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de visualización */}
            {isViewModalOpen && viewResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white rounded-t-xl flex justify-between items-start">
                            <h2 className="text-2xl font-bold">📋 Detalles del Proceso</h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-white hover:text-blue-100 transition-colors"
                                aria-label="Cerrar modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
                            {/* Sección: Información Básica */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">📋 Información Básica</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.name}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Código</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.code}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg md:col-span-2">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descripción</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Detalles */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">📊 Detalles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Versión</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.version}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo de Proceso</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{getProcessTypeName(viewResult.processType)}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departamento</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{getDepartmentName(viewResult.department)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Configuración */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">⚙️ Configuración</h3>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Estado</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                        viewResult.status
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {viewResult.status ? '✓ Activo' : '○ Inactivo'}
                                    </span>
                                </div>
                            </div>

                            {/* Sección: Auditoría */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">📅 Información de Control</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {viewResult.creationDate && (
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Creación</p>
                                            <p className="text-gray-900 dark:text-gray-100 font-semibold">
                                                {new Date(viewResult.creationDate).toLocaleDateString("es-CO")}
                                            </p>
                                        </div>
                                    )}
                                    {viewResult.updateDate && (
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Última Actualización</p>
                                            <p className="text-gray-900 dark:text-gray-100 font-semibold">
                                                {new Date(viewResult.updateDate).toLocaleDateString("es-CO")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end pt-6 px-6 pb-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                            >
                                ✕ Cerrar
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
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Departamento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {processes.map((process) => (
                                <tr key={process.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {process.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                v{process.version}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {process.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {getProcessTypeName(process.processType)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {getDepartmentName(process.department)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${process.status
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {process.status ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleView(process)}
                                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                title="Ver detalles"
                                            >
                                                <FaEye size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(process)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Editar"
                                            >
                                                <FaEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(process.id, process.status)}
                                                className={`${process.status
                                                    ? "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                    }`}
                                                title={process.status ? 'Desactivar' : 'Activar'}
                                            >

                                                {process.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(process.id)}
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
                {processes.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No se encontraron procesos.
                    </div>
                )}
            </div>

            {/* Modal de confirmación */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            {processToToggle ? 'Cambiar Estado' : 'Confirmar Eliminación'}
                        </h3>
                        <p className="mb-6 text-gray-700 dark:text-gray-200">
                            {processToToggle
                                ? `¿Estás seguro de que deseas ${processToToggle.currentStatus ? 'desactivar' : 'activar'} este proceso?`
                                : '¿Estás seguro de que deseas eliminar este proceso? Esta acción no se puede deshacer.'
                            }
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    setProcessIdToDelete(null);
                                    setProcessToToggle(null);
                                }}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={processToToggle ? confirmToggleStatus : confirmDelete}
                                className={`px-4 py-2 text-white rounded hover:opacity-90 ${processToToggle
                                        ? (processToToggle.currentStatus ? 'bg-red-600' : 'bg-green-600')
                                        : 'bg-red-600'
                                    }`}
                            >
                                {processToToggle
                                    ? (processToToggle.currentStatus ? 'Desactivar' : 'Activar')
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