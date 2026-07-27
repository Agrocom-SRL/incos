import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ISesionRefuerzoEstudianteRepository
 *
 * Estudiantes (por matrícula) de sesiones de refuerzo
 * (tabla `sesion_refuerzo_estudiantes`, módulo TUT).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ISesionRefuerzoEstudianteRepository extends IRepository {
  /**
   * Estudiantes vigentes de una sesión.
   *
   * @param {number} sesionRefuerzoId
   * @returns {Promise<Array<Object>>}
   */
  async findBySesionId(_sesionRefuerzoId) {
    throw new Error('Method findBySesionId() must be implemented');
  }

  /**
   * Estudiante vigente de la sesión para una matrícula (o null).
   * Guard anti-duplicados.
   *
   * @param {number} sesionRefuerzoId
   * @param {number} matriculaMateriaId
   * @returns {Promise<Object|null>}
   */
  async findBySesionAndMatricula(_sesionRefuerzoId, _matriculaMateriaId) {
    throw new Error('Method findBySesionAndMatricula() must be implemented');
  }
}
