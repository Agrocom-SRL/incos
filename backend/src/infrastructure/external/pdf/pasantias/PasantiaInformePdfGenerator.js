/**
 * PasantiaInformePdfGenerator (módulo TUT · pasantías)
 *
 * Genera los dos informes formales de la práctica laboral a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib, replicando el formato
 * REAL del instituto (documento fuente: "INFORME DE VERIFICACIÓN DE LA
 * EMPRESA Y DE SU ACTIVIDAD PARA REALIZAR LA PASANTÍA LABORAL-2026.docx"):
 * - VERIFICACION_EMPRESA: párrafo continuo (no filas de label/valor), con
 *   los datos variables subrayados como si se hubiesen escrito a máquina
 *   sobre un espacio en blanco preimpreso.
 * - CONVALIDACION_TRABAJO: mismo encabezado/título, cuerpo por bullets (no
 *   se cuenta con el documento fuente exacto de este segundo formato).
 *
 * Estructura común: título único (alineado a la izquierda en 2 líneas, como
 * el documento fuente, pero con la misma fuente decorativa y color verde que
 * el resto de documentos institucionales — defaultTitleFont / COLORS.primary)
 * / A / VIA / DE / REF / FECHA / ANTECEDENTES / RESULTADOS / CONCLUSIONES /
 * FIRMA DOCENTE. "A" (Rector) y "VIA" (Dirección Académica) son cargos
 * institucionales fijos — nunca se piden en el formulario. Nombres de
 * persona en orden institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES
 * (la vista 168 ya los arma).
 *
 * Tamaño de letra y márgenes laterales propios de este generador
 * (2026-08-09, más grande y más aire a los costados que el resto de
 * documentos institucionales — se imprime y firma a mano): no se tocan las
 * constantes compartidas de IncosPDFBase, solo se pasa `fontSize`/`marginLeft`/
 * `marginRight` explícitos a los helpers que lo soportan.
 *
 * Patrón ViabilidadProyectoPdfGenerator: extiende IncosPDFLibBase, retorna
 * Buffer (el use case lo guarda vía uploadsStorage).
 *
 * @implements {IPasantiaInformePdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import {
  TIPOS_INFORME_PASANTIA,
  RESULTADOS_INFORME_PASANTIA,
  AUTORIDAD_RECTOR_INCOS,
  AUTORIDAD_DIRECTORA_ACADEMICA_INCOS,
} from '../../../../domain/constants/pasantias.constants.js';

const TITULOS = {
  [TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA]:
    'INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU ACTIVIDAD PARA REALIZAR LA PASANTÍA LABORAL',
  [TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO]:
    'INFORME DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO',
};

const REFERENCIAS = {
  [TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA]:
    'INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU ACTIVIDAD PARA LA PASANTÍA LABORAL.',
  [TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO]:
    'INFORME DE CONVALIDACIÓN DE TRABAJO POR PASANTÍA LABORAL.',
};

/** Tamaño de fuente propio de este documento (más grande que el resto). */
const FONT_SIZE_TITLE = 13;
const FONT_SIZE_BODY = 10;

/** Relleno de "espacio en blanco" cuando un dato aún no está cargado. */
const BLANCO = '……………………';

/** Ancho fijo del label (A / VIA / DE) antes de los ":" del encabezado. */
const HEADER_LABEL_WIDTH = 42;
/** Dónde arranca el valor/cargo tras "LABEL   :" (misma columna en ambas líneas). */
const HEADER_VALUE_INDENT = 58;

/**
 * Márgenes laterales propios de este documento — más anchos que el resto de
 * generadores institucionales (no se toca la constante global compartida,
 * solo se pasa override a los helpers que lo soportan).
 */
const PAGE_MARGIN_LEFT = IncosPDFBase.LAYOUT.margins.left + 20;
const PAGE_MARGIN_RIGHT = IncosPDFBase.LAYOUT.margins.right + 20;
const SECTION_MARGIN_OPTS = { marginLeft: PAGE_MARGIN_LEFT };
const PARAGRAPH_MARGIN_OPTS = { marginLeft: PAGE_MARGIN_LEFT, marginRight: PAGE_MARGIN_RIGHT };

/** ISO (YYYY-MM-DD) → DD/MM/YYYY para lectura natural en el documento impreso. */
const formatFechaLegible = (iso) => {
  if (!iso) return null;
  const [y, m, d] = String(iso).split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

export class PasantiaInformePdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IPasantiaInformePdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const { tipo } = options;
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._buildTitulo(TITULOS[tipo] ?? 'INFORME DE PASANTÍA LABORAL');
      this._addSpace(10);

      await this._buildEncabezadoMemo(options);
      await this._buildAntecedentes(options);
      await this._buildResultados(options);
      await this._buildConclusiones(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[PasantiaInformePdfGenerator] PDF generado (buffer)', {
        tipo,
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[PasantiaInformePdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Título único, alineado a la izquierda (2 líneas, como el formato real),
   * con la misma fuente decorativa y color verde que el resto de documentos
   * institucionales (defaultTitleFont / COLORS.primary).
   * @private
   */
  async _buildTitulo(text) {
    const { width: pageWidth } = this._currentPage.getSize();
    const font = await this._loadCustomFont(this._pdfDoc, IncosPDFBase.FONTS.defaultTitleFont);
    const titleRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);
    const maxWidth = pageWidth - PAGE_MARGIN_LEFT - PAGE_MARGIN_RIGHT;

    const lines = this._wrapText(text, font, FONT_SIZE_TITLE, maxWidth);
    for (const line of lines) {
      this._currentPage.drawText(line, {
        x: PAGE_MARGIN_LEFT,
        y: this._currentY,
        size: FONT_SIZE_TITLE,
        font,
        color: titleRgb,
      });
      this._currentY -= FONT_SIZE_TITLE + 4;
    }
  }

  /**
   * Bloque "LABEL   :  Nombre" + línea siguiente indentada con el cargo en
   * negrita (patrón A / VIA / DE del formato real).
   * @private
   */
  async _buildAutoridadLinea(label, nombre, cargo, underlineNombre = false) {
    const x = PAGE_MARGIN_LEFT;
    const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
    const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
    const boldFont = await this._pdfDoc.embedFont(boldFontName);
    const normalFont = await this._pdfDoc.embedFont(normalFontName);
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    this._currentPage.drawText(label, {
      x,
      y: this._currentY,
      size: FONT_SIZE_BODY,
      font: boldFont,
      color: textRgb,
    });
    this._currentPage.drawText(':', {
      x: x + HEADER_LABEL_WIDTH,
      y: this._currentY,
      size: FONT_SIZE_BODY,
      font: normalFont,
      color: textRgb,
    });

    const nombreStr = nombre || BLANCO;
    this._currentPage.drawText(nombreStr, {
      x: x + HEADER_VALUE_INDENT,
      y: this._currentY,
      size: FONT_SIZE_BODY,
      font: normalFont,
      color: textRgb,
    });
    if (underlineNombre && nombre) {
      const w = normalFont.widthOfTextAtSize(nombreStr, FONT_SIZE_BODY);
      this._currentPage.drawLine({
        start: { x: x + HEADER_VALUE_INDENT, y: this._currentY - 2 },
        end: { x: x + HEADER_VALUE_INDENT + w, y: this._currentY - 2 },
        thickness: 0.75,
        color: textRgb,
      });
    }
    this._currentY -= FONT_SIZE_BODY + 3;

    this._currentPage.drawText(cargo, {
      x: x + HEADER_VALUE_INDENT,
      y: this._currentY,
      size: FONT_SIZE_BODY,
      font: boldFont,
      color: textRgb,
    });
    this._currentY -= FONT_SIZE_BODY + 13;
  }

  /**
   * "LABEL:  texto" con wrap (para REF. / FECHA, sin línea de cargo debajo).
   * `label` ya incluye los ":" (ej. "REF.:", "FECHA:").
   * @private
   */
  async _buildLabelWrapped(label, text) {
    const { width: pageWidth } = this._currentPage.getSize();
    const x = PAGE_MARGIN_LEFT;
    const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
    const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
    const boldFont = await this._pdfDoc.embedFont(boldFontName);
    const normalFont = await this._pdfDoc.embedFont(normalFontName);
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    this._currentPage.drawText(label, {
      x,
      y: this._currentY,
      size: FONT_SIZE_BODY,
      font: boldFont,
      color: textRgb,
    });

    const maxWidth = pageWidth - PAGE_MARGIN_RIGHT - (x + HEADER_VALUE_INDENT);
    const lines = this._wrapText(text, normalFont, FONT_SIZE_BODY, maxWidth);
    for (const line of lines) {
      this._currentPage.drawText(line, {
        x: x + HEADER_VALUE_INDENT,
        y: this._currentY,
        size: FONT_SIZE_BODY,
        font: normalFont,
        color: textRgb,
      });
      this._currentY -= FONT_SIZE_BODY + 3;
    }
    this._currentY -= 5;
  }

  /**
   * Bloque A / VIA / DE / REF / FECHA del formato real. "A" y "VIA" son
   * cargos institucionales fijos (Rector / Dirección Académica), no datos
   * del trámite — nunca se piden en el formulario.
   * @private
   */
  async _buildEncabezadoMemo(options) {
    const informe = options.informe || {};
    const docenteNombre =
      options.docenteNombre || options.pasantia?.docenteSupervisorNombre || '';

    await this._buildAutoridadLinea('A', AUTORIDAD_RECTOR_INCOS.nombre, AUTORIDAD_RECTOR_INCOS.cargo);
    await this._buildAutoridadLinea(
      'VIA',
      AUTORIDAD_DIRECTORA_ACADEMICA_INCOS.nombre,
      AUTORIDAD_DIRECTORA_ACADEMICA_INCOS.cargo
    );
    await this._buildAutoridadLinea(
      'DE',
      docenteNombre,
      'DOCENTE - INSTITUTO TÉCNICO INCOS SANTA CRUZ',
      true
    );

    await this._buildLabelWrapped('REF.:', REFERENCIAS[options.tipo] ?? '');
    const fechaEmisionLegible = formatFechaLegible(informe.fechaEmision);
    if (fechaEmisionLegible) {
      await this._buildLabelWrapped('FECHA:', `Santa Cruz, ${fechaEmisionLegible}.`);
    }
    this._addSpace(6);
  }

  /**
   * ANTECEDENTES: texto normativo fijo del formulario (R.M. 487/2023).
   * @private
   */
  async _buildAntecedentes(options) {
    await this._addSection('ANTECEDENTES', false, SECTION_MARGIN_OPTS);
    if (options.tipo === TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO) {
      await this._addRichParagraph(
        [
          {
            text:
              'Mediante el presente informe se hace conocer a las autoridades del Instituto ' +
              'Técnico INCOS Santa Cruz, sobre la supervisión realizada para la ' +
              '"Convalidación de Actividades Laborales para la Práctica Laboral", tal como ' +
              'se encuentra enmarcado en la Resolución Ministerial No. 487/2023, donde se ' +
              'establece el reconocimiento de la actividad laboral para su valoración de ' +
              'Dirección Académica bajo informes de supervisión.',
          },
        ],
        { fontSize: FONT_SIZE_BODY, ...PARAGRAPH_MARGIN_OPTS }
      );
    } else {
      await this._addRichParagraph(
        [
          {
            text:
              'Mediante el presente informe se hace conocer a las autoridades del Instituto ' +
              'Técnico INCOS Santa Cruz, sobre la verificación realizada a la empresa, para ' +
              'que el estudiante realice sus prácticas laborales, tal como exige la ' +
              'Resolución Ministerial No. 487/2023, donde se establece que el estudiante ' +
              'tiene que realizar práctica laboral de 300 a 360 horas laborales para su ' +
              'valoración de Dirección Académica bajo informes de supervisión; para ello la ' +
              'empresa tiene que estar legalmente constituida.',
          },
        ],
        { fontSize: FONT_SIZE_BODY, ...PARAGRAPH_MARGIN_OPTS }
      );
    }
  }

  /**
   * RESULTADOS: párrafo continuo (verificación) o bullets (convalidación,
   * sin documento fuente exacto). Los datos variables van subrayados dentro
   * de la oración, como en el formato real.
   * @private
   */
  async _buildResultados(options) {
    const pasantia = options.pasantia || {};
    const informe = options.informe || {};

    if (options.tipo === TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO) {
      await this._addSection(
        'RESULTADOS DE LA SUPERVISIÓN DE LA ACTIVIDAD LABORAL DEL ESTUDIANTE',
        false,
        SECTION_MARGIN_OPTS
      );
      await this._addLabelValue('Empresa/Institución:', pasantia.empresaNombre || '');
      if (pasantia.empresaTipoSocietario) {
        await this._addLabelValue('Constituida como:', pasantia.empresaTipoSocietario);
      }
      await this._buildDatosEmpresa(pasantia);
      this._addSpace();
      await this._addLabelValue('Estudiante:', pasantia.estudianteNombre || '');
      if (pasantia.carreraNombre) {
        await this._addLabelValue('Carrera (3er año):', pasantia.carreraNombre);
      }
      if (pasantia.cargoPuesto) {
        const desde = pasantia.fechaInicio
          ? ` desde el ${pasantia.fechaInicio} hasta la presente fecha`
          : '';
        await this._addLabelValue('Cargo que desempeña:', `${pasantia.cargoPuesto}${desde}`);
      }
      if (pasantia.funciones) {
        await this._addBulletPoint(`Entre sus funciones primordiales realiza: ${pasantia.funciones}`);
      }
      if (pasantia.tipoContrato) {
        const area = pasantia.areaDepartamento ? ` y es del área ${pasantia.areaDepartamento}` : '';
        await this._addBulletPoint(
          `En la empresa cuenta con un contrato laboral ${String(pasantia.tipoContrato).toLowerCase()}${area}.`
        );
      }
      if (informe.evaluacionCualitativa) {
        await this._addBulletPoint(informe.evaluacionCualitativa);
      }
      this._addSpace();
      return;
    }

    await this._addSection(
      'RESULTADOS DE LA VERIFICACIÓN DE LA EMPRESA Y SU ACTIVIDAD PRINCIPAL',
      false,
      SECTION_MARGIN_OPTS
    );

    const fechaVerificacionLegible = formatFechaLegible(informe.fechaVerificacion) || BLANCO;
    const enFuncionamiento = pasantia.empresaEnFuncionamiento === false ? 'NO' : 'SÍ';

    await this._addRichParagraph(
      [
        { text: 'Dando cumplimiento al' },
        { text: informe.numeroMemo || BLANCO, underline: true },
        {
          text:
            'para la verificación de la empresa/institución para pasantía laboral, se ' +
            'hace conocer lo siguiente: Se realizó la verificación en fecha',
        },
        { text: fechaVerificacionLegible, underline: true },
        { text: 'efectivamente' },
        { text: enFuncionamiento, underline: true },
        { text: 'está en funcionamiento la empresa/institución' },
        { text: `${pasantia.empresaNombre || BLANCO},`, underline: true },
        {
          text:
            'legalmente establecida cumpliendo el principio de una empresa constituida ' +
            'la misma es una empresa',
        },
        { text: pasantia.empresaTipoSocietario || BLANCO, underline: true },
        { text: 'ubicada en la calle o Av.' },
        { text: pasantia.empresaDireccion || BLANCO, underline: true },
        { text: 'con NIT:' },
        { text: `${pasantia.empresaNit || BLANCO},`, underline: true },
        { text: 'su actividad económica es en el Sector' },
        { text: `${pasantia.empresaSectorActividad || BLANCO}.`, underline: true },
      ],
      { fontSize: FONT_SIZE_BODY, ...PARAGRAPH_MARGIN_OPTS }
    );
  }

  /**
   * Datos comunes de la empresa (dirección, NIT, sector) — solo camino
   * CONVALIDACION_TRABAJO (VERIFICACION_EMPRESA los integra en el párrafo).
   * @private
   */
  async _buildDatosEmpresa(pasantia) {
    if (pasantia.empresaDireccion) {
      await this._addLabelValue('Ubicada en:', pasantia.empresaDireccion);
    }
    if (pasantia.empresaNit) {
      await this._addLabelValue('NIT:', pasantia.empresaNit);
    }
    if (pasantia.empresaSectorActividad) {
      await this._addLabelValue('Actividad económica (sector):', pasantia.empresaSectorActividad);
    }
  }

  /**
   * CONCLUSIONES + cierre + FIRMA DOCENTE del formato real. Párrafo continuo
   * (verificación) con la frase de viabilidad fija en negrita, tal como el
   * documento fuente.
   * @private
   */
  async _buildConclusiones(options) {
    const pasantia = options.pasantia || {};
    const informe = options.informe || {};
    const esViable = informe.resultado !== RESULTADOS_INFORME_PASANTIA.NO_VIABLE;
    const docenteNombre = options.docenteNombre || pasantia.docenteSupervisorNombre || '';

    await this._addSection('CONCLUSIONES', false, SECTION_MARGIN_OPTS);

    if (options.tipo === TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO) {
      if (pasantia.areaDepartamento) {
        await this._addLabelValue('Área relacionada con la carrera:', pasantia.areaDepartamento);
      }
      if (pasantia.cargoPuesto) {
        await this._addLabelValue('Cargo del estudiante:', pasantia.cargoPuesto);
      }
      await this._addParagraph(
        esViable
          ? 'La empresa demuestra la formalidad correspondiente en relación a los ' +
              'aspectos legales de constitución y la contratación de personal está de ' +
              'acuerdo a la Ley General del Trabajo, por lo que se puede dar VALIDEZ A ' +
              'LA SOLICITUD DE CONVALIDACIÓN. Se adjunta el formulario de seguimiento ' +
              'del instituto debidamente llenado y sellado por la empresa.'
          : 'De la supervisión realizada se concluye que NO corresponde dar validez a ' +
              'la solicitud de convalidación de actividades laborales.'
      );
    } else {
      await this._addRichParagraph(
        [
          {
            text:
              'Al concluir la verificación de la empresa se corroboró que las funciones ' +
              'que realizará está relacionado con el área',
          },
          { text: `${pasantia.areaDepartamento || BLANCO},`, underline: true },
          { text: 'el estudiante estará como' },
          { text: `${pasantia.cargoPuesto || BLANCO},`, underline: true },
          {
            text:
              'la empresa demuestra la formalidad correspondiente en relación a los ' +
              'aspectos legales de constitución está tal como exige las leyes bolivianas, ' +
              'por lo que se debe dar',
          },
          esViable
            ? {
                text: 'viabilidad a la solicitud de autorización para la realización de pasantía laboral.',
                bold: true,
              }
            : {
                text: 'NO viabilidad a la solicitud de autorización para la realización de pasantía laboral.',
                bold: true,
              },
        ],
        { fontSize: FONT_SIZE_BODY, ...PARAGRAPH_MARGIN_OPTS }
      );
    }

    if (informe.contenido) {
      await this._addRichParagraph(
        [{ text: informe.contenido }],
        { fontSize: FONT_SIZE_BODY, ...PARAGRAPH_MARGIN_OPTS }
      );
    }
    await this._addRichParagraph(
      [{ text: 'Es todo cuanto puedo informar sobre la solicitud del Estudiante.' }],
      { fontSize: FONT_SIZE_BODY, ...PARAGRAPH_MARGIN_OPTS }
    );

    await this._addSignatureBlock({
      lines: ['FIRMA DOCENTE', docenteNombre],
      fontSize: FONT_SIZE_BODY,
    });
  }
}
