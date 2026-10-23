/**
 * Sección IV del Formulario de Inscripción de Capacitación: grupos y horarios.
 *
 * Tabla con el encabezado verde institucional (igual que la de requisitos) y las columnas
 * Selección · Grupo · Días · Horarios: una fila con el grupo en el que se inscribió el participante
 * (p. ej. Intensivo) con su casilla marcada y, por cada bloque horario del grupo, los días y la hora alineados en la misma línea. El cuerpo va sobre el color del papel.
 * La casilla y el nombre del grupo van centrados verticalmente en la fila.
 * Si la inscripción no tiene grupo, la sección no se dibuja.
 */

import { rgb } from 'pdf-lib';
import { IncosPDFBase } from '../../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from '../capacitacionPdfConfig.js';
import { cabeBloque, valorODefecto } from '../capacitacionPdfLayout.js';

const LADO_CASILLA = 12;
const PADDING = 6;
const FUENTE = 9;
const FUENTE_ENCABEZADO = 8;
const INTERLINEADO = FUENTE * 1.3;
const ALTO_ENCABEZADO = 20;
const GROSOR_BORDE = 1;

/** Bloques de un grupo; sin horarios queda una línea vacía para que la fila no colapse. */
const bloquesDe = (grupo) => (grupo.bloques?.length > 0 ? grupo.bloques : [{ dias: '', horas: '' }]);

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
  const colorEncabezado = pdf._hexToRgb(IncosPDFBase.COLORS.primary);

  const { headers, widths } = CFG.tablaGrupos;
  const { width: pageWidth } = pdf._currentPage.getSize();
  const x = margins.left;
  const ancho = pageWidth - margins.left - margins.right;
  const anchos = widths.map((proporcion) => ancho * proporcion);
  const xColumna = anchos.map((_, i) => x + anchos.slice(0, i).reduce((suma, a) => suma + a, 0));
  const [colSeleccion, colGrupo, colDias, colHoras] = [0, 1, 2, 3];
  const anchoTexto = (col) => anchos[col] - PADDING * 2;

  await pdf._addSection(CFG.secciones.grupos);

  /** Encabezado verde con texto blanco centrado en cada columna; devuelve la Y inferior. */
  const dibujarEncabezado = () => {
    const page = pdf._currentPage;
    const base = pdf._currentY - ALTO_ENCABEZADO;
    page.drawRectangle({ x, y: base, width: ancho, height: ALTO_ENCABEZADO, color: colorEncabezado });
    page.drawRectangle({
      x,
      y: base,
      width: ancho,
      height: ALTO_ENCABEZADO,
      borderColor: colorBorde,
      borderWidth: GROSOR_BORDE
    });
    headers.forEach((titulo, col) => {
      const anchoTitulo = fontBold.widthOfTextAtSize(titulo, FUENTE_ENCABEZADO);
      page.drawText(titulo, {
        x: xColumna[col] + (anchos[col] - anchoTitulo) / 2,
        y: base + (ALTO_ENCABEZADO - FUENTE_ENCABEZADO) / 2 + 1,
        size: FUENTE_ENCABEZADO,
        font: fontBold,
        color: rgb(1, 1, 1)
      });
      if (col < headers.length - 1) {
        page.drawLine({
          start: { x: xColumna[col + 1], y: base },
          end: { x: xColumna[col + 1], y: base + ALTO_ENCABEZADO },
          thickness: GROSOR_BORDE,
          color: colorBorde
        });
      }
    });
    pdf._currentY = base;
  };

  /** Casilla cuadrada (marcada con una «✓» de dos trazos si es el grupo elegido). */
  const dibujarCasilla = (page, cx, cy, marcada) => {
    page.drawRectangle({
      x: cx,
      y: cy,
      width: LADO_CASILLA,
      height: LADO_CASILLA,
      borderColor: colorBorde,
      borderWidth: GROSOR_BORDE
    });
    if (!marcada) return;
    const trazo = { thickness: 1.6, color };
    page.drawLine({
      start: { x: cx + 2.5, y: cy + LADO_CASILLA / 2 },
      end: { x: cx + LADO_CASILLA * 0.42, y: cy + 2.5 },
      ...trazo
    });
    page.drawLine({
      start: { x: cx + LADO_CASILLA * 0.42, y: cy + 2.5 },
      end: { x: cx + LADO_CASILLA - 2, y: cy + LADO_CASILLA - 2.5 },
      ...trazo
    });
  };

  dibujarEncabezado();

  for (const grupo of grupos) {
    const lineasNombre = pdf._wrapText(
      valorODefecto(grupo.nombre, CFG.nullPlaceholder),
      fontBold,
      FUENTE,
      anchoTexto(colGrupo)
    );
    const bloques = bloquesDe(grupo).map((bloque) => {
      const dias = bloque.dias ? pdf._wrapText(bloque.dias, fontRegular, FUENTE, anchoTexto(colDias)) : [];
      const horas = bloque.horas ? pdf._wrapText(bloque.horas, fontRegular, FUENTE, anchoTexto(colHoras)) : [];
      return { dias, horas, lineas: Math.max(dias.length, horas.length, 1) };
    });
    const lineasBloques = bloques.reduce((suma, bloque) => suma + bloque.lineas, 0);
    const alto = PADDING * 2 + INTERLINEADO * Math.max(lineasNombre.length, lineasBloques);

    if (!cabeBloque({ currentY: pdf._currentY, requerido: alto, floorY })) {
      await pdf._addTemplatePage();
      dibujarEncabezado();
    }
    const page = pdf._currentPage;
    const top = pdf._currentY;
    const base = top - alto;

    page.drawRectangle({ x, y: base, width: ancho, height: alto, borderColor: colorBorde, borderWidth: GROSOR_BORDE });
    for (let col = 1; col < headers.length; col += 1) {
      page.drawLine({
        start: { x: xColumna[col], y: base },
        end: { x: xColumna[col], y: top },
        thickness: GROSOR_BORDE,
        color: colorBorde
      });
    }

    dibujarCasilla(
      page,
      xColumna[colSeleccion] + (anchos[colSeleccion] - LADO_CASILLA) / 2,
      base + (alto - LADO_CASILLA) / 2,
      grupo.seleccionado
    );

    const yLinea = (indice) => top - PADDING - FUENTE - indice * INTERLINEADO;
    // El nombre va centrado verticalmente en la fila (igual que la casilla)
    const margenNombre = (alto - lineasNombre.length * INTERLINEADO) / 2;
    lineasNombre.forEach((linea, i) => {
      page.drawText(linea, {
        x: xColumna[colGrupo] + PADDING,
        y: top - margenNombre - FUENTE - i * INTERLINEADO,
        size: FUENTE,
        font: fontBold,
        color
      });
    });

    // Días y horas de cada bloque salen en la misma línea inicial, uno debajo del otro.
    const dibujarLineas = (lineas, col, primeraLinea) => {
      lineas.forEach((linea, i) => {
        page.drawText(linea, {
          x: xColumna[col] + PADDING,
          y: yLinea(primeraLinea + i),
          size: FUENTE,
          font: fontRegular,
          color
        });
      });
    };
    let indice = 0;
    for (const bloque of bloques) {
      dibujarLineas(bloque.dias, colDias, indice);
      dibujarLineas(bloque.horas, colHoras, indice);
      indice += bloque.lineas;
    }

    pdf._currentY = base;
  }

  pdf._addSpace();
}

export default dibujarGrupos;
