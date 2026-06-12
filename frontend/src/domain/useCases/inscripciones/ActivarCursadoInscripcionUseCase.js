/**
 * Use Case: ActivarCursadoInscripcionUseCase
 *
 * Single Responsibility: Orquestar la activación del cursado de una inscripción
 * (sus matrículas pasan INSCRITO → CURSANDO y se abren sus bimestres).
 *
 * Clean Architecture:
 * - Domain Layer: lógica de negocio
 * - Depende de: IInscripcionRepository (abstracción)
 */

export class ActivarCursadoInscripcionUseCase {
  /**
   * @param {Object} dependencies
   * @param {IInscripcionRepository} dependencies.inscripcionRepository
   */
  constructor({ inscripcionRepository }) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * @param {string|number} id - ID de la inscripción
   * @returns {Promise<{success: boolean, data?: Object, error?: string, code?: string}>}
   */
  async ejecutar(id) {
    return this.inscripcionRepository.cambiarEstadoCursado(id);
  }
}
