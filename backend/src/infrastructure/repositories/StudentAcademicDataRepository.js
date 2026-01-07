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
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
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
   * Maneja todos los criterios de búsqueda: studentId, careerId, managementId, academicState, registrationState
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante (estudianteId)
   *   - careerId: ID de la carrera (carreraId)
   *   - managementId: ID de la gestión de ingreso (gestionIngresoId)
   *   - academicState: Estado académico (estadoAcademico)
   *   - registrationState: Estado de registro (estadoRegistro)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.managementId) {
      where.gestionIngresoId = filters.managementId;
    }
    if (filters.academicState) {
      where.estadoAcademico = filters.academicState;
    }
    if (filters.registrationState) {
      where.estadoRegistro = filters.registrationState;
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
  getDefaultSort() { return []; }

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

  // NOTA: Los métodos específicos (findByEstudianteId, findByCarreraId) han sido eliminados.
  // Ahora se usan los métodos base de IRepository:
  // - findBy({ studentId }) para buscar un solo registro por estudiante
  // - findAll({ studentId }) para buscar todos los registros por estudiante
  // - findAll({ careerId }) para buscar todos los registros por carrera
}

