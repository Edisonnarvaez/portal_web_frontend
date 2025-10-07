import React, { useState, useEffect } from "react";
import { HiCalendarDays, HiClock, HiMapPin, HiGlobeAlt } from "react-icons/hi2";
import type { Evento, CreateEventoRequest, UpdateEventoRequest } from "../../domain/types";
import { formatDateToInput, getCurrentLocalDate } from "../../../../shared/utils/dateUtils";

interface EventoFormProps {
  evento?: Evento | null;
  onSubmit: (data: CreateEventoRequest | UpdateEventoRequest) => Promise<void>; // 👈 CAMBIAR: agregar Promise<void>
  loading?: boolean;
}

export default function EventoForm({ evento, onSubmit, loading = false }: EventoFormProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    detalles: '',
    es_virtual: false,
    enlace: '',
    lugar: '',
    importante: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (evento) {
      setFormData({
        titulo: evento.titulo,
        fecha: formatDateToInput(evento.fecha), // 👈 USAR UTILIDAD
        hora: evento.hora,
        detalles: evento.detalles,
        es_virtual: evento.es_virtual,
        enlace: evento.enlace || '',
        lugar: evento.lugar || '',
        importante: evento.importante
      });
    } else {
      setFormData({
        titulo: '',
        fecha: getCurrentLocalDate(), // 👈 FECHA ACTUAL POR DEFECTO
        hora: '',
        detalles: '',
        es_virtual: false,
        enlace: '',
        lugar: '',
        importante: false
      });
    }
    setErrors({});
  }, [evento]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) newErrors.titulo = 'Título es requerido';
    if (!formData.fecha) newErrors.fecha = 'Fecha es requerida';
    if (!formData.hora) newErrors.hora = 'Hora es requerida';
    if (!formData.detalles.trim()) newErrors.detalles = 'Detalles son requeridos';
    if (!formData.es_virtual && !formData.lugar.trim()) {
      newErrors.lugar = 'Lugar es requerido para eventos presenciales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => { // 👈 CAMBIAR: hacer async
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = evento 
      ? { id: evento.id, ...formData } as UpdateEventoRequest
      : formData as CreateEventoRequest;

    await onSubmit(submitData); // 👈 CAMBIAR: agregar await
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
          <HiCalendarDays className="w-4 h-4 inline mr-2" />
          Título del evento
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

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiClock className="w-4 h-4 inline mr-2" />
            Hora
          </label>
          <input
            type="time"
            value={formData.hora}
            onChange={(e) => handleInputChange('hora', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.hora ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.hora && <p className="text-red-500 text-sm mt-1">{errors.hora}</p>}
        </div>
      </div>

      {/* Detalles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Detalles del evento
        </label>
        <textarea
          value={formData.detalles}
          onChange={(e) => handleInputChange('detalles', e.target.value)}
          rows={4}
          className={`
            w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            ${errors.detalles ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          `}
          disabled={loading}
        />
        {errors.detalles && <p className="text-red-500 text-sm mt-1">{errors.detalles}</p>}
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center">
          <input
            id="es_virtual"
            type="checkbox"
            checked={formData.es_virtual}
            onChange={(e) => handleInputChange('es_virtual', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            disabled={loading}
          />
          <label htmlFor="es_virtual" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            <HiGlobeAlt className="w-4 h-4 inline mr-1" />
            Evento virtual
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="importante"
            type="checkbox"
            checked={formData.importante}
            onChange={(e) => handleInputChange('importante', e.target.checked)}
            className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            disabled={loading}
          />
          <label htmlFor="importante" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Evento importante
          </label>
        </div>
      </div>

      {/* Lugar o Enlace dependiendo del tipo */}
      {formData.es_virtual ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiGlobeAlt className="w-4 h-4 inline mr-2" />
            Enlace del evento virtual
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
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiMapPin className="w-4 h-4 inline mr-2" />
            Lugar del evento
          </label>
          <input
            type="text"
            value={formData.lugar}
            onChange={(e) => handleInputChange('lugar', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.lugar ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.lugar && <p className="text-red-500 text-sm mt-1">{errors.lugar}</p>}
        </div>
      )}
    </form>
  );
}