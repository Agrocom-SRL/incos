import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IDocumentacionRepository
 * Define el contrato que debe cumplir el repositorio de documentación
 * Extiende IRepository para métodos comunes
 */
export class IDocumentacionRepository extends IRepository {
  /**
   * Buscar documentación por tipo
   * @param {string} tipoDocumento - Tipo de documento
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<Documentacion[]>}
   */
  async findByTipoDocumento(tipoDocumento, options = {}) {
    throw new Error('Method findByTipoDocumento must be implemented');
  }

  /**
   * Buscar documentación requerida
   * @param {Object} options - Opciones opcionales (includeInactive, tipoDocumento)
   * @returns {Promise<Documentacion[]>}
   */
  async findRequeridos(options = {}) {
    throw new Error('Method findRequeridos must be implemented');
  }
}

