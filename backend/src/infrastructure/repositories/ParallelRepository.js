import { IParallelRepository } from '../../domain/interfaces/repositories/IParallelRepository.js';
import { Paralelo as ParaleloModel } from '../database/models/paralelo.js';
import { BaseRepository } from './BaseRepository.js';
import { ParallelMapper } from '../mappers/ParallelMapper.js';

/**
 * Implementación del repositorio de paralelos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ParallelMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ParallelMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IParallelRepository
 * - Usa ParallelMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IParallelRepository}
 */
export class ParallelRepository extends BaseRepository {
  getModel() {
    return ParaleloModel;
  }

  toEntity(model) {
    return ParallelMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.periodId) {
      where.periodoId = filters.periodId;
    }
    if (filters.shift) {
      where.turno = filters.shift;
    }

    return where;
  }

  getSearchFields() {
    return ['nombre', 'descripcion'];
  }

  getDefaultSort() {
    return [['nombre', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return ParallelMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ParallelMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'parallels';
  }
}
