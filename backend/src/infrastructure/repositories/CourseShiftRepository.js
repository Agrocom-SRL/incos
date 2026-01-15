import { ITurnoCursoRepository } from '../../domain/interfaces/repositories/ITurnoCursoRepository.js';
import { TurnoCurso as TurnoCursoModel } from '../database/models/turno_curso.js';
import { BaseRepository } from './BaseRepository.js';
import { CourseShiftMapper } from '../mappers/CourseShiftMapper.js';

/**
 * Implementación del repositorio de turnos de cursos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CourseShiftMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CourseShiftMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITurnoCursoRepository
 * - Usa CourseShiftMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ITurnoCursoRepository}
 * 
 * Esta clase cumple con el contrato ITurnoCursoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminó findByAsignacionId() porque es redundante.
 * Usar en su lugar:
 * - findAll({ assignmentId: X }) → Reemplaza findByAsignacionId()
 */
export class CourseShiftRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de turnos de cursos
   * @returns {Object} Modelo TurnoCurso
   */
  getModel() {
    return TurnoCursoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CourseShiftMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {CourseShift|null} Entidad de dominio
   */
  toEntity(model) {
    return CourseShiftMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad CourseShift
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ assignmentId: 1 }) → Busca turnos de una asignación docente
   * - findAll({ weekDay: 'LUNES' }) → Busca turnos de lunes
   * - findBy({ assignmentId: 1, weekDay: 'LUNES', startTime: '08:00:00' }) → Busca turno específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - assignmentId: ID de la asignación docente
   *   - shiftId: ID del turno
   *   - weekDay: Día de la semana (LUNES, MARTES, etc.)
   *   - startTime: Hora de inicio
   *   - endTime: Hora de fin
   *   - classroom: Aula (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.assignmentId) {
      where.asignacionId = filters.assignmentId;
    }
    if (filters.shiftId) {
      where.turnoId = filters.shiftId;
    }
    if (filters.weekDay) {
      where.diaSemana = filters.weekDay;
    }
    if (filters.startTime !== undefined) {
      where.horaInicio = filters.startTime;
    }
    if (filters.endTime !== undefined) {
      where.horaFin = filters.endTime;
    }
    if (filters.classroom !== undefined) {
      where.aula = filters.classroom;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['aula'];
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Delega el orden al BaseRepository que ordena por ID ASC
   * 
   * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository (id ASC)
   */
  getDefaultSort() {
    return []; // Usa el orden por defecto de BaseRepository: [['id', 'ASC']]
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a CourseShiftMapper
   * 
   * @param {CourseShift|Object} data - Entidad CourseShift o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CourseShiftMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CourseShiftMapper
   * 
   * @param {CourseShift|Object} data - Entidad CourseShift o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CourseShiftMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'courseShifts';
  }
}

