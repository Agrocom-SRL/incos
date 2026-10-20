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
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
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
   * Maneja todos los criterios de búsqueda de la entidad AcademicPeriod
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ managementId: 1 }) → Busca periodos de una gestión
   * - findAll({ division: 'BIMESTRE' }) → Busca periodos bimestrales
   * - findBy({ managementId: 1, code: '2025-BIM1' }) → Busca periodo específico
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - managementId: ID de la gestión
   *   - code: Código del periodo (búsqueda exacta, para búsqueda de texto usar search())
   *   - name: Nombre del periodo (búsqueda exacta, para búsqueda de texto usar search())
   *   - division: División (PLANIFICACION, MENSUAL, BIMESTRE, etc.)
   *   - orderNumber: Número de orden
   *   - startDate: Fecha de inicio
   *   - endDate: Fecha de fin
   *   - colorHex: Color hexadecimal
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.division) {
      where.division = filters.division;
    }
    if (filters.orderNumber !== undefined) {
      where.numeroOrden = filters.orderNumber;
    }
    if (filters.startDate !== undefined) {
      where.fechaInicio = filters.startDate;
    }
    if (filters.endDate !== undefined) {
      where.fechaFin = filters.endDate;
    }
    if (filters.colorHex !== undefined) {
      where.colorHex = filters.colorHex;
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
    return ['nombre', 'codigo'];
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
   * Delega la responsabilidad de mapeo a AcademicPeriodMapper
   *
   * @param {AcademicPeriod|Object} data - Entidad AcademicPeriod o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
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
  mapDataToUpdate(data, _userId = null) {
    return AcademicPeriodMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'academicPeriods';
  }
}
