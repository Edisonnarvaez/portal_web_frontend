export function getIndicatorField(item: any, field: string, defaultValue: any = undefined) {
  if (!item) return defaultValue;
  const ind = item.indicator;
  if (ind && typeof ind === 'object' && ind[field] !== undefined && ind[field] !== null) return ind[field];
  if (item[field] !== undefined && item[field] !== null) return item[field];
  return defaultValue;
}

export function getHeadquarterField(item: any, field: string, defaultValue: any = undefined) {
  if (!item) return defaultValue;
  const hq = item.headquarters;
  if (hq && typeof hq === 'object' && hq[field] !== undefined && hq[field] !== null) return hq[field];
  if (item[field] !== undefined && item[field] !== null) return item[field];
  return defaultValue;
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

export function formatIndicatorLabel(item: any) {
  const code = getIndicatorField(item, 'code', '') || getIndicatorField(item, 'indicatorCode', '') || '';
  const name = getIndicatorField(item, 'name', '') || getIndicatorField(item, 'indicatorName', '') || '';
  return code ? `${code} - ${name}` : name;
}

/**
 * 🎯 Calcula el cumplimiento basado en la tendencia del indicador
 * - CRECIENTE (increasing): resultado debe ser ≥ meta
 * - DECRECIENTE (decreasing): resultado debe ser ≤ meta
 * 
 * @param resultado - Valor calculado del indicador
 * @param meta - Valor objetivo (target)
 * @param tendencia - Tendencia del indicador (increasing/decreasing)
 * @returns Objeto con status texto y boolean cumple
 */
export function calculateCompliance(
  resultado: number,
  meta: number,
  tendencia: string | null | undefined
): { status: string; cumple: boolean } {
  // Normalizar la tendencia
  const normalizedTrend = (tendencia || '').toString().toLowerCase().trim();
  
  // Si tendencia es DECRECIENTE: resultado debe ser <= meta
  if (normalizedTrend === 'decreciente' || normalizedTrend === 'decreasing' || normalizedTrend === 'descendente') {
    return resultado <= meta 
      ? { status: '✅ Cumple', cumple: true } 
      : { status: '❌ No cumple', cumple: false };
  }
  
  // Si tendencia es CRECIENTE o sin especificar (por defecto): resultado debe ser >= meta
  return resultado >= meta 
    ? { status: '✅ Cumple', cumple: true } 
    : { status: '❌ No cumple', cumple: false };
}
