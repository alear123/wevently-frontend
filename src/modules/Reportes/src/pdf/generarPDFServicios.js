import { crearPdfBase, agregarEncabezado, agregarPiePaginas } from './basePDF';
import autoTable from 'jspdf-autotable';

export async function generarPDFServiciosMasSolicitados({
  datos,
  rango,
  usuario='usuario@demo.com',
  images = {}
}) {
  const pdf = crearPdfBase();
  let y = await agregarEncabezado(pdf, {
    titulo: 'Servicios más solicitados',
    subtitulo: `Listado y cantidades desde ${rango.desde.toLocaleDateString('es-AR')} hasta ${rango.hasta.toLocaleDateString('es-AR')}`,
    usuario
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // --- Global Stats Image ---
  if (images.globalStats) {
    y += 10;
    pdf.setFontSize(14);
    pdf.text('Estadísticas Globales', margin, y);
    y += 5;
    
    const imgProps = pdf.getImageProperties(images.globalStats);
    const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
    
    // Check if image fits on page
    if (y + imgHeight > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.addImage(images.globalStats, 'PNG', margin, y, contentWidth, imgHeight);
    y += imgHeight + 10;
  }

  // --- Filtered Stats Image ---
  if (images.filteredStats) {
    // Check space
    if (y > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.setFontSize(14);
    pdf.text('Resumen del Período (Filtrado)', margin, y);
    y += 5;
    
    const imgProps = pdf.getImageProperties(images.filteredStats);
    const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
    
    if (y + imgHeight > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.addImage(images.filteredStats, 'PNG', margin, y, contentWidth, imgHeight);
    y += imgHeight + 10;
  }

  // Optional: Add a small summary text if needed, but user requested visual similarity.
  // We skip the autoTable as per request "no quiero que se vea la tabla con el nombre y cantidad".

  agregarPiePaginas(pdf, {});
  const fechaGen = new Date().toISOString().split('T')[0];
  pdf.save(`Servicios_mas_solicitados_${fechaGen}.pdf`);
}


