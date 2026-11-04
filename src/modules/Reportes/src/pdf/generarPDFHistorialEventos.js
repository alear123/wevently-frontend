import { crearPdfBase, agregarEncabezado, agregarPiePaginas, capturarElementoComoImagen } from './basePDF';
import autoTable from 'jspdf-autotable';

export async function generarPDFHistorialEventos({
    datos,
    rango,
    selectorGrafico = '.reporte-chart-container canvas',
    usuario = 'usuario@demo.com'
}) {
    const pdf = crearPdfBase();
    let y = await agregarEncabezado(pdf, {
        titulo: 'Historial de eventos',
        subtitulo: `Resumen de eventos y gastos desde ${rango.desde.toLocaleDateString('es-AR')} hasta ${rango.hasta.toLocaleDateString('es-AR')}`,
        usuario
    });

    // Resumen
    const resumenArr = datos.resumen || [];
    if (Array.isArray(resumenArr) && resumenArr.length) {
        pdf.setFontSize(10);
        let yResumen = y + 8;
        const colW = 56;
        const colGap = 15;
        const rowGap = 28;
        const cardsPerRow = 2; // ¡Siempre dos!
        const margenX = 28;

        resumenArr.forEach((item, idx) => {
            const fila = Math.floor(idx / cardsPerRow);
            const col = idx % cardsPerRow;
            const x = margenX + col * (colW + colGap);
            const yCard = yResumen + fila * rowGap;

            pdf.setDrawColor(230, 230, 230);
            pdf.setFillColor(250, 250, 250);
            pdf.roundedRect(x, yCard, colW, 25, 3, 3, 'FD');
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(9);
            pdf.text(item.periodo ?? '', x + 5, yCard + 8);
            pdf.setFontSize(13);
            pdf.setFont(undefined, 'normal');
            pdf.text(String(item.valor ?? 0), x + 5, yCard + 17);
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            if (item.descripcion) {
                const descTexto = pdf.splitTextToSize(item.descripcion, colW - 10);
                pdf.text(descTexto, x + 5, yCard + 22);
            }
            pdf.setTextColor(0, 0, 0);
        });
        y = yResumen + 2 * rowGap + 8; // actualiza y para lo que sigue después
    }

    // Rango de fechas
    if (rango?.desde && rango?.hasta) {
        pdf.setFontSize(11);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const textoRango = `Período: ${rango.desde.toLocaleDateString('es-AR')} - ${rango.hasta.toLocaleDateString('es-AR')}`;
        pdf.text(textoRango, pageWidth - 20, y, { align: 'right' });
        y += 12;
    }

    // Gráfico
    if (datos.eventos?.length) {
        try {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const captura = await capturarElementoComoImagen(selectorGrafico, { 
                maxWidth: pageWidth - 40, 
                maxHeight: 80, 
                retries: 6, 
                delay: 350, 
                scale: 2 
            });
            
            if (captura) {
                pdf.addImage(captura.imgData, 'PNG', captura.x, y, captura.width, captura.height);
                y += captura.height + 12;
            }
        } catch (e) {
            console.error('Error capturando gráfico:', e);
            pdf.setFontSize(9);
            pdf.setTextColor(180, 0, 0);
            pdf.text('No se pudo capturar el gráfico', 20, y);
            pdf.setTextColor(0, 0, 0);
            y += 8;
        }
    }

    // Tabla de eventos
    if (datos.eventos?.length) {
        const filas = datos.eventos.map(evento => {
            const fecha = new Date(evento.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-AR');
            const montoFormateado = `$${Number(evento.valor || 0).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
            
            return [
                evento.label || evento.nombreEvento,
                fechaFormateada,
                evento.evento?.personas || 0,
                montoFormateado
            ];
        });

        autoTable(pdf, {
            head: [['Evento', 'Fecha', 'Personas', 'Total gastado']],
            body: filas,
            startY: y,
            styles: { 
                fontSize: 9, 
                cellPadding: 3, 
                textColor: [0, 0, 0] 
            },
            headStyles: { 
                fillColor: [230, 230, 230], 
                textColor: 0, 
                fontStyle: 'bold', 
                fontSize: 10 
            },
            alternateRowStyles: { 
                fillColor: [248, 248, 248] 
            },
            margin: { left: 20, right: 20 },
            columnStyles: {
                0: { cellWidth: 60, halign: 'left' },
                1: { cellWidth: 35, halign: 'center' },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 40, halign: 'right' }
            }
        });
    } else {
        pdf.setFontSize(11);
        pdf.text('No hay eventos en el período seleccionado', 20, y);
    }

    agregarPiePaginas(pdf, {});
    const fechaGen = new Date().toISOString().split('T')[0];
    pdf.save(`Historial_eventos_${fechaGen}.pdf`);
}
