/**
 * FormularioModalidadGradoPdfGenerator (módulo TIT · titulación, Requisito 1
 * — extensión 2026-07-31)
 *
 * Genera el FORMULARIO DE MODALIDAD DE GRADUACIÓN (FMDG-1) a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib. Patrón
 * DesignacionTutorPdfGenerator: extiende IncosPDFLibBase, retorna Buffer (no
 * se guarda en uploads ni se registra en dictamenes_proyecto — documento
 * "export", ver §0.4 del plan de desarrollo).
 *
 * @implements {IFormularioModalidadGradoPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';

export class FormularioModalidadGradoPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IFormularioModalidadGradoPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('FORMULARIO DE MODALIDAD DE GRADUACIÓN (FMDG-1)');
      if (options.proyecto?.gestionAnio) {
        await this._addSubtitle(`GESTIÓN ${options.proyecto.gestionAnio}`);
      }
      this._addSpace();

      await this._buildDatosDeclarante(options);
      await this._buildDatosProyecto(options);
      await this._buildDeclaracion();
      await this._buildFirmas(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[FormularioModalidadGradoPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[FormularioModalidadGradoPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /** @private */
  async _buildDatosDeclarante(options) {
    const est = options.estudiante || {};
    await this._addSection('DATOS DEL DECLARANTE');
    await this._addBoxedFieldGrid(
      [
        { label: 'Nombres:', value: est.nombres || '' },
        { label: 'Apellido paterno:', value: est.apellidoPaterno || '' },
        { label: 'Apellido materno:', value: est.apellidoMaterno || '' },
      ],
      [
        {
          label: 'Cédula de identidad:',
          value: this._formatCi(est.ci, est.expedicion),
        },
        { label: 'Nº de celular:', value: est.celular || '' },
        { label: 'Instituto:', value: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ' },
      ],
      45,
      95,
      110
    );
    this._addSpace();
  }

  /** @private */
  async _buildDatosProyecto(options) {
    const proyecto = options.proyecto || {};
    await this._addSection('MODALIDAD DE GRADUACIÓN');
    await this._addBoxedFieldGrid(
      [
        { label: 'Carrera:', value: proyecto.carreraNombre || '' },
        { label: 'Modalidad de graduación:', value: proyecto.modalidadNombre || '' },
      ],
      [],
      100
    );
    this._addSpace();

    await this._addSection('NOMBRE / TEMA');
    await this._addParagraph(proyecto.titulo || '');

    if (proyecto.objetivos) {
      await this._addSection('OBJETIVOS');
      await this._addParagraph(proyecto.objetivos);
    }
    this._addSpace();
  }

  /** @private */
  async _buildDeclaracion() {
    await this._addParagraph(
      'Declaro que tengo definido el tema de mi proyecto de grado bajo la modalidad de ' +
        'graduación señalada, comprometiéndome a su desarrollo conforme al reglamento ' +
        'institucional vigente.'
    );
    this._addSpace();
  }

  /** @private */
  _formatCi(ci, expedicion) {
    if (!ci) return '';
    return expedicion ? `${ci} ${expedicion}` : String(ci);
  }

  /**
   * Bloque de firmas en 2 columnas: "Firma de la o el declarante" (izquierda)
   * y "DIRECCIÓN ACADÉMICA" (derecha). `_addSignatureBlock` de la base
   * siempre centra una única firma en pageWidth/2 a una Y fija junto al
   * margen inferior — llamarlo dos veces solaparía ambos bloques, por eso se
   * replica aquí el patrón de 2 columnas de `FormularioInscripcionPdfGenerator`
   * (`_addSignatureBlockTwoColumns`), adaptado a declarante/institución.
   * @private
   */
  async _buildFirmas(options) {
    const est = options.estudiante || {};
    const { width: pageWidth } = this._currentPage.getSize();
    const cfg = IncosPDFBase.LAYOUT;
    const { margins } = cfg;
    const lineWidth = cfg.signatureLineWidth ?? 150;
    const lineThickness = cfg.signatureLineThickness ?? 1;
    const footerPadding = cfg.signatureFooterPadding ?? 10;
    const templateFooterHeight = cfg.signatureTemplateFooterHeight ?? 0;
    const spaceLineToFirst = cfg.signatureSpacingLineToFirstText ?? 8;
    const spaceBetweenLines = cfg.signatureSpacingBetweenTextLines ?? 4;

    const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
    const font = await this._pdfDoc.embedFont(normalFontName);
    const fontSize = IncosPDFBase.FONTS.normal.size;
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    const totalWidth = pageWidth - margins.left - margins.right;
    const colWidth = totalWidth / 2;
    const leftColX = margins.left;
    const rightColX = margins.left + colWidth;

    const leftLines = [
      'Firma de la o el declarante',
      est.nombreCompleto || '',
      est.ci ? `C.I. ${this._formatCi(est.ci, est.expedicion)}` : '',
    ];
    const rightLines = ['DIRECCIÓN ACADÉMICA', 'Instituto INCOS'];

    const maxLines = Math.max(leftLines.length, rightLines.length);
    const blockHeight =
      lineThickness +
      spaceLineToFirst +
      maxLines * fontSize +
      Math.max(0, maxLines - 1) * spaceBetweenLines;
    const blockBottomY = margins.bottom + templateFooterHeight + footerPadding;
    const lineY = blockBottomY + blockHeight - lineThickness;
    const halfLine = lineWidth / 2;

    const leftLineCenterX = leftColX + colWidth / 2;
    const rightLineCenterX = rightColX + colWidth / 2;

    this._currentPage.drawLine({
      start: { x: leftLineCenterX - halfLine, y: lineY },
      end: { x: leftLineCenterX + halfLine, y: lineY },
      thickness: lineThickness,
      color: textRgb,
    });
    this._currentPage.drawLine({
      start: { x: rightLineCenterX - halfLine, y: lineY },
      end: { x: rightLineCenterX + halfLine, y: lineY },
      thickness: lineThickness,
      color: textRgb,
    });

    const drawCfg = {
      lineY,
      lineThickness,
      spaceLineToFirst,
      spaceBetweenLines,
      font,
      fontSize,
      textRgb,
    };
    this._drawSignatureColumnLines(leftLines, leftLineCenterX, drawCfg);
    this._drawSignatureColumnLines(rightLines, rightLineCenterX, drawCfg);
  }

  /** @private */
  _drawSignatureColumnLines(lines, centerX, cfg) {
    const { lineY, lineThickness, spaceLineToFirst, spaceBetweenLines, font, fontSize, textRgb } =
      cfg;
    let textY = lineY - lineThickness - spaceLineToFirst;
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
