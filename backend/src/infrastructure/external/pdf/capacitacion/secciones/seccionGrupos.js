/**
 * Sección IV del Formulario de Inscripción de Capacitación: grupos y horarios.
 *
 * Un cuadro por cada grupo disponible del curso (p. ej. Regular e Intensivo) con
 * su horario; el grupo que eligió el participante lleva la casilla marcada.
 * Si el curso no tiene grupos, la sección no se dibuja.
 */

import { IncosPDFBase } from '../../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from '../capacitacionPdfConfig.js';
import { cabeBloque, valorODefecto } from '../capacitacionPdfLayout.js';

const LADO_CASILLA = 12;
const PADDING = 8;
const FUENTE = 9;
const INTERLINEADO = FUENTE * 1.3;
const SEPARACION_CUADROS = 6;

/**
 * @param {import('../../IncosPDFLibBase.js').IncosPDFLibBase} pdf - Generador (contexto de dibujo)
 * @param {Object} datos - Payload del formulario
 * @returns {Promise<void>}
 */
export async function dibujarGrupos(pdf, datos) {
  const grupos = datos.grupos ?? [];
  if (grupos.length === 0) return;

  const { margins } = IncosPDFBase.LAYOUT;
  const floorY = margins.bottom + IncosPDFBase.LAYOUT.signatureTemplateFooterHeight;
  const fontRegular = await pdf._pdfDoc.embedFont(
    pdf._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font)
  );
  const fontBold = await pdf._pdfDoc.embedFont(
    pdf._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font)
  );
  const color = pdf._hexToRgb(IncosPDFBase.COLORS.text);
  const colorBorde = pdf._hexToRgb(IncosPDFBase.COLORS.border);

  await pdf._addSection(CFG.secciones.grupos);

  for (const grupo of grupos) {
    const { width: pageWidth } = pdf._currentPage.getSize();
    const x = margins.left;
    const ancho = pageWidth - margins.left - margins.right;
    const xTexto = x + PADDING + LADO_CASILLA + PADDING;
    const lineasHorario = pdf._wrapText(
      `${CFG.etiquetas.horario} ${valorODefecto(grupo.horarios, CFG.nullPlaceholder)}`,
      fontRegular,
      FUENTE,
      x + ancho - PADDING - xTexto
    );
    const alto = PADDING * 2 + INTERLINEADO * (1 + lineasHorario.length);

    if (!cabeBloque({ currentY: pdf._currentY, requerido: alto, floorY })) {
      await pdf._addTemplatePage();
    }
    const page = pdf._currentPage;
    const top = pdf._currentY;
    const base = top - alto;

    page.drawRectangle({ x, y: base, width: ancho, height: alto, borderColor: colorBorde, borderWidth: 1 });

    // Casilla centrada verticalmente en el cuadro del grupo
    const casillaY = base + (alto - LADO_CASILLA) / 2;
    page.drawRectangle({
      x: x + PADDING,
      y: casillaY,
      width: LADO_CASILLA,
      height: LADO_CASILLA,
      borderColor: colorBorde,
      borderWidth: 1
    });
    if (grupo.seleccionado) {
      const cx = x + PADDING;
      const trazo = { thickness: 1.6, color };
      page.drawLine({
        start: { x: cx + 2.5, y: casillaY + LADO_CASILLA / 2 },
        end: { x: cx + LADO_CASILLA * 0.42, y: casillaY + 2.5 },
        ...trazo
      });
      page.drawLine({
        start: { x: cx + LADO_CASILLA * 0.42, y: casillaY + 2.5 },
        end: { x: cx + LADO_CASILLA - 2, y: casillaY + LADO_CASILLA - 2.5 },
        ...trazo
      });
    }

    let y = top - PADDING - FUENTE;
    page.drawText(`${CFG.etiquetas.grupoDisponible} ${valorODefecto(grupo.nombre, CFG.nullPlaceholder)}`.toUpperCase(), {
      x: xTexto,
      y,
      size: FUENTE,
      font: fontBold,
      color
    });
    for (const linea of lineasHorario) {
      y -= INTERLINEADO;
      page.drawText(linea, { x: xTexto, y, size: FUENTE, font: fontRegular, color });
    }

    pdf._currentY = base - SEPARACION_CUADROS;
  }
}

export default dibujarGrupos;
