/**
 * Sección compartida de firmas de los PDF de Capacitación (formulario y recibo).
 *
 * Dibuja, en el flujo del documento, una línea de firma por cada entrada con su
 * etiqueta centrada debajo. Si no queda espacio en la página abre una nueva (con la
 * plantilla del documento, si la tiene) para no solapar el contenido ni el pie.
 */

import { IncosPDFBase } from '../../IncosPDFBase.js';
import { cabeBloque, computeFirmaColumnas } from '../capacitacionPdfLayout.js';

const ESPACIO_PARA_FIRMAR = 44;
const ALTO_BLOQUE = ESPACIO_PARA_FIRMAR + 24;

/**
 * @param {import('../../IncosPDFLibBase.js').IncosPDFLibBase} pdf - Generador (contexto de dibujo)
 * @param {Object} params
 * @param {Array<{ label:string }>} params.firmas - Firmas a dibujar, de izquierda a derecha.
 * @param {number} [params.pieHeight=0] - Alto del pie de la plantilla a no invadir.
 * @returns {Promise<void>}
 */
export async function dibujarFirmas(pdf, { firmas, pieHeight = 0 }) {
  const { margins, signatureLineThickness: grosor = 1 } = IncosPDFBase.LAYOUT;
  const floorY = margins.bottom + pieHeight;

  if (!cabeBloque({ currentY: pdf._currentY, requerido: ALTO_BLOQUE, floorY })) {
    await pdf._addTemplatePage();
  }

  const page = pdf._currentPage;
  const { width: pageWidth } = page.getSize();
  const font = await pdf._pdfDoc.embedFont(
    pdf._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font)
  );
  const size = IncosPDFBase.FONTS.normal.size;
  const color = pdf._hexToRgb(IncosPDFBase.COLORS.text);
  const lineY = pdf._currentY - ESPACIO_PARA_FIRMAR;

  const columnas = computeFirmaColumnas({
    count: firmas.length,
    startX: margins.left,
    contentWidth: pageWidth - margins.left - margins.right,
    lineWidth: IncosPDFBase.LAYOUT.signatureLineWidth
  });

  columnas.forEach((columna, i) => {
    page.drawLine({
      start: { x: columna.x1, y: lineY },
      end: { x: columna.x2, y: lineY },
      thickness: grosor,
      color
    });
    const etiqueta = firmas[i].label;
    page.drawText(etiqueta, {
      x: columna.centerX - font.widthOfTextAtSize(etiqueta, size) / 2,
      y: lineY - grosor - IncosPDFBase.LAYOUT.signatureSpacingLineToFirstText - size,
      size,
      font,
      color
    });
  });

  pdf._currentY = lineY - ALTO_BLOQUE + ESPACIO_PARA_FIRMAR;
}

export default dibujarFirmas;
