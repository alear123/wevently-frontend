// Utilidades de formateo reutilizables para pantallas ABM

// Reemplaza underscores por espacios y capitaliza opcionalmente
export function humanizeEnum(value = '', { capitalize = false } = {}) {
  if (value == null) return '';
  const str = String(value).replace(/_/g, ' ');
  if (!capitalize) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Formatea número con separadores locales. Devuelve '-' si null/undefined vacío.
export function formatNumber(value, { locale = 'es-AR', minimumFractionDigits = 0, maximumFractionDigits = 0 } = {}) {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString(locale, { minimumFractionDigits, maximumFractionDigits });
}

// Envuelve un valor con sufijo/prefijo si existe
export function withAffixes(value, { prefix = '', suffix = '' } = {}) {
  if (value === '-' || value == null || value === '') return '-';
  return `${prefix}${value}${suffix}`;
}

// Atajos específicos del dominio
// Monto en ARS con símbolo $ y 2 decimales (si es número). Mantiene '-' para valores nulos.
export function formatMonto(value) {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  const formatted = formatNumber(num, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return withAffixes(formatted, { prefix: '$' });
}
export function formatTiempoSegundos(value) { if (value == null) return '-'; return withAffixes(value, { suffix: ' segundos' }); }
// Días (retenciones, plazos simples)
export function formatDias(value) { if (value == null) return '-'; return withAffixes(formatNumber(value), { suffix: ' días' }); }

// Formatea bytes a unidad legible (KB, MB, GB, TB) con 1 decimal (configurable)
export function formatBytes(bytes, { decimals = 1 } = {}) {
  if (bytes === null || bytes === undefined || bytes === '' ) return '-';
  const num = Number(bytes);
  if (!Number.isFinite(num) || num < 0) return '-';
  if (num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  const value = num / Math.pow(k, i);
  const formatted = value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  return `${formatted}${sizes[i]}`;
}

// Parser auxiliar para tamaños escritos tipo "2,4GB" -> bytes (no exportado públicamente si no se necesita fuera)
export function parseHumanSize(str) {
  if (!str) return null;
  const normalized = String(str).trim().replace(',', '.').replace(/\s+/g, '');
  const match = normalized.match(/^(\d+(?:\.\d+)?)(B|KB|MB|GB|TB|PB)$/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const order = ['B','KB','MB','GB','TB','PB'];
  const idx = order.indexOf(unit);
  if (idx === -1) return null;
  return Math.round(value * Math.pow(1024, idx));
}

// Helpers para chips: determina clase chip--* según estado
export function chipClassEstadoProveedor(estado) {
  switch (estado) {
    case 'ACTIVO': return 'chip chip--ok';
    case 'INACTIVO': return 'chip chip--off';
    default: return 'chip chip--warn';
  }
}

export function chipClassVisible(esVisible) {
  return esVisible ? 'chip chip--ok' : 'chip chip--off';
}
