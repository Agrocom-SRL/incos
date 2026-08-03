/**
 * Interfaz del generador Excel del Avance académico (ACA `/academico/avance`).
 * Libro de UNA hoja: listado estudiante × plan con % de avance.
 * Implementación: infrastructure/external/excel/avance-academico/.
 */
export class IAvanceAcademicoExcelGenerator {
  /**
   * @param {Object} _datos
   * @param {string} _datos.fechaEmision
   * @param {string|null} _datos.carreraFiltro - Nombre de la carrera filtrada (o null = todas).
   * @param {Array<Object>} _datos.filas - Salida de GetAvanceAcademicoUseCase (camelCase).
   * @returns {Promise<Buffer>}
   */
  async generarAvanceAcademico(_datos) {
    throw new Error('Method generarAvanceAcademico() must be implemented');
  }
}
