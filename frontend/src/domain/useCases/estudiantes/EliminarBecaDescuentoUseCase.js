/**
 * Use Case: EliminarBecaDescuentoUseCase
 * 
 * Single Responsibility: Orquestar la eliminación de una beca/descuento
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de negocio para eliminar becas
 * - Depende de: IBecaDescuentoRepository (abstracción)
 */

export class EliminarBecaDescuentoUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {IBecaDescuentoRepository} dependencies.becaDescuentoRepository - Repositorio de becas
   */
  constructor({ becaDescuentoRepository }) {
    this.becaDescuentoRepository = becaDescuentoRepository;
  }

  /**
   * Ejecuta la eliminación de la beca
   * 
   * @param {string|number} id - ID de la beca a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async ejecutar(id) {
    return await this.becaDescuentoRepository.eliminar(id);
  }
}
