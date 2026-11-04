const parametrosComision = [
  {
    id: 1,
    comisionLugar: 0.1,
    comisionServicio: 0.05,
    descripcion: "Comisión estándar",
    fechaDesde: "2024-01-01",
    fechaHasta: "2024-12-31",
    fechaHoraBaja: null,
  },
  {
    id: 2,
    comisionLugar: 0.15,
    comisionServicio: 0.1,
    descripcion: "Comisión especial por temporada alta",
    fechaDesde: "2025-01-01",
    fechaHasta: "2025-03-31",
    fechaHoraBaja: null,
  },
  {
    id: 3,
    comisionLugar: 0.08,
    comisionServicio: 0.04,
    descripcion: "Descuento promocional",
    fechaDesde: "2025-04-01",
    fechaHasta: "2025-06-30",
    fechaHoraBaja: null,
  }
];

export default parametrosComision;
