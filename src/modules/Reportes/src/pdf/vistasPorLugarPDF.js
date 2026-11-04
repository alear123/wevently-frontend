import { crearPdfBase, agregarEncabezado, agregarPiePaginas, capturarElementoComoImagen } from './basePDF';

export default async function generarPdfVistasPorLugar({
  titulo,
  subtitulo,
  usuario,
  fechaDesde,
  fechaHasta,
  filtroTexto,
  agrupacion,
  datosTabla,
  tieneLugarSeleccionado = false,
  resumenContrataciones = null,
  lugarSeleccionado = ''
}) {
  const pdf = crearPdfBase({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let currentY = await agregarEncabezado(pdf, { titulo, subtitulo, usuario });

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  if (filtroTexto) {
    pdf.setFillColor(36, 51, 255);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    const w = pdf.getTextWidth(filtroTexto) + 8;
    pdf.roundedRect(margin, currentY - 4, w, 8, 2, 2, 'F');
    pdf.text(filtroTexto, margin + 4, currentY + 1);
    pdf.setTextColor(0, 0, 0);
    currentY += 12;
  }

  await new Promise(resolve => setTimeout(resolve, 400));

  // 1. Capturar y agregar resumen de contrataciones (solo si hay lugar seleccionado)
  if (tieneLugarSeleccionado && resumenContrataciones) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumen de Contrataciones', margin, currentY);
    currentY += 8;

    const capturaResumen = await capturarElementoComoImagen('#resumen-contrataciones-pdf', {
      maxWidth: pageWidth - margin * 2,
      maxHeight: 60,
      retries: 6,
      delay: 350,
      scale: 2
    });

    if (capturaResumen) {
      const escalaAdicional = 1.3;
      const anchoFinal = capturaResumen.width * escalaAdicional;
      const altoFinal = capturaResumen.height * escalaAdicional;

      if (currentY + altoFinal > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }

      const xPos = (pageWidth - anchoFinal) / 2;
      pdf.addImage(capturaResumen.imgData, 'PNG', xPos, currentY, anchoFinal, altoFinal);
      currentY += altoFinal + 12;
    } else {
      // Si no se puede capturar la imagen, mostrar los datos en texto
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Contrataciones Totales: ${resumenContrataciones.cantidadContrataciones}`, margin, currentY);
      currentY += 6;
      pdf.text(`Dinero Ganado: $${resumenContrataciones.dineroGanado}`, margin, currentY);
      currentY += 12;
    }
  }

  // 2. Capturar y agregar gráfico de visualizaciones
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  const tituloVisualizaciones = tieneLugarSeleccionado
    ? `Visualizaciones - ${lugarSeleccionado}`
    : 'Visualizaciones';
  pdf.text(tituloVisualizaciones, margin, currentY);
  currentY += 8;

  const capturaVisualizaciones = await capturarElementoComoImagen('#grafico-visualizaciones-pdf canvas', {
    maxWidth: pageWidth - margin * 2,
    maxHeight: 90,
    retries: 6,
    delay: 350,
    scale: 2
  });

  if (capturaVisualizaciones) {
    if (currentY + capturaVisualizaciones.height > pageHeight - 30) {
      pdf.addPage();
      currentY = margin;
    }

    const xPos = (pageWidth - capturaVisualizaciones.width) / 2;
    pdf.addImage(capturaVisualizaciones.imgData, 'PNG', xPos, currentY, capturaVisualizaciones.width, capturaVisualizaciones.height);
    currentY += capturaVisualizaciones.height + 12;
  }

  // 3. Capturar y agregar gráfico de ganancias (solo si hay lugar seleccionado)
  if (tieneLugarSeleccionado) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const tipoGanancia = agrupacion === 'dia' ? 'Diarias' : agrupacion === 'semana' ? 'Semanales' : 'Mensuales';
    pdf.text(`Ganancias ${tipoGanancia} - ${lugarSeleccionado}`, margin, currentY);
    currentY += 8;

    const capturaGanancias = await capturarElementoComoImagen('#grafico-ganancias-pdf canvas', {
      maxWidth: pageWidth - margin * 2,
      maxHeight: 80,
      retries: 6,
      delay: 350,
      scale: 2
    });

    if (capturaGanancias) {
      if (currentY + capturaGanancias.height > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }

      const xPos = (pageWidth - capturaGanancias.width) / 2;
      pdf.addImage(capturaGanancias.imgData, 'PNG', xPos, currentY, capturaGanancias.width, capturaGanancias.height);
      currentY += capturaGanancias.height + 10;
    }
  }

  agregarPiePaginas(pdf, { margen: 20 });

  const nombre = `vistas_por_lugar_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
  pdf.save(nombre);
}
