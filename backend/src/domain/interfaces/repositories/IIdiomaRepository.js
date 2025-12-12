import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IIdiomaRepository
 * Define el contrato que debe cumplir el repositorio de idiomas
 */
export class IIdiomaRepository extends IRepository {
  /**
   * Buscar idioma por código ISO
   * @param {string} codigoIso
   * @returns {Promise<Object|null>}
   */
  async findByCodigoIso(codigoIso) {
    throw new Error('Method findByCodigoIso must be implemented');
  }
}
