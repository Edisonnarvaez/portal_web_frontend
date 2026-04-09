import { useEffect, useState } from "react";
import { useHeadquarters, useCompany, useRegion, useMunicipality } from "../hooks";
import type { Headquarters } from "../../domain/entities";
import LoadingScreen from "../../../../shared/components/LoadingScreen";
import { FaEdit } from "react-icons/fa";
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa6";

export default function SedesEmpresa() {
  const { headquarters, loading: hqLoading, error: hqError, fetchHeadquarters, createHeadquarter, updateHeadquarter, deleteHeadquarter, toggleStatus } = useHeadquarters();
  const { companies, loading: compLoading, fetchCompanies } = useCompany();
  const { regions, fetchRegions } = useRegion();
  const { municipalities, fetchMunicipalities } = useMunicipality();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [headquarterIdToDelete, setHeadquarterIdToDelete] = useState<number | null>(null);
  const [headquarterToToggle, setHeadquarterToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResult, setViewResult] = useState<Headquarters | null>(null);
  const [form, setForm] = useState<Partial<Headquarters>>({
    name: "",
    company: 0,
    region: 0,
    municipality: 0,
    address: "",
    status: true,
    concepto_sanitario: false,
    reserva_agua_24h: false,
    planta_electrica: false,
    es_domicilio_ong: false,
  });
  const [mensaje, setMensaje] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchHeadquarters().catch(() => {
      // Manejar errores
    });
    fetchCompanies().catch(() => {
      // Manejar errores
    });
    fetchRegions().catch(() => {
      // Manejar errores
    });
    fetchMunicipalities().catch(() => {
      // Manejar errores
    });
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
    if (!form.name || !form.company || !form.region || !form.municipality || !form.address) {
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
        await updateHeadquarter(form.id, form as Headquarters);
        setMensaje("Sede actualizada exitosamente");
      } else {
        if (form && form.name && form.company && form.region && form.municipality && form.address) {
          await createHeadquarter(form as Headquarters);
          setMensaje("Sede creada exitosamente");
        }
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      setFormError("Error al guardar la sede.");
    }
  };

  const handleEdit = (headquarter: Headquarters) => {
    setForm(headquarter);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (headquarter: Headquarters) => {
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
      await deleteHeadquarter(headquarterIdToDelete);
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
      await toggleStatus(headquarterToToggle.id, !headquarterToToggle.currentStatus);
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
      company: 0,
      region: 0,
      municipality: 0,
      address: "",
      status: true,
      concepto_sanitario: false,
      reserva_agua_24h: false,
      planta_electrica: false,
      es_domicilio_ong: false,
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getRegionName = (regionId: number) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'N/A';
  };

  const getMunicipalityName = (municipalityId: number) => {
    const municipality = municipalities.find(m => m.id === municipalityId);
    return municipality ? municipality.name : 'N/A';
  };

  const getFilteredMunicipalities = () => {
    if (!form.region) return [];
    // Filtrar municipios que pertenecen a la región seleccionada
    // Convertir ambos a números por si hay incompatibilidad de tipos
    return Array.isArray(municipalities) 
      ? municipalities.filter(m => {
          const mRegion = Number(m.region);
          const formRegion = Number(form.region);
          return mRegion === formRegion;
        })
      : [];
  };

  if (hqLoading || compLoading) return <LoadingScreen message="Cargando sedes..." fullScreen={true} />;
  if (hqError) return <div className="text-center py-8 text-red-600 dark:text-red-400">{hqError}</div>;

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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
              <h2 className="text-2xl font-bold">{isEditing ? "Editar" : "Agregar"} Sede</h2>
              <p className="text-blue-100 text-sm mt-1">Completa los datos de la nueva sede</p>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Sección 1: Datos Básicos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                    📋 Datos Básicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Nombre de la Sede *</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Ej: Sede Principal"
                        value={form.name || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Empresa *</label>
                      <select
                        name="company"
                        value={form.company || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                        required
                      >
                        <option value="">Seleccione empresa</option>
                        {Array.isArray(companies) && companies.map(company => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Ubicación */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                    📍 Ubicación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Región *</label>
                      <select
                        name="region"
                        value={form.region || ""}
                        onChange={(e) => {
                          handleChange(e);
                          // Resetear municipio al cambiar región
                          setForm(prev => ({
                            ...prev,
                            municipality: 0
                          }));
                        }}
                        className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                        required
                      >
                        <option value="">Seleccione una región</option>
                        {Array.isArray(regions) && regions.map(region => (
                          <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Municipio *</label>
                      <select
                        name="municipality"
                        value={form.municipality || ""}
                        onChange={handleChange}
                        disabled={!form.region}
                        className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">
                          {!form.region ? "Primero selecciona una región" : "Selecciona un municipio"}
                        </option>
                        {getFilteredMunicipalities().map(municipality => (
                          <option key={municipality.id} value={municipality.id}>{municipality.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Dirección *</label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Ej: Calle 10 #20-50"
                        value={form.address || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 3: Infraestructura */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                    🏗️ Infraestructura
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer">
                      <input
                        type="checkbox"
                        name="concepto_sanitario"
                        checked={form.concepto_sanitario || false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                        id="concepto_sanitario"
                      />
                      <label htmlFor="concepto_sanitario" className="ml-3 font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                        Concepto sanitario
                      </label>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer">
                      <input
                        type="checkbox"
                        name="reserva_agua_24h"
                        checked={form.reserva_agua_24h || false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                        id="reserva_agua_24h"
                      />
                      <label htmlFor="reserva_agua_24h" className="ml-3 font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                        Reserva agua 24h
                      </label>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer">
                      <input
                        type="checkbox"
                        name="planta_electrica"
                        checked={form.planta_electrica || false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                        id="planta_electrica"
                      />
                      <label htmlFor="planta_electrica" className="ml-3 font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                        Planta eléctrica
                      </label>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer">
                      <input
                        type="checkbox"
                        name="es_domicilio_ong"
                        checked={form.es_domicilio_ong || false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                        id="es_domicilio_ong"
                      />
                      <label htmlFor="es_domicilio_ong" className="ml-3 font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                        Es domicilio ONG
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sección 4: Configuración */}
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
                      Sede activa
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white flex justify-between items-start">
              <h2 className="text-2xl font-bold">🏢 Detalles de la Sede</h2>
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
              {/* Sección 1: Datos Básicos */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">
                  📋 Datos Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Nombre</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.name || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Empresa</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {companies.find((company) => company.id === viewResult.company)?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 2: Ubicación */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">
                  📍 Ubicación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Región</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{getRegionName(viewResult.region) || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Municipio</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{getMunicipalityName(viewResult.municipality) || "N/A"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Dirección</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{viewResult.address || "N/A"}</p>
                </div>
              </div>

              {/* Sección 3: Infraestructura */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">
                  🏗️ Infraestructura
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Concepto sanitario</p>
                    <span className={`inline-block w-5 h-5 rounded ${viewResult.concepto_sanitario ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Reserva agua 24h</p>
                    <span className={`inline-block w-5 h-5 rounded ${viewResult.reserva_agua_24h ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Planta eléctrica</p>
                    <span className={`inline-block w-5 h-5 rounded ${viewResult.planta_electrica ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Es domicilio ONG</p>
                    <span className={`inline-block w-5 h-5 rounded ${viewResult.es_domicilio_ong ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  </div>
                </div>
              </div>

              {/* Sección 4: Estado */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-blue-600">
                  ⚙️ Estado
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Sede activa</p>
                  <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                    viewResult.status 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {viewResult.status ? "✓ Activa" : "○ Inactiva"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-6 px-6 sm:px-8 pb-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                onClick={() => setIsViewModalOpen(false)}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Región</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Municipio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dirección</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {headquarters.map((headquarter) => (
              <tr key={headquarter.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{getRegionName(headquarter.region)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{getMunicipalityName(headquarter.municipality)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{headquarter.address}</td>
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