/**
 * Interfaz del servicio de generación del Listado de Inscritos de un curso de
 * capacitación (.xlsx, una sola hoja).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el libro Excel con los participantes vigentes (PENDIENTE/INSCRITO) de una
 * capacitación, a partir del payload armado por
 * ExportListadoInscritosCapacitacionExcelUseCase.
 *
 * Clean Architecture:
 * - Domain: IListadoInscritosCapacitacionExcelGenerator (este contrato).
 * - Infrastructure: ListadoInscritosCapacitacionExcelBuilder lo implementa con ExcelJS.
 * - Application: el use case depende de esta interfaz (inyectada por el container),
 *   nunca de la implementación concreta.
 */
export class IListadoInscritosCapacitacionExcelGenerator {
  /**
   * Genera el libro Excel del listado de inscritos de una capacitación.
   *
   * @param {Object} datos - Payload del listado.
   * @param {Object} datos.curso - { titulo, costo, aulaNombre, horariosDetalle, fechaInicio, fechaFin }
   * @param {Array<Object>} datos.participantes - { nombreCompleto, ciCompleto, correo, saldo, fechaInscripcion }
   * @param {string} [datos.fechaEmision] - Fecha de emisión (YYYY-MM-DD).
   * @returns {Promise<Buffer>} Buffer del archivo .xlsx.
   */
  generarListadoInscritos(_datos) {
    throw new Error('Method generarListadoInscritos must be implemented');
  }
}

export default IListadoInscritosCapacitacionExcelGenerator;
