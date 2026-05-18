import { IHorarioRepository } from '../../domain/interfaces/repositories/IHorarioRepository.js';
import { Horario as HorarioModel } from '../database/models/horario.js';
import { BaseRepository } from './BaseRepository.js';
import { ScheduleMapper } from '../mappers/ScheduleMapper.js';

/**
 * Implementación del repositorio de horarios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ScheduleMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ScheduleMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IHorarioRepository
 * - Usa ScheduleMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IHorarioRepository}
 * 
 * Esta clase cumple con el contrato IHorarioRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class ScheduleRepository extends BaseRepository {
  getModel() {
    return HorarioModel;
  }

  toEntity(model) {
    return ScheduleMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Schedule
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ scheduleType: 'CLASES' }) → Busca bloques de clases
   * - findAll({ shift: 'MAÑANA', day: 'LUNES' }) → Busca horarios de lunes en la mañana
   * - findBy({ day: 'LUNES', startTime: '08:00:00' }) → Busca horario específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - name: Nombre del horario (búsqueda exacta, para búsqueda de texto usar search())
   *   - day: Día de la semana (LUNES, MARTES, etc.)
   *   - startTime: Hora de inicio
   *   - endTime: Hora de fin
   *   - shift: Turno (MAÑANA, TARDE, NOCHE)
   *   - blockNumber: Número del bloque dentro del turno
   *   - scheduleType: Tipo de horario (CLASES, EVENTO, FERIADO, CAPACITACION)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.day) {
      where.dia = filters.day;
    }
    if (filters.startTime !== undefined) {
      where.horaInicio = filters.startTime;
    }
    if (filters.endTime !== undefined) {
      where.horaFin = filters.endTime;
    }
    if (filters.shift) {
      where.turno = filters.shift;
    }
    if (filters.blockNumber !== undefined) {
      where.numeroBloque = filters.blockNumber;
    }
    if (filters.scheduleType) {
      where.tipoHorario = filters.scheduleType;
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
    return ['nombre'];
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

  mapDataToModel(data, userId = null) {
    return ScheduleMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ScheduleMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'schedules';
  }
}
