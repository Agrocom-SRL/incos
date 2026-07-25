/**
 * Interfaz del generador PDF del Panel de Acompañamiento Pedagógico
 * (módulo TUT · acompañamiento). Fuentes: vistas 157/158/162.
 */
export class IPanelAcompanamientoPdfGenerator {
  /**
   * Genera el PDF del panel y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {number|string|null} [options.gestionAnio] - Año de gestión
   * @param {Array<Object>} options.riesgoPorCarrera - Filas de la vista 157 (camelCase)
   * @param {Array<Object>} options.materiasCriticas - Filas de la vista 158 (camelCase)
   * @param {Array<Object>} options.sesionesResumen - Filas de la vista 162 (camelCase)
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
