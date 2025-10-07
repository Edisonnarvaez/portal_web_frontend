import React, { useState, useEffect } from "react";
import { HiGift, HiUser } from "react-icons/hi2";
import type { FelicitacionCumpleanios, CreateFelicitacionRequest, UpdateFelicitacionRequest, Funcionario } from "../../domain/types";

interface FelicitacionFormProps {
    felicitacion?: FelicitacionCumpleanios | null;
    funcionarioPreseleccionado?: Funcionario | null;
    funcionarios: Funcionario[];
    onSubmit: (data: CreateFelicitacionRequest | UpdateFelicitacionRequest) => Promise<void>;
    loading?: boolean;
}

const MENSAJES_PREDEFINIDOS = [
    "🎉 ¡Feliz cumpleaños! Esperamos que tengas un día maravilloso lleno de alegría y bendiciones.",
    "🎂 En tu día especial, te deseamos mucha felicidad, salud y éxitos. ¡Feliz cumpleaños!",
    "🌟 Que este nuevo año de vida esté lleno de nuevas oportunidades y grandes logros. ¡Feliz cumpleaños!",
    "🎈 Celebramos contigo tu cumpleaños y agradecemos tu dedicación y compromiso con la institución.",
    "🎁 ¡Feliz cumpleaños! Que todos tus deseos se hagan realidad en este nuevo año de vida."
];

export default function FelicitacionForm({
    felicitacion,
    funcionarioPreseleccionado,
    funcionarios,
    onSubmit,
    loading = false
}: FelicitacionFormProps) {
    const [formData, setFormData] = useState({
        funcionario: 0,
        mensaje: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (felicitacion) {
            setFormData({
                funcionario: felicitacion.funcionario.id, // 👈 CAMBIAR: extraer ID del objeto
                mensaje: felicitacion.mensaje
            });
        } else {
            setFormData({
                funcionario: funcionarioPreseleccionado?.id || 0,
                mensaje: MENSAJES_PREDEFINIDOS[0] // Mensaje por defecto
            });
        }
        setErrors({});
    }, [felicitacion, funcionarioPreseleccionado]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.funcionario || formData.funcionario === 0) {
            newErrors.funcionario = 'Funcionario es requerido';
        }
        if (!formData.mensaje.trim()) newErrors.mensaje = 'Mensaje es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData = felicitacion
            ? { id: felicitacion.id, ...formData } as UpdateFelicitacionRequest
            : formData as CreateFelicitacionRequest;

        await onSubmit(submitData);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const aplicarMensajePredefinido = (mensaje: string) => {
        handleInputChange('mensaje', mensaje);
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
                    disabled={!!funcionarioPreseleccionado || loading}
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

            {/* Mensajes predefinidos */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <HiGift className="w-4 h-4 inline mr-2" />
                    Mensajes predefinidos
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {MENSAJES_PREDEFINIDOS.map((mensaje, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => aplicarMensajePredefinido(mensaje)}
                            className={`
                text-left p-3 rounded-lg border transition-colors text-sm
                ${formData.mensaje === mensaje
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }
              `}
                            disabled={loading}
                        >
                            {mensaje}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mensaje personalizado */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensaje de felicitación
                </label>
                <textarea
                    value={formData.mensaje}
                    onChange={(e) => handleInputChange('mensaje', e.target.value)}
                    rows={4}
                    placeholder="Escribe un mensaje personalizado para el cumpleaños..."
                    className={`
            w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            ${errors.mensaje ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          `}
                    disabled={loading}
                />
                {errors.mensaje && <p className="text-red-500 text-sm mt-1">{errors.mensaje}</p>}
            </div>
        </form>
    );
}