import { useState, useCallback } from 'react';
import { validarRangoFechas } from '../utils/fechas';

// Hook reutilizable para manejar fechas de un reporte con validación
export default function useRangoFechasReporte(initialDesde = null, initialHasta = null) {
  const [fechaDesde, setFechaDesde] = useState(initialDesde);
  const [fechaHasta, setFechaHasta] = useState(initialHasta);

  const setRango = useCallback((d, h) => {
    if (d !== undefined) setFechaDesde(d);
    if (h !== undefined) setFechaHasta(h);
  }, []);

  const validacion = validarRangoFechas(fechaDesde, fechaHasta);

  return {
    fechaDesde,
    fechaHasta,
    setFechaDesde,
    setFechaHasta,
    setRango,
    validacion
  };
}
