export interface Indicator {
  id?: number;
  name: string;
  description: string;
  code: string;
  version: string;
  calculationMethod: 'percentage' | 'rate_per_1000' | 'rate_per_10000' | 'average' | 'ratio';
  measurementUnit: string;
  numerator: string;
  numeratorResponsible: string;
  numeratorSource: string;
  numeratorDescription: string;
  denominator: string;
  denominatorResponsible: string;
  denominatorSource: string;
  denominatorDescription: string;
  trend: 'increasing' | 'decreasing';
  target: string;
  author: string;
  process: number; // ✅ Coincide con la API
  measurementFrequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  status: boolean;
  user?: number;
  creationDate?: string; // ✅ La API devuelve string en formato ISO
  updateDate?: string;   // ✅ La API devuelve string en formato ISO
}

export interface CreateIndicatorRequest {
  name: string;
  description: string;
  code: string;
  version: string;
  calculationMethod: 'percentage' | 'rate_per_1000' | 'rate_per_10000' | 'average' | 'ratio';
  measurementUnit: string;
  numerator: string;
  numeratorResponsible: string;
  numeratorSource: string;
  numeratorDescription: string;
  denominator: string;
  denominatorResponsible: string;
  denominatorSource: string;
  denominatorDescription: string;
  trend: 'increasing' | 'decreasing';
  target: string;
  author: string;
  process: number;
  measurementFrequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  status: boolean;
  user?: number;
}

export interface UpdateIndicatorRequest extends CreateIndicatorRequest {
  id: number;
}

// Constantes para dropdowns
export const CALCULATION_METHODS = [
  { value: 'percentage', label: 'Porcentaje' },
  { value: 'rate_per_1000', label: 'Tasa por 1000' },
  { value: 'rate_per_10000', label: 'Tasa por 10000' },
  { value: 'average', label: 'Promedio' },
  { value: 'ratio', label: 'Razón' },
] as const;

export const MEASUREMENT_FREQUENCIES = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
] as const;

export const TREND_OPTIONS = [
  { value: 'increasing', label: 'Creciente' },
  { value: 'decreasing', label: 'Decreciente' },
] as const;