/**
 * PasantiaSeguimientoPdfGenerator (módulo TUT · pasantías)
 *
 * Genera la hoja de seguimiento de una visita de supervisión, replicando el
 * formato REAL del instituto (documento fuente: "hoja de seguimiento de
 * pasantía 2026.docx", FORMULARIO DE SEGUIMIENTO DE PASANTÍA): datos del
 * pasante, detalles de la pasantía (empresa/responsable/fechas), trabajo
 * realizado, principales actividades, nivel de desempeño (checkbox
 * ALTO/MEDIO/BAJO), fortalezas, áreas a mejorar, sugerencias y — al pie —
 * DOS líneas de firma en blanco lado a lado ("Sello y Firma del Docente de
 * INCOS Santa Cruz" / "Sello y Firma de la Empresa"): el documento se
 * imprime y se firma a mano, no hay campo de firma digital en el formulario
 * de captura (`SeguimientoPasantiaDrawer` ya no pide "¿firmado?" — extensión
 * 2026-08-11, pedido explícito del usuario).
 *
 * Patrón PasantiaInformePdfGenerator: extiende IncosPDFLibBase, retorna
 * Buffer. A diferencia de los informes (persisten PDF en uploads), esta hoja
 * se regenera siempre al vuelo — no hay `ruta_archivo` que leer/regenerar en
 * `pasantias_seguimientos` para este documento.
 *
 * @implements {IPasantiaSeguimientoPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import {
  NIVELES_DESEMPENO_PASANTIA_VALUES,
} from '../../../../domain/constants/pasantias.constants.js';

const TITULO = 'FORMULARIO DE SEGUIMIENTO DE PASANTÍA';

/** Relleno de "espacio en blanco" cuando un dato aún no está cargado. */
const BLANCO = '……………………';

/** ISO (YYYY-MM-DD) → DD/MM/YYYY para lectura natural en el documento impreso. */
const formatFechaLegible = (iso) => {
  if (!iso) return null;
  const [y, m, d] = String(iso).split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

export class PasantiaSeguimientoPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IPasantiaSeguimientoPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle(TITULO);
      this._addSpace(6);

      await this._buildDatosPasante(options);
      await this._buildDetallesPasantia(options);
      await this._buildTrabajoRealizado(options);
      await this._buildNivelDesempeno(options);
      await this._buildObservaciones(options);
      await this._buildFirmasPie();

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[PasantiaSeguimientoPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[PasantiaSeguimientoPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * RESPONSABLE DEL SEGUIMIENTO + DATOS DEL PASANTE. `_addSpace()` explícito
   * entre cada campo/sección: el gap final de `_addBoxedField`/
   * `_addBoxedFieldGrid` (`LAYOUT.spacing.line`, 4pt) no deja margen para el
   * ascendente de la fuente del siguiente elemento y el borde del recuadro
   * anterior queda tachando el texto (bug verificado por renderizado; no se
   * toca `IncosPDFLibBase` compartida por otros documentos institucionales).
   * @private
   */
  async _buildDatosPasante(options) {
    const pasantia = options.pasantia || {};
    const seguimiento = options.seguimiento || {};

    await this._addBoxedField('RESPONSABLE DEL SEGUIMIENTO', pasantia.docenteSupervisorNombre || BLANCO);
    this._addSpace();
    await this._addBoxedField('FECHA DEL SEGUIMIENTO', formatFechaLegible(seguimiento.fecha) || BLANCO);
    this._addSpace();

    await this._addSection('DATOS DEL PASANTE');
    await this._addBoxedField('NOMBRE COMPLETO', pasantia.estudianteNombre || BLANCO);
    this._addSpace();
    await this._addBoxedFieldGrid(
      [{ label: 'C.I.', value: pasantia.estudianteCi || BLANCO }],
      [{ label: 'TELÉFONO', value: pasantia.estudianteCelular || BLANCO }]
    );
    this._addSpace();
    await this._addBoxedField('CARRERA / ÁREA DE ESTUDIOS', pasantia.carreraNombre || BLANCO);
    this._addSpace();
  }

  /** DETALLES DE LA PASANTÍA: empresa, dirección, área, responsable, fechas. @private */
  async _buildDetallesPasantia(options) {
    const pasantia = options.pasantia || {};

    await this._addSection('DETALLES DE LA PASANTÍA');
    await this._addBoxedField('EMPRESA / ORGANIZACIÓN', pasantia.empresaNombre || BLANCO);
    this._addSpace();
    await this._addBoxedFieldGrid(
      [{ label: 'DIRECCIÓN', value: pasantia.empresaDireccion || BLANCO }],
      [{ label: 'TELÉFONO', value: pasantia.empresaTelefono || BLANCO }]
    );
    this._addSpace();
    await this._addBoxedFieldGrid(
      [{ label: 'ÁREA O DEPARTAMENTO ASIGNADO', value: pasantia.areaDepartamento || BLANCO }],
      [{ label: 'RESPONSABLE A CARGO DEL PASANTE', value: pasantia.responsableEmpresa || BLANCO }]
    );
    this._addSpace();
    await this._addBoxedFieldGrid(
      [{ label: 'FECHA DE INICIO', value: formatFechaLegible(pasantia.fechaInicio) || BLANCO }],
      [{ label: 'FECHA DE FINALIZACIÓN', value: formatFechaLegible(pasantia.fechaFinalizacion) || 'A la fecha' }]
    );
    this._addSpace();
  }

  /** DESCRIPCIÓN DEL TRABAJO REALIZADO + PRINCIPALES ACTIVIDADES. @private */
  async _buildTrabajoRealizado(options) {
    const seguimiento = options.seguimiento || {};

    await this._addSection('DESCRIPCIÓN DEL TRABAJO REALIZADO DURANTE LA PASANTÍA');
    await this._addParagraph(seguimiento.descripcionTrabajo || BLANCO);
    this._addSpace();

    await this._addSection('PRINCIPALES ACTIVIDADES');
    await this._addParagraph(seguimiento.principalesActividades || BLANCO);
    this._addSpace();
  }

  /**
   * NIVEL DE DESEMPEÑO: tres casillas ALTO/MEDIO/BAJO, marcada la que
   * corresponde al seguimiento (checkbox dibujado, no solo texto — mismo
   * lenguaje visual del formulario físico).
   * @private
   */
  async _buildNivelDesempeno(options) {
    const seguimiento = options.seguimiento || {};
    const seleccionado = seguimiento.nivelDesempeno || null;

    await this._addSection('NIVEL DE DESEMPEÑO');

    const { width: pageWidth } = this._currentPage.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const x0 = margins.left;
    const usableWidth = pageWidth - margins.left - margins.right;
    const colWidth = usableWidth / NIVELES_DESEMPENO_PASANTIA_VALUES.length;
    const boxSize = 10;

    const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
    const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
    const normalFont = await this._pdfDoc.embedFont(normalFontName);
    const boldFont = await this._pdfDoc.embedFont(boldFontName);
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
    const primaryRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);
    const fontSize = IncosPDFBase.FONTS.normal.size + 1;
    const boxY = this._currentY - boxSize;

    NIVELES_DESEMPENO_PASANTIA_VALUES.forEach((nivel, index) => {
      const colX = x0 + index * colWidth;
      const marcado = nivel === seleccionado;

      this._currentPage.drawRectangle({
        x: colX,
        y: boxY,
        width: boxSize,
        height: boxSize,
        borderColor: textRgb,
        borderWidth: 1,
      });
      if (marcado) {
        this._currentPage.drawText('X', {
          x: colX + 2,
          y: boxY + 1,
          size: boxSize,
          font: boldFont,
          color: primaryRgb,
        });
      }
      this._currentPage.drawText(nivel, {
        x: colX + boxSize + 6,
        y: boxY + 2,
        size: fontSize,
        font: marcado ? boldFont : normalFont,
        color: marcado ? primaryRgb : textRgb,
      });
    });

    this._currentY = boxY - IncosPDFBase.LAYOUT.spacing.paragraph;
  }

  /** FORTALEZAS / ÁREAS A MEJORAR / SUGERENCIAS. @private */
  async _buildObservaciones(options) {
    const seguimiento = options.seguimiento || {};

    await this._addSection('FORTALEZAS OBSERVADAS EN EL CUMPLIMIENTO DEL TRABAJO REALIZADO');
    await this._addParagraph(seguimiento.fortalezas || BLANCO);
    this._addSpace();

    await this._addSection('ÁREAS EN QUE DEBE MEJORAR EL PASANTE');
    await this._addParagraph(seguimiento.areasMejorar || BLANCO);
    this._addSpace();

    await this._addSection('SUGERENCIAS PARA FORTALECER EL PROCESO DE PASANTÍAS');
    await this._addParagraph(seguimiento.sugerencias || BLANCO);
  }

  /**
   * Pie con DOS líneas de firma en blanco lado a lado — el formulario se
   * imprime y se firma a mano (docente + empresa); no hay firma digital.
   * `_addSignatureBlock` (base) solo dibuja UNA línea centrada, por eso este
   * documento dibuja el bloque a mano (mismo estilo, dos columnas).
   * @private
   */
  async _buildFirmasPie() {
    const { width: pageWidth } = this._currentPage.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const usableWidth = pageWidth - margins.left - margins.right;
    const lineWidth = 190;
    const leftCenterX = margins.left + usableWidth * 0.25;
    const rightCenterX = margins.left + usableWidth * 0.75;

    const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
    const font = await this._pdfDoc.embedFont(normalFontName);
    const fontSize = IncosPDFBase.FONTS.normal.size;
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    this._addSpace(30);
    const lineY = this._currentY;

    for (const centerX of [leftCenterX, rightCenterX]) {
      this._currentPage.drawLine({
        start: { x: centerX - lineWidth / 2, y: lineY },
        end: { x: centerX + lineWidth / 2, y: lineY },
        thickness: 1,
        color: textRgb,
      });
    }

    const columnas = [
      { etiqueta: 'Sello y Firma del Docente de INCOS Santa Cruz', centerX: leftCenterX },
      { etiqueta: 'Sello y Firma de la Empresa', centerX: rightCenterX },
    ];
    for (const { etiqueta, centerX } of columnas) {
      const lines = this._wrapText(etiqueta, font, fontSize, lineWidth);
      let y = lineY - fontSize - 6;
      for (const line of lines) {
        const w = font.widthOfTextAtSize(line, fontSize);
        this._currentPage.drawText(line, {
          x: centerX - w / 2,
          y,
          size: fontSize,
          font,
          color: textRgb,
        });
        y -= fontSize + 2;
      }
    }
  }
}
