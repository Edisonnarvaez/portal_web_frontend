import { useEffect, useState } from "react";
import { useCompany, useRegion, useMunicipality } from "../hooks";
import type { Company } from "../../domain/entities";
import LoadingScreen from "../../../../shared/components/LoadingScreen";

export default function InformacionEmpresa() {
    const { company, loading, error: hookError, fetchCompany, updateCompany, validateData } = useCompany();
    const { regions, fetchRegions } = useRegion();
    const { municipalities, fetchMunicipalities } = useMunicipality();
    const [form, setForm] = useState<Company | null>(null);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Cargar empresa con ID 1 por defecto
        fetchCompany(1).catch(() => {
            // Manejar errores de carga
        });
        fetchRegions().catch(() => {
            // Manejar errores
        });
        fetchMunicipalities().catch(() => {
            // Manejar errores
        });
    }, []);

    useEffect(() => {
        // Sincronizar formulario cuando cambia la empresa
        if (company) {
            setForm(company);
        }
    }, [company]);

    useEffect(() => {
        // Mostrar errores del hook
        if (hookError) {
            setError(hookError);
        }
    }, [hookError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!form) return;
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const files = (e.target as HTMLInputElement).files;
        
        // Manejar archivos
        if (type === 'file' && files && files.length > 0) {
            setForm({
                ...form,
                [name]: files[0],
            });
            return;
        }
        
        // Convertir a número si es un campo numérico
        let finalValue: any = value;
        if (['region', 'municipality'].includes(name)) {
            finalValue = value ? parseInt(value, 10) : 0;
        } else if (type === 'checkbox') {
            finalValue = checked;
        }
        
        setForm({
            ...form,
            [name]: finalValue,
        });
    };

    const validateForm = () => {
        if (!form) return false;
        const { valid, errors } = validateData(form);
        if (!valid) {
            setError(errors.join(". "));
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        if (!form || !validateForm() || !form.id) return;
        
        setSaving(true);
        try {
            // Verificar si hay un archivo a cargar
            const hasFile = form.documento_representante_legal && 
                           typeof form.documento_representante_legal === 'object' && 
                           'size' in form.documento_representante_legal;
            
            if (hasFile) {
                const formData = new FormData();
                formData.append('name', form.name);
                formData.append('type_document', form.type_document);
                formData.append('number_document', form.number_document);
                if (form.digit_verification) formData.append('digit_verification', form.digit_verification);
                formData.append('legal_nature', form.legal_nature);
                formData.append('class_healthcare_entity', form.class_healthcare_entity);
                formData.append('region', String(form.region));
                formData.append('municipality', String(form.municipality));
                if (form.code_authorize) formData.append('code_authorize', form.code_authorize);
                formData.append('address', form.address);
                formData.append('phone', form.phone);
                formData.append('contactEmail', form.contactEmail);
                if (form.foundationDate) formData.append('foundationDate', form.foundationDate);
                formData.append('type_document_legal_representative', form.type_document_legal_representative);
                formData.append('number_document_legal_representative', form.number_document_legal_representative);
                formData.append('name_legal_representative', form.name_legal_representative);
                formData.append('company_social_state', String(form.company_social_state || false));
                formData.append('status', String(form.status));
                formData.append('documento_representante_legal', form.documento_representante_legal as any);
                
                await updateCompany(form.id, formData as any);
            } else {
                // Enviar todos los campos editables de la compañía (sin archivo)
                const updateData = {
                    name: form.name,
                    type_document: form.type_document,
                    number_document: form.number_document,
                    digit_verification: form.digit_verification || undefined,
                    legal_nature: form.legal_nature,
                    class_healthcare_entity: form.class_healthcare_entity,
                    region: form.region,
                    municipality: form.municipality,
                    code_authorize: form.code_authorize || undefined,
                    address: form.address,
                    phone: form.phone,
                    contactEmail: form.contactEmail,
                    foundationDate: form.foundationDate || undefined,
                    type_document_legal_representative: form.type_document_legal_representative,
                    number_document_legal_representative: form.number_document_legal_representative,
                    name_legal_representative: form.name_legal_representative,
                    company_social_state: form.company_social_state || false,
                    status: form.status,
                };
                await updateCompany(form.id, updateData as any);
            }
            setMensaje("¡Información actualizada correctamente!");
        } catch (err: any) {
            console.error('Error al actualizar:', err?.response?.data || err);
            setError(err?.response?.data?.detail || "Error al guardar la información.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Cargando información de la empresa..." fullScreen={true} />;
    }

    if (!form) {
        return (
            <div className="text-red-600 dark:text-red-400 text-center">
                Error: No se pudo cargar la información de la empresa.
            </div>
        );
    }

    return (
        <form
            className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
            onSubmit={handleSubmit}
        >
            {/* Header 
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                <h2 className="text-2xl sm:text-3xl font-bold">Información de la Empresa</h2>
                <p className="text-blue-100 text-sm mt-1">Gestiona los datos principales de tu organización</p>
            </div>*/}

            {/* Content */}
            <div className="p-6 sm:p-8">
                {/* Error & Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                        ⚠️ {error}
                    </div>
                )}
                {mensaje && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
                        ✓ {mensaje}
                    </div>
                )}

                {/* Sección 1: Información Básica */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                        📋 Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Razón Social / Nombre *</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Tipo de Documento *</label>
                            <select
                                name="type_document"
                                value={form.type_document || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            >
                                <option value="">Seleccione tipo</option>
                                <option value="NIT">NIT</option>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="PA">Pasaporte</option>
                                <option value="PPT">PEP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Número de Documento *</label>
                            <input
                                type="text"
                                name="number_document"
                                value={form.number_document || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Dígito Verificación</label>
                            <input
                                type="text"
                                name="digit_verification"
                                value={form.digit_verification || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Fecha de Fundación</label>
                            <input
                                type="date"
                                name="foundationDate"
                                value={form.foundationDate || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 2: Clasificación */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                        🏥 Clasificación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Naturaleza Legal *</label>
                            <select
                                name="legal_nature"
                                value={form.legal_nature || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            >
                                <option value="">Seleccione naturaleza</option>
                                <option value="PUBLICA">Pública</option>
                                <option value="PRIVADA">Privada</option>
                                <option value="MIXTA">Mixta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Clase de Entidad de Salud *</label>
                            <select
                                name="class_healthcare_entity"
                                value={form.class_healthcare_entity || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            >
                                <option value="">Seleccione clase</option>
                                <option value="IPS">IPS - Prestador de Servicios</option>
                                <option value="PROF">Profesional Independiente</option>
                                <option value="PH">Persona Hogar</option>
                                <option value="PJ">Persona Jurídica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Código INVIMA</label>
                            <input
                                type="text"
                                name="code_authorize"
                                value={form.code_authorize || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 3: Ubicación */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                        📍 Ubicación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Región *</label>
                            <select
                                name="region"
                                value={form.region || ""}
                                onChange={handleChange}
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
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            >
                                <option value="">Seleccione un municipio</option>
                                {Array.isArray(municipalities) && municipalities.map(municipality => (
                                    <option key={municipality.id} value={municipality.id}>{municipality.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Dirección *</label>
                            <input
                                type="text"
                                name="address"
                                value={form.address || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 4: Contacto */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                        📞 Contacto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Teléfono *</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Correo Electrónico *</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={form.contactEmail || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 5: Representante Legal */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                        👤 Representante Legal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Nombre Completo *</label>
                            <input
                                type="text"
                                name="name_legal_representative"
                                value={form.name_legal_representative || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Tipo de Documento *</label>
                            <select
                                name="type_document_legal_representative"
                                value={form.type_document_legal_representative || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            >
                                <option value="">Seleccione tipo</option>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="PA">Pasaporte</option>
                                <option value="NIT">NIT</option>
                                <option value="PPT">PEP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 text-sm">Número de Documento *</label>
                            <input
                                type="text"
                                name="number_document_legal_representative"
                                value={form.number_document_legal_representative || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Documento del Representante */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <label className="block font-medium mb-3 text-gray-700 dark:text-gray-200 text-sm">Documento de Identificación</label>
                        <input
                            type="file"
                            name="documento_representante_legal"
                            onChange={handleChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="w-full rounded-lg border px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
                        />
                        {form.documento_representante_legal && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center justify-between gap-3">
                                <span className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-lg">📄</span>
                                    <span className="truncate">
                                        {String(
                                            typeof form.documento_representante_legal === 'string' 
                                                ? form.documento_representante_legal 
                                                : (form.documento_representante_legal as any)?.name || 'Archivo'
                                        )}
                                    </span>
                                </span>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            try {
                                                // Si es un File object (recién cargado)
                                                if (typeof form.documento_representante_legal === 'object' && 'size' in form.documento_representante_legal) {
                                                    const url = URL.createObjectURL(form.documento_representante_legal as any);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.target = '_blank';
                                                    link.rel = 'noopener noreferrer';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    URL.revokeObjectURL(url);
                                                }
                                                // Si es un string (URL del backend)
                                                else if (typeof form.documento_representante_legal === 'string') {
                                                    const fullUrl = form.documento_representante_legal.startsWith('http') 
                                                        ? form.documento_representante_legal 
                                                        : `http://127.0.0.1:8000${form.documento_representante_legal.startsWith('/') ? '' : '/'}${form.documento_representante_legal}`;
                                                    window.open(fullUrl, '_blank', 'noopener,noreferrer');
                                                }
                                            } catch (error) {
                                                console.error('Error al abrir documento:', error);
                                                alert('No se pudo abrir el documento.');
                                            }
                                        }}
                                        title="Ver documento"
                                        className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
                                    >
                                        👁️ Ver
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                // Si es un File object (recién cargado)
                                                if (typeof form.documento_representante_legal === 'object' && 'size' in form.documento_representante_legal) {
                                                    const url = URL.createObjectURL(form.documento_representante_legal as any);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = (form.documento_representante_legal as any)?.name || 'documento';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    URL.revokeObjectURL(url);
                                                }
                                                // Si es un string (URL del backend)
                                                else if (typeof form.documento_representante_legal === 'string') {
                                                    const urlPath = form.documento_representante_legal;
                                                    const fullUrl = urlPath.startsWith('http') 
                                                        ? urlPath 
                                                        : `http://127.0.0.1:8000${urlPath}`;
                                                    
                                                    console.log('Descargando desde:', fullUrl);
                                                    
                                                    // Usar fetch para descargar el archivo
                                                    const response = await fetch(fullUrl);
                                                    if (!response.ok) {
                                                        throw new Error(`HTTP error! status: ${response.status}`);
                                                    }
                                                    
                                                    const blob = await response.blob();
                                                    const url = URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = urlPath.split('/').pop() || 'documento';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    URL.revokeObjectURL(url);
                                                }
                                            } catch (error) {
                                                console.error('Error al descargar documento:', error);
                                                alert('No se pudo descargar el documento. Verifica que el archivo exista.');
                                            }
                                        }}
                                        title="Descargar documento"
                                        className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition"
                                    >
                                        ⬇️ Descargar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm({
                                                ...form,
                                                documento_representante_legal: undefined,
                                            });
                                        }}
                                        title="Eliminar documento"
                                        className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Formatos: PDF, DOC, DOCX, JPG, JPEG, PNG (máx. 10MB)
                        </p>
                    </div>
                </div>

                {/* Sección 6: Estado de la Empresa */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                        ⚙️ Estado de la Empresa
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer">
                            <input
                                type="checkbox"
                                name="status"
                                checked={!!form.status}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                                id="status"
                            />
                            <label htmlFor="status" className="ml-3 font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                                Empresa Activa
                            </label>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer">
                            <input
                                type="checkbox"
                                name="company_social_state"
                                checked={!!form.company_social_state}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 dark:accent-blue-500 cursor-pointer"
                                id="company_social_state"
                            />
                            <label htmlFor="company_social_state" className="ml-3 font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                                Empresa de Economía Social
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {saving ? "⏳ Guardando..." : "💾 Guardar Cambios"}
                    </button>
                    <button
                        type="reset"
                        className="flex-1 px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        onClick={() => setForm(company)}
                    >
                        ↻ Descartar
                    </button>
                </div>
            </div>
        </form>
    );
}