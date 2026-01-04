import { IStudentApoderadoRepository } from '../../domain/interfaces/repositories/IStudentApoderadoRepository.js';
import { EstudianteApoderado as EstudianteApoderadoModel } from '../database/models/estudiante_apoderado.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentGuardianMapper } from '../mappers/StudentGuardianMapper.js';

/**
 * Implementación del repositorio de apoderados de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentGuardianMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentGuardianMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IStudentApoderadoRepository
 * - Usa StudentGuardianMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IStudentApoderadoRepository}
 * 
 * Esta clase cumple con el contrato IStudentApoderadoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() que es requerido por IStudentApoderadoRepository
 */
export class StudentGuardianRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de apoderados de estudiantes
   * @returns {Object} Modelo EstudianteApoderado
   */
  getModel() {
    return EstudianteApoderadoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentGuardianMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentGuardian|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentGuardianMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.relationshipTypeId) {
      where.tipoParentescoId = filters.relationshipTypeId;
    }
    if (filters.isEmergencyContact !== undefined) {
      where.esContactoEmergencia = filters.isEmergencyContact;
    }
    if (filters.isLegalGuardian !== undefined) {
      where.esApoderadoLegal = filters.isLegalGuardian;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombres', 'apellidos', 'ci', 'email', 'ocupacion', 'lugarTrabajo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['nombres', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentGuardianMapper
   * 
   * @param {StudentGuardian|Object} data - Entidad StudentGuardian o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentGuardianMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentGuardianMapper
   * 
   * @param {StudentGuardian|Object} data - Entidad StudentGuardian o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentGuardianMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentGuardians';
  }

  /**
   * Método específico: Buscar apoderados por estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentGuardian[]>} Array de entidades StudentGuardian
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['esContactoEmergencia', 'DESC'], ['esApoderadoLegal', 'DESC'], ['nombres', 'ASC']],
    });
    return StudentGuardianMapper.toEntityList(models);
  }
}

