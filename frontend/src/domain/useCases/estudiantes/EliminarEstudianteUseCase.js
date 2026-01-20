/**
 * Use Case: EliminarEstudianteUseCase
 * 
 * Single Responsibility: Orquestar la eliminación de un estudiante
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de negocio para eliminar estudiantes
 * - Depende de: IEstudianteRepository (abstracción)
 */

export class EliminarEstudianteUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {IEstudianteRepository} dependencies.estudianteRepository - Repositorio de estudiantes
   */
  constructor({ estudianteRepository }) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * Ejecuta la eliminación del estudiante
   * 
   * @param {string|number} id - ID del estudiante a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async ejecutar(id) {
    return await this.estudianteRepository.eliminar(id);
  }
}
