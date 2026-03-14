/**
 * Form Modal Utilities
 * Utilities comunes para todos los modales de CRUD
 */

import { extractErrorMessage } from '../../../shared/utils/error';

/**
 * Formato de fecha para inputs HTML
 * Convierte YYYY-MM-DDTHH:MM:SSZ a YYYY-MM-DD
 */
export const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Hook to safely access nested object properties
 * Usado en useEffect para extract datos del objeto edited
 */
export const safeGet = <T,>(obj: unknown, path: string, defaultValue?: T): T | undefined => {
  try {
    const value = path.split('.').reduce<unknown>((current, prop) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[prop];
      }
      return undefined;
    }, obj);
    if (value !== undefined && value !== null) {
      return value as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Validar que objeto tenga los campos requeridos
 */
export const hasRequiredFields = (obj: unknown, fields: string[]): boolean => {
  return fields.every(field => safeGet(obj, field) !== undefined && safeGet(obj, field) !== '');
};

/**
 * Generar mensaje de error desde respuesta de Django REST Framework
 */
export const getErrorMessage = (err: unknown): string => {
  const backendErrors = (err as { response?: { data?: unknown } })?.response?.data;
  if (backendErrors && typeof backendErrors === 'object') {
    const errorLines = Object.entries(backendErrors as Record<string, unknown>)
      .map(([key, value]) => {
        if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
        return `${key}: ${String(value)}`;
      });

    if (errorLines.length > 0) {
      return errorLines.join('\n');
    }
  }

  return extractErrorMessage(err, 'Error desconocido');
};

/**
 * Crear objeto FormData seguro para undefined/null fields
 * Filtra campos vacíos para backends que no los aceptan
 */
export const cleanFormData = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      (acc as Record<string, unknown>)[key] = value;
    }
    return acc;
  }, {} as Partial<T>);
};
