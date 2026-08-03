/**
 * Interfaz del Repositorio del Panel de Acompañamiento (módulo TUT).
 * Fuente: vistas 157/158/162 + top de la 156 — arquetipo B (solo lectura):
 * NO extiende IBaseRepository.
 *
 * Contrato A10-A11 de docs/plan/tutorias-plan-desarrollo.md.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 */

export class IPanelAcompanamientoRepository {
  /**
   * Datos agregados del panel (A10, `panelAcompanamiento`).
   * @param {{gestionId?: string|number}} _params
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPanel(_params = {}) {
    throw new Error('Método obtenerPanel debe ser implementado');
  }

  /**
   * Exporta el panel a PDF (A11, panel·EXPORTAR, blob autenticado).
   * @param {{gestionId?: string|number}} _params
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarPanel(_params = {}) {
    throw new Error('Método exportarPanel debe ser implementado');
  }
}
