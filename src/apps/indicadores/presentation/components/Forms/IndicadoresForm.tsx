import React, { useState, useEffect } from 'react';
import type {
    Indicator,
    CreateIndicatorRequest,
    UpdateIndicatorRequest
} from '../../../domain/entities';
import {
    CALCULATION_METHODS,
    MEASUREMENT_FREQUENCIES,
    TREND_OPTIONS
} from '../../../domain/entities';
import { useAuthContext } from '../../../../../apps/auth/presentation/context/AuthContext';

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
        trend: indicator?.trend || 'increasing',
        target: indicator?.target || '',
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
        if (!form.target?.trim()) newErrors.target = 'La meta es obligatoria';
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información básica */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Información Básica
                    </h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Nombre *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Código *
                    </label>
                    <input
                        type="text"
                        name="code"
                        value={form.code || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Versión *
                    </label>
                    <input
                        type="text"
                        name="version"
                        value={form.version || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.version ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Proceso *
                    </label>
                    <select
                        name="process"
                        value={form.process || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.process ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    >
                        <option value="">Seleccionar proceso</option>
                        {processes.map(proc => (
                            <option key={proc.id} value={proc.id}>
                                {proc.name}
                            </option>
                        ))}
                    </select>
                    {errors.process && <p className="text-red-500 text-sm mt-1">{errors.process}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Descripción *
                    </label>
                    <textarea
                        name="description"
                        value={form.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Configuración del cálculo */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
                        Configuración del Cálculo
                    </h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Método de Cálculo *
                    </label>
                    <select
                        name="calculationMethod"
                        value={form.calculationMethod || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        {CALCULATION_METHODS.map(method => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Unidad de Medida *
                    </label>
                    <input
                        type="text"
                        name="measurementUnit"
                        value={form.measurementUnit || ''}
                        onChange={handleChange}
                        placeholder="%, cantidad, etc."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.measurementUnit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.measurementUnit && <p className="text-red-500 text-sm mt-1">{errors.measurementUnit}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Frecuencia de Medición *
                    </label>
                    <select
                        name="measurementFrequency"
                        value={form.measurementFrequency || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        {MEASUREMENT_FREQUENCIES.map(freq => (
                            <option key={freq.value} value={freq.value}>
                                {freq.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Tendencia *
                    </label>
                    <select
                        name="trend"
                        value={form.trend || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        {TREND_OPTIONS.map(trend => (
                            <option key={trend.value} value={trend.value}>
                                {trend.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Numerador */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
                        Numerador
                    </h3>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Definición del Numerador *
                    </label>
                    <textarea
                        name="numerator"
                        value={form.numerator || ''}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.numerator ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.numerator && <p className="text-red-500 text-sm mt-1">{errors.numerator}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Responsable del Numerador
                    </label>
                    <input
                        type="text"
                        name="numeratorResponsible"
                        value={form.numeratorResponsible || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Fuente del Numerador
                    </label>
                    <input
                        type="text"
                        name="numeratorSource"
                        value={form.numeratorSource || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Descripción del Numerador
                    </label>
                    <textarea
                        name="numeratorDescription"
                        value={form.numeratorDescription || ''}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Denominador */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
                        Denominador
                    </h3>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Definición del Denominador *
                    </label>
                    <textarea
                        name="denominator"
                        value={form.denominator || ''}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.denominator ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.denominator && <p className="text-red-500 text-sm mt-1">{errors.denominator}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Responsable del Denominador
                    </label>
                    <input
                        type="text"
                        name="denominatorResponsible"
                        value={form.denominatorResponsible || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Fuente del Denominador
                    </label>
                    <input
                        type="text"
                        name="denominatorSource"
                        value={form.denominatorSource || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Descripción del Denominador
                    </label>
                    <textarea
                        name="denominatorDescription"
                        value={form.denominatorDescription || ''}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Información adicional */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
                        Información Adicional
                    </h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Meta *
                    </label>
                    <input
                        type="text"
                        name="target"
                        value={form.target || ''}
                        onChange={handleChange}
                        placeholder="95%, 100 casos, etc."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.target ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.target && <p className="text-red-500 text-sm mt-1">{errors.target}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Autor *
                    </label>
                    <input
                        type="text"
                        name="author"
                        value={form.author || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.author ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                    {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
                </div>

                {/* Estado */}
                <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="status"
                            checked={form.status || false}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Indicador activo
                        </span>
                    </label>
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                    {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {loading ? 'Guardando...' : (indicator ? 'Actualizar' : 'Crear')} Indicador
                </button>
            </div>
        </form>
    );
};

export default IndicatorForm;