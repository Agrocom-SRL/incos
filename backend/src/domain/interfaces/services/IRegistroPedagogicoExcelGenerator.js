/**
 * Interfaz del servicio de generación del Registro Pedagógico Bimestral (.xlsx).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que
 * arme el libro Excel del registro pedagógico (hojas CONSOLIDADO y PLANILLA
 * CALIFICACIONES) a partir del payload ya formado por la capa de aplicación.
 *
 * Clean Architecture:
 * - Domain: IRegistroPedagogicoExcelGenerator (este contrato).
 * - Infrastructure: RegistroPedagogicoExcelBuilder lo implementa con ExcelJS.
 * - Application: el use case depende de esta interfaz (inyectada por el container),
 *   nunca de la implementación concreta.
 */
export class IRegistroPedagogicoExcelGenerator {
  /**
   * Genera el libro Excel del registro pedagógico de un bimestre cerrado.
   *
   * @param {Object} datos - Payload del registro (ver registroPedagogicoExcelMapper).
   * @param {string} datos.carrera
   * @param {string} datos.asignatura
   * @param {string} datos.codigo_asignatura
   * @param {string} datos.docente
   * @param {string} datos.curso
   * @param {string} datos.paralelo
   * @param {string} datos.gestion
   * @param {string} datos.bimestre - Ordinal en mayúsculas (PRIMER, SEGUNDO, ...).
   * @param {string} datos.fecha_emision
   * @param {Array<{ nombre: string, puntaje_maximo: number }>} datos.evaluaciones_practicas
   * @param {Array<{ nombre: string, puntaje_maximo: number }>} datos.evaluaciones_teoricas
   * @param {Array<Object>} datos.estudiantes
   * @returns {Promise<Buffer>} Buffer del archivo .xlsx.
   */
  generarRegistroPedagogicoBimestre(_datos) {
    throw new Error('Method generarRegistroPedagogicoBimestre must be implemented');
  }
}

export default IRegistroPedagogicoExcelGenerator;
