/**
 * FormularioModalidadGradoPdfGenerator (módulo TIT · titulación, Requisito 1
 * — extensión 2026-07-31, alineado 2026-08-10 al documento físico real
 * "FORMULARIO DE MODALIDAD DE GRADUACION (FMDG-1)" — Resolución Ministerial
 * 426/2016)
 *
 * Genera el FMDG-1 a partir de la plantilla institucional (Plantilla.pdf,
 * ya trae ambos logos — Ministerio de Educación + INCOS — y el pie
 * institucional) con pdf-lib. Patrón DesignacionTutorPdfGenerator: extiende
 * IncosPDFLibBase, retorna Buffer (no se guarda en uploads ni se registra en
 * dictamenes_proyecto — documento "export", ver §0.4 del plan de desarrollo).
 *
 * Campos y texto de declaración replican 1:1 el documento físico: NOMBRES /
 * APELLIDOS (2 campos, no 3) / CÉDULA DE IDENTIDAD (Nº + expedido) / Nº DE
 * CELULAR / INSTITUTO / CARRERA / MODALIDAD DE GRADUACIÓN / NOMBRE-TEMA /
 * OBJETIVOS (texto libre, el declarante ya distingue "Objetivo General" de
 * "Objetivos Específicos" dentro del mismo campo — separados por línea en
 * blanco, cada bloque se imprime como párrafo propio) + declaración fija +
 * "Lugar y fecha" + nota al pie.
 *
 * @implements {IFormularioModalidadGradoPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

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
      this._addSpace();

      await this._buildDatos(options);
      await this._buildDeclaracion(options);
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

  /**
   * NOMBRES / APELLIDOS / CÉDULA DE IDENTIDAD (Nº + expedido + celular) /
   * INSTITUTO / CARRERA / MODALIDAD DE GRADUACIÓN / NOMBRE-TEMA / OBJETIVOS.
   * @private
   */
  async _buildDatos(options) {
    const est = options.estudiante || {};
    const proyecto = options.proyecto || {};
    const apellidos = [est.apellidoPaterno, est.apellidoMaterno].filter(Boolean).join(' ');

    await this._addBoxedFieldGrid(
      [
        { label: 'Nombres:', value: est.nombres || '' },
        { label: 'Apellidos:', value: apellidos },
      ],
      [],
      100,
      90
    );

    await this._addBoxedFieldGrid(
      [
        { label: 'C.I. Nº:', value: est.ci || '' },
        { label: 'Expedido en:', value: est.expedicion || '' },
      ],
      [{ label: 'Nº de celular:', value: est.celular || '' }],
      55,
      90,
      110
    );

    await this._addBoxedFieldGrid(
      [
        { label: 'Instituto:', value: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ' },
        { label: 'Carrera:', value: proyecto.carreraNombre || '' },
        { label: 'Modalidad de graduación:', value: proyecto.modalidadNombre || '' },
      ],
      [],
      100,
      150
    );
    this._addSpace();

    await this._addSection('NOMBRE / TEMA');
    await this._addParagraph(proyecto.titulo || '');

    await this._addSection('OBJETIVOS');
    await this._addMultiParagraph(proyecto.objetivos);
    this._addSpace();
  }

  /**
   * Imprime texto libre respetando párrafos separados por línea en blanco
   * (p.ej. "Objetivo General:" / "Objetivos Específicos:") — `_addParagraph`
   * por sí solo colapsa TODO salto de línea a un espacio.
   * @private
   */
  async _addMultiParagraph(text) {
    const str = String(text ?? '').trim();
    if (!str) return;
    const paragraphs = str
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const paragraph of paragraphs) {
      await this._addParagraph(paragraph);
    }
  }

  /**
   * Declaración fija (idéntica al documento físico) + "Yo [nombre], con C.I.
   * [ci], declaro..." + Lugar y fecha (autogenerada, no manuscrita).
   * @private
   */
  async _buildDeclaracion(options) {
    const est = options.estudiante || {};
    await this._addParagraph(
      '1. A la fecha declaro que tengo definido el tema de la modalidad de graduación, ' +
        'por lo cual solicito proseguir como corresponda.'
    );
    await this._addParagraph(
      '2. De existir algún impedimento para continuar con el proceso de modalidad de ' +
        'graduación se solicita se notifique para tomar las acciones correctivas.'
    );
    this._addSpace();

    const nombreCompleto =
      est.nombreCompleto || [est.apellidoPaterno, est.apellidoMaterno, est.nombres].filter(Boolean).join(' ');
    await this._addParagraph(
      `Yo ${nombreCompleto || '—'}, con C.I. ${est.ci || '—'}, declaro que todos los datos ` +
        'consignados en el presente formulario son verídicos.'
    );
    await this._addParagraph(`Lugar y fecha: ${this._formatLugarFecha()}.`);
    this._addSpace();

    await this._addParagraph(
      'NOTA: El contenido de la presente declaración es de exclusiva responsabilidad del declarante.',
      { fontSize: IncosPDFBase.FONTS.small.size }
    );
    this._addSpace();
  }

  /** @private */
  _formatLugarFecha() {
    const ahora = new Date();
    const mes = MESES_ES[ahora.getMonth()] ?? '';
    return `Santa Cruz, ${ahora.getDate()} de ${mes} de ${ahora.getFullYear()}`;
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
