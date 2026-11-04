import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function crearPdfBase({ orientation = 'portrait', unit = 'mm', format = 'a4' } = {}) {
  return new jsPDF({ orientation, unit, format });
}

export async function agregarEncabezado(pdf, { titulo, subtitulo, usuario, fechaGeneracion = new Date(), margen = 20, logoWidthMM = 40, logoSpacingMM = 6, logoOffsetX = 13 } = {}) {
  let y = margen;
  try {
    // Ruta relativa al asset desde este archivo
    const logoModule = await import('../../../../assets/logo_wevently.png');
    const logoUrl = logoModule?.default || logoModule;

    const imgEl = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = logoUrl;
    });


    const pageWidth = pdf.internal.pageSize.getWidth();
    const aspect = imgEl.naturalWidth / imgEl.naturalHeight;
    // Asegurarnos que el logo quepa dejando márgenes
    const widthMM = Math.min(logoWidthMM, pageWidth - (margen * 2) - 10);
    const heightMM = widthMM / aspect;

    // Posicionar a la derecha superior (enfrentado al título) SIN empujar el contenido hacia abajo
    // `logoOffsetX` permite desplazar el logo en mm (positivo -> más a la derecha)
    const rawX = pageWidth - margen - widthMM + (typeof logoOffsetX === 'number' ? logoOffsetX : 0);
    // Asegurar que el logo no se salga de la página: dejar al menos 2mm de holgura
    const minX = 0;
    const maxX = pageWidth - widthMM - 2;
    const x = Math.min(maxX, Math.max(minX, rawX));
    const yLogo = Math.max(5, margen - (heightMM / 2)); // evitar valores negativos

    // Convertir a dataURL usando canvas (jsPDF puede aceptar dataURL)
    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0);
    const imgData = canvas.toDataURL('image/png');

    // Agregar imagen al PDF en la esquina superior derecha
    pdf.addImage(imgData, 'PNG', x, yLogo, widthMM, heightMM);

  } catch (e) {
    // No romper si no se pudo cargar el logo: continuar con el layout anterior
  }

  // Texto del encabezado (igual que antes), posicionado usando la y actual
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(25);
  pdf.text(titulo, margen, y); y += 8;
  if (subtitulo) {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(90, 90, 90);
    pdf.setFontSize(14);
    pdf.text(subtitulo, margen, y); y += 10; //si no anda probar con 12
    pdf.setTextColor(0, 0, 0);
  }
  const fechaStr = fechaGeneracion.toLocaleDateString('es-AR');
  const horaStr = fechaGeneracion.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  pdf.setFontSize(11.5);
  pdf.text(`Generado por: ${usuario || ''}  `, margen, y);
  y += 6;
  pdf.text(`Fecha de generación:  ${fechaStr} ${horaStr}`, margen, y);
  y += 8;

  return y; // nueva posición para continuar
}

export function agregarPiePaginas(pdf, { margen = 20, leyenda = '© 2025 Wevently' } = {}) {
  const total = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margen, pageHeight - 15, pageWidth - margen, pageHeight - 15);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(leyenda, margen, pageHeight - 8);
    pdf.text(`Página ${i}/${total}`, pageWidth - margen - 10, pageHeight - 8, { align: 'right' });
  }
}

/**
 * Captura un elemento DOM como imagen usando html2canvas con reintentos.
 * @param {string} selector CSS del elemento (por ejemplo '.reporte-chart-container canvas')
 * @param {object} cfg Configuración
 *  - maxWidth, maxHeight: límites opcionales
 *  - margenX: posición X inicial
 *  - retries: cantidad de reintentos si el canvas todavía no está listo
 *  - delay: milisegundos entre reintentos
 *  - scale: escala de renderizado (default 2)
 */
export async function capturarElementoComoImagen(selector, { maxWidth, maxHeight, margenX = 20, retries = 5, delay = 300, scale = 2 } = {}) {
  const html2canvas = (await import('html2canvas')).default;

  for (let intento = 0; intento < retries; intento++) {
    const el = document.querySelector(selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      // Evitar capturar mientras ancho/alto sean 0 (aún montando / animando)
      if (rect.width > 0 && rect.height > 0) {
        try {
          const canvas = await html2canvas(el, {
            scale,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
            onclone: (clonedDoc) => {
              const element = clonedDoc.querySelector(selector);
              if (element) {
                // Desactivar animaciones para evitar que salgan transparentes/descoloridos
                element.style.animation = 'none';
                element.style.transition = 'none';
                element.style.opacity = '1';
                const children = element.querySelectorAll('*');
                children.forEach(child => {
                  child.style.animation = 'none';
                  child.style.transition = 'none';
                  if (getComputedStyle(child).opacity !== '1') {
                    child.style.opacity = '1';
                  }
                });
              }
            }
          });
          const ratio = canvas.width / canvas.height;
          let w = maxWidth || canvas.width / scale; // fallback tamaño original
          let h = w / ratio;
          if (maxHeight && h > maxHeight) { h = maxHeight; w = h * ratio; }
          const imgData = canvas.toDataURL('image/png');
          return { imgData, width: w, height: h, x: margenX };
        } catch (e) {
          // intenta nuevamente si quedan reintentos
        }
      }
    }
    if (intento < retries - 1) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return null; // no se pudo capturar
}
