import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ISesionClaseRepository (arquetipo A — escritura/CRUD).
 *
 * Gobierna la tabla `sesiones_clase` (schema 17). Una sesión = 1 curso × 1 fecha
 * en que se tomó asistencia; su existencia marca el día tomado y su estado
 * (ABIERTA/CERRADA) gobierna el cierre/reapertura del registro.
 *
 * Convención de capas:
 * ISesionClaseRepository → models/sesion_clase.js (`sesiones_clase`)
 * → SesionClaseRepository
 */
export class ISesionClaseRepository extends IRepository {
  /**
   * Inserta o reactiva la sesión (asignacion + fecha). Idempotente.
   * @param {number} _asignacionDocenteId
   * @param {string} _fecha YYYY-MM-DD
   * @param {object} _datos { esEspecial, motivo, periodoAcademicoId, horaInicio, horaFin }
   * @param {number} _usuarioId
   * @param {import('sequelize').Transaction} [_transaction]
   * @returns {Promise<{ id: number, creada: boolean }>}
   */
  async upsertSesion(_asignacionDocenteId, _fecha, _datos, _usuarioId, _transaction) {
    throw new Error('Method upsertSesion() must be implemented');
  }

  /**
   * Pone CERRADA todas las sesiones del curso en el bimestre.
   * @returns {Promise<number>} filas afectadas
   */
  async cerrarSesionesBimestre(_asignacionDocenteId, _periodoAcademicoId, _usuarioId) {
    throw new Error('Method cerrarSesionesBimestre() must be implemented');
  }

  /**
   * Vuelve ABIERTA todas las sesiones del curso en el bimestre.
   * @returns {Promise<number>} filas afectadas
   */
  async reabrirSesionesBimestre(_asignacionDocenteId, _periodoAcademicoId, _usuarioId) {
    throw new Error('Method reabrirSesionesBimestre() must be implemented');
  }

  /**
   * Sesiones de un curso en un rango de fechas.
   * @returns {Promise<Array<Object>>}
   */
  async listarSesionesCursoRango(_asignacionDocenteId, _desde, _hasta) {
    throw new Error('Method listarSesionesCursoRango() must be implemented');
  }

  /**
   * Fechas en que se tomó asistencia (días tomados) en el rango.
   * @returns {Promise<Array<{ fecha: string, sesionEstado: string }>>}
   */
  async listarFechasTomadas(_asignacionDocenteId, _desde, _hasta) {
    throw new Error('Method listarFechasTomadas() must be implemented');
  }
}
