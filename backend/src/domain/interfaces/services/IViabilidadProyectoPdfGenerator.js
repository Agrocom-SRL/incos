/**
 * Interfaz del generador PDF del Informe de Viabilidad Técnica del proyecto
 * de grado (módulo TUT · titulación). El PDF se guarda en uploads y se
 * registra en tutoria_dictamenes (tipo VIABILIDAD_TECNICA).
 */
export class IViabilidadProyectoPdfGenerator {
  /**
   * Genera el PDF de viabilidad técnica y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {Object} options.proyecto - { titulo, modalidadNombre, carreraNombre, gestionAnio, estado }
   * @param {string} options.tutorNombre - Nombre del tutor
   * @param {Array<Object>} options.integrantes - [{ estudianteNombre, codigoEstudiante, rol }]
   * @param {string} options.resultado - APROBADO | OBSERVADO | RECHAZADO
   * @param {string} [options.contenido] - Cuerpo/resumen del informe
   * @param {string} [options.numeroInforme]
   * @param {string} [options.fechaEmision]
   * @param {string} [options.destinatario]
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
