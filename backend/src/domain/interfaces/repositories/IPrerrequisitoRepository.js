import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPrerrequisitoRepository
 * Define el contrato que debe cumplir el repositorio de prerrequisitos
 */
export class IPrerrequisitoRepository extends IRepository {
  /**
   * Buscar prerrequisitos por materia
   * @param {number} materiaId
   * @returns {Promise<Object[]>}
   */
  async findByMateriaId(materiaId) {
    throw new Error('Method findByMateriaId must be implemented');
  }
}
