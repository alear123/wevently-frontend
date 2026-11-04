// Utilidades de fechas y validaciones comunes para reportes

// Convierte Date o string ISO (YYYY-MM-DD) a string YYYY-MM-DD
export function toYMD(fecha) {
  if (!fecha) return '';
  if (typeof fecha === 'string') {
    // Asumimos ya viene en formato aceptable
    return fecha.slice(0, 10);
  }
  if (fecha instanceof Date && !isNaN(fecha)) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

// Valida rango: ambas presentes, desde <= hasta, ninguna futura
export function validarRangoFechas(desde, hasta) {
  if (!desde || !hasta) return { esValido: false, mensaje: 'Debe elegir ambas fechas' };
  const d = typeof desde === 'string' ? new Date(desde) : desde;
  const h = typeof hasta === 'string' ? new Date(hasta) : hasta;
  if (d > h) return { esValido: false, mensaje: 'La fecha desde no puede ser mayor a fecha hasta' };
  const hoy = new Date(); hoy.setHours(23,59,59,999);
  if (d > hoy || h > hoy) return { esValido: false, mensaje: 'No se pueden elegir fechas futuras' };
  return { esValido: true };
}

// Devuelve diferencia en días (redondeado hacia arriba)
export function diffEnDias(desde, hasta) {
  if (!desde || !hasta) return 0;
  const d = (typeof desde === 'string') ? new Date(desde) : desde;
  const h = (typeof hasta === 'string') ? new Date(hasta) : hasta;
  const diff = Math.abs(h - d);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
