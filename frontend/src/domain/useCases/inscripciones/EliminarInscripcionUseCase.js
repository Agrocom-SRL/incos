/**
 * Use Case: EliminarInscripcionUseCase
 * 
 * Single Responsibility: Orquestar la eliminación de una inscripción
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de negocio para eliminar inscripciones
 * - Depende de: IInscripcionRepository (abstracción)
 */

export class EliminarInscripcionUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {IInscripcionRepository} dependencies.inscripcionRepository - Repositorio de inscripciones
   */
  constructor({ inscripcionRepository }) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * Ejecuta la eliminación de la inscripción
   * 
   * @param {string|number} id - ID de la inscripción a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async ejecutar(id) {
    return await this.inscripcionRepository.eliminar(id);
  }
}
