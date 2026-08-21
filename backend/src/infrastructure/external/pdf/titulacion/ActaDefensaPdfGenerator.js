/**
 * ActaDefensaPdfGenerator (módulo TIT · titulación, extensión 2026-08-01,
 * rediseñado 2026-08-19 para replicar 1:1 el documento físico real — ver
 * memoria de proyecto "PDFs oficiales: fidelidad a plantilla física" y la
 * foto de referencia entregada por el usuario)
 *
 * Genera el ACTA DE DEFENSA DE GRADO MODALIDAD DE GRADUACIÓN. Igual que
 * `FormularioModalidadGradoPdfGenerator`, NO usa la plantilla corporativa
 * moderna `Plantilla.pdf` (franja verde + pie de redes sociales): el físico
 * real es hoja blanca con el membrete clásico del Ministerio (folio rojo
 * arriba a la derecha + escudo Ministerio + logo INCOS), construido con
 * `_addOfficialLogosHeader` (IncosPDFLibBase). Extiende IncosPDFLibBase,
 * retorna Buffer (documento "export" — el acta ya está persistida en
 * `actas_defensa`, el PDF es reproducible; NO escribe en uploads ni en
 * `dictamenes_proyecto`).
 *
 * Espejo de §1 del plan de desarrollo
 * (docs/plan/acta-defensa-grado-plan-desarrollo.md): foliado rojo esquina
 * superior derecha, título de 2 líneas, cabecera institucional en texto
 * simple (SIN cuadros — el físico no dibuja bordes ahí, a diferencia del
 * FMDG-1), párrafo de apertura con nombre/modalidad en negrita, título del
 * proyecto entre comillas centrado, lista numerada del tribunal, párrafo fijo
 * de desarrollo del acto, resolución con calificación en número y letras,
 * hora de conclusión y 4 firmas (3 tribunal + postulante).
 *
 * Identidad institucional propia (INSTITUTO/CARÁCTER/CIUDAD/DEPARTAMENTO):
 * constantes locales, mismo patrón que `FormularioModalidadGradoPdfGenerator`
 * (que hardcodea "INSTITUTO TÉCNICO INCOS SANTA CRUZ"). La tabla
 * `instituciones` NO aplica aquí: es el catálogo de instituciones DE ORIGEN
 * de traspasos/transitabilidad (UETHP/CEA/otros ITT), no la identidad propia
 * de INCOS — ver hallazgo en el resumen de la Iteración 1.
 *
 * @implements {IActaDefensaPdfGenerator}
 */

import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import { numberToWords, fechaEnLetras } from '../numberToWords.js';
import { RESULTADOS_ACTA_DEFENSA } from '../../../../domain/constants/titulacion.constants.js';

/** Tamaño de página oficio, igual al resto de plantillas institucionales. */
const PAGE_SIZE = [612.12, 935.58];

/** Identidad institucional propia del acta (cabecera §1.4). */
const INSTITUTO = {
  nombre: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
  caracter: 'FISCAL',
  ciudad: 'SANTA CRUZ DE LA SIERRA',
  departamento: 'SANTA CRUZ',
};

/** Rojo del foliado del talonario físico (esquina superior derecha). */
const COLOR_FOLIO_ROJO = '#c00000';

/** "HH:MM:SS" (Sequelize TIME) → "HH:MM". */
function formatHora(hora) {
  if (!hora) return '';
  return String(hora).slice(0, 5);
}

export class ActaDefensaPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options
   * @param {Object} options.acta - Presentación de ActaDefensaMapper.toDetail (con `tribunal`)
   * @param {Object} options.estudiante - { nombreCompleto, ci, expedicion }
   * @param {Object} options.proyecto - { titulo, carreraNombre, modalidadNombre, gestionAnio }
   * @param {string} options.nivel - "TÉCNICO SUPERIOR" | "TÉCNICO MEDIO" | título tal cual
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.addPage(PAGE_SIZE);
      this._initializeDocumentState(pdfDoc, page, false);

      await this._addOfficialLogosHeader();
      await this._drawFolioRojo(options.acta?.numeroActaFormateado);

      await this._addOfficialDocumentTitle([
        'ACTA DE DEFENSA DE GRADO MODALIDAD DE GRADUACIÓN:',
        (options.proyecto?.modalidadNombre ?? '').toUpperCase(),
      ]);
      this._addSpace();

      await this._buildCabecera(options);
      await this._buildParrafoApertura(options);
      await this._buildTituloProyecto(options.proyecto?.titulo);
      await this._buildTribunal(options.acta?.tribunal);
      await this._buildParrafoDesarrollo();
      await this._buildResolucion(options.acta);
      await this._buildCierre(options.acta);
      await this._buildFirmas(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[ActaDefensaPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[ActaDefensaPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Número rojo (ej. "012") en la esquina superior derecha (foliado del
   * talonario) — POR ENCIMA de los logos (fiel al físico: el folio está a la
   * altura del borde superior de la hoja, no del bloque de membrete).
   * @private
   */
  async _drawFolioRojo(numeroActaFormateado) {
    if (!numeroActaFormateado) return;
    const { width: pageWidth, height: pageHeight } = this._currentPage.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const fontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
    const font = await this._pdfDoc.embedFont(fontName);
    const fontSize = IncosPDFLibBase.OFICIO_FONTS.title;
    const rojo = this._hexToRgb(COLOR_FOLIO_ROJO);
    const y = pageHeight - margins.top / 2;
    const width = font.widthOfTextAtSize(numeroActaFormateado, fontSize);
    this._currentPage.drawText(numeroActaFormateado, {
      x: pageWidth - margins.right - width,
      y,
      size: fontSize,
      font,
      color: rojo,
    });
  }

  /**
   * Cabecera institucional en texto simple, 2 columnas × 3 filas (§1.4) —
   * fiel al físico: SIN cuadros con borde (a diferencia del FMDG-1).
   * @private
   */
  async _buildCabecera(options) {
    await this._addLabelValueGrid(
      [
        { label: 'INSTITUTO: ', value: INSTITUTO.nombre },
        { label: 'CARÁCTER: ', value: INSTITUTO.caracter },
        { label: 'CARRERA: ', value: options.proyecto?.carreraNombre ?? '' },
        { label: 'NIVEL: ', value: options.nivel ?? '' },
        { label: 'CIUDAD/LOCALIDAD: ', value: INSTITUTO.ciudad },
        { label: 'DEPARTAMENTO: ', value: INSTITUTO.departamento },
      ],
      2,
      { fontSize: IncosPDFLibBase.OFICIO_FONTS.normal },
    );
    this._addSpace();
  }

  /** @private Párrafo de apertura (§1.5): nombre del estudiante y modalidad en negrita. */
  async _buildParrafoApertura(options) {
    const acta = options.acta ?? {};
    const estudiante = options.estudiante ?? {};
    const proyecto = options.proyecto ?? {};
    const horaInicio = formatHora(acta.horaInicio);
    const fechaLetras = fechaEnLetras(acta.fechaDefensa);
    const ci = estudiante.ci
      ? `${estudiante.ci}${estudiante.expedicion ? ` ${estudiante.expedicion}` : ''}`
      : '';

    await this._addMixedParagraph([
      {
        text: `En el departamento de ${INSTITUTO.departamento} en fecha ${fechaLetras} a horas ${horaInicio} y en aplicación a lo dispuesto en la normativa vigente, el estudiante: `,
      },
      { text: (estudiante.nombreCompleto ?? '').toUpperCase(), bold: true },
      { text: ` con C.I. ${ci}, procedió a la defensa ` },
      { text: proyecto.modalidadNombre ?? '', bold: true },
      { text: ' titulado:' },
    ]);
  }

  /** @private Título del proyecto entre comillas, centrado, negrita, mayúsculas (§1.6). */
  async _buildTituloProyecto(titulo) {
    const texto = `"${String(titulo ?? '').toUpperCase()}"`;
    await this._addCenteredBoldParagraph(texto);
    this._addSpace();
  }

  /** @private Lista numerada del Tribunal Evaluador (§1.7). */
  async _buildTribunal(tribunal) {
    await this._addParagraph(
      'Asistiendo en calidad de miembros del Tribunal Evaluador los siguientes profesionales del área de formación:',
      { fontSize: IncosPDFLibBase.OFICIO_FONTS.normal },
    );
    const miembros = Array.isArray(tribunal) ? tribunal : [];
    for (let i = 0; i < miembros.length; i += 1) {
      const miembro = miembros[i];
      // eslint-disable-next-line no-await-in-loop
      await this._addTribunalRow(i + 1, miembro?.nombreCompleto ?? '', miembro?.cargo);
    }
    this._addSpace();
  }

  /** @private Fila "N.- {nombre}" con el cargo alineado a la derecha. */
  async _addTribunalRow(numero, nombre, cargo) {
    const { width: pageWidth } = this._currentPage.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const fontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
    const font = await this._pdfDoc.embedFont(fontName);
    const fontSize = IncosPDFLibBase.OFICIO_FONTS.normal;
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    const izquierda = `${numero}.- ${nombre}`;
    const derecha = `(${cargo || 'Tribunal Evaluador'})`;
    const y = this._currentY;

    this._currentPage.drawText(izquierda, {
      x: margins.left,
      y,
      size: fontSize,
      font,
      color: textRgb,
    });
    const derechaWidth = font.widthOfTextAtSize(derecha, fontSize);
    this._currentPage.drawText(derecha, {
      x: pageWidth - margins.right - derechaWidth,
      y,
      size: fontSize,
      font,
      color: textRgb,
    });

    this._currentY -= fontSize + IncosPDFBase.LAYOUT.spacing.line;
  }

  /** @private Párrafo fijo de desarrollo del acto (§1.8). */
  async _buildParrafoDesarrollo() {
    await this._addParagraph(
      'Instalado el acto académico, el Tribunal Evaluador procedió a la evaluación de la ' +
        'defensa oral del proyecto, tras lo cual se decretó un cuarto intermedio para la ' +
        'deliberación reservada del Tribunal. Reinstalado el acto en presencia del postulante, ' +
        'el Tribunal Evaluador resolvió:',
      { fontSize: IncosPDFLibBase.OFICIO_FONTS.normal },
    );
  }

  /** @private Resolución con calificación en número y letras (§1.9). */
  async _buildResolucion(acta) {
    const nota = acta?.calificacionFinal ?? 0;
    const notaEntera = Math.round(Number(nota));
    const notaEnLetras = numberToWords(notaEntera).toUpperCase();
    const resultadoTexto =
      acta?.resultado === RESULTADOS_ACTA_DEFENSA.APRUEBA ? 'APRUEBA' : 'REPRUEBA';

    await this._addMixedParagraph([
      { text: 'OTORGAR LA CALIFICACIÓN FINAL DE ' },
      { text: `${notaEntera} (${notaEnLetras})`, bold: true },
      { text: ' PUNTOS, A FAVOR DEL ESTUDIANTE, CON LO QUE ' },
      { text: `(${resultadoTexto})`, bold: true },
      { text: ' LA MODALIDAD DE GRADUACIÓN EFECTUADA.' },
    ]);
  }

  /** @private Cierre del acto (§1.10). */
  async _buildCierre(acta) {
    const horaConclusion = formatHora(acta?.horaConclusion);
    const fontOpts = { fontSize: IncosPDFLibBase.OFICIO_FONTS.normal };
    await this._addParagraph(
      `El presente acto académico concluyó a horas: ${horaConclusion || '____'}.`,
      fontOpts,
    );
    await this._addParagraph('En señal de conformidad firman al pie del presente.', fontOpts);
  }

  /**
   * @private 4 firmas en 2 columnas × 2 filas (§1.11): fila 1 = tribunal[0]/[1],
   * fila 2 = tribunal[2]/POSTULANTE. Réplica del patrón de 2 columnas de
   * `FormularioModalidadGradoPdfGenerator._buildFirmas` (`_addSignatureBlock`
   * de la base solo soporta UNA firma centrada), extendido a 2×2.
   */
  async _buildFirmas(options) {
    const { width: pageWidth } = this._currentPage.getSize();
    const cfg = IncosPDFBase.LAYOUT;
    const { margins } = cfg;
    const lineWidth = (cfg.signatureLineWidth ?? 150) * 0.8;
    const lineThickness = cfg.signatureLineThickness ?? 1;
    // Sin Plantilla.pdf (hoja blanca, membrete propio vía
    // `_addOfficialLogosHeader`): no hay franja de pie pre-impresa que evitar.
    const templateFooterHeight = 0;
    const spaceLineToFirst = cfg.signatureSpacingLineToFirstText ?? 8;
    const spaceBetweenLines = cfg.signatureSpacingBetweenTextLines ?? 4;

    const fontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
    const font = await this._pdfDoc.embedFont(fontName);
    const fontSize = IncosPDFLibBase.OFICIO_FONTS.normal;
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    const tribunal = Array.isArray(options.acta?.tribunal) ? options.acta.tribunal : [];
    const postulante = options.estudiante?.nombreCompleto ?? 'POSTULANTE';

    const celdas = [
      [tribunal[0]?.nombreCompleto ?? '', '(Tribunal Evaluador)'],
      [tribunal[1]?.nombreCompleto ?? '', '(Tribunal Evaluador)'],
      [tribunal[2]?.nombreCompleto ?? '', '(Tribunal Evaluador)'],
      [postulante, '(Postulante)'],
    ];

    const totalWidth = pageWidth - margins.left - margins.right;
    const colWidth = totalWidth / 2;
    const colX = [margins.left, margins.left + colWidth];
    const filaAltura = lineThickness + spaceLineToFirst + 2 * fontSize + spaceBetweenLines;

    // Fila inferior primero (más cerca del pie) para calcular Y hacia arriba.
    // templateFooterHeight: altura de la franja verde/contacto pre-impresa de
    // Plantilla.pdf — sin sumarla, las firmas se dibujan encima del pie de
    // página (mismo cómputo que FormularioModalidadGradoPdfGenerator._buildFirmas).
    const yFilaInferior =
      margins.bottom + templateFooterHeight + (cfg.signatureFooterPadding ?? 10) + filaAltura;
    const yFilaSuperior = yFilaInferior + filaAltura + (cfg.spacing.section ?? 16);

    const filas = [
      { y: yFilaSuperior, celdas: [celdas[0], celdas[1]] },
      { y: yFilaInferior, celdas: [celdas[2], celdas[3]] },
    ];

    for (const fila of filas) {
      for (let col = 0; col < 2; col += 1) {
        const centerX = colX[col] + colWidth / 2;
        const halfLine = lineWidth / 2;
        this._currentPage.drawLine({
          start: { x: centerX - halfLine, y: fila.y },
          end: { x: centerX + halfLine, y: fila.y },
          thickness: lineThickness,
          color: textRgb,
        });
        const lines = fila.celdas[col];
        let textY = fila.y - lineThickness - spaceLineToFirst;
        for (let i = 0; i < lines.length; i += 1) {
          const str = String(lines[i] ?? '').trim();
          if (str) {
            const w = font.widthOfTextAtSize(str, fontSize);
            this._currentPage.drawText(str, {
              x: centerX - w / 2,
              y: textY,
              size: fontSize,
              font,
              color: textRgb,
            });
          }
          textY -= fontSize + (i < lines.length - 1 ? spaceBetweenLines : 0);
        }
      }
    }
  }

  /**
   * @private Párrafo con segmentos en negrita opcional, envuelto por ancho
   * disponible palabra a palabra (mezcla fuente normal/bold por palabra).
   * @param {Array<{text:string, bold?:boolean}>} segments
   */
  async _addMixedParagraph(segments) {
    const { width: pageWidth } = this._currentPage.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const maxWidth = pageWidth - margins.left - margins.right;
    const fontSize = IncosPDFLibBase.OFICIO_FONTS.normal;
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
    const normalFont = await this._pdfDoc.embedFont(
      this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font)
    );
    const boldFont = await this._pdfDoc.embedFont(
      this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font)
    );

    // Tokeniza a nivel de palabra conservando el estilo (bold) de su segmento.
    const words = [];
    for (const seg of segments) {
      const tokens = String(seg.text ?? '').split(/(\s+)/).filter((t) => t !== '');
      for (const token of tokens) {
        words.push({ token, bold: Boolean(seg.bold) });
      }
    }

    // Arma líneas respetando maxWidth.
    const lines = [[]];
    let lineWidth = 0;
    for (const word of words) {
      const font = word.bold ? boldFont : normalFont;
      const w = font.widthOfTextAtSize(word.token, fontSize);
      const esEspacio = word.token.trim() === '';
      if (esEspacio) {
        // Espacio: solo se agrega si no inicia línea.
        if (lines[lines.length - 1].length > 0) {
          lines[lines.length - 1].push(word);
          lineWidth += w;
        }
      } else {
        if (lineWidth + w > maxWidth && lines[lines.length - 1].length > 0) {
          lines.push([]);
          lineWidth = 0;
        }
        lines[lines.length - 1].push(word);
        lineWidth += w;
      }
    }

    let y = this._currentY;
    for (const line of lines) {
      let x = margins.left;
      for (const word of line) {
        const font = word.bold ? boldFont : normalFont;
        if (word.token.trim() !== '') {
          this._currentPage.drawText(word.token, { x, y, size: fontSize, font, color: textRgb });
        }
        x += font.widthOfTextAtSize(word.token, fontSize);
      }
      y -= fontSize + IncosPDFBase.LAYOUT.spacing.line;
    }
    this._currentY = y - IncosPDFBase.LAYOUT.spacing.paragraph;
  }

  /** @private Párrafo centrado en negrita (título del proyecto entre comillas). */
  async _addCenteredBoldParagraph(text) {
    const { width: pageWidth } = this._currentPage.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const maxWidth = pageWidth - margins.left - margins.right;
    const fontSize = IncosPDFLibBase.OFICIO_FONTS.normal + 1;
    const font = await this._pdfDoc.embedFont(
      this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font)
    );
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    const lines = this._wrapText(text, font, fontSize, maxWidth);
    let y = this._currentY;
    for (const line of lines) {
      const w = font.widthOfTextAtSize(line, fontSize);
      this._currentPage.drawText(line, {
        x: (pageWidth - w) / 2,
        y,
        size: fontSize,
        font,
        color: textRgb,
      });
      y -= fontSize + IncosPDFBase.LAYOUT.spacing.line;
    }
    this._currentY = y - IncosPDFBase.LAYOUT.spacing.paragraph;
  }
}
