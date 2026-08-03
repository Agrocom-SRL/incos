/**
 * Interfaz del generador PDF del Reporte de avance de tutorías por carrera
 * (módulo TIT · titulación, Requisito 2 — extensión 2026-07-31). Documento
 * "export": no persiste nada (no crea fila en dictamenes_proyecto).
 */
export class IAvanceTutoriaCarreraPdfGenerator {
  /**
   * Genera el PDF del reporte y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {number|string|null} [options.gestionAnio]
   * @param {Array<Object>} options.resumenPorCarrera - Filas de la vista 179
   *   en camelCase: [{ carreraNombre, totalProyectos, promedioAvance,
   *   proyectosConObservacionesPendientes }]
   * @param {Array<Object>} options.detalle - Filas de la vista 160 en
   *   camelCase: [{ titulo, carreraNombre, tutorNombre, porcentajeAvance,
   *   ultimaObservacion }]
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
