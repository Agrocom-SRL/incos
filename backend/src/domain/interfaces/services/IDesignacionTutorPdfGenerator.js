/**
 * Interfaz del generador PDF del Informe de Designación Oficial de Tutor
 * (módulo TUT · titulación). El PDF se guarda en uploads y se registra en
 * tutoria_dictamenes (tipo DESIGNACION_OFICIAL) para su envío a la DDE.
 */
export class IDesignacionTutorPdfGenerator {
  /**
   * Genera el PDF de designación de tutor y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {Object} options.proyecto - { titulo, modalidadNombre, carreraNombre, gestionAnio }
   * @param {string} options.tutorNombre - Nombre del tutor (APELLIDOS NOMBRES)
   * @param {Array<Object>} options.integrantes - [{ estudianteNombre, codigoEstudiante, rol }]
   * @param {string} [options.numeroInforme] - Número/cite del informe
   * @param {string} [options.fechaEmision] - Fecha formateada
   * @param {string} [options.destinatario] - Instancia destinataria (ej: DDE)
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
