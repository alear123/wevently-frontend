import { crearPdfBase, agregarEncabezado, agregarPiePaginas, capturarElementoComoImagen } from './basePDF';
import autoTable from 'jspdf-autotable';

/**
 * Genera el PDF de Usuarios Activos replicando el comportamiento legacy (chips de agrupación + captura de gráfico)
 */
export async function generarPDFUsuariosActivos({
  datos,
  rango,
  tipoAgrupacion,
  agrupacionesDisponibles = [],
  selectorResumenUsuarios = '.vca-resumen-container',
  selectorGrafico = '.reporte-chart-container canvas',
  selectorCuadros = '.vca-double-card',
  selectorComisionDiaria = '.vca-comisiones-row',
  selectorTopMedios = '.grafico-barras-medios-wrapper',
  usuario = 'usuario@demo.com'
}) {
  const pdf = crearPdfBase();
  let y = await agregarEncabezado(pdf, {
    titulo: 'Reporte de usuarios activos',
    subtitulo: `Tendencias y actividad desde ${rango.desde.toLocaleDateString('es-AR')} hasta ${rango.hasta.toLocaleDateString('es-AR')}`,
    usuario
  });

  // Intentar capturar el resumen como imagen primero
  let resumenCapturado = false;
  if (selectorResumenUsuarios) {
    try {
      const pageWidth = pdf.internal.pageSize.getWidth();
      const capturaResumen = await capturarElementoComoImagen(selectorResumenUsuarios, {
        maxWidth: pageWidth - 40,
        maxHeight: 120,
        retries: 4,
        delay: 200,
        scale: 2
      });
      if (capturaResumen) {
        pdf.addImage(capturaResumen.imgData, 'PNG', capturaResumen.x, y + 6, capturaResumen.width, capturaResumen.height);
        y += capturaResumen.height + 12;
        resumenCapturado = true;
      }
    } catch (e) {
      console.warn('Falló captura de resumen, usando fallback manual', e);
    }
  }

  // Fallback: Dibujar manualmente si no se capturó imagen
  const resumenArr = datos.resumenPeriodo || datos.resumenPeriodos || [];
  if (!resumenCapturado && Array.isArray(resumenArr) && resumenArr.length) {
    pdf.setFontSize(10);
    let yResumen = y + 6;
    const margenX = 20;
    const colW = 55;
    resumenArr.forEach((item, idx) => {
      const x = margenX + idx * (colW + 10);
      pdf.setDrawColor(230, 230, 230);
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(x, yResumen, colW, 26, 3, 3, 'FD');
      pdf.setFont(undefined, 'bold');
      pdf.text((item.periodo || ''), x + 5, yResumen + 8);
      pdf.setFontSize(13);
      pdf.setFont(undefined, 'normal');
      pdf.text(String(item.valor ?? 0), x + 5, yResumen + 17);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      if (item.descripcion) pdf.text(item.descripcion, x + 5, yResumen + 23);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'normal');
    });
    y = yResumen + 32;
  }


  // Rango alineado a la derecha
  /*if (rango?.desde && rango?.hasta) {
    pdf.setFontSize(11);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const textoRango = `Rango: ${rango.desde.toLocaleDateString('es-AR')} - ${rango.hasta.toLocaleDateString('es-AR')}`;
    pdf.text(textoRango, pageWidth - 20, y, { align: 'right' });
    y += 8;
  }*/

  // Chips de agrupación (simulación visual como antes)
  if (agrupacionesDisponibles.length) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setFontSize(10);
    let xPos = 20;
    const maxX = pageWidth - 20;
    agrupacionesDisponibles.forEach(g => {
      const label = g.charAt(0).toUpperCase() + g.slice(1);
      const textW = pdf.getTextWidth(label);
      const w = textW + 8;
      if (xPos + w > maxX) { // wrap simple
        y += 10; xPos = 20;
      }
      if (g === tipoAgrupacion) {
        pdf.setFillColor(36, 51, 255);
        pdf.setTextColor(255, 255, 255);
      } else {
        pdf.setFillColor(240, 240, 240);
        pdf.setTextColor(0, 0, 0);
      }
      pdf.roundedRect(xPos, y - 4, w, 8, 2, 2, 'F');
      pdf.text(label, xPos + 4, y + 1);
      xPos += w + 5;
    });
    pdf.setTextColor(0, 0, 0);
    y += 14;
  }

  // Gráfico (html2canvas vía import dinámico en basePDF)
  if (datos?.datosGrafico?.length) {
    try {
      const pageWidth = pdf.internal.pageSize.getWidth();
      const captura = await capturarElementoComoImagen(selectorGrafico, { maxWidth: pageWidth - 40, maxHeight: 135, retries: 6, delay: 350, scale: 2 });
      if (captura) {
        pdf.addImage(captura.imgData, 'PNG', captura.x, y, captura.width, captura.height);
        y += captura.height + 6;
      }
    } catch (e) {
      // Continuar sin gráfico
      pdf.setFontSize(9);
      pdf.setTextColor(180, 0, 0);
      pdf.text('No se pudo capturar el gráfico', 20, y);
      pdf.setTextColor(0, 0, 0);
      y += 8;
    }
  }

  // Tabla con formato flexible (como legacy: fecha según agrupación y valor fallback)
  if (datos?.datosGrafico?.length) {
    const filas = datos.datosGrafico.map(item => {
      let fechaTxt;
      if (tipoAgrupacion === 'dia' && item.fecha) {
        const d = new Date(item.fecha);
        fechaTxt = isNaN(d) ? (item.label || item.fecha) : d.toLocaleDateString('es-AR');
      } else if (tipoAgrupacion === 'semana') {
        fechaTxt = item.label || `Semana ${item.semana || ''}`;
      } else if (tipoAgrupacion === 'mes') {
        fechaTxt = item.label || item.mes || '';
      } else {
        fechaTxt = item.label || item.fecha || '';
      }
      const valor = item.value ?? item.cantidad ?? item.usuarios ?? item.activos ?? 0;
      return [fechaTxt, valor.toLocaleString('es-AR')];
    });

    autoTable(pdf, {
      head: [['Fecha', 'Usuarios activos']],
      body: filas,
      startY: y,
      styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0] },
      headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold', fontSize: 10 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 65, halign: 'left' },
        1: { halign: 'right' }
      },
      didParseCell: (data) => {
        if (data.section === 'head' && data.column.index === 1) {
          data.cell.styles.halign = 'right';
        }
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.halign = 'right';
        }
      }
    });
    // Actualizar y con el final de la tabla
    y = pdf.lastAutoTable.finalY + 15;
  } else {
    pdf.setFontSize(11);
    pdf.text('Sin datos para el rango seleccionado', 20, y);
    y += 15;
  }

  // Título financiero
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('Esto fue lo que paso monetariamente...', 20, y);
  y += 12;
  // ============================================================================
  // SECCIÓN NUEVA: Cuadros informativos debajo del gráfico
  // ============================================================================
  if (selectorCuadros) {
    try {
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margenInferior = 20;

      const capturaCuadros = await capturarElementoComoImagen(selectorCuadros, {
        maxWidth: pageWidth - 20,
        maxHeight: 200,
        retries: 8,
        delay: 400,
        scale: 2
      });

      if (capturaCuadros) {
        // Verificar si hay espacio en la página actual; si no, agregar nueva página
        if (y + capturaCuadros.height + margenInferior > pageHeight) {
          pdf.addPage();
          y = 20;
        }

        // Agregar un pequeño espaciado antes de los cuadros
        y += 4;

        pdf.addImage(
          capturaCuadros.imgData,
          'PNG',
          capturaCuadros.x,
          y,
          capturaCuadros.width,
          capturaCuadros.height
        );
        y += capturaCuadros.height + 6;
      }
    } catch (e) {
      // Continuar sin cuadros si no se pueden capturar (no es crítico)
      console.warn('No se pudieron capturar los cuadros informativos:', e.message);
    }
  }

  // ============================================================================
  // SECCIÓN NUEVA: Comisiones diarias
  // ============================================================================
  if (selectorComisionDiaria) {
    try {
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margenInferior = 20;

      const capturaComisiones = await capturarElementoComoImagen(selectorComisionDiaria, {
        maxWidth: pageWidth - 20,
        maxHeight: 250,
        retries: 8,
        delay: 400,
        scale: 2
      });

      if (capturaComisiones) {
        if (y + capturaComisiones.height + margenInferior > pageHeight) {
          pdf.addPage();
          y = 20;
        }
        y += 4;
        pdf.addImage(capturaComisiones.imgData, 'PNG', capturaComisiones.x, y, capturaComisiones.width, capturaComisiones.height);
        y += capturaComisiones.height + 6;
      }
    } catch (e) {
      console.warn('No se pudieron capturar las comisiones:', e.message);
    }
  }

  // ============================================================================
  // SECCIÓN NUEVA: Top Medios de Pago
  // ============================================================================
  if (selectorTopMedios) {
    try {
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margenInferior = 20;

      const capturaMedios = await capturarElementoComoImagen(selectorTopMedios, {
        maxWidth: pageWidth - 20,
        maxHeight: 250,
        retries: 8,
        delay: 400,
        scale: 2
      });

      if (capturaMedios) {
        if (y + capturaMedios.height + margenInferior > pageHeight) {
          pdf.addPage();
          y = 20;
        }
        y += 4;
        pdf.addImage(capturaMedios.imgData, 'PNG', capturaMedios.x, y, capturaMedios.width, capturaMedios.height);
        y += capturaMedios.height + 6;
      }
    } catch (e) {
      console.warn('No se pudo capturar top medios:', e.message);
    }
  }

  agregarPiePaginas(pdf, {});
  const fechaGen = new Date().toISOString().split('T')[0];
  pdf.save(`Usuarios_activos_${fechaGen}.pdf`);
}
