/**
 * Interfaz del generador PDF del Informe de Suficiencia de Modalidad de
 * Graduación (módulo TIT · titulación, extensión 2026-08-17). Emitido al
 * transicionar DESARROLLO → SUFICIENCIA (T11, AprobarEtapaProyectoUseCase).
 * El PDF se guarda en uploads y se registra en dictamenes_proyecto (tipo
 * INFORME_SUFICIENCIA).
 */
export class IInformeSuficienciaPdfGenerator {
  /**
   * Genera el PDF del informe de suficiencia y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {Object} options.estudiante - { nombres, apellidoPaterno, apellidoMaterno, nombreCompleto, ci, expedicion, celular }
   * @param {Object} options.proyecto - { titulo, modalidadNombre, carreraNombre, gestionAnio }
   * @param {string} options.tutorNombre - Nombre del Docente Tutor/a
   * @param {string} options.aspectosFormato - Criterio 1 (texto libre del tutor)
   * @param {string} options.contenidoProyecto - Criterio 2 (texto libre del tutor)
   * @param {string} options.procesoTutoria - Criterio 3 (texto libre del tutor)
   * @param {string} options.resultadoSuficiencia - APROBADO | NO_APROBADO (veredicto del tutor)
   * @param {string} [options.fechaEmision]
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
