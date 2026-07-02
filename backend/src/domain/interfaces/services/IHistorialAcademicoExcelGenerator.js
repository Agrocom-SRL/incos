/**
 * Interfaz de servicio: IHistorialAcademicoExcelGenerator
 *
 * Contrato del generador .xlsx del Historial académico (kardex / transcript
 * FORM-SIE-ITT-04) de un estudiante: una hoja con cabecera institucional +
 * datos del estudiante, la tabla del transcript y el pie de resumen.
 *
 * El use case nunca importa la implementación concreta: se inyecta por DI. El
 * payload es el mismo contrato { estudiante, filas, resumen } que sirve la API.
 */
export class IHistorialAcademicoExcelGenerator {
  /**
   * @param {Object} payload
   * @param {Object} payload.estudiante - Cabecera del estudiante (camelCase del contrato).
   * @param {Array<Object>} payload.filas - Filas del transcript.
   * @param {Object} payload.resumen - Pie de resumen.
   * @returns {Promise<Buffer>}
   */
  // eslint-disable-next-line no-unused-vars
  async generarHistorialAcademico(payload) {
    throw new Error('Method generarHistorialAcademico() must be implemented');
  }
}
