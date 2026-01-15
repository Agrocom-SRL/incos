import { IEstudianteBecaRepository } from '../../domain/interfaces/repositories/IEstudianteBecaRepository.js';
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
 * - Infrastructure Layer: Implementación concreta de IEstudianteBecaRepository
 * - Usa StudentScholarshipMapper (Infrastructure Layer) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstudianteBecaRepository}
 * 
 * Esta clase cumple con el contrato IEstudianteBecaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminaron findByEstudianteId() y findByGestionId() porque son redundantes.
 * Usar en su lugar:
 * - findAll({ studentId: X }) → Reemplaza findByEstudianteId()
 * - findAll({ managementId: X }) → Reemplaza findByGestionId()
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
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['observaciones'];
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studentScholarships';
  }
}

