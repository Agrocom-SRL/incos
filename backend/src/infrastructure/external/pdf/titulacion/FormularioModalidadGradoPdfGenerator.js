/**
 * FormularioModalidadGradoPdfGenerator (módulo TIT · titulación, Requisito 1
 * — extensión 2026-07-31, rediseñado 2026-08-19 para replicar 1:1 el
 * documento físico real "FORMULARIO DE MODALIDAD DE GRADUACION (FMDG-1)" —
 * Resolución Ministerial 426/2016, ver memoria de proyecto "PDFs oficiales:
 * fidelidad a plantilla física" y el .docx de referencia entregado por el
 * usuario)
 *
 * A diferencia del resto de PDFs de titulación, este documento NO usa la
 * plantilla corporativa moderna `Plantilla.pdf` (franja verde + pie de redes
 * sociales) porque el físico real no la lleva: es un formulario oficial en
 * hoja blanca con el membrete clásico (escudo del Ministerio de Educación +
 * logo INCOS), construido desde cero con `_addOfficialLogosHeader` +
 * `_addIdentificationTable` (IncosPDFLibBase). Extiende IncosPDFLibBase,
 * retorna Buffer (no se guarda en uploads ni se registra en
 * dictamenes_proyecto — documento "export", ver §0.4 del plan de desarrollo).
 *
 * Campos y texto de declaración replican 1:1 el documento físico: NOMBRES /
 * APELLIDOS (2 campos, no 3) / CÉDULA DE IDENTIDAD (Nº + expedido + Nº de
 * celular, las 3 en la misma fila) / INSTITUTO / CARRERA / MODALIDAD DE
 * GRADUACIÓN / NOMBRE-TEMA / OBJETIVOS (texto libre, el declarante ya
 * distingue "Objetivo General" de "Objetivos Específicos" dentro del mismo
 * campo — separados por línea en blanco, cada bloque se imprime como
 * párrafo propio) + declaración fija + firma ÚNICA del declarante (el
 * físico NO lleva una segunda firma de "Dirección Académica") + "Lugar y
 * fecha" (va DESPUÉS de la firma, no antes) + nota al pie.
 *
 * @implements {IFormularioModalidadGradoPdfGenerator}
 */

import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Tamaño de página oficio, igual al resto de plantillas institucionales. */
const PAGE_SIZE = [612.12, 935.58];

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
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.addPage(PAGE_SIZE);
      this._initializeDocumentState(pdfDoc, page, false);

      await this._addOfficialLogosHeader();
      await this._addOfficialDocumentTitle('FORMULARIO DE MODALIDAD DE GRADUACION (FMDG-1)');
      this._addSpace();

      await this._buildDatos(options);
      await this._buildDeclaracion(options);
      await this._buildFirmaYFecha(options);

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
   * Tabla de identificación fiel al físico: NOMBRES / APELLIDOS / CÉDULA DE
   * IDENTIDAD (Nº + EXPEDIDO + Nº DE CELULAR en la misma fila) / INSTITUTO /
   * CARRERA / MODALIDAD DE GRADUACIÓN / NOMBRE/TEMA / OBJETIVOS.
   * @private
   */
  async _buildDatos(options) {
    const est = options.estudiante || {};
    const proyecto = options.proyecto || {};
    const apellidos = [est.apellidoPaterno, est.apellidoMaterno].filter(Boolean).join(' ');

    await this._addIdentificationTable([
      { label: 'Nombres', value: est.nombres || '' },
      { label: 'Apellidos', value: apellidos },
      {
        label: 'Cédula de identidad',
        subFields: [
          { label: 'Nº', value: est.ci || '' },
          { label: 'Expedido', value: est.expedicion || '' },
          { label: 'Nº de celular', value: est.celular || '' },
        ],
      },
      { label: 'Instituto', value: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ' },
      { label: 'Carrera', value: proyecto.carreraNombre || '' },
      { label: 'Modalidad de graduación', value: proyecto.modalidadNombre || '' },
      { label: 'Nombre / Tema', value: proyecto.titulo || '' },
      { label: 'Objetivos', value: this._flattenObjetivos(proyecto.objetivos), minHeight: 160 },
    ]);
    this._addSpace();
  }

  /**
   * La celda de OBJETIVOS del físico es texto corrido (con saltos de línea
   * en blanco entre "Objetivo General" y "Objetivos Específicos"); la tabla
   * de identificación solo hace wrap por ancho, así que aquí se preservan
   * los saltos de párrafo como línea en blanco real dentro del mismo string.
   * @private
   */
  _flattenObjetivos(text) {
    const str = String(text ?? '').trim();
    if (!str) return '';
    return str
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .join('\n\n');
  }

  /**
   * Declaración fija (idéntica al documento físico) + "Yo [nombre], con C.I.
   * [ci], declaro...". "Lugar y fecha" NO va aquí: en el físico aparece
   * DESPUÉS de la firma (ver `_buildFirmaYFecha`).
   * @private
   */
  async _buildDeclaracion(options) {
    const est = options.estudiante || {};
    const fontOpts = { fontSize: IncosPDFLibBase.OFICIO_FONTS.normal };
    await this._addParagraph(
      '1. A la fecha declaro que tengo definido el tema de la modalidad de graduación, '
        + 'por lo cual solicito proseguir como corresponda.',
      fontOpts,
    );
    await this._addParagraph(
      '2. De existir algún impedimento para continuar con el proceso de modalidad de '
        + 'graduación se solicita se notifique para tomar las acciones correctivas.',
      fontOpts,
    );
    this._addSpace();

    const nombreCompleto = est.nombreCompleto
      || [est.apellidoPaterno, est.apellidoMaterno, est.nombres].filter(Boolean).join(' ');
    await this._addParagraph(
      `Yo ${nombreCompleto || '—'}, con C.I. ${est.ci || '—'}, declaro que todos los datos `
        + 'consignados en el presente formulario son verídicos.',
      fontOpts,
    );
    this._addSpace();
  }

  /**
   * Firma ÚNICA del declarante (el físico NO lleva una segunda firma de
   * "Dirección Académica") + "Lugar y fecha" DEBAJO de la firma + nota al
   * pie — mismo orden que el documento físico. Dibujado en el flujo normal
   * (`_currentY`), no anclado al pie de página: en el físico el bloque
   * queda a media hoja, con espacio en blanco debajo.
   * @private
   */
  async _buildFirmaYFecha() {
    await this._addSignatureBlockInFlow(['Firma de la o el declarante']);

    this._addSpace();
    await this._addParagraph(
      `Lugar y fecha: ${this._formatLugarFecha()}.`,
      { fontSize: IncosPDFLibBase.OFICIO_FONTS.normal },
    );
    this._addSpace();

    await this._addParagraph(
      'NOTA: El contenido de la presente declaración es de exclusiva responsabilidad del declarante.',
      { fontSize: IncosPDFLibBase.OFICIO_FONTS.small },
    );
  }

  /** @private */
  _formatLugarFecha() {
    const ahora = new Date();
    const mes = MESES_ES[ahora.getMonth()] ?? '';
    return `Santa Cruz, ${ahora.getDate()} de ${mes} de ${ahora.getFullYear()}`;
  }
}
