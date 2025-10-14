// Simple CSV parsing and validation helpers for bulk result upload
type ParsedRow = { [key: string]: string };

export function parseCSV(text: string): ParsedRow[] {
  // Basic CSV parser that handles commas and quoted values. Not a full-featured CSV lib.
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];
  const headers = splitLine(lines[0]);
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
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
    if (!row[f] || row[f].trim() === '') errors.push(`${f} is required`);
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
