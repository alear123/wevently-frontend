// Simula una respuesta de API para servicios más solicitados en un rango de fechas, con formato DTO

const serviciosMasSolicitadosMock = ({ fechaDesde, fechaHasta, localidadId }) => {
  // Generar fechas entre el rango
  const getFechasEnRango = (desde, hasta) => {
    const fechas = [];
    let current = new Date(desde);
    const end = new Date(hasta);
    while (current <= end) {
      fechas.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return fechas;
  };

  // Simular servicios
  const servicios = [
    "Sonido",
    "Iluminación",
    "Catering",
    "Decoración",
    "Fotografía"
  ];

  // Generar resumen total por servicio
  const resumen = servicios.map(servicio => ({
    servicio,
    cantidad: Math.floor(Math.random() * 50) + 1
  }));

  // Generar datos para el gráfico: un objeto por fecha, con cantidad por servicio
  const fechas = getFechasEnRango(fechaDesde, fechaHasta);
  const datosGrafico = fechas.map(fecha => {
    const obj = { fecha: fecha.toISOString().split('T')[0] };
    servicios.forEach(servicio => {
      obj[servicio] = Math.floor(Math.random() * 10) + 1;
    });
    return obj;
  });

  return {
    resumen,
    datosGrafico,
    rangoFechas: {
      desde: fechaDesde,
      hasta: fechaHasta
    }
  };
};

export default serviciosMasSolicitadosMock;
