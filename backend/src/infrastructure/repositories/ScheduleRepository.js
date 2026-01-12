import { IScheduleRepository } from '../../domain/interfaces/repositories/IScheduleRepository.js';
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
 * - Infrastructure Layer: Implementación concreta de IScheduleRepository
 * - Usa ScheduleMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IScheduleRepository}
 * 
 * Esta clase cumple con el contrato IScheduleRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 */
export class ScheduleRepository extends BaseRepository {
  getModel() {
    return HorarioModel;
  }

  toEntity(model) {
    return ScheduleMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.scheduleType) {
      where.tipoHorario = filters.scheduleType;
    }
    if (filters.shift) {
      where.turno = filters.shift;
    }
    if (filters.day) {
      where.dia = filters.day;
    }
    if (filters.blockNumber) {
      where.numeroBloque = filters.blockNumber;
    }

    return where;
  }

  getSearchFields() {
    return ['nombre'];
  }

  getDefaultSort() {
    return [['turno', 'ASC'], ['numeroBloque', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return ScheduleMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ScheduleMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'schedules';
  }
}
