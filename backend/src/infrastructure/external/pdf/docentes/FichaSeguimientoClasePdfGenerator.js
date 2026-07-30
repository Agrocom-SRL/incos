/**
 * FichaSeguimientoClasePdfGenerator (módulo DOC · supervisión docente)
 *
 * Genera la «FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL» a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib, replicando el
 * formulario físico de la Dirección Académica (foto real revisada):
 * membrete + título, grilla de cabecera (Docente / Asignatura / Carrera /
 * Curso: Paralelo / Fecha de seguimiento), check de clase observada
 * PRESENCIAL, tabla en dos columnas «ESTRUCTURA MÍNIMA DE LA CLASE |
 * OBSERVACIONES» con la documentación SI/NO, las cantidades de estudiantes y
 * las secciones de observación, OTRAS OBSERVACIONES y pie de firma de la
 * DIRECTORA ACADÉMICA.
 *
 * Patrón BitacoraMensualTutorPdfGenerator: extiende IncosPDFLibBase y retorna
 * Buffer (el controller lo envía como descarga binaria).
 *
 * @implements {IFichaSeguimientoClasePdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

/** SI/NO del formulario; «—» cuando el ítem no fue marcado. */
function marcaSiNo(value) {
  if (value === true || value === 1) return 'SI';
  if (value === false || value === 0) return 'NO';
  return '—';
}

/** Valor observado o «—» para celdas vacías del formulario. */
function textoObs(value) {
  const str = String(value ?? '').trim();
  return str || '—';
}

export class FichaSeguimientoClasePdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IFichaSeguimientoClasePdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const ficha = options.ficha || {};
      const contexto = options.contexto || {};

      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('FICHA DE SEGUIMIENTO EN LA CLASE');
      await this._addSubtitle('PRESENCIAL');
      this._addSpace();

      await this._buildCabecera(ficha, contexto);
      await this._buildEstructuraMinima(ficha);
      await this._buildOtrasObservaciones(ficha);
      await this._buildFirma(contexto);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[FichaSeguimientoClasePdfGenerator] PDF generado (buffer)', {
        fichaId: ficha.id ?? null,
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[FichaSeguimientoClasePdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Grilla de cabecera del formulario: Nombre del Docente (fila completa),
   * Asignatura | Carrera, Curso: Paralelo | Fecha de seguimiento, y el check
   * «Marque la clase observada».
   * @private
   */
  async _buildCabecera(ficha, contexto) {
    const curso = [contexto.paraleloPeriodoNombre, contexto.paraleloNombre]
      .filter(Boolean)
      .join(' · ');

    await this._addLabelValue('Nombre del Docente:', contexto.docenteNombre ?? '—');
    await this._addLabelValueGrid(
      [
        { label: 'Asignatura:', value: contexto.asignaturaNombre ?? '—' },
        { label: 'CARRERA:', value: contexto.carreraNombre ?? '—' },
        { label: 'Curso: Paralelo:', value: curso || '—' },
        { label: 'Fecha de seguimiento:', value: String(ficha.fechaSeguimiento ?? '—') },
      ],
      2
    );

    const claseObservada = ficha.claseObservada ?? 'PRESENCIAL';
    await this._addLabelValue('Marque la clase observada:', `[X] ${claseObservada}`);
    this._addSpace();
  }

  /**
   * Tabla en dos columnas del formulario («ESTRUCTURA MÍNIMA DE LA CLASE |
   * OBSERVACIONES — registre todo lo observado»): documentación SI/NO,
   * cantidad de estudiantes y las secciones 3-9 de observación.
   * @private
   */
  async _buildEstructuraMinima(ficha) {
    const documentacion = [
      `• Cronograma bimestral de asignatura: ${marcaSiNo(ficha.tieneCronogramaBimestral)}`,
      `• Plan bimestral: ${marcaSiNo(ficha.tienePlanBimestral)}`,
      `• Registro de asistencia: ${marcaSiNo(ficha.tieneRegistroAsistencia)}`,
      `• Registro pedagógico y el consolidado: ${marcaSiNo(ficha.tieneRegistroPedagogico)}`,
    ].join('  ');

    const cantidadEstudiantes = [
      `En planilla: ${ficha.estudiantesEnPlanilla ?? '—'}`,
      `Asistentes: ${ficha.estudiantesAsistentes ?? '—'}`,
    ].join('  ·  ');

    const filas = [
      [`DOCUMENTACIÓN LISTA DE ASISTENCIA  ${documentacion}`, textoObs(ficha.obsDocumentacion)],
      ['CANTIDAD DE ESTUDIANTES', cantidadEstudiantes],
      ['AVANCE DE LA ASIGNATURA', textoObs(ficha.obsAvanceAsignatura)],
      [
        'PRESENTACIÓN DEL TEMA O CONTINUIDAD DE AVANCE',
        textoObs(ficha.obsPresentacionTema),
      ],
      ['RECURSOS QUE UTILIZA', textoObs(ficha.obsRecursos)],
      ['EXPOSICIÓN DEL DOCENTE', textoObs(ficha.obsExposicion)],
      ['PARTICIPACIÓN DE ESTUDIANTES', textoObs(ficha.obsParticipacion)],
      ['ACTIVIDADES PRÁCTICAS', textoObs(ficha.obsActividadesPracticas)],
      ['ACTIVIDADES DE EVALUACIÓN', textoObs(ficha.obsActividadesEvaluacion)],
    ];

    await this._addTable(
      ['ESTRUCTURA MÍNIMA DE LA CLASE', 'OBSERVACIONES (REGISTRE TODO LO OBSERVADO)'],
      [42, 58],
      filas
    );
  }

  /**
   * Cierre del formulario: OTRAS OBSERVACIONES.
   * @private
   */
  async _buildOtrasObservaciones(ficha) {
    this._addSpace();
    await this._addSection('OTRAS OBSERVACIONES:');
    await this._addParagraph(textoObs(ficha.otrasObservaciones));
  }

  /**
   * Pie de firma del formulario: evaluador + cargo DIRECTORA ACADÉMICA.
   * @private
   */
  async _buildFirma(contexto) {
    const lines = [
      contexto.evaluadorNombre || '',
      'DIRECTORA ACADÉMICA',
      'Instituto Técnico INCOS Santa Cruz',
    ].filter(Boolean);

    await this._addSignatureBlock({ lines });
  }
}
