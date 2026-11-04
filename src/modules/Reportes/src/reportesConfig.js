// Configuración centralizada de reportes y utilidades de rol
// Cada nuevo reporte debe agregarse aquí para reutilización en modal y barra

export const ROLE_ALIASES = {
  admin: 'Administrador',
  administrador: 'Administrador',
  organizador: 'Organizador',
  propietario: 'Propietario',
  prestador: 'Prestador',
  'prestador de lugar': 'Propietario',
  'prestador de servicios': 'Prestador'
};

export const normalizarRol = (rol) => {
  if (!rol || typeof rol !== 'string') return '';
  const key = rol.trim().toLowerCase();
  if (ROLE_ALIASES[key]) return ROLE_ALIASES[key];
  return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
};

// Array de definiciones de reportes
// implemented: habilita o no la navegación
// description: texto corto mostrado en tooltip/hover
export const reportDefinitions = [
  {
    value: 'usuariosactivos',
    label: 'Usuarios activos',
    description: 'Evolución de usuarios activos para detectar picos y tendencias de uso.',
    roles: ['Administrador'],
    path: '/reportes/usuariosactivos',
    implemented: true
  },
  {
    value: 'serviciosmasolicitados',
    label: 'Servicios más solicitados',
    description: 'Ranking de servicios con mayor demanda en un período.',
    roles: ['Administrador'],
    path: '/reportes/servicios-mas-solicitados',
    implemented: true
  },
  {
    value: 'historialeventos',
    label: 'Historial de eventos',
    description: 'Listado y métricas históricas de eventos organizados.',
    roles: ['Organizador'],
    path: '/reportes/historial-de-eventos',
    implemented: true
  },
  {
    value: 'solicitudesporlugar',
    label: 'Solicitudes por lugar',
    description: 'Número de solicitudes recibidas por cada lugar publicado.',
    roles: ['Propietario'],
    path: '/reportes/solicitudes-por-lugar',
    implemented: true
  },
  {
    value: 'vistasporlugar',
    label: 'Vistas por lugar',
    description: 'Cantidad de visualizaciones de tus lugares.',
    roles: ['Propietario'],
    path: '/reportes/vistas-por-lugar',
    implemented: true
  },
  {
    value: 'vistasservicio',
    label: 'Vistas a servicio',
    description: 'Cantidad de visualizaciones de tus servicios.',
    roles: ['Prestador'],
    path: '/reportes/vistas-por-servicio',
    implemented: true
  },
  {
    value: 'reportefinanciero',
    label: 'Reporte financiero',
    description: 'Resumen de ingresos y métricas de rendimiento financiero.',
    roles: ['Prestador', 'Propietario'],
    path: '/reportes/reporte-financiero',
    implemented: true
  }
];

// Helper para obtener el último rango guardado (formato usado actualmente)
export function getLastRange() {
  try {
    const saved = JSON.parse(localStorage.getItem('reportes:lastRange'));
    if (saved && saved.fechaDesde && saved.fechaHasta) return saved;
  } catch { /* ignore */ }
  return null;
}

// Navegar usando fechas guardadas o devolver null si no existen
export function buildReportPathWithLastRange(reportDef) {
  const last = getLastRange();
  if (!reportDef) return null;
  if (last && last.fechaDesde && last.fechaHasta) {
    return `${reportDef.path}?desde=${last.fechaDesde}&hasta=${last.fechaHasta}`;
  }
  return null; // caller decidirá si abre modal
}
