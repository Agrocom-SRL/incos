/**
 * Interfaz del generador PDF del Acta de Defensa de Grado Modalidad de
 * Graduación — módulo TIT · titulación, extensión 2026-08-01. Documento
 * "export": no se guarda en uploads ni se registra en `dictamenes_proyecto`
 * (el acta ya está persistida en su propia tabla; el PDF es reproducible).
 *
 * Espejo de §1 de `docs/plan/acta-defensa-grado-plan-desarrollo.md` (caso
 * real verificado: YUCRA VEIZAGA PEDRO, ADM-EMP, 26-nov-2025, foliado 012).
 */
export class IActaDefensaPdfGenerator {
  /**
   * Genera el PDF del acta de defensa y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {Object} options.acta - Presentación de ActaDefensaMapper.toDetail
   *   (numeroActaFormateado, fechaDefensa, horaInicio, horaConclusion,
   *   calificacionFinal, resultado, tribunal[])
   * @param {Object} options.estudiante - { nombreCompleto, ci, expedicion }
   * @param {Object} options.proyecto - { titulo, carreraNombre, modalidadNombre, gestionAnio }
   * @param {string} options.nivel - Nivel académico derivado de `carreras.tituloOtorgado`
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
