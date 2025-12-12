import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IDocumentoEstudianteRepository
 * Define el contrato que debe cumplir el repositorio de documentos de estudiantes
 */
export class IDocumentoEstudianteRepository extends IRepository {
  /**
   * Buscar documentos por estudiante
   * @param {number} estudianteId
   * @returns {Promise<Object[]>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }

  /**
   * Buscar documentos por tipo
   * @param {string} tipoDocumento
   * @returns {Promise<Object[]>}
   */
  async findByTipoDocumento(tipoDocumento) {
    throw new Error('Method findByTipoDocumento must be implemented');
  }
}
