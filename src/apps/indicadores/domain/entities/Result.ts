import type { Indicator } from './Indicator';
import type { Headquarters } from '../../../menu/domain/types';

export interface Result {
  id?: number;
  // The backend may return either the numeric id or the full nested object for these relations
  headquarters: Headquarters | number;
  indicator: Indicator | number;
  user: number;
  numerator: number;
  denominator: number;
  calculatedValue?: number; // 👈 Se calcula automáticamente en el backend
  creationDate?: string;
  updateDate?: string;
  year: number;
  month?: number | null;
  quarter?: number | null;
  semester?: number | null;
}

export interface DetailedResult {
  id?: number;
  headquarters: Headquarters | number;
  indicator: Indicator | number;
  user: number;
  numerator: number;
  denominator: number;
  calculatedValue?: number;
  creationDate?: string;
  updateDate?: string;
  year: number;
  month?: number | null;
  quarter?: number | null;
  semester?: number | null;
  // Enriched fields from indicator
  indicatorName: string;
  indicatorCode: string;
  headquarterName: string;
  measurementUnit: string;
  measurementFrequency: string;
  target?: number;
  calculationMethod: string;
  description?: string;
  version?: string;
  numeratorResponsible?: string;
  denominatorResponsible?: string;
  // Additional computed/enriched fields
  trend?: string | null;
  compliant?: boolean | undefined;
  diferencia?: number | undefined;
}

export interface CreateResultRequest {
  headquarters: number;
  indicator: number;
  numerator: number;
  denominator: number;
  year: number;
  month?: number | null;
  quarter?: number | null;
  semester?: number | null;
  user: number; // 👈 Requerido en el backend
}

export interface UpdateResultRequest extends CreateResultRequest {
  id: number;
}

// Constantes para dropdowns - mantener las existentes
export const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const;

export const QUARTERS = [
  { value: 1, label: 'Q1 - Primer Trimestre' },
  { value: 2, label: 'Q2 - Segundo Trimestre' },
  { value: 3, label: 'Q3 - Tercer Trimestre' },
  { value: 4, label: 'Q4 - Cuarto Trimestre' },
] as const;

export const SEMESTERS = [
  { value: 1, label: 'Primer Semestre' },
  { value: 2, label: 'Segundo Semestre' },
] as const;

export const YEARS = Array.from({ length: 11 }, (_, i) => {
  const year = new Date().getFullYear() - 5 + i; // 5 años atrás a 5 años adelante
  return { value: year, label: year.toString() };
});