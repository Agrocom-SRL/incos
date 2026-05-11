/**
 * Interfaz del Repositorio de Paralelos
 * Tabla: paralelos
 * 
 * Extiende IBaseRepository con métodos específicos de paralelos
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo Académico
 * - Feature: Paralelos
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IParaleloRepository extends IBaseRepository {

  /**
   * Obtiene los horarios completos de un paralelo
   * @param {Object} options - Opciones de consulta
   * @param {number} options.parallelId - ID del paralelo
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerHorarios(options = {}) {
    throw new Error('Method obtenerHorarios() must be implemented');
  }

  /**
   * GET /v1/paralelos/:id/cursos-oferta — oferta de cursos y materias sin curso.
   */
  async obtenerCursosOferta(options = {}) {
    throw new Error('Method obtenerCursosOferta() must be implemented');
  }

  /**
   * POST /v1/paralelos/:id/cursos
   * @param {Object} options
   * @param {number} options.parallelId
   * @param {Object} options.payload — asignaturaPlanId, cupoMinimo?, cupoMaximo?, colorHex?, codigo?
   */
  async crearCursoOferta(options = {}) {
    throw new Error('Method crearCursoOferta() must be implemented');
  }

  /**
   * Persiste el plan semanal (bloques) del paralelo.
   * PUT /v1/paralelos/:id/schedule
   *
   * @param {Object} options
   * @param {number} options.parallelId
   * @param {Array} options.schedules - courseSchedules (cursoId + bloques)
   */
  async persistirHorarios(options = {}) {
    throw new Error('Method persistirHorarios() must be implemented');
  }

  async obtenerParalelosEstadoDashboard(options = {}) {
    throw new Error('Method obtenerParalelosEstadoDashboard() must be implemented');
  }

  async obtenerAsignaturasSinCursoDashboard(options = {}) {
    throw new Error('Method obtenerAsignaturasSinCursoDashboard() must be implemented');
  }

  async obtenerCapacidadTurnoDashboard(options = {}) {
    throw new Error('Method obtenerCapacidadTurnoDashboard() must be implemented');
  }

  async obtenerAulasHorarios(options = {}) {
    throw new Error('Method obtenerAulasHorarios() must be implemented');
  }

  async asignarAulaHorario(options = {}) {
    throw new Error('Method asignarAulaHorario() must be implemented');
  }

  async obtenerHorariosPendientesSidebar(options = {}) {
    throw new Error('Method obtenerHorariosPendientesSidebar() must be implemented');
  }

  async obtenerHorariosPublicacionPlanes(options = {}) {
    throw new Error('Method obtenerHorariosPublicacionPlanes() must be implemented');
  }
}
