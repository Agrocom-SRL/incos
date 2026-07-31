/**
 * Interfaz del generador PDF del Formulario de elección de Modalidad de
 * Graduación (FMDG-1) — módulo TIT · titulación, Requisito 1 (extensión
 * 2026-07-31). Documento "export": no se guarda ni se registra en
 * `dictamenes_proyecto` (mismo patrón que `ExportBitacoraMensualTutorPdfUseCase`).
 *
 * Réplica de `/Users/miguel/Documents/incos/pasantia/FORMULARIO 01 DE
 * MODALIDAD DE GRADUACION OK.docx` (verificado campo a campo, ver §0.3 del
 * plan de desarrollo).
 */
export class IFormularioModalidadGradoPdfGenerator {
  /**
   * Genera el PDF del FMDG-1 y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {Object} options.estudiante - { nombres, apellidoPaterno,
   *   apellidoMaterno, nombreCompleto, ci, expedicion, celular }
   * @param {Object} options.proyecto - { titulo, objetivos, carreraNombre,
   *   modalidadNombre, gestionAnio }
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
