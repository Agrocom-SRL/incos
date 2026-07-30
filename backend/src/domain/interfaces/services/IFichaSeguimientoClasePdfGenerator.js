/**
 * Interfaz del generador PDF de la «FICHA DE SEGUIMIENTO EN LA CLASE
 * PRESENCIAL» (módulo DOC · supervisión docente). Réplica del formulario
 * físico de la Dirección Académica: cabecera Docente/Asignatura/Carrera/
 * Curso-Paralelo/Fecha, check PRESENCIAL, documentación SI/NO, cantidades de
 * estudiantes, secciones de observación en dos columnas («ESTRUCTURA MÍNIMA
 * DE LA CLASE | OBSERVACIONES»), OTRAS OBSERVACIONES y firma de la Dirección
 * Académica.
 */
export class IFichaSeguimientoClasePdfGenerator {
  /**
   * Genera el PDF de la ficha y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {Object} options.ficha - Ficha camelCase (FichaSeguimientoMapper.toDetail):
   *   fechaSeguimiento, claseObservada, tiene*, obs*, estudiantesEnPlanilla,
   *   estudiantesAsistentes, otrasObservaciones
   * @param {Object} [options.contexto] - Contexto de la asignación (vista 174):
   *   docenteNombre, asignaturaNombre, carreraNombre, paraleloPeriodoNombre,
   *   paraleloNombre, gestionAnio, evaluadorNombre
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
