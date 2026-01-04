import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteDocumentoEntregaRepository
 * Define el contrato que debe cumplir el repositorio de entregas de documentos de estudiantes
 * Extiende IRepository para métodos comunes
 */
export class IEstudianteDocumentoEntregaRepository extends IRepository {
  /**
   * Buscar entregas por estudiante
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentDocumentDelivery[]>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }

  /**
   * Buscar entregas por documento
   * @param {number} documentacionId - ID del documento
   * @returns {Promise<StudentDocumentDelivery[]>}
   */
  async findByDocumentacionId(documentacionId) {
    throw new Error('Method findByDocumentacionId must be implemented');
  }

  /**
   * Buscar entrega por estudiante y documento
   * @param {number} estudianteId - ID del estudiante
   * @param {number} documentacionId - ID del documento
   * @returns {Promise<StudentDocumentDelivery|null>}
   */
  async findByEstudianteAndDocumentacion(estudianteId, documentacionId) {
    throw new Error('Method findByEstudianteAndDocumentacion must be implemented');
  }
}

