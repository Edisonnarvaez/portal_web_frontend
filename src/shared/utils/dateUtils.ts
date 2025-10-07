/**
 * Convierte una fecha en formato string (YYYY-MM-DD) a Date local
 * Sin afectación de zona horaria
 */
export const parseLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month - 1 porque en JS enero es 0
};

/**
 * Convierte una Date a string formato YYYY-MM-DD
 * Sin afectación de zona horaria
 */
export const formatDateToInput = (date: Date | string): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha para mostrar en la UI
 */
export const formatDisplayDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return '';
  
  const date = parseLocalDate(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    timeZone: 'America/Bogota' // 👈 Especificar zona horaria de Colombia
  };
  
  return date.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
};

/**
 * Formatea fecha corta para cumpleaños
 */
export const formatBirthdayDate = (dateString: string): string => {
  return formatDisplayDate(dateString, {
    day: '2-digit',
    month: 'short'
  });
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (local)
 */
export const getCurrentLocalDate = (): string => {
  return formatDateToInput(new Date());
};

/**
 * Calcula días hasta una fecha
 */
export const getDaysUntilDate = (dateString: string): number => {
  const today = new Date();
  const targetDate = parseLocalDate(dateString);
  
  // Normalizar a medianoche para comparación precisa
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};