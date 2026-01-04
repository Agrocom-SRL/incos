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
 * - Infrastructure Layer: Implementación concreta
 * - Usa StudentDisabilityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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

  /**
   * Buscar discapacidades por estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentDisability[]>} Array de entidades StudentDisability
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
      order: this.getDefaultSort(),
    });

    return StudentDisabilityMapper.toEntityList(models);
  }

  /**
   * Crear múltiples discapacidades para un estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @param {Array<{disabilityTypeId: number, description?: string, disabilityDegree?: string, cause?: string}>} discapacidades - Array de discapacidades
   * @param {number} userId - ID del usuario que crea
   * @returns {Promise<StudentDisability[]>} Array de entidades StudentDisability creadas
   */
  async createMultiple(estudianteId, discapacidades, userId = null) {
    const created = [];
    
    for (const discapacidad of discapacidades) {
      const data = {
        studentId: estudianteId,
        disabilityTypeId: discapacidad.disabilityTypeId || discapacidad.tipoDiscapacidadId,
        description: discapacidad.description || discapacidad.descripcion || null,
        disabilityDegree: discapacidad.disabilityDegree || discapacidad.gradoDiscapacidad || discapacidad.gradoInvalidez || null,
        cause: discapacidad.cause || discapacidad.causa || null,
      };
      
      const createdItem = await this.create(data, userId);
      created.push(createdItem);
    }
    
    return created;
  }

  /**
   * Eliminar todas las discapacidades de un estudiante (soft delete)
   * @param {number} estudianteId
   * @param {number} userId
   * @returns {Promise<number>} Número de registros eliminados
   */
  async deleteByEstudianteId(estudianteId, userId = null) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
    });

    let deletedCount = 0;
    for (const model of models) {
      await this.delete(model.id, userId);
      deletedCount++;
    }

    return deletedCount;
  }
}

