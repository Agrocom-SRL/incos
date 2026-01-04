import { IEstudianteDatosAcademicosRepository } from '../../domain/interfaces/repositories/IEstudianteDatosAcademicosRepository.js';
import { EstudianteDatosAcademicos as EstudianteDatosAcademicosModel } from '../database/models/estudiante_datos_academicos.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentAcademicDataMapper } from '../mappers/StudentAcademicDataMapper.js';

/**
 * Implementación del repositorio de datos académicos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentAcademicDataMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentAcademicDataMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteDatosAcademicosRepository
 * - Usa StudentAcademicDataMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstudianteDatosAcademicosRepository}
 * 
 * Esta clase cumple con el contrato IEstudianteDatosAcademicosRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() y findByCarreraId() que son requeridos por IEstudianteDatosAcademicosRepository
 */
export class StudentAcademicDataRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de datos académicos de estudiantes
   * @returns {Object} Modelo EstudianteDatosAcademicos
   */
  getModel() {
    return EstudianteDatosAcademicosModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentAcademicDataMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentAcademicData|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentAcademicDataMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.managementId) {
      where.gestionIngresoId = filters.managementId;
    }
    if (filters.academicState) {
      where.estadoAcademico = filters.academicState;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['unidadEducativaProcedencia', 'motivoRetiro'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['gestionIngresoId', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentAcademicDataMapper
   * 
   * @param {StudentAcademicData|Object} data - Entidad StudentAcademicData o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentAcademicDataMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentAcademicDataMapper
   * 
   * @param {StudentAcademicData|Object} data - Entidad StudentAcademicData o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentAcademicDataMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentAcademicData';
  }

  /**
   * Método específico: Buscar datos académicos por estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentAcademicData|null>} Entidad StudentAcademicData o null si no se encuentra
   */
  async findByEstudianteId(estudianteId) {
    const model = await this.getModel().findOne({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['gestionIngresoId', 'DESC']],
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar estudiantes por carrera
   * 
   * @param {number} carreraId - ID de la carrera
   * @returns {Promise<StudentAcademicData[]>} Array de entidades StudentAcademicData
   */
  async findByCarreraId(carreraId) {
    const models = await this.getModel().findAll({
      where: {
        carreraId: carreraId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['gestionIngresoId', 'DESC']],
    });
    return StudentAcademicDataMapper.toEntityList(models);
  }
}

