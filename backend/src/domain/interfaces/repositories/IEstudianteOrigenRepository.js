import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteOrigenRepository
 * Define el contrato que debe cumplir el repositorio de orígenes de estudiantes
 * Extiende IRepository para métodos comunes
 */
export class IEstudianteOrigenRepository extends IRepository {
  /**
   * Buscar orígenes por estudiante
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentOrigin[]>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }

  /**
   * Crear múltiples orígenes para un estudiante
   * @param {number} estudianteId - ID del estudiante
   * @param {Array<{countryId?: number, birthMunicipalityId?: number, birthCity?: string, nativeLanguageId?: number, secondaryLanguageId?: number, originType?: string, isPrincipal?: boolean}>} origenes - Array de orígenes
   * @param {number} userId - ID del usuario que crea
   * @returns {Promise<StudentOrigin[]>}
   */
  async createMultiple(estudianteId, origenes, userId = null) {
    throw new Error('Method createMultiple must be implemented');
  }

  /**
   * Eliminar todos los orígenes de un estudiante (soft delete)
   * @param {number} estudianteId - ID del estudiante
   * @param {number} userId - ID del usuario que elimina
   * @returns {Promise<number>} Número de registros eliminados
   */
  async deleteByEstudianteId(estudianteId, userId = null) {
    throw new Error('Method deleteByEstudianteId must be implemented');
  }

  /**
   * Determina el tipo de nacionalidad del estudiante basándose en sus orígenes
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<{tipo: string, origenes: StudentOrigin[]}>} Tipo de nacionalidad y array de entidades StudentOrigin
   */
  async determinarTipoNacionalidadEstudiante(estudianteId) {
    throw new Error('Method determinarTipoNacionalidadEstudiante must be implemented');
  }
}

