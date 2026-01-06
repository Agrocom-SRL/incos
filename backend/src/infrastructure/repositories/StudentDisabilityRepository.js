import { IEstudianteDiscapacidadRepository } from '../../domain/interfaces/repositories/IEstudianteDiscapacidadRepository.js';
import { EstudianteDiscapacidad as EstudianteDiscapacidadModel } from '../database/models/estudiante_discapacidad.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentDisabilityMapper } from '../mappers/StudentDisabilityMapper.js';

/**
 * Repositorio de discapacidades de estudiantes
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentDisabilityMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentDisabilityMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteDiscapacidadRepository
 * - Usa StudentDisabilityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstudianteDiscapacidadRepository}
 * 
 * Esta clase cumple con el contrato IEstudianteDiscapacidadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - NOTA: createMultiple y deleteByEstudianteId deben moverse a casos de uso
 */
export class StudentDisabilityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize
   * @returns {Object} Modelo EstudianteDiscapacidad
   */
  getModel() {
    return EstudianteDiscapacidadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentDisabilityMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentDisability|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentDisabilityMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda: studentId, disabilityTypeId
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante (estudianteId)
   *   - disabilityTypeId: ID del tipo de discapacidad (tipoDiscapacidadId)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.disabilityTypeId) {
      where.tipoDiscapacidadId = filters.disabilityTypeId;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['tipoDiscapacidadId', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentDisabilityMapper
   * 
   * @param {StudentDisability|Object} data - Entidad StudentDisability o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentDisabilityMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentDisabilityMapper
   * 
   * @param {StudentDisability|Object} data - Entidad StudentDisability o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentDisabilityMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentDisabilities';
  }

  // NOTA: Los métodos específicos (findByEstudianteId, createMultiple, deleteByEstudianteId) han sido eliminados.
  // Ahora se usan los métodos base de IRepository:
  // - findAll({ studentId }) para buscar todas las discapacidades por estudiante
  // - create() múltiples veces en un loop para crear múltiples discapacidades (debe hacerse en caso de uso)
  // - delete() múltiples veces en un loop para eliminar todas las discapacidades (debe hacerse en caso de uso)
}

