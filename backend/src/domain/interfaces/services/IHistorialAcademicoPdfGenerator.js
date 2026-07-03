/**
 * Interfaz del servicio de generación del Historial Académico (.pdf).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el documento oficial FORM-SIE-ITT-04 (kardex / transcript) de UN estudiante en
 * PDF sobre la plantilla institucional, a partir del payload ya formado por la
 * capa de aplicación (mismo contrato { estudiante, filas, resumen } que sirve la
 * API GET /estudiantes/:id/historial-academico).
 *
 * Clean Architecture:
 * - Domain: IHistorialAcademicoPdfGenerator (este contrato).
 * - Infrastructure: HistorialAcademicoPdfGenerator lo implementa con pdf-lib.
 * - Application: el use case depende de esta interfaz (inyectada por el
 *   container), nunca de la implementación concreta.
 */
export class IHistorialAcademicoPdfGenerator {
  /**
   * Genera el documento PDF del historial académico de un estudiante.
   *
   * @param {Object} payload - Contrato { estudiante, filas, resumen } de la API.
   * @param {Object} payload.estudiante - Cabecera del estudiante (camelCase).
   * @param {number} payload.estudiante.estudianteId
   * @param {string} payload.estudiante.matricula
   * @param {string} payload.estudiante.ci
   * @param {string} [payload.estudiante.expedicion]
   * @param {string} payload.estudiante.nombreCompleto
   * @param {string} payload.estudiante.carreraNombre
   * @param {string} [payload.estudiante.carreraCodigo]
   * @param {string} payload.estudiante.nivelFormacion - P. ej. "TECNICO SUPERIOR".
   * @param {string} payload.estudiante.regimen - P. ej. "ANUAL".
   * @param {string} [payload.estudiante.fechaAdmision]
   * @param {string} [payload.estudiante.fechaConclusion]
   * @param {Array<{ nro:number, gestionAnio:(number|string), cargaHoraria:(number|null),
   *                 periodoNumero:number, periodoNombre:string, asignaturaSigla:string,
   *                 asignaturaNombre:string, prerrequisitoSigla:(string|null),
   *                 notaFinal:(number|null), notaRecuperacion:(number|null),
   *                 estado:string, origen:string }>} payload.filas - Filas del
   *        transcript, una por asignatura cursada/convalidada.
   * @param {{ totalCargaHoraria:number, asignaturasAprobadas:number,
   *           asignaturasTotal:number, promedioGeneral:(number|null) }} payload.resumen
   *        - Pie de resumen (carga total, aprobadas/total, promedio).
   * @returns {Promise<Buffer>} Buffer del archivo .pdf.
   */
  // eslint-disable-next-line no-unused-vars
  async generarHistorialAcademico(payload) {
    throw new Error('Method generarHistorialAcademico() must be implemented');
  }
}

export default IHistorialAcademicoPdfGenerator;
