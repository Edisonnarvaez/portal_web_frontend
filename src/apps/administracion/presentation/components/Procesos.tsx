import { useEffect, useState } from "react";
import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import { useAuthContext } from "../../../auth/presentation/context/AuthContext";
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import LoadingScreen from "../../../../shared/components/LoadingScreen";

interface ProcessType {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Process {
    id: number;
    name: string;
    description: string;
    code: string;
    version: string;
    processType: number;
    department: number;
    status: boolean;
    creationDate: string;
    updateDate: string;
    user: number;
}

export default function Procesos() {
    const { user } = useAuthContext(); // Obtener usuario autenticado
    const [processes, setProcesses] = useState<Process[]>([]);
    const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        user: user?.id || 0, // Asignar ID del usuario autenticado
    });

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                const response = await axiosInstance.get("/companies/processes/");
                //.log("Processes response:", response.data);
                setProcesses(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            } catch (err: any) {
                console.error("Error fetching processes:", err);
                setError("No se pudieron cargar los procesos");
                setProcesses([]);
                setLoading(false);
            }
        };

        const fetchProcessTypes = async () => {
            try {
                const response = await axiosInstance.get("/companies/process_types/");
                //console.log("Process types response:", response.data);
                setProcessTypes(Array.isArray(response.data) ? response.data : []);
            } catch (err: any) {
                console.error("Error fetching process types:", err);
                setError("No se pudieron cargar los tipos de proceso");
                setProcessTypes([]);
            }
        };

        const fetchDepartments = async () => {
            try {
                const response = await axiosInstance.get("/companies/departments/");
                //console.log("Departments response:", response.data);
                setDepartments(Array.isArray(response.data) ? response.data : []);
            } catch (err: any) {
                console.error("Error fetching departments:", err);
                setError("No se pudieron cargar las áreas");
                setDepartments([]);
            }
        };

        fetchProcesses();
        fetchProcessTypes();
        fetchDepartments();
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
            // Asegurar que el usuario esté asignado
            const formData = {
                ...form,
                user: user?.id, // Siempre asignar el usuario autenticado
            };

            if (isEditing && form.id) {
                // Para actualizaciones, usar PATCH para enviar solo campos modificados
                const changedFields: Partial<Record<keyof Process, string | number | boolean>> = {};

                // Comparar con los datos originales y solo incluir campos modificados
                const originalProcess = processes.find(p => p.id === form.id);
                if (originalProcess) {
                    Object.keys(formData).forEach(key => {
                        const formValue = formData[key as keyof Process];
                        const originalValue = originalProcess[key as keyof Process];

                        if (formValue !== originalValue && formValue !== undefined && formValue !== null && formValue !== "") {
                            changedFields[key as keyof Process] = formValue as string | number | boolean;
                        }
                    });

                    // Siempre incluir el usuario para mantener el registro de quién modificó
                    changedFields.user = user?.id as number;
                }

                const response = await axiosInstance.patch(`/companies/processes/${form.id}/`, changedFields);
                setProcesses((prev) =>
                    prev.map((process) => (process.id === response.data.id ? response.data : process))
                );
                setMensaje("Proceso actualizado exitosamente");
            } else {
                // Para creación, enviar todos los datos
                const response = await axiosInstance.post("/companies/processes/", formData);
                setProcesses((prev) => [...prev, response.data]);
                setMensaje("Proceso creado exitosamente");
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            console.error("Error saving process:", error.response?.data);
            setFormError(error.response?.data?.detail || "Error al guardar el proceso.");
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
            await axiosInstance.delete(`/companies/processes/${processIdToDelete}/`);
            setProcesses((prev) => prev.filter((process) => process.id !== processIdToDelete));
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
            const response = await axiosInstance.patch(`/companies/processes/${processToToggle.id}/`, {
                status: !processToToggle.currentStatus,
                user: user?.id, // Registrar quién cambió el estado
            });
            setProcesses((prev) =>
                prev.map((process) =>
                    process.id === processToToggle.id ? { ...process, status: response.data.status } : process
                )
            );
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

    // Función para obtener el nombre del usuario (si tienes acceso a esta información)
    const getUserName = (userId: number) => {
        // Si tienes acceso a la información de usuarios, implementa esta función
        // Por ahora retorna el ID
        return `Usuario ${userId}`;
    };

    if (loading) {
        return <LoadingScreen message="Cargando procesos..." />;
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
                {error}
                <button
                    onClick={() => window.location.reload()}
                    className="block mx-auto mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Reintentar
                </button>
            </div>
        );
    }

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
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            {isEditing ? "Editar" : "Crear"} Proceso
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                                        Código *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={form.code || ""}
                                        onChange={handleChange}
                                        className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
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
                                        Versión *
                                    </label>
                                    <input
                                        type="text"
                                        name="version"
                                        value={form.version || ""}
                                        onChange={handleChange}
                                        className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Tipo de Proceso *
                                    </label>
                                    <select
                                        name="processType"
                                        value={form.processType || ""}
                                        onChange={handleChange}
                                        className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    >
                                        <option value="">Seleccione un tipo</option>
                                        {Array.isArray(processTypes) && processTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Departamento *
                                    </label>
                                    <select
                                        name="department"
                                        value={form.department || ""}
                                        onChange={handleChange}
                                        className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    >
                                        <option value="">Seleccione un departamento</option>
                                        {Array.isArray(departments) && departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
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
                                Detalles del Proceso
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
                                <span className="font-medium text-gray-700 dark:text-gray-300">Código:</span>
                                <span className="text-gray-900 dark:text-gray-100">{viewResult.code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Versión:</span>
                                <span className="text-gray-900 dark:text-gray-100">{viewResult.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Descripción:</span>
                                <span className="text-gray-900 dark:text-gray-100 text-right max-w-xs">{viewResult.description}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
                                <span className="text-gray-900 dark:text-gray-100">{getProcessTypeName(viewResult.processType)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Departamento:</span>
                                <span className="text-gray-900 dark:text-gray-100">{getDepartmentName(viewResult.department)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                                <span className={`px-2 py-1 rounded text-xs ${viewResult.status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {viewResult.status ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Creado por:</span>
                                <span className="text-gray-900 dark:text-gray-100">{getUserName(viewResult.user)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de creación:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {new Date(viewResult.creationDate).toLocaleDateString("es-CO")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Última actualización:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {new Date(viewResult.updateDate).toLocaleDateString("es-CO")}
                                </span>
                            </div>
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
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Ver detalles"
                                            >
                                                <FaEye size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(process)}
                                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
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