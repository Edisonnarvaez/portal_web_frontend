import { useEffect, useState } from "react";
import { useDepartment, useCompany } from "../hooks";
import type { Department } from "../../domain/entities";
import LoadingScreen from "../../../../shared/components/LoadingScreen";
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

export default function AreasEmpresa() {
  const { departments, loading: deptLoading, error: deptError, fetchDepartments, createDepartment, updateDepartment, deleteDepartment, toggleStatus } = useDepartment();
  const { companies, loading: compLoading, fetchCompanies } = useCompany();
  
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
    fetchDepartments().catch(() => {});
    fetchCompanies().catch(() => {});
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
        await updateDepartment(form.id, form as Department);
        setMensaje("Área actualizada exitosamente");
      } else {
        if (form && form.name && form.description && form.company) {
          await createDepartment(form as Department);
          setMensaje("Área creada exitosamente");
        }
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
      await deleteDepartment(departmentIdToDelete);
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
      await toggleStatus(departmentToToggle.id, !departmentToToggle.currentStatus);
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

  if (deptLoading || compLoading) return <LoadingScreen message="Cargando áreas..." fullScreen={true} />;
  if (deptError) return <div className="text-center py-8 text-red-600 dark:text-red-400">{deptError}</div>;

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
        <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white rounded-t-xl">
              <h2 className="text-2xl font-bold">
                📋 {isEditing ? "Editar" : "Agregar"} Área
              </h2>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {formError}
                  </div>
                )}

                {/* Sección: Información General */}
                <div className="border-b-2 border-blue-600 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">📋 Información General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Nombre del Área *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Nombre del área"
                        value={form.name || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600 focus:border-transparent transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Código del Área *
                      </label>
                      <input
                        type="text"
                        name="departmentCode"
                        placeholder="Código de área"
                        value={form.departmentCode || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600 focus:border-transparent transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Descripción *
                      </label>
                      <input
                        type="text"
                        name="description"
                        placeholder="Descripción del área"
                        value={form.description || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600 focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Configuración */}
                <div className="border-b-2 border-blue-600 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">⚙️ Configuración</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Empresa *
                      </label>
                      <select
                        name="company"
                        value={form.company || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600 focus:border-transparent transition"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Estado
                      </label>
                      <select
                        name="status"
                        value={form.status ? "true" : "false"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600 focus:border-transparent transition"
                        required
                      >
                        <option value="true">✓ Activo</option>
                        <option value="false">○ Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-6 px-6 pb-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
              <button
                type="button"
                className="flex-1 px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                ✕ Cancelar
              </button>
              <button
                type="submit"
                form="areasForm"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
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
              <h2 className="text-2xl font-bold">📋 Detalles del Área</h2>
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
              {/* Sección: Información General */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">📋 Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.name || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Código</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.departmentCode || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descripción</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.description || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Sección: Configuración */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">⚙️ Configuración</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empresa</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{companies.find((c) => c.id === viewResult.company)?.name || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      viewResult.status
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {viewResult.status ? '✓ Activo' : '○ Inactivo'}
                    </span>
                  </div>
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