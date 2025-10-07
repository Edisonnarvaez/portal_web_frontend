import React, { useState, useEffect } from "react";
import { HiNewspaper, HiCalendarDays, HiGlobeAlt } from "react-icons/hi2";
import type { ContenidoInformativo, CreateContenidoRequest, UpdateContenidoRequest } from "../../domain/types";

interface ContenidoFormProps {
  contenido?: ContenidoInformativo | null;
  onSubmit: (data: CreateContenidoRequest | UpdateContenidoRequest) => Promise<void>; // 👈 CAMBIAR: agregar Promise<void>
  loading?: boolean;
}

export default function ContenidoForm({ contenido, onSubmit, loading = false }: ContenidoFormProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    fecha: '',
    contenido: '',
    enlace: '',
    urgente: false,
    tipo: 'noticia' as 'noticia' | 'comunicado'
  });

  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contenido) {
      setFormData({
        titulo: contenido.titulo,
        fecha: contenido.fecha,
        contenido: contenido.contenido,
        enlace: contenido.enlace || '',
        urgente: contenido.urgente,
        tipo: contenido.tipo
      });
      // Si hay imagen existente, mostrar preview
      if (contenido.imagen) {
        setImagenPreview(contenido.imagen);
      }
    } else {
      setFormData({
        titulo: '',
        fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        contenido: '',
        enlace: '',
        urgente: false,
        tipo: 'noticia'
      });
      setImagenPreview(null);
      setImagen(null);
    }
    setErrors({});
  }, [contenido]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imagen: 'Debe seleccionar un archivo de imagen' }));
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imagen: 'La imagen no debe exceder 5MB' }));
        return;
      }

      setImagen(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Limpiar error si existe
      if (errors.imagen) {
        setErrors(prev => ({ ...prev, imagen: '' }));
      }
    }
  };

  const removeImage = () => {
    setImagen(null);
    setImagenPreview(null);
    // Reset input file
    const fileInput = document.getElementById('imagen-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) newErrors.titulo = 'Título es requerido';
    if (!formData.fecha) newErrors.fecha = 'Fecha es requerida';
    if (!formData.contenido.trim()) newErrors.contenido = 'Contenido es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = contenido 
      ? { id: contenido.id, ...formData, imagen } as UpdateContenidoRequest
      : { ...formData, imagen } as CreateContenidoRequest;

    await onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <HiNewspaper className="w-4 h-4 inline mr-2" />
          Título
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de contenido
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => handleInputChange('tipo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="noticia">Noticia</option>
            <option value="comunicado">Comunicado</option>
          </select>
        </div>
      </div>

      {/* Contenido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contenido
        </label>
        <textarea
          value={formData.contenido}
          onChange={(e) => handleInputChange('contenido', e.target.value)}
          rows={6}
          className={`
            w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            ${errors.contenido ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          `}
          disabled={loading}
        />
        {errors.contenido && <p className="text-red-500 text-sm mt-1">{errors.contenido}</p>}
      </div>

      {/* Enlace externo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <HiGlobeAlt className="w-4 h-4 inline mr-2" />
          Enlace externo (opcional)
        </label>
        <input
          type="url"
          value={formData.enlace}
          onChange={(e) => handleInputChange('enlace', e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
      </div>

      {/* Imagen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagen (opcional)
        </label>
        <div className="space-y-3">
          <input
            id="imagen-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          {errors.imagen && <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>}
          
          {/* Preview de la imagen */}
          {imagenPreview && (
            <div className="relative">
              <img
                src={imagenPreview}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
          </p>
        </div>
      </div>

      {/* Urgente */}
      <div className="flex items-center">
        <input
          id="urgente"
          type="checkbox"
          checked={formData.urgente}
          onChange={(e) => handleInputChange('urgente', e.target.checked)}
          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          disabled={loading}
        />
        <label htmlFor="urgente" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Marcar como urgente
        </label>
      </div>
    </form>
  );
}