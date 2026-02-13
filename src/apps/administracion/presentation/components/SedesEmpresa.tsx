import { useEffect, useState } from "react";
import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import LoadingScreen from "../../../../shared/components/LoadingScreen";
import { FaEdit } from "react-icons/fa";
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa6";

interface Company {
  id: number;
  name: string;
}

interface Headquarter {
  id: number;
  name: string;
  habilitationCode: string;
  company: number;
  departament: string;
  city: string;
  address: string;
  habilitationDate: string;
  closingDate: string;
  status: boolean;
}

export default function SedesEmpresa() {
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [headquarterIdToDelete, setHeadquarterIdToDelete] = useState<number | null>(null);
  const [headquarterToToggle, setHeadquarterToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResult, setViewResult] = useState<Headquarter | null>(null);
  const [form, setForm] = useState<Partial<Headquarter>>({
    name: "",
    habilitationCode: "",
    company: 0,
    departament: "",
    city: "",
    address: "",
    habilitationDate: "",
    closingDate: "",
    status: true,
  });
  const [mensaje, setMensaje] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchHeadquarters = async () => {
      try {
        const response = await axiosInstance.get("/companies/headquarters/");
        setHeadquarters(response.data);
        setLoading(false);
      } catch (err: any) {
        setError("No se pudieron cargar las sedes");
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        // Verificar la URL correcta del endpoint
        const response = await axiosInstance.get("/companies/companies/"); // O la URL correcta
        //console.log("Companies response:", response.data); // Para debuggear
        
        // Verificar que response.data sea un array
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          console.error("Companies response is not an array:", response.data);
          setCompanies([]); // Establecer array vacío como fallback
        }
      } catch (err: any) {
        console.error("Error fetching companies:", err);
        setError("No se pudieron cargar las empresas");
        setCompanies([]); // Importante: establecer array vacío en caso de error
      }
    };

    fetchHeadquarters();
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
    if (!form.name || !form.habilitationCode || !form.company || !form.departament || !form.city || !form.address || !form.habilitationDate) {
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
        const response = await axiosInstance.put(`/companies/headquarters/${form.id}/`, form);
        setHeadquarters((prev) =>
          prev.map((headquarter) => (headquarter.id === response.data.id ? response.data : headquarter))
        );
        setMensaje("Sede actualizada exitosamente");
      } else {
        const response = await axiosInstance.post("/companies/headquarters/", form);
        setHeadquarters((prev) => [...prev, response.data]);
        setMensaje("Sede creada exitosamente");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      setFormError("Error al guardar la sede.");
    }
  };

  const handleEdit = (headquarter: Headquarter) => {
    setForm(headquarter);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (headquarter: Headquarter) => {
    setViewResult(headquarter);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setHeadquarterIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!headquarterIdToDelete) return;
    try {
      await axiosInstance.delete(`/companies/headquarters/${headquarterIdToDelete}/`);
      setHeadquarters((prev) => prev.filter((headquarter) => headquarter.id !== headquarterIdToDelete));
      setMensaje("Sede eliminada exitosamente");
    } catch {
      setFormError("Error al eliminar la sede.");
    } finally {
      setHeadquarterIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setHeadquarterToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!headquarterToToggle) return;
    try {
      const response = await axiosInstance.patch(`/companies/headquarters/${headquarterToToggle.id}/`, {
        status: !headquarterToToggle.currentStatus,
      });
      setHeadquarters((prev) =>
        prev.map((headquarter) =>
          headquarter.id === headquarterToToggle.id ? { ...headquarter, status: response.data.status } : headquarter
        )
      );
      setMensaje(`Sede ${headquarterToToggle.currentStatus ? "inactivada" : "activada"} exitosamente`);
    } catch {
      setFormError("Error al cambiar el estado de la sede.");
    } finally {
      setHeadquarterToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      habilitationCode: "",
      company: 0,
      departament: "",
      city: "",
      address: "",
      habilitationDate: "",
      closingDate: "",
      status: true,
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) return <LoadingScreen message="Cargando sedes..." />;
  if (error) return <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Sedes</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
        onClick={openModal}
      >
        Agregar Sede
      </button>
      </div>
      {mensaje && <div className="mb-4 text-green-600 dark:text-green-400">{mensaje}</div>}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-lg mx-auto my-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">{isEditing ? "Editar" : "Agregar"} Sede</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && <div className="text-red-600 dark:text-red-400">{formError}</div>}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre de la sede"
                    value={form.name || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Código de habilitación</label>
                  <input
                    type="text"
                    name="habilitationCode"
                    placeholder="Código de habilitación de la sede"
                    value={form.habilitationCode || ""}
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
                    <option value="">Seleccione una empresa</option>
                    {/* Verificación doble para evitar errores */}
                    {Array.isArray(companies) && companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Departamento</label>
                  <input
                    type="text"
                    name="departament"
                    placeholder="Departamento de la sede"
                    value={form.departament || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ciudad de la sede"
                    value={form.city || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Dirección de la sede"
                    value={form.address || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha de habilitación</label>
                  <input
                    type="date"
                    name="habilitationDate"
                    value={form.habilitationDate || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha de cierre</label>
                  <input
                    type="date"
                    name="closingDate"
                    value={form.closingDate || ""}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Estado</label>
                  <select
                    name="status"
                    value={form.status ? "true" : "false"}
                    onChange={handleChange}
                    className="mt-1 p-3 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              Detalles de la Sede
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-200">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Nombre:</span>
                <span>{viewResult.name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Código de Habilitación:</span>
                <span>{viewResult.habilitationCode || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Empresa:</span>
                <span>
                  {companies.find((company) => company.id === viewResult.company)?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Departamento:</span>
                <span>{viewResult.departament || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Ciudad:</span>
                <span>{viewResult.city || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Dirección:</span>
                <span>{viewResult.address || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Fecha de Habilitación:</span>
                <span>{viewResult.habilitationDate || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Fecha de Cierre:</span>
                <span>{viewResult.closingDate || "N/A"}</span>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ciudad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dirección</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Habilitación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {headquarters.map((headquarter) => (
              <tr key={headquarter.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.habilitationCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.departament}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.city}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.habilitationDate}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 flex space-x-4">
                  <button
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    onClick={() => handleView(headquarter)}
                    title="Ver"
                    aria-label="Ver sede"
                  >
                    <FaEye size={20} />
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => handleEdit(headquarter)}
                    title="Editar"
                    aria-label="Editar sede"
                  >
                    <FaEdit size={20} />
                  </button>
                  
                  <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => handleDelete(headquarter.id)}
                    title="Eliminar"
                    aria-label="Eliminar sede"
                  >
                    <FaTrash size={20} />
                  </button>
                  <button
                    className={
                      headquarter.status
                        ? "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                        : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    }
                    onClick={() => handleToggleStatus(headquarter.id, headquarter.status)}
                    title={headquarter.status ? "Inactivar" : "Activar"}
                    aria-label={headquarter.status ? "Inactivar sede" : "Activar sede"}
                  >
                    {headquarter.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
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
              {headquarterIdToDelete
                ? "¿Estás seguro de que deseas eliminar esta sede? Esta acción no se puede deshacer."
                : headquarterToToggle
                ? `¿Estás seguro de que deseas ${headquarterToToggle.currentStatus ? "inactivar" : "activar"} esta sede?`
                : "¿Estás seguro de que deseas realizar esta acción?"}
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setHeadquarterIdToDelete(null);
                  setHeadquarterToToggle(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  if (headquarterIdToDelete) confirmDelete();
                  if (headquarterToToggle) confirmToggleStatus();
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