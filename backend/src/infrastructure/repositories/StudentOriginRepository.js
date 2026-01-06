import { IEstudianteOrigenRepository } from '../../domain/interfaces/repositories/IEstudianteOrigenRepository.js';
import { EstudianteOrigen as EstudianteOrigenModel } from '../database/models/estudiante_origen.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentOriginMapper } from '../mappers/StudentOriginMapper.js';

/**
 * Repositorio de orígenes de estudiantes
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentOriginMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentOriginMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteOrigenRepository
 * - Usa StudentOriginMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstudianteOrigenRepository}
 * 
 * Esta clase cumple con el contrato IEstudianteOrigenRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - NOTA: createMultiple, deleteByEstudianteId y determinarTipoNacionalidadEstudiante deben moverse a casos de uso
 */
export class StudentOriginRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize
   * @returns {Object} Modelo EstudianteOrigen
   */
  getModel() {
    return EstudianteOrigenModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentOrigin|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentOriginMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda: studentId, countryId, originType, isPrincipal
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante (estudianteId)
   *   - countryId: ID del país (paisId)
   *   - originType: Tipo de origen (tipoOrigen)
   *   - isPrincipal: Si es principal (esPrincipal)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.countryId) {
      where.paisId = filters.countryId;
    }
    if (filters.originType) {
      where.tipoOrigen = filters.originType;
    }
    if (filters.isPrincipal !== undefined) {
      where.esPrincipal = filters.isPrincipal;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['ciudadNacimiento'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['esPrincipal', 'DESC'], ['tipoOrigen', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   * 
   * @param {StudentOrigin|Object} data - Entidad StudentOrigin o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentOriginMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   * 
   * @param {StudentOrigin|Object} data - Entidad StudentOrigin o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentOriginMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentOrigins';
  }

  // NOTA: Los métodos específicos (findByEstudianteId, createMultiple, deleteByEstudianteId, 
  // determinarTipoNacionalidadEstudiante, determinarTipoNacionalidad, origenesToPresentation) han sido eliminados.
  // Ahora se usan los métodos base de IRepository:
  // - findAll({ studentId }) para buscar todos los orígenes por estudiante
  // - create() múltiples veces en un loop para crear múltiples orígenes (debe hacerse en caso de uso)
  // - delete() múltiples veces en un loop para eliminar todos los orígenes (debe hacerse en caso de uso)
  // - determinarTipoNacionalidadEstudiante debe moverse a un caso de uso o servicio
}

