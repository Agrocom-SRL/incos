/**
 * Use Case: EliminarBecaAsignadaUseCase
 * 
 * Single Responsibility: Orquestar la eliminación de una beca asignada a un estudiante
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de negocio para eliminar becas asignadas
 * - Depende de: IEstudianteBecaRepository (abstracción)
 */

export class EliminarBecaAsignadaUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {IEstudianteBecaRepository} dependencies.estudianteBecaRepository - Repositorio de becas asignadas
   */
  constructor({ estudianteBecaRepository }) {
    this.estudianteBecaRepository = estudianteBecaRepository;
  }

  /**
   * Ejecuta la eliminación de la beca asignada
   * 
   * @param {string|number} id - ID de la beca asignada a eliminar (estudiantes_becas.id)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async ejecutar(id) {
    return await this.estudianteBecaRepository.eliminar(id);
  }
}
