import React, { useState } from 'react';
import { HiExclamationCircle } from 'react-icons/hi2';
import type {
    Indicator,
    CreateIndicatorRequest,
    UpdateIndicatorRequest
} from '../../../domain/entities';
import {
    CALCULATION_METHODS,
    MEASUREMENT_FREQUENCIES,
    TREND_OPTIONS,
    CLASS_OPTIONS
} from '../../../domain/entities';
import { useAuthContext } from '../../../../../apps/auth/presentation/context/AuthContext';

// 🎨 Componente FormField reutilizable
interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    value?: any;
    onChange: (e: any) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    children?: React.ReactNode;
    className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    children,
    className = ''
}) => (
    <div className={className}>
        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        {children || (
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${error
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500`}
            />
        )}
        {error && (
            <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-sm">
                <HiExclamationCircle className="w-4 h-4" />
                {error}
            </div>
        )}
    </div>
);

interface IndicatorFormProps {
    indicator?: Indicator;
    processes: Array<{ id: number, name: string }>;
    onSubmit: (data: CreateIndicatorRequest | UpdateIndicatorRequest) => void;
    loading: boolean;
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({
    indicator,
    processes,
    onSubmit,
    loading
}) => {
    const { user } = useAuthContext();

    const [form, setForm] = useState<Partial<Indicator>>({
        name: indicator?.name || '',
        description: indicator?.description || '',
        code: indicator?.code || '',
        version: indicator?.version || '1.0',
        calculationMethod: indicator?.calculationMethod || 'percentage',
        measurementUnit: indicator?.measurementUnit || '',
        numerator: indicator?.numerator || '',
        numeratorResponsible: indicator?.numeratorResponsible || '',
        numeratorSource: indicator?.numeratorSource || '',
        numeratorDescription: indicator?.numeratorDescription || '',
        denominator: indicator?.denominator || '',
        denominatorResponsible: indicator?.denominatorResponsible || '',
        denominatorSource: indicator?.denominatorSource || '',
        denominatorDescription: indicator?.denominatorDescription || '',
        classindicator: indicator?.classindicator || 'other',
        trend: indicator?.trend || 'increasing',
        target: indicator?.target || 0,
        author: indicator?.author || '',
        process: indicator?.process || 0,
        measurementFrequency: indicator?.measurementFrequency || 'quarterly',
        status: indicator?.status ?? true,
        user: user?.id || indicator?.user || 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;

        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (name === 'Process') {
            processedValue = parseInt(value) || 0;
        }

        setForm(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.name?.trim()) newErrors.name = 'El nombre es obligatorio';
        if (!form.description?.trim()) newErrors.description = 'La descripción es obligatoria';
        if (!form.code?.trim()) newErrors.code = 'El código es obligatorio';
        if (!form.version?.trim()) newErrors.version = 'La versión es obligatoria';
        if (!form.measurementUnit?.trim()) newErrors.measurementUnit = 'La unidad de medida es obligatoria';
        if (!form.numerator?.trim()) newErrors.numerator = 'El numerador es obligatorio';
        if (!form.denominator?.trim()) newErrors.denominator = 'El denominador es obligatorio';
        if (!form.classindicator) newErrors.classindicator = 'Debe seleccionar una clase';
        if (
            form.target === undefined ||
            form.target === null ||
            (typeof form.target === 'number' && isNaN(form.target))
        ) newErrors.target = 'La meta es obligatoria';
        if (!form.author?.trim()) newErrors.author = 'El autor es obligatorio';
        if (!form.process || form.process === 0) newErrors.process = 'Debe seleccionar un proceso';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const data = {
            ...form,
            user: user?.id || form.user || 0,
        } as CreateIndicatorRequest | UpdateIndicatorRequest;

        if (indicator?.id) {
            (data as UpdateIndicatorRequest).id = indicator.id;
        }

        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección 1: Información Básica */}
            <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-300">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Información Básica
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        label="Nombre"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                    />
                    <FormField
                        label="Código"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        error={errors.code}
                        required
                    />
                    <FormField
                        label="Versión"
                        name="version"
                        value={form.version}
                        onChange={handleChange}
                        error={errors.version}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                        label="Proceso"
                        name="process"
                        value={form.process}
                        onChange={handleChange}
                        error={errors.process}
                        required
                    >
                        <select
                            name="process"
                            value={form.process || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                ${errors.process
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                }
                                text-gray-900 dark:text-gray-100`}
                        >
                            <option value="">Seleccionar proceso</option>
                            {processes.map(proc => (
                                <option key={proc.id} value={proc.id}>
                                    {proc.name}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField
                        label="Autor"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                        error={errors.author}
                        required
                    />
                </div>
                <div className="mt-4">
                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={form.description || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe claramente qué mide este indicador..."
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            ${errors.description
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                            }
                            text-gray-900 dark:text-gray-100 resize-none`}
                    />
                    {errors.description && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-sm">
                            <HiExclamationCircle className="w-4 h-4" />
                            {errors.description}
                        </div>
                    )}
                </div>
            </div>

            {/* Sección 2: Configuración del Cálculo */}
            <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-500">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-300">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Configuración del Cálculo
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                        label="Método"
                        name="calculationMethod"
                        value={form.calculationMethod}
                        onChange={handleChange}
                        required
                    >
                        <select
                            name="calculationMethod"
                            value={form.calculationMethod || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {CALCULATION_METHODS.map(method => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField
                        label="Unidad"
                        name="measurementUnit"
                        value={form.measurementUnit}
                        onChange={handleChange}
                        placeholder="%, cantidad, etc."
                        error={errors.measurementUnit}
                        required
                    />
                    <FormField
                        label="Frecuencia"
                        name="measurementFrequency"
                        value={form.measurementFrequency}
                        onChange={handleChange}
                        required
                    >
                        <select
                            name="measurementFrequency"
                            value={form.measurementFrequency || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {MEASUREMENT_FREQUENCIES.map(freq => (
                                <option key={freq.value} value={freq.value}>
                                    {freq.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField
                        label="Clase"
                        name="classindicator"
                        value={form.classindicator}
                        onChange={handleChange}
                        error={errors.classindicator}
                    >
                        <select
                            name="classindicator"
                            value={form.classindicator || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {CLASS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    
                    <FormField
                        label="Tendencia"
                        name="trend"
                        value={form.trend}
                        onChange={handleChange}
                        required
                    >
                        <select
                            name="trend"
                            value={form.trend || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {TREND_OPTIONS.map(trend => (
                                <option key={trend.value} value={trend.value}>
                                    {trend.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </div>

            {/* Sección 3: Numerador */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-300 dark:border-blue-700">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Numerador
                    </h3>
                </div>
                <div className="space-y-4">
                    <FormField
                        label="Definición"
                        name="numerator"
                        value={form.numerator}
                        onChange={handleChange}
                        error={errors.numerator}
                        required
                    >
                        <textarea
                            name="numerator"
                            value={form.numerator || ''}
                            onChange={handleChange}
                            rows={2}
                            className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                ${errors.numerator
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                }
                                text-gray-900 dark:text-gray-100 resize-none`}
                        />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Responsable"
                            name="numeratorResponsible"
                            value={form.numeratorResponsible}
                            onChange={handleChange}
                        />
                        <FormField
                            label="Fuente"
                            name="numeratorSource"
                            value={form.numeratorSource}
                            onChange={handleChange}
                        />
                    </div>
                    <FormField
                        label="Descripción Adicional"
                        name="numeratorDescription"
                        value={form.numeratorDescription}
                        onChange={handleChange}
                    >
                        <textarea
                            name="numeratorDescription"
                            value={form.numeratorDescription || ''}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                        />
                    </FormField>
                </div>
            </div>

            {/* Sección 4: Denominador */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-300 dark:border-purple-700">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">4</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Denominador
                    </h3>
                </div>
                <div className="space-y-4">
                    <FormField
                        label="Definición"
                        name="denominator"
                        value={form.denominator}
                        onChange={handleChange}
                        error={errors.denominator}
                        required
                    >
                        <textarea
                            name="denominator"
                            value={form.denominator || ''}
                            onChange={handleChange}
                            rows={2}
                            className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                ${errors.denominator
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                }
                                text-gray-900 dark:text-gray-100 resize-none`}
                        />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Responsable"
                            name="denominatorResponsible"
                            value={form.denominatorResponsible}
                            onChange={handleChange}
                        />
                        <FormField
                            label="Fuente"
                            name="denominatorSource"
                            value={form.denominatorSource}
                            onChange={handleChange}
                        />
                    </div>
                    <FormField
                        label="Descripción Adicional"
                        name="denominatorDescription"
                        value={form.denominatorDescription}
                        onChange={handleChange}
                    >
                        <textarea
                            name="denominatorDescription"
                            value={form.denominatorDescription || ''}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                        />
                    </FormField>
                </div>
            </div>

            {/* Sección 5: Información Adicional */}
            <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-500">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600 dark:text-green-300">5</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Información Adicional
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Meta"
                        name="target"
                        type="number"
                        value={form.target}
                        onChange={handleChange}
                        error={errors.target}
                        placeholder="valor numérico"
                        required
                    />
                    <div className="flex items-end gap-3 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="status"
                                checked={form.status || false}
                                onChange={handleChange}
                                className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Indicador activo
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end items-center gap-3 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    )}
                    <span className="text-base">
                        {loading ? 'Guardando...' : (indicator ? 'Actualizar' : 'Crear')} Indicador
                    </span>
                </button>
            </div>
        </form>
    );
};

export default IndicatorForm;