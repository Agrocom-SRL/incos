/**
 * Use Case: CambiarEstadoBecaDescuentoUseCase
 *
 * Single Responsibility: Orquestar el toggle activo/inactivo de una beca o
 * descuento del catálogo maestro (columna "Estado" del listado de Config. de
 * pagos · Finanzas, PATCH /becas-descuentos/:id/estado).
 *
 * Clean Architecture:
 * - Domain Layer: Lógica de negocio para activar/desactivar becas
 * - Depende de: IBecaDescuentoRepository (abstracción)
 */

export class CambiarEstadoBecaDescuentoUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {IBecaDescuentoRepository} dependencies.becaDescuentoRepository - Repositorio de becas
   */
  constructor({ becaDescuentoRepository }) {
    this.becaDescuentoRepository = becaDescuentoRepository;
  }

  /**
   * Activa/desactiva una beca o descuento del catálogo maestro
   *
   * @param {string|number} becaDescuentoId
   * @param {boolean} activo - Nuevo estado (true = activo)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(becaDescuentoId, activo) {
    try {
      if (!becaDescuentoId) {
        return { success: false, error: 'El ID de la beca o descuento es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.becaDescuentoRepository.cambiarEstado(becaDescuentoId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado de la beca o descuento'
            : result.error || 'Error al cambiar el estado de la beca o descuento';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado de la beca o descuento',
      };
    }
  }
}
