import React, { useState, useEffect } from "react";
import { HiStar, HiCalendarDays, HiUser } from "react-icons/hi2";
import type { Reconocimiento, CreateReconocimientoRequest, UpdateReconocimientoRequest, Funcionario } from "../../domain/types";
import { formatDateToInput, getCurrentLocalDate } from "../../../../shared/utils/dateUtils";

interface ReconocimientoFormProps {
    reconocimiento?: Reconocimiento | null;
    funcionarioPreseleccionado?: Funcionario | null; // 👈 NUEVO: para preseleccionar funcionario
    funcionarios: Funcionario[]; // 👈 NUEVO: lista de funcionarios
    onSubmit: (data: CreateReconocimientoRequest | UpdateReconocimientoRequest) => Promise<void>;
    loading?: boolean;
}

const TIPOS_RECONOCIMIENTO = [
    "Excelencia en el servicio",
    "Liderazgo",
    "Trabajo en equipo",
    "Innovación",
    "Compromiso institucional",
    "Responsabilidad social",
    "Otro"
];

export default function ReconocimientoForm({
    reconocimiento,
    funcionarioPreseleccionado,
    funcionarios,
    onSubmit,
    loading = false
}: ReconocimientoFormProps) {
    const [formData, setFormData] = useState({
        funcionario: 0,
        titulo: '',
        descripcion: '',
        fecha: '',
        tipo: '',
        publicar: true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (reconocimiento) {
            setFormData({
                funcionario: reconocimiento.funcionario.id, // 👈 CAMBIAR: extraer ID del objeto
                titulo: reconocimiento.titulo,
                descripcion: reconocimiento.descripcion,
                fecha: formatDateToInput(reconocimiento.fecha),
                tipo: reconocimiento.tipo || '',
                publicar: reconocimiento.publicar
            });
        } else {
            setFormData({
                funcionario: funcionarioPreseleccionado?.id || 0,
                titulo: '',
                descripcion: '',
                fecha: getCurrentLocalDate(),
                tipo: '',
                publicar: true
            });
        }
        setErrors({});
    }, [reconocimiento, funcionarioPreseleccionado]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.funcionario || formData.funcionario === 0) {
            newErrors.funcionario = 'Funcionario es requerido';
        }
        if (!formData.titulo.trim()) newErrors.titulo = 'Título es requerido';
        if (!formData.descripcion.trim()) newErrors.descripcion = 'Descripción es requerida';
        if (!formData.fecha) newErrors.fecha = 'Fecha es requerida';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // 👈 DEBUG: Ver datos antes de enviar
        //console.log('Datos del formulario de reconocimiento:', formData);

        const submitData = reconocimiento
            ? { id: reconocimiento.id, ...formData } as UpdateReconocimientoRequest
            : formData as CreateReconocimientoRequest;

        // 👈 DEBUG: Ver datos finales a enviar
        //console.log('Datos finales a enviar:', submitData);

        await onSubmit(submitData);
    };

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form
            id="crud-form"
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Funcionario */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <HiUser className="w-4 h-4 inline mr-2" />
                    Funcionario
                </label>
                <select
                    value={formData.funcionario}
                    onChange={(e) => handleInputChange('funcionario', parseInt(e.target.value) || 0)}
                    disabled={!!funcionarioPreseleccionado || loading} // 👈 DESHABILITAR si está preseleccionado
                    className={`
            w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            ${errors.funcionario ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${funcionarioPreseleccionado ? 'bg-gray-100 dark:bg-gray-600' : ''}
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          `}
                >
                    <option value={0}>Seleccionar funcionario...</option>
                    {funcionarios.map(funcionario => (
                        <option key={funcionario.id} value={funcionario.id}>
                            {funcionario.nombres} {funcionario.apellidos} - {funcionario.cargo}
                        </option>
                    ))}
                </select>
                {errors.funcionario && <p className="text-red-500 text-sm mt-1">{errors.funcionario}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <HiStar className="w-4 h-4 inline mr-2" />
                        Título del reconocimiento
                    </label>
                    <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.titulo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
                        disabled={loading}
                    />
                    {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
                </div>

                {/* Fecha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <HiCalendarDays className="w-4 h-4 inline mr-2" />
                        Fecha
                    </label>
                    <input
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => handleInputChange('fecha', e.target.value)}
                        className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.fecha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
                        disabled={loading}
                    />
                    {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
                </div>
            </div>

            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de reconocimiento
                </label>
                <select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                >
                    <option value="">Seleccionar tipo...</option>
                    {TIPOS_RECONOCIMIENTO.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                </select>
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción del reconocimiento
                </label>
                <textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={4}
                    className={`
            w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            ${errors.descripcion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          `}
                    disabled={loading}
                />
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
            </div>

            {/* Publicar */}
            <div className="flex items-center">
                <input
                    id="publicar"
                    type="checkbox"
                    checked={formData.publicar}
                    onChange={(e) => handleInputChange('publicar', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    disabled={loading}
                />
                <label htmlFor="publicar" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Publicar en el tablero de reconocimientos
                </label>
            </div>
        </form>
    );
}