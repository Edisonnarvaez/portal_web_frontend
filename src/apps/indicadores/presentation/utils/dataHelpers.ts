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
