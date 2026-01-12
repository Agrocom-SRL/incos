import { Op } from 'sequelize';
import { IClassroomRepository } from '../../domain/interfaces/repositories/IClassroomRepository.js';
import { Aula as AulaModel } from '../database/models/aula.js';
import { BaseRepository } from './BaseRepository.js';
import { ClassroomMapper } from '../mappers/ClassroomMapper.js';

/**
 * Implementación del repositorio de aulas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ClassroomMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ClassroomMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IClassroomRepository
 * - Usa ClassroomMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IClassroomRepository}
 */
export class ClassroomRepository extends BaseRepository {
  getModel() {
    return AulaModel;
  }

  toEntity(model) {
    return ClassroomMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.category) {
      where.categoria = filters.category;
    }
    if (filters.minCapacity) {
      where.capacidad = { [Op.gte]: filters.minCapacity };
    }
    if (filters.maxCapacity) {
      where.capacidad = { [Op.lte]: filters.maxCapacity };
    }

    return where;
  }

  getSearchFields() {
    return ['codigo', 'nombre', 'observaciones'];
  }

  getDefaultSort() {
    return [['codigo', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return ClassroomMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ClassroomMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'classrooms';
  }
}
