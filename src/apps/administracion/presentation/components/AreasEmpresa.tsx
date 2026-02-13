import { useEffect, useState } from "react";
import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import LoadingScreen from "../../../../shared/components/LoadingScreen";
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

interface Company {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  departmentCode: string;
  company: number;
  description: string;
  status: boolean;
}

export default function AreasEmpresa() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [departmentIdToDelete, setDepartmentIdToDelete] = useState<number | null>(null);
  const [departmentToToggle, setDepartmentToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResult, setViewResult] = useState<Department | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState<Partial<Department>>({
    name: "",
    departmentCode: "",
    company: 0,
    description: "",
    status: true,
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get("/companies/departments/");
        setDepartments(response.data);
        setLoading(false);
      } catch (err: any) {
        setError("No se pudieron cargar las áreas");
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await axiosInstance.get("/companies/companies/");
        setCompanies(response.data);
      } catch (err: any) {
        setError("No se pudieron cargar las empresas");
      }
    };

    fetchDepartments();
    fetchCompanies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const validateForm = () => {
    if (!form.name || !form.departmentCode || !form.company || !form.description) {
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
        const response = await axiosInstance.put(`/companies/departments/${form.id}/`, form);
        setDepartments((prev) =>
          prev.map((department) => (department.id === response.data.id ? response.data : department))
        );
        setMensaje("Área actualizada exitosamente");
      } else {
        const response = await axiosInstance.post("/companies/departments/", form);
        setDepartments((prev) => [...prev, response.data]);
        setMensaje("Área creada exitosamente");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      setFormError("Error al guardar el área.");
    }
  };

  const handleEdit = (department: Department) => {
    setForm(department);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (department: Department) => {
    setViewResult(department);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDepartmentIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentIdToDelete) return;
    try {
      await axiosInstance.delete(`/companies/departments/${departmentIdToDelete}/`);
      setDepartments((prev) => prev.filter((department) => department.id !== departmentIdToDelete));
      setMensaje("Área eliminada exitosamente");
    } catch {
      setFormError("Error al eliminar el área.");
    } finally {
      setDepartmentIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setDepartmentToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!departmentToToggle) return;
    try {
      const response = await axiosInstance.patch(`/companies/departments/${departmentToToggle.id}/`, {
        status: !departmentToToggle.currentStatus,
      });
      setDepartments((prev) =>
        prev.map((department) =>
          department.id === departmentToToggle.id ? { ...department, status: response.data.status } : department
        )
      );
      setMensaje(`Área ${departmentToToggle.currentStatus ? "inactivada" : "activada"} exitosamente`);
    } catch {
      setFormError("Error al cambiar el estado del área.");
    } finally {
      setDepartmentToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      departmentCode: "",
      company: 0,
      description: "",
      status: true,
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) return <LoadingScreen message="Cargando áreas..." />;
  if (error) return <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Áreas</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
        onClick={openModal}
      >
        Agregar Área
      </button>
      </div>
      {mensaje && <div className="mb-4 text-green-600 dark:text-green-400">{mensaje}</div>}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-lg mx-auto my-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">{isEditing ? "Editar" : "Agregar"} Área</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && <div className="text-red-600 dark:text-red-400">{formError}</div>}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre del Área</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={form.name || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Código de Área</label>
                  <input
                    type="text"
                    name="departmentCode"
                    placeholder="Código de área"
                    value={form.departmentCode || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Empresa</label>
                  <select
                    name="company"
                    value={form.company || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Seleccione Empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Descripción"
                    value={form.description || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Estado</label>
                  <select
                    name="status"
                    value={form.status ? "true" : "false"}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center sm:justify-end space-x-4 mt-8">
                <button
                  type="button"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de visualización */}
      {isViewModalOpen && viewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 transition-opacity duration-300 ease-out">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl sm:p-8 transform transition-all duration-300 scale-100 hover:scale-[1.01]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              onClick={() => setIsViewModalOpen(false)}
              aria-label="Cerrar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center tracking-tight">
              Detalles del Área
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-200">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Nombre:</span>
                <span>{viewResult.name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Código de Área:</span>
                <span>{viewResult.departmentCode || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Empresa:</span>
                <span>
                  {companies.find((company) => company.id === viewResult.company)?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Descripción:</span>
                <span>{viewResult.description || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Estado:</span>
                <span>{viewResult.status ? "Activo" : "Inactivo"}</span>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                onClick={() => setIsViewModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {departments.map((department) => (
              <tr key={department.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{department.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{department.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{department.departmentCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{department.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {department.status ? "Activo" : "Inactivo"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 flex space-x-4">
                  <button
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    onClick={() => handleView(department)}
                    title="Ver"
                    aria-label="Ver área"
                  >
                    <FaEye size={20} />
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => handleEdit(department)}
                    title="Editar"
                    aria-label="Editar área"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    className={
                      department.status
                        ? "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                        : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    }
                    onClick={() => handleToggleStatus(department.id, department.status)}
                    title={department.status ? "Inactivar" : "Activar"}
                    aria-label={department.status ? "Inactivar área" : "Activar área"}
                  >
                    {department.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => handleDelete(department.id)}
                    title="Eliminar"
                    aria-label="Eliminar área"
                  >
                    <FaTrash size={20} />
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de confirmación */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Confirmar Acción</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-200">
              {departmentIdToDelete
                ? "¿Estás seguro de que deseas eliminar esta área? Esta acción no se puede deshacer."
                : departmentToToggle
                ? `¿Estás seguro de que deseas ${departmentToToggle.currentStatus ? "inactivar" : "activar"} esta área?`
                : "¿Estás seguro de que deseas realizar esta acción?"}
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setDepartmentIdToDelete(null);
                  setDepartmentToToggle(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  if (departmentIdToDelete) confirmDelete();
                  if (departmentToToggle) confirmToggleStatus();
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}