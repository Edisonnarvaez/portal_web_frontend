import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Tercero, CreateTerceroRequest, UpdateTerceroRequest, Pais, Departamento, Municipio, TipoTercero } from '../../domain/entities/Tercero';
import { TIPOS_DOCUMENTO } from '../../domain/entities/Tercero';
import { formatDateToInput } from '../../../../shared/utils/dateUtils';

interface TerceroFormProps {
  tercero?: Tercero;
  paises: Pais[];
  departamentos: Departamento[];
  municipios: Municipio[];
  tiposTercero: TipoTercero[];
  onSubmit: (data: CreateTerceroRequest | UpdateTerceroRequest) => Promise<void>;
  onCancel: () => void;
  onDepartamentoChange: (paisId: number) => void;
  onMunicipioChange: (departamentoId: number) => void;
  loading: boolean;
}

export default function TerceroForm({
  tercero,
  paises,
  departamentos,
  municipios,
  tiposTercero,
  onSubmit,
  onCancel,
  onDepartamentoChange,
  onMunicipioChange,
  loading
}: TerceroFormProps) {
  const isEdit = !!tercero;
  
  const [form, setForm] = useState<Partial<Tercero>>({
    tercero_tipo_documento: tercero?.tercero_tipo_documento || 'CC',
    tercero_codigo: tercero?.tercero_codigo || '',
    tercero_nombre_completo: tercero?.tercero_nombre_completo || '',
    tercero_razon_social: tercero?.tercero_razon_social || '',
    tercero_fecha_nacimiento: tercero?.tercero_fecha_nacimiento ? formatDateToInput(tercero.tercero_fecha_nacimiento) : '',
    tercero_direccion: tercero?.tercero_direccion || '',
    tercero_telefono: tercero?.tercero_telefono || '',
    tercero_email: tercero?.tercero_email || '',
    tercero_pais: tercero?.tercero_pais || 0,
    tercero_departamento: tercero?.tercero_departamento || 0,
    tercero_municipio: tercero?.tercero_municipio || 0,
    tercero_obligado_facturar: tercero?.tercero_obligado_facturar ?? false,
    tercero_proveedor: tercero?.tercero_proveedor ?? false,
    tercero_tipo: tercero?.tercero_tipo || 0,
    tercero_estado: tercero?.tercero_estado ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determinar si es persona natural o jurídica
  const esPersonaNatural = ['CC', 'TI', 'CE', 'PA', 'RC'].includes(form.tercero_tipo_documento || '');
  const esPersonaJuridica = ['NIT', 'NI'].includes(form.tercero_tipo_documento || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'tercero_pais' || name === 'tercero_departamento' || name === 'tercero_municipio' || name === 'tercero_tipo') {
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

    // Manejar cambios en cascada
    if (name === 'tercero_pais' && processedValue > 0) {
      onDepartamentoChange(processedValue);
      setForm(prev => ({ ...prev, tercero_departamento: 0, tercero_municipio: 0 }));
    }
    
    if (name === 'tercero_departamento' && processedValue > 0) {
      onMunicipioChange(processedValue);
      setForm(prev => ({ ...prev, tercero_municipio: 0 }));
    }

    // Limpiar campos según tipo de documento
    if (name === 'tercero_tipo_documento') {
      if (['CC', 'TI', 'CE', 'PA', 'RC'].includes(processedValue)) {
        setForm(prev => ({ ...prev, tercero_razon_social: '' }));
      } else if (['NIT', 'NI'].includes(processedValue)) {
        setForm(prev => ({ ...prev, tercero_nombre_completo: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.tercero_codigo?.trim()) {
      newErrors.tercero_codigo = 'El código es obligatorio';
    }

    if (!form.tercero_tipo_documento) {
      newErrors.tercero_tipo_documento = 'El tipo de documento es obligatorio';
    }

    if (esPersonaNatural && !form.tercero_nombre_completo?.trim()) {
      newErrors.tercero_nombre_completo = 'El nombre completo es obligatorio para personas naturales';
    }

    if (esPersonaJuridica && !form.tercero_razon_social?.trim()) {
      newErrors.tercero_razon_social = 'La razón social es obligatoria para personas jurídicas';
    }

    if (form.tercero_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.tercero_email)) {
      newErrors.tercero_email = 'El formato del email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const data = {
        ...form,
        tercero_pais: form.tercero_pais || undefined,
        tercero_departamento: form.tercero_departamento || undefined,
        tercero_municipio: form.tercero_municipio || undefined,
        tercero_tipo: form.tercero_tipo || undefined,
      } as CreateTerceroRequest | UpdateTerceroRequest;

      if (isEdit && tercero) {
        (data as UpdateTerceroRequest).tercero_id = tercero.tercero_id!;
      }

      await onSubmit(data);
    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-4xl mx-auto my-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Editar' : 'Crear'} Tercero
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de documento *
              </label>
              <select
                name="tercero_tipo_documento"
                value={form.tercero_tipo_documento}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tercero_tipo_documento ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              >
                {TIPOS_DOCUMENTO.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
              {errors.tercero_tipo_documento && (
                <p className="text-red-500 text-xs mt-1">{errors.tercero_tipo_documento}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de documento *
              </label>
              <input
                type="text"
                name="tercero_codigo"
                value={form.tercero_codigo}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tercero_codigo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              />
              {errors.tercero_codigo && (
                <p className="text-red-500 text-xs mt-1">{errors.tercero_codigo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de tercero
              </label>
              <select
                name="tercero_tipo"
                value={form.tercero_tipo}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Seleccionar tipo</option>
                {tiposTercero.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombres */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {esPersonaNatural && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="tercero_nombre_completo"
                  value={form.tercero_nombre_completo}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tercero_nombre_completo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                />
                {errors.tercero_nombre_completo && (
                  <p className="text-red-500 text-xs mt-1">{errors.tercero_nombre_completo}</p>
                )}
              </div>
            )}

            {esPersonaJuridica && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Razón social *
                </label>
                <input
                  type="text"
                  name="tercero_razon_social"
                  value={form.tercero_razon_social}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tercero_razon_social ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                />
                {errors.tercero_razon_social && (
                  <p className="text-red-500 text-xs mt-1">{errors.tercero_razon_social}</p>
                )}
              </div>
            )}

            {esPersonaNatural && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  name="tercero_fecha_nacimiento"
                  value={form.tercero_fecha_nacimiento}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Contacto */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="tercero_telefono"
                value={form.tercero_telefono}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="tercero_email"
                value={form.tercero_email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tercero_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              />
              {errors.tercero_email && (
                <p className="text-red-500 text-xs mt-1">{errors.tercero_email}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="tercero_direccion"
              value={form.tercero_direccion}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Ubicación */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                País
              </label>
              <select
                name="tercero_pais"
                value={form.tercero_pais}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Seleccionar país</option>
                {paises.map(pais => (
                  <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Departamento
              </label>
              <select
                name="tercero_departamento"
                value={form.tercero_departamento}
                onChange={handleChange}
                disabled={loading || !form.tercero_pais}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value={0}>Seleccionar departamento</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Municipio
              </label>
              <select
                name="tercero_municipio"
                value={form.tercero_municipio}
                onChange={handleChange}
                disabled={loading || !form.tercero_departamento}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value={0}>Seleccionar municipio</option>
                {municipios.map(mun => (
                  <option key={mun.id} value={mun.id}>{mun.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="tercero_proveedor"
                name="tercero_proveedor"
                checked={form.tercero_proveedor}
                onChange={handleChange}
                disabled={loading}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="tercero_proveedor" className="text-sm text-gray-700 dark:text-gray-300">
                Es proveedor
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="tercero_obligado_facturar"
                name="tercero_obligado_facturar"
                checked={form.tercero_obligado_facturar}
                onChange={handleChange}
                disabled={loading}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="tercero_obligado_facturar" className="text-sm text-gray-700 dark:text-gray-300">
                Obligado a facturar
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="tercero_estado"
                name="tercero_estado"
                checked={form.tercero_estado}
                onChange={handleChange}
                disabled={loading}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="tercero_estado" className="text-sm text-gray-700 dark:text-gray-300">
                Activo
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')} Tercero
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}