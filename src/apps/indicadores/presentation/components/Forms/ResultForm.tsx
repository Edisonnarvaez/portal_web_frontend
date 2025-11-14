// src/apps/indicadores/presentation/components/Forms/ResultForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../../../apps/auth/presentation/context/AuthContext';
import type { Result, CreateResultRequest, UpdateResultRequest } from '../../../domain/entities/Result';
import { MONTHS, QUARTERS, SEMESTERS, YEARS } from '../../../domain/entities/Result';

interface ResultFormProps {
  result?: Result;
  indicators: Array<{id: number, name: string, code: string, measurementFrequency: string}>;
  headquarters: Array<{id: number, name: string}>;
  onSubmit: (data: CreateResultRequest | UpdateResultRequest) => void;
  loading: boolean;
}

// Local form state type: keep indicator/headquarters as number | string | null
interface FormState {
  headquarters: number | string | null;
  indicator: number | string | null;
  numerator: number;
  denominator: number;
  year: number;
  month?: number | null;
  quarter?: number | null;
  semester?: number | null;
  user: number;
}

const ResultForm: React.FC<ResultFormProps> = ({
  result,
  indicators,
  headquarters,
  onSubmit,
  loading
}) => {
  const { user } = useAuthContext();
  
  const [form, setForm] = useState<FormState>({
    headquarters: (typeof result?.headquarters === 'object' ? (result?.headquarters as any)?.id : result?.headquarters) ?? 0,
    indicator: (typeof result?.indicator === 'object' ? (result?.indicator as any)?.id : result?.indicator) ?? 0,
    numerator: result?.numerator ?? 0,
    denominator: result?.denominator ?? 0,
    year: result?.year ?? new Date().getFullYear(),
    month: result?.month ?? null,
    quarter: result?.quarter ?? null,
    semester: result?.semester ?? null,
    user: user?.id || result?.user || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);

  // 🔍 Buscar el indicador seleccionado para obtener la frecuencia
  useEffect(() => {
    if (form.indicator !== undefined && form.indicator !== null && form.indicator !== '') {
      const indicatorId = Number(form.indicator);
      const indicator = indicators.find(ind => ind.id === indicatorId) ?? null;
      setSelectedIndicator(indicator);

      // 🧹 Limpiar campos de período que no corresponden a la frecuencia
      if (indicator) {
        const newForm = { ...form };
        if (indicator.measurementFrequency === 'monthly') {
          // Para mensual: solo usamos mes
          newForm.quarter = null;
          newForm.semester = null;
        } else if (indicator.measurementFrequency === 'quarterly') {
          // Para trimestral: solo usamos trimestre
          newForm.month = null;
          newForm.semester = null;
        } else if (indicator.measurementFrequency === 'semiannual') {
          // Para semestral: solo usamos semestre
          newForm.month = null;
          newForm.quarter = null;
        } else if (indicator.measurementFrequency === 'annual') {
          // Para anual: nada
          newForm.month = null;
          newForm.quarter = null;
          newForm.semester = null;
        }
        setForm(newForm);
      }
    } else {
      setSelectedIndicator(null);
    }
  }, [form.indicator, indicators]);

  // 📅 Función para calcular el período automáticamente
  const calculateAutoPeriod = (frequency: string, value?: number): { month?: number; quarter?: number; semester?: number } => {
    const result: any = {};
    
    if (frequency === 'monthly' && value) {
      // 1️⃣ MENSUAL: Se selecciona mes → calcula trimestre y semestre
      // Ej: mes 2 → trimestre 1, semestre 1
      result.month = value;
      result.quarter = Math.ceil(value / 3);
      result.semester = value <= 6 ? 1 : 2;
    } else if (frequency === 'quarterly' && value) {
      // 2️⃣ TRIMESTRAL: Se selecciona trimestre → calcula mes último del trimestre y semestre
      // T1 → mes 3 (marzo), Sem 1
      // T2 → mes 6 (junio), Sem 1
      // T3 → mes 9 (septiembre), Sem 2
      // T4 → mes 12 (diciembre), Sem 2
      const lastMonthOfQuarter = value * 3;
      result.month = lastMonthOfQuarter;
      result.quarter = value;
      result.semester = value <= 2 ? 1 : 2;
    } else if (frequency === 'semiannual' && value) {
      // 3️⃣ SEMESTRAL: Se selecciona semestre → calcula mes último del semestre y trimestre
      // S1 → mes 6 (junio), T2
      // S2 → mes 12 (diciembre), T4
      const lastMonthOfSemester = value === 1 ? 6 : 12;
      const quarterOfSemester = value === 1 ? 2 : 4;
      result.month = lastMonthOfSemester;
      result.quarter = quarterOfSemester;
      result.semester = value;
    } else if (frequency === 'annual') {
      // 4️⃣ ANUAL: Todo en el final del año
      // mes 12, trimestre 4, semestre 2
      result.month = 12;
      result.quarter = 4;
      result.semester = 2;
    }
    
    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    
    if (name === 'headquarters' || name === 'indicator' || name === 'year' || name === 'month' || name === 'quarter' || name === 'semester') {
      // Preserve empty string for selects so controlled value remains compatible
      if (value === '') processedValue = '';
      else processedValue = parseInt(value) || (name === 'month' || name === 'quarter' || name === 'semester' ? null : 0);
    } else if (name === 'numerator' || name === 'denominator') {
      processedValue = parseFloat(value) || 0;
    }
    
    // 🔄 Si cambió mes, trimestre o semestre, calcular automáticamente los otros períodos
    let newForm = {
      ...form,
      // TypeScript: index signature is fine since keys match FormState
      // @ts-ignore
      [name]: processedValue
    };

    if (selectedIndicator) {
      if (name === 'month' && selectedIndicator.measurementFrequency === 'monthly') {
        // Para mensual: seleccionó mes → calcula trimestre y semestre
        const monthVal = parseInt(value, 10);
        if (!isNaN(monthVal)) {
          const autoPeriod = calculateAutoPeriod('monthly', monthVal);
          newForm = { ...newForm, ...autoPeriod };
        }
      } else if (name === 'quarter' && selectedIndicator.measurementFrequency === 'quarterly') {
        // Para trimestral: seleccionó trimestre → calcula mes y semestre
        const quarterVal = parseInt(value, 10);
        if (!isNaN(quarterVal)) {
          const autoPeriod = calculateAutoPeriod('quarterly', quarterVal);
          newForm = { ...newForm, ...autoPeriod };
        }
      } else if (name === 'semester' && selectedIndicator.measurementFrequency === 'semiannual') {
        // Para semestral: seleccionó semestre → calcula mes y trimestre
        const semesterVal = parseInt(value, 10);
        if (!isNaN(semesterVal)) {
          const autoPeriod = calculateAutoPeriod('semiannual', semesterVal);
          newForm = { ...newForm, ...autoPeriod };
        }
      } else if (selectedIndicator.measurementFrequency === 'annual' && (name === 'year' || name === 'indicator')) {
        // Para anual: siempre configura mes 12, trimestre 4, semestre 2
        if (name === 'indicator' || name === 'year') {
          const autoPeriod = calculateAutoPeriod('annual');
          newForm = { ...newForm, ...autoPeriod };
        }
      }
    }

    setForm(newForm);

    // 🧹 Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.headquarters || form.headquarters === 0 || form.headquarters === '') {
      newErrors.headquarters = 'Debe seleccionar una sede';
    }
    
    if (!form.indicator || form.indicator === 0 || form.indicator === '') {
      newErrors.indicator = 'Debe seleccionar un indicador';
    }
    
    // ✅ Numerador PUEDE ser 0 (se permite valores >= 0)
    if (form.numerator === undefined || form.numerator < 0) {
      newErrors.numerator = 'El numerador no puede ser negativo';
    }
    
    // 🚫 Denominador DEBE ser > 0 (no puede ser 0 ni negativo)
    if (!form.denominator || form.denominator <= 0) {
      newErrors.denominator = 'El denominador debe ser mayor que cero';
    }
    
    if (!form.year || form.year < 2020 || form.year > 2030) {
      newErrors.year = 'El año debe estar entre 2020 y 2030';
    }

    // 🔍 Validar períodos según la frecuencia del indicador
    if (selectedIndicator) {
      if (selectedIndicator.measurementFrequency === 'monthly' && (!form.month || form.month < 1 || form.month > 12)) {
        newErrors.month = 'Debe seleccionar un mes válido';
      }
      
      if (selectedIndicator.measurementFrequency === 'quarterly' && (!form.quarter || form.quarter < 1 || form.quarter > 4)) {
        newErrors.quarter = 'Debe seleccionar un trimestre válido';
      }
      
      if (selectedIndicator.measurementFrequency === 'semiannual' && (!form.semester || form.semester < 1 || form.semester > 2)) {
        newErrors.semester = 'Debe seleccionar un semestre válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Build payload ensuring indicator/headquarters are numbers for the API
    const dataPayload: any = {
      ...form,
      user: user?.id || form.user || 0,
      headquarters: typeof form.headquarters === 'string' ? Number(form.headquarters) : form.headquarters,
      indicator: typeof form.indicator === 'string' ? Number(form.indicator) : form.indicator,
    };

    const data = dataPayload as CreateResultRequest | UpdateResultRequest;

    if (result?.id) {
      (data as UpdateResultRequest).id = result.id;
    }

    onSubmit(data);
  };

  const renderPeriodFields = () => {
  if (!selectedIndicator) return null;

  const { measurementFrequency } = selectedIndicator;

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Período de Medición</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 📅 MES - Solo para mensual */}
          {measurementFrequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Mes *
              </label>
              <select
                name="month"
                value={form.month ?? ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.month ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              >
                <option value="">Seleccione mes</option>
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
              {form.month && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ✓ Auto: Trimestre {form.quarter}, Semestre {form.semester}
                </p>
              )}
            </div>
          )}

          {/* 📅 TRIMESTRE - Solo para trimestral */}
          {measurementFrequency === 'quarterly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Trimestre *
              </label>
              <select
                name="quarter"
                value={form.quarter ?? ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.quarter ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              >
                <option value="">Seleccione trimestre</option>
                {QUARTERS.map(quarter => (
                  <option key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </option>
                ))}
              </select>
              {errors.quarter && <p className="text-red-500 text-sm mt-1">{errors.quarter}</p>}
              {form.quarter && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ✓ Auto: Mes {form.month} ({MONTHS.find(m => m.value === form.month)?.label}), Semestre {form.semester}
                </p>
              )}
            </div>
          )}

          {/* 📅 SEMESTRE - Solo para semestral */}
          {measurementFrequency === 'semiannual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Semestre *
              </label>
              <select
                name="semester"
                value={form.semester ?? ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.semester ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              >
                <option value="">Seleccione semestre</option>
                {SEMESTERS.map(semester => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </select>
              {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
              {form.semester && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ✓ Auto: Mes {form.month} ({MONTHS.find(m => m.value === form.month)?.label}), Trimestre {form.quarter}
                </p>
              )}
            </div>
          )}

          {/* ANUAL - Sin entrada del usuario */}
          {measurementFrequency === 'annual' && (
            <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📅 Frecuencia Anual: Se registra automáticamente para diciembre (mes 12, trimestre 4, semestre 2)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🏢 Sede */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Sede *
          </label>
            <select
            name="headquarters"
            value={form.headquarters ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.headquarters ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          >
            <option value="">Seleccione sede</option>
            {headquarters.map(hq => (
              <option key={hq.id} value={hq.id}>
                {hq.name}
              </option>
            ))}
          </select>
          {errors.headquarters && <p className="text-red-500 text-sm mt-1">{errors.headquarters}</p>}
        </div>

        {/* 📊 Indicador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Indicador *
          </label>
          <select
            name="indicator"
              value={form.indicator ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.indicator ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          >
            <option value="">Seleccione indicador</option>
            {indicators.map(indicator => (
              <option key={indicator.id} value={indicator.id}>
                {indicator.code} - {indicator.name}
              </option>
            ))}
          </select>
          {errors.indicator && <p className="text-red-500 text-sm mt-1">{errors.indicator}</p>}
        </div>

        {/* 🔢 Numerador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Numerador *
          </label>
          <input
            type="number"
            name="numerator"
            value={form.numerator !== undefined && form.numerator !== null ? form.numerator : ''}
            onChange={handleChange}
            step="0.0"
            min="0"
            placeholder="Ej: 85"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.numerator ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          />
          {errors.numerator && <p className="text-red-500 text-sm mt-1">{errors.numerator}</p>}
        </div>

        {/* 🔢 Denominador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Denominador *
          </label>
          <input
            type="number"
            name="denominator"
            value={form.denominator !== undefined && form.denominator !== null ? form.denominator : ''}
            onChange={handleChange}
            step="0.01"
            min="0.0"
            placeholder="Ej: 100"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.denominator ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          />
          {errors.denominator && <p className="text-red-500 text-sm mt-1">{errors.denominator}</p>}
        </div>

        {/* 📅 Año */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Año *
          </label>
          <select
            name="year"
            value={form.year || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          >
            <option value="">Seleccione año</option>
            {YEARS.map(year => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
          {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
        </div>

        {/* 🗓️ Mostrar información del indicador seleccionado */}
        {selectedIndicator && (
          <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Información del Indicador
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-300">
              <div><strong>Código:</strong> {selectedIndicator.code}</div>
              <div><strong>Frecuencia:</strong> {selectedIndicator.measurementFrequency}</div>
              <div><strong>Nombre:</strong> {selectedIndicator.name}</div>
            </div>
          </div>
        )}

        {/* 📅 Campos de período dinámicos */}
        {selectedIndicator && (
          <div className="md:col-span-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Período de Medición
            </h4>
            {renderPeriodFields()}
          </div>
        )}
      </div>

      {/* 🔘 Botones */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {result ? 'Actualizar' : 'Crear'} Resultado
        </button>
      </div>
    </form>
  );
};

export default ResultForm;