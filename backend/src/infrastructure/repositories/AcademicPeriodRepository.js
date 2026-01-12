import { IPeriodoAcademicoRepository } from '../../domain/interfaces/repositories/IPeriodoAcademicoRepository.js';
import { PeriodoAcademico as PeriodoAcademicoModel } from '../database/models/periodo_academico.js';
import { BaseRepository } from './BaseRepository.js';
import { AcademicPeriodMapper } from '../mappers/AcademicPeriodMapper.js';

/**
 * Implementación del repositorio de periodos académicos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a AcademicPeriodMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa AcademicPeriodMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPeriodoAcademicoRepository
 * - Usa AcademicPeriodMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IPeriodoAcademicoRepository}
 * 
 * Esta clase cumple con el contrato IPeriodoAcademicoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class AcademicPeriodRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de periodos académicos
   * @returns {Object} Modelo PeriodoAcademico
   */
  getModel() {
    return PeriodoAcademicoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a AcademicPeriodMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {AcademicPeriod|null} Entidad de dominio
   */
  toEntity(model) {
    return AcademicPeriodMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.division) {
      where.division = filters.division;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'codigo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { 
    return [['numeroOrden', 'ASC'], ['fechaInicio', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a AcademicPeriodMapper
   * 
   * @param {AcademicPeriod|Object} data - Entidad AcademicPeriod o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return AcademicPeriodMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a AcademicPeriodMapper
   * 
   * @param {AcademicPeriod|Object} data - Entidad AcademicPeriod o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return AcademicPeriodMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'academicPeriods';
  }
}
