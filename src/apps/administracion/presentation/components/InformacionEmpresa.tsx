import { useEffect, useState } from "react";
import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import LoadingScreen from "../../../../shared/components/LoadingScreen";

interface Company {
    id: number;
    name: string;
    nit: string;
    legalRepresentative: string;
    phone: string;
    address: string;
    contactEmail: string;
    foundationDate: string;
    status: boolean;
}

export default function InformacionEmpresa() {
    const [empresa, setEmpresa] = useState<Company | null>(null);
    const [form, setForm] = useState<Company>({
        id: 0,
        name: "",
        nit: "",
        legalRepresentative: "",
        phone: "",
        address: "",
        contactEmail: "",
        foundationDate: "",
        status: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        axiosInstance.get("/companies/companies/1")
            .then((res) => {
                setEmpresa(res.data);
                setForm(res.data);
            })
            .catch(() => setError("Error al cargar la información de la empresa."))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const validateForm = () => {
        const nitRegex = /^[0-9\-]{6,}$/;
        if (!form.nit || !nitRegex.test(form.nit)) {
            setError("El NIT debe tener al menos 6 dígitos y solo números o guiones.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.contactEmail || !emailRegex.test(form.contactEmail)) {
            setError("El correo electrónico no es válido.");
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        if (!validateForm()) return;
        setSaving(true);
        axiosInstance.put(`/companies/companies/${form.id}/`, form)
            .then((res) => {
                setEmpresa(res.data);
                setForm(res.data);
                setMensaje("¡Información actualizada correctamente!");
            })
            .catch(() => setError("Error al guardar la información."))
            .finally(() => setSaving(false));
    };

    if (loading) {
        return <LoadingScreen message="Cargando información de la empresa..." />;
    }

    return (
        <form
            className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 sm:p-8 flex flex-col gap-5"
            onSubmit={handleSubmit}
        >
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Información de la Empresa</h2>
            {error && (
                <div className="text-red-600 dark:text-red-400 text-center mb-2">{error}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Razón Social</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">NIT</label>
                    <input
                        type="text"
                        name="nit"
                        value={form.nit}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Representante Legal</label>
                    <input
                        type="text"
                        name="legalRepresentative"
                        value={form.legalRepresentative}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Dirección</label>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Teléfono</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Correo electrónico</label>
                    <input
                        type="email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Fecha de Fundación</label>
                    <input
                        type="date"
                        name="foundationDate"
                        value={form.foundationDate ? form.foundationDate.slice(0, 10) : ""}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        required
                    />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        name="status"
                        checked={!!form.status}
                        onChange={handleChange}
                        className="rounded border-gray-300 dark:border-gray-700 accent-blue-600 dark:accent-blue-400"
                        id="status"
                    />
                    <label htmlFor="status" className="font-medium text-gray-700 dark:text-gray-200 select-none">
                        Empresa activa
                    </label>
                </div>
            </div>
            <button
                type="submit"
                disabled={saving}
                className="mt-4 px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
                {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            {mensaje && (
                <div className="text-green-600 dark:text-green-400 text-center mt-2">{mensaje}</div>
            )}
        </form>
    );
}