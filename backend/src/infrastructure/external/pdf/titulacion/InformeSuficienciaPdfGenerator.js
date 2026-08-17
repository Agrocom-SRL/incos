/**
 * InformeSuficienciaPdfGenerator (módulo TIT · titulación, extensión 2026-08-17)
 *
 * Genera el INFORME DE SUFICIENCIA DE MODALIDAD DE GRADUACIÓN a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib. Patrón
 * `FormularioModalidadGradoPdfGenerator`/`ViabilidadProyectoPdfGenerator`:
 * extiende IncosPDFLibBase, retorna Buffer. Documento formal del tutor
 * (emitido al transicionar DESARROLLO → SUFICIENCIA, T11): se guarda en
 * uploads y se registra en dictamenes_proyecto (tipo INFORME_SUFICIENCIA).
 *
 * Réplica del documento físico (foto de referencia
 * `WhatsApp Image 2026-08-11 at 21.01.37.jpeg`, ver plan de desarrollo):
 * datos del estudiante (nombres/apellidos, C.I. + expedido, celular),
 * instituto/carrera/modalidad/tema, tutor/a, 3 criterios de texto libre
 * (Aspectos de formato / Contenido del proyecto / Proceso de tutoría) y el
 * veredicto APROBADO/NO APROBADO para la Defensa con casillas dibujadas
 * (marcada la que corresponde al resultado registrado por el tutor).
 *
 * @implements {IInformeSuficienciaPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import { RESULTADOS_DICTAMEN_TUTORIA } from '../../../../domain/constants/titulacion.constants.js';

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export class InformeSuficienciaPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IInformeSuficienciaPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('INFORME DE SUFICIENCIA DE MODALIDAD DE GRADUACIÓN');
      this._addSpace();

      await this._buildDatos(options);
      await this._buildCriterios(options);
      await this._buildVeredicto(options);
      await this._buildFirma(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[InformeSuficienciaPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[InformeSuficienciaPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * NOMBRES / APELLIDOS / C.I. + expedido / celular / INSTITUTO / CARRERA /
   * MODALIDAD DE GRADUACIÓN / NOMBRE-TEMA / TUTOR/A.
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

    await this._addSection('NOMBRE / TEMA DEL PROYECTO');
    await this._addParagraph(proyecto.titulo || '');

    await this._addSection('DOCENTE TUTOR/A');
    await this._addParagraph(options.tutorNombre || '');
    this._addSpace();
  }

  /**
   * Cuerpo: declaración fija del tutor + 3 criterios de texto libre.
   * @private
   */
  async _buildCriterios(options) {
    await this._addParagraph(
      'Como Docente Tutor/a emito el presente informe de suficiencia de acuerdo a los siguientes criterios:'
    );
    this._addSpace();

    await this._addSection('Aspectos de formato');
    await this._addParagraph(options.aspectosFormato || '—');

    await this._addSection('Contenido del proyecto');
    await this._addParagraph(options.contenidoProyecto || '—');

    await this._addSection('Proceso de tutoría');
    await this._addParagraph(options.procesoTutoria || '—');
    this._addSpace();
  }

  /**
   * Cierre: "Por cuanto el/la estudiante ... se encuentra [ ] APROBADO
   * [ ] NO APROBADO para la Defensa de Proyecto de Grado", lugar y fecha.
   * @private
   */
  async _buildVeredicto(options) {
    const est = options.estudiante || {};
    const proyecto = options.proyecto || {};
    const nombreCompleto =
      est.nombreCompleto ||
      [est.apellidoPaterno, est.apellidoMaterno, est.nombres].filter(Boolean).join(' ');
    const aprobado = options.resultadoSuficiencia === RESULTADOS_DICTAMEN_TUTORIA.APROBADO;

    await this._addParagraph(
      `Por cuanto el/la estudiante ${nombreCompleto || '—'} de la Carrera de ${
        proyecto.carreraNombre || '—'
      } se encuentra:`
    );
    await this._drawVeredictoCheckboxes(aprobado);
    this._addSpace();

    await this._addParagraph('para la Defensa de Proyecto de Grado.');
    await this._addParagraph(`Lugar y fecha: ${this._formatLugarFecha(options.fechaEmision)}.`);
    this._addSpace();
  }

  /**
   * Fila con 2 casillas dibujadas (APROBADO / NO APROBADO), marcada con "X"
   * la que corresponde al veredicto del tutor. Patrón de casillas de
   * `DeclaracionJuradaPdfGenerator`, extendido para marcar la seleccionada.
   * @private
   */
  async _drawVeredictoCheckboxes(aprobado) {
    const { margins } = IncosPDFBase.LAYOUT;
    const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
    const boldFont = await this._pdfDoc.embedFont(boldFontName);
    const fontSize = IncosPDFBase.FONTS.normal.size;
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    const boxSize = 11;
    const boxGap = 6;
    const groupGap = 30;

    const y = this._currentY;
    const boxY = y - 1;
    let x = margins.left;

    const drawCasilla = (label, marcada) => {
      this._currentPage.drawRectangle({
        x,
        y: boxY,
        width: boxSize,
        height: boxSize,
        borderColor: textRgb,
        borderWidth: 1,
      });
      if (marcada) {
        this._currentPage.drawText('X', {
          x: x + 2,
          y: boxY + 1.5,
          size: boxSize - 1,
          font: boldFont,
          color: textRgb,
        });
      }
      x += boxSize + boxGap;
      this._currentPage.drawText(label, { x, y, size: fontSize, font: boldFont, color: textRgb });
      x += boldFont.widthOfTextAtSize(label, fontSize) + groupGap;
    };

    drawCasilla('APROBADO', aprobado);
    drawCasilla('NO APROBADO', !aprobado);

    this._currentY = y - fontSize - IncosPDFBase.LAYOUT.spacing.paragraph;
  }

  /** @private "Santa Cruz, {día} de {mes} de {año}" a partir de fechaISO (o de hoy si no llega). */
  _formatLugarFecha(fechaISO) {
    const d = fechaISO ? new Date(`${fechaISO}T00:00:00`) : new Date();
    const mes = MESES_ES[d.getMonth()] ?? '';
    return `Santa Cruz, ${d.getDate()} de ${mes} de ${d.getFullYear()}`;
  }

  /** @private Firma y sello del Docente Tutor/a (una sola firma centrada). */
  async _buildFirma(options) {
    const est = options.estudiante || {};
    await this._addSignatureBlock({
      lines: [
        'Firma y sello Docente Tutor/a',
        options.tutorNombre || '',
        est.ci ? `Estudiante: ${est.nombreCompleto ?? ''}` : '',
      ],
    });
  }
}
