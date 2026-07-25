import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ISesionReforzamientoParticipanteRepository
 *
 * Participantes de sesiones de reforzamiento
 * (tabla `sesion_reforzamiento_participantes`, módulo TUT).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ISesionReforzamientoParticipanteRepository extends IRepository {
  /**
   * Participantes vigentes de una sesión.
   *
   * @param {number} sesionReforzamientoId
   * @returns {Promise<Array<Object>>}
   */
  async findBySesionId(_sesionReforzamientoId) {
    throw new Error('Method findBySesionId() must be implemented');
  }

  /**
   * Participante vigente de la sesión para una matrícula (o null).
   * Guard anti-duplicados.
   *
   * @param {number} sesionReforzamientoId
   * @param {number} matriculaMateriaId
   * @returns {Promise<Object|null>}
   */
  async findBySesionAndMatricula(_sesionReforzamientoId, _matriculaMateriaId) {
    throw new Error('Method findBySesionAndMatricula() must be implemented');
  }
}
