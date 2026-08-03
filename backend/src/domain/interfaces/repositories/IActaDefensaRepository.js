import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IActaDefensaRepository
 *
 * Actas de defensa de grado (tabla raíz `actas_defensa` + satélite
 * `tribunal_acta_defensa`, módulo TIT · titulación, 22-modalidades-grado.sql
 * extensión 2026-08-01).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository. Extras propios del dominio:
 * creación con tribunal en transacción y consultas de correlativo/pertenencia.
 */
export class IActaDefensaRepository extends IRepository {
  /**
   * Crea el acta y sus 3 filas de tribunal en UNA transacción.
   * @param {Object} actaData - Datos de `actas_defensa` (camelCase)
   * @param {Array<Object>} tribunalRows - Filas de `tribunal_acta_defensa` (sin actaDefensaId, se asigna dentro)
   * @param {number|null} userId
   * @returns {Promise<Object>} Acta creada con `tribunal` anidado (ordenado por `orden`)
   */
  async createConTribunal(_actaData, _tribunalRows, _userId = null) {
    throw new Error('Method createConTribunal() must be implemented');
  }

  /**
   * Actas de un proyecto (EMITIDA + ANULADA), con tribunal incluido y
   * ordenado por `orden`.
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoId(_proyectoGradoId) {
    throw new Error('Method findByProyectoId() must be implemented');
  }

  /**
   * Acta EMITIDA vigente de un estudiante en un proyecto, o null.
   * @param {number} proyectoGradoId
   * @param {number} estudianteId
   * @returns {Promise<Object|null>}
   */
  async findEmitidaByProyectoEstudiante(_proyectoGradoId, _estudianteId) {
    throw new Error('Method findEmitidaByProyectoEstudiante() must be implemented');
  }

  /**
   * Máximo `numeroActa` ya asignado en una gestión (0 si no hay actas).
   * @param {number} gestionId
   * @returns {Promise<number>}
   */
  async maxNumeroActaByGestion(_gestionId) {
    throw new Error('Method maxNumeroActaByGestion() must be implemented');
  }

  /**
   * Acta por ID con tribunal incluido (para exportar el PDF).
   * @param {number} actaId
   * @returns {Promise<Object|null>}
   */
  async findByIdWithTribunal(_actaId) {
    throw new Error('Method findByIdWithTribunal() must be implemented');
  }
}
