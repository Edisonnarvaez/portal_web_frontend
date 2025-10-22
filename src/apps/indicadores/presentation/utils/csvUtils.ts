// Simple CSV parsing and validation helpers for bulk result upload
type ParsedRow = { [key: string]: string };

export function parseCSV(text: string): ParsedRow[] {
  // Basic CSV parser that handles commas and quoted values. Not a full-featured CSV lib.
  // Quick sanity check: if the uploaded file is a binary (e.g. XLSX) we should fail fast
  // so the user can export to CSV. XLSX files start with PK (zip archive header) when
  // read as text, so detect that pattern or many non-text characters.
  const firstChunk = text.slice(0, 256);
  const looksLikeZip = firstChunk.startsWith('PK');
  const nonTextRatio = (firstChunk.match(/[^\x09\x0A\x0D\x20-\x7E]/g) || []).length / Math.max(1, firstChunk.length);
  if (looksLikeZip || nonTextRatio > 0.1) {
    throw new Error('El archivo parece ser un archivo binario (por ejemplo .xlsx). Exporte el archivo a CSV (UTF-8) antes de subir.');
  }

  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];
  // Our template includes descriptive rows above the actual data header. Find the
  // row that contains the marker 'DATA HEADER (EN)' and use the next non-empty
  // line as the header row. Otherwise, use the first line as header.
  let headerLineIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/DATA HEADER \(EN\)/i.test(lines[i])) {
      headerLineIndex = i + 1;
      break;
    }
  }
  const rawHeaders = splitLine(lines[headerLineIndex]);
  // Normalize header names: accept English or Spanish friendly names and map them to canonical English keys
  const headerAliases: { [k: string]: string } = {
    // Spanish -> English
    sede: 'headquarters',
    sede_id: 'headquarters',
    "sede id": 'headquarters',
    indicador: 'indicator',
    indicador_id: 'indicator',
    numerador: 'numerator',
    denominador: 'denominator',
    annio: 'year',
    anio: 'year',
    año: 'year',
    mes: 'month',
    trimestre: 'quarter',
    semestre: 'semester',
    usuario: 'user',

    // English canonical (allow passthrough)
    headquarters: 'headquarters',
    indicator: 'indicator',
    numerator: 'numerator',
    denominator: 'denominator',
    year: 'year',
    month: 'month',
    quarter: 'quarter',
    semester: 'semester',
    user: 'user',
  };

  function stripParentheses(s: string) {
    return s.replace(/\(.*\)/, '').trim();
  }

  function removeAccents(s: string) {
    // simple replacements for Spanish accents
    return s
      .replace(/[ÁÀÂÄáàâä]/g, 'a')
      .replace(/[ÉÈÊËéèêë]/g, 'e')
      .replace(/[ÍÌÎÏíìîï]/g, 'i')
      .replace(/[ÓÒÔÖóòôö]/g, 'o')
      .replace(/[ÚÙÛÜúùûü]/g, 'u')
      .replace(/[Ññ]/g, 'n');
  }

  function normalizeKey(raw: string) {
    if (!raw) return '';
    let s = String(raw).trim().toLowerCase();
    s = stripParentheses(s);
    s = removeAccents(s);
    // take first token likely to be the field name (handles 'sede (ID de la sede)' -> 'sede')
    const m = s.match(/^([a-z0-9]+)/);
    if (m) return m[1];
    // fallback: remove non-word chars and spaces
    return s.replace(/[^a-z0-9]+/g, '_');
  }

  const headers = rawHeaders.map(h => {
    const key = normalizeKey(h as string);
    return headerAliases[key] ?? (h || '').toString().trim();
  });
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    // skip any template rows before the header line
    if (i <= headerLineIndex) continue;
    const parts = splitLine(lines[i]);
    if (parts.length === 0) continue;
    const row: ParsedRow = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = parts[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function splitLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export function validateRowForCreate(row: ParsedRow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  // Required fields for CreateResultRequest
  const required = ['headquarters', 'indicator', 'numerator', 'denominator', 'year', 'user'];
  required.forEach(f => {
    if (!row[f] || row[f].trim() === '') errors.push(`${f} is required / ${f === 'headquarters' ? 'sede es requerida' : f === 'indicator' ? 'indicador es requerido' : f + ' is required'}`);
  });

  const numericFields = ['headquarters', 'indicator', 'numerator', 'denominator', 'year', 'month', 'quarter', 'semester', 'user'];
  numericFields.forEach(f => {
    if (row[f] && row[f].trim() !== '' && isNaN(Number(row[f]))) errors.push(`${f} must be a number`);
  });

  // More domain-specific checks
  if (row['numerator'] && row['denominator'] && Number(row['denominator']) === 0) errors.push('denominator must not be zero');

  return { valid: errors.length === 0, errors };
}

export function mapRowToCreatePayload(row: ParsedRow) {
  return {
    headquarters: Number(row['headquarters']),
    indicator: Number(row['indicator']),
    numerator: Number(row['numerator']),
    denominator: Number(row['denominator']),
    year: Number(row['year']),
    month: row['month'] ? Number(row['month']) : null,
    quarter: row['quarter'] ? Number(row['quarter']) : null,
    semester: row['semester'] ? Number(row['semester']) : null,
    user: Number(row['user']),
  } as const;
}

function quoteCsv(value: any) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Generate a CSV template blob that includes:
 * - Instructions and column descriptions
 * - Header row for data import
 * - An example row
 * - Mapping tables for Headquarters and Indicators (id -> name / code)
 */
export function generateTemplateCSV(indicators: any[] = [], headquarters: any[] = []) {
  // We'll present Spanish-friendly descriptions but the actual data header used for import
  // will be the canonical English field names so the importer/validator continues to work.
  const displayHeadersEs: Record<string, string> = {
    sede: 'sede (ID de la sede)',
    indicador: 'indicador (ID del indicador)',
    numerador: 'numerador',
    denominador: 'denominador',
    annio: 'año',
    mes: 'mes',
    trimestre: 'trimestre',
    semestre: 'semestre',
    usuario: 'usuario (ID)'
  };

  const dataHeadersEn = ['headquarters','indicator','numerator','denominator','year','month','quarter','semester','user'];

  const descriptions: Record<string, string> = {
    sede: 'ID numerico de la sede (ver tabla de mapeo mas abajo). Ej: 1 = Aurora',
    indicador: 'ID numerico del indicador (ver tabla de mapeo). Ej: 2 = COD-001 - Tasa de ocupacion',
    numerador: 'Valor numerador usado para calcular el resultado (numero)',
    denominador: 'Valor denominador usado para calcular el resultado (numero, distinto de cero)',
    annio: 'Año del resultado (ej. 2025)',
    mes: 'Mes del resultado (1-12) - opcional',
    trimestre: 'Trimestre (1-4) - opcional',
    semestre: 'Semestre (1-2) - opcional',
    usuario: 'ID del usuario que registra el resultado (numero)'
  };

  const lines: string[] = [];
  lines.push('INSTRUCCIONES: Este archivo es una plantilla para la carga masiva de resultados.');
  lines.push('INSTRUCCIONES: La primera sección muestra nombres amigables en español y una breve descripcion. La fila marcada como "DATA HEADER (EN)" es la fila de encabezado que el sistema utiliza para importar los datos. No la borre ni la modifique.');
  lines.push('');

  // Friendly Spanish headers + descriptions
  lines.push('COLUMNS (ES),DESCRIPTION');
  for (const key of Object.keys(displayHeadersEs)) {
    lines.push(`${quoteCsv(displayHeadersEs[key])},${quoteCsv(descriptions[key] ?? '')}`);
  }
  lines.push('');

  // Also include a mapping row so users can see which ES name corresponds to the EN header
  lines.push('MAPA DE ENCABEZADOS:ESPANOL -> INGLES');
  lines.push('encabezado_es,encabezado_en');
  const esKeys = Object.keys(displayHeadersEs);
  const enKeys = dataHeadersEn;
  for (let i = 0; i < esKeys.length; i++) {
    lines.push(`${quoteCsv(displayHeadersEs[esKeys[i]])},${quoteCsv(enKeys[i])}`);
  }
  lines.push('');

  // Data header row for upload (English canonical headers)
  lines.push('DATA HEADER (EN)');
  lines.push(dataHeadersEn.map(quoteCsv).join(','));

  // Example row: use first available ids when present
  const exampleHeadquarter = headquarters && headquarters.length > 0 ? (headquarters[0].id ?? headquarters[0].value ?? '') : '1';
  const exampleIndicator = indicators && indicators.length > 0 ? (indicators[0].id ?? indicators[0].value ?? '') : '2';
  const example = [exampleHeadquarter, exampleIndicator, 10, 100, new Date().getFullYear(), 1, 1, 1, 1];
  lines.push(example.map(quoteCsv).join(','));
  lines.push('');

  // Headquarters mapping
  lines.push('Mapa de sedes / Headquarters Mapping');
  lines.push('id,nombre');
  for (const hq of (headquarters || [])) {
    const id = hq.id ?? hq.value ?? hq.headquarter_id ?? '';
    const name = hq.name ?? hq.nombre ?? hq.headquarter_name ?? '';
    lines.push([quoteCsv(id), quoteCsv(name)].join(','));
  }
  lines.push('');

  // Indicators mapping
  lines.push('mapa de indicadores / INDICATORS_MAPPING');
  lines.push('id,codigo,nombre,meta,unidad_medida');
  for (const ind of (indicators || [])) {
    const id = ind.id ?? ind.value ?? '';
    const code = ind.code ?? ind.codigo ?? '';
    const name = ind.name ?? ind.nombre ?? '';
    const target = ind.target ?? ind.meta ?? '';
    const unit = ind.measurementUnit ?? ind.unidad_medida ?? '';
    lines.push([quoteCsv(id), quoteCsv(code), quoteCsv(name), quoteCsv(target), quoteCsv(unit)].join(','));
  }

  const csv = lines.join('\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}
