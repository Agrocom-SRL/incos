import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ITutoriaIntegranteRepository
 *
 * Integrantes de proyectos de grado (tabla `tutoria_integrantes`, módulo TUT).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ITutoriaIntegranteRepository extends IRepository {
  /**
   * Integrantes vigentes (activo, no borrado) de un proyecto.
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(_proyectoGradoId) {
    throw new Error('Method findByProyectoGradoId() must be implemented');
  }

  /**
   * Integrante vigente de un proyecto para un estudiante (o null).
   * Guard de pertenencia: estudiante integrante ACTIVO del proyecto.
   *
   * @param {number} proyectoGradoId
   * @param {number} estudianteId
   * @returns {Promise<Object|null>}
   */
  async findActivoByProyectoAndEstudiante(_proyectoGradoId, _estudianteId) {
    throw new Error('Method findActivoByProyectoAndEstudiante() must be implemented');
  }

  /**
   * Filas de integrante ACTIVO del estudiante (todas sus membresías vigentes,
   * cualquiera sea el estado del proyecto). El use case cruza contra el estado
   * del proyecto para la regla "un solo proyecto vigente por estudiante".
   *
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  async findActivosByEstudianteId(_estudianteId) {
    throw new Error('Method findActivosByEstudianteId() must be implemented');
  }
}
