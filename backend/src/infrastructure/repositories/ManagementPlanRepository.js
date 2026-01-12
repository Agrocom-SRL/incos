import { IManagementPlanRepository } from '../../domain/interfaces/repositories/IManagementPlanRepository.js';
import { GestionPlan as GestionPlanModel } from '../database/models/gestion_plan.js';
import { BaseRepository } from './BaseRepository.js';
import { ManagementPlanMapper } from '../mappers/ManagementPlanMapper.js';

/**
 * Implementación del repositorio de planes habilitados por gestión usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ManagementPlanMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ManagementPlanMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IManagementPlanRepository
 * - Usa ManagementPlanMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IManagementPlanRepository}
 */
export class ManagementPlanRepository extends BaseRepository {
  getModel() {
    return GestionPlanModel;
  }

  toEntity(model) {
    return ManagementPlanMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.studyPlanId) {
      where.planEstudioId = filters.studyPlanId;
    }
    if (filters.state) {
      where.estado = filters.state;
    }

    return where;
  }

  getSearchFields() {
    return ['nombre'];
  }

  getDefaultSort() {
    return [['gestionId', 'DESC'], ['nombre', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return ManagementPlanMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ManagementPlanMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'managementPlans';
  }
}
