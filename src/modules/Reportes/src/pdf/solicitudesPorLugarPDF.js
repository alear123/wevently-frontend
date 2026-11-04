import { crearPdfBase, agregarEncabezado, agregarPiePaginas, capturarElementoComoImagen } from './basePDF';

export default async function solicitudesPorLugarPDF({
    titulo, subtitulo, usuario, fechaDesde, fechaHasta, filtroTexto, resumenArr = []
}) {
    const pdf = crearPdfBase({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let currentY = await agregarEncabezado(pdf, { titulo, subtitulo, usuario });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;

    // Info rango/filtro
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

    // --- Tarjetas Resumen: usar función de utilidad optimizada ---
    const tarjetasCaptura = await capturarElementoComoImagen('#tarjetas-resumen-container', {
        maxWidth: 170,
        retries: 5,
        delay: 300,
        scale: 2
    });

    if (tarjetasCaptura) {
        pdf.addImage(
            tarjetasCaptura.imgData,
            'PNG',
            (pageWidth - tarjetasCaptura.width) / 2,
            currentY,
            tarjetasCaptura.width,
            tarjetasCaptura.height
        );
        currentY += tarjetasCaptura.height + 10;
    }


    // --- Capturar gráfico de barras (reservas por estado) ---
    await new Promise(resolve => setTimeout(resolve, 500));
    const chartBarrasContainer = document.querySelector('#grafico-barras-container canvas');
    if (chartBarrasContainer) {
        const imgData = chartBarrasContainer.toDataURL("image/png");
        const w = 170;
        const h = 50;
        pdf.addImage(imgData, 'PNG', (pageWidth - w) / 2, currentY, w, h);
        currentY += h + 15;
    }

    // --- Capturar gráfico lineal (tendencia de reseñas) ---
    const chartLinealContainer = document.querySelector('#grafico-lineal-container canvas');
    if (chartLinealContainer) {
        if (currentY + 50 > pdf.internal.pageSize.getHeight() - 30) {
            pdf.addPage();
            currentY = 20;
        }

        const imgData = chartLinealContainer.toDataURL("image/png");
        const w = 170;
        const h = 50;
        pdf.addImage(imgData, 'PNG', (pageWidth - w) / 2, currentY, w, h);
        currentY += h + 10;
    }


    agregarPiePaginas(pdf, { margen: 20 });
    const nombre = `solicitudes_por_lugar_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
    pdf.save(nombre);
}
