import { IStudentBecaRepository } from '../../domain/interfaces/repositories/IStudentBecaRepository.js';
import { EstudianteBeca as EstudianteBecaModel } from '../database/models/estudiante_beca.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentScholarshipMapper } from '../mappers/StudentScholarshipMapper.js';

/**
 * Implementación del repositorio de becas de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentScholarshipMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentScholarshipMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IStudentBecaRepository
 * - Usa StudentScholarshipMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IStudentBecaRepository}
 * 
 * Esta clase cumple con el contrato IStudentBecaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() y findByGestionId() que son requeridos por IStudentBecaRepository
 */
export class StudentScholarshipRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de becas de estudiantes
   * @returns {Object} Modelo EstudianteBeca
   */
  getModel() {
    return EstudianteBecaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentScholarshipMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentScholarship|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentScholarshipMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.scholarshipId) {
      where.becaDescuentoId = filters.scholarshipId;
    }
    if (filters.state) {
      where.estado = filters.state;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['observaciones'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['fechaSolicitud', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentScholarshipMapper
   * 
   * @param {StudentScholarship|Object} data - Entidad StudentScholarship o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentScholarshipMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentScholarshipMapper
   * 
   * @param {StudentScholarship|Object} data - Entidad StudentScholarship o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentScholarshipMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentScholarships';
  }

  /**
   * Método específico: Buscar becas por estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentScholarship[]>} Array de entidades StudentScholarship
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaSolicitud', 'DESC']],
    });
    return StudentScholarshipMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar becas por gestión
   * 
   * @param {number} gestionId - ID de la gestión
   * @returns {Promise<StudentScholarship[]>} Array de entidades StudentScholarship
   */
  async findByGestionId(gestionId) {
    const models = await this.getModel().findAll({
      where: {
        gestionId: gestionId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaSolicitud', 'DESC']],
    });
    return StudentScholarshipMapper.toEntityList(models);
  }
}

