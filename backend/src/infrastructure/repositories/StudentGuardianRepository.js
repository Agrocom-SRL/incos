import { IEstudianteApoderadoRepository } from '../../domain/interfaces/repositories/IEstudianteApoderadoRepository.js';
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
 * - Infrastructure Layer: Implementación concreta de IEstudianteApoderadoRepository
 * - Usa StudentGuardianMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstudianteApoderadoRepository}
 * 
 * Esta clase cumple con el contrato IEstudianteApoderadoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
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
   * Maneja todos los criterios de búsqueda de la entidad StudentGuardian
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ studentId: 1 }) → Busca apoderados de un estudiante
   * - findAll({ isEmergencyContact: true }) → Busca contactos de emergencia
   * - findBy({ studentId: 1, relationshipTypeId: 2 }) → Busca apoderado específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante
   *   - relationshipTypeId: ID del tipo de parentesco
   *   - firstName: Nombre (búsqueda exacta, para búsqueda de texto usar search())
   *   - lastName: Apellidos (búsqueda exacta, para búsqueda de texto usar search())
   *   - cellphone1: Celular 1
   *   - cellphone2: Celular 2
   *   - livesWithStudent: Si vive con el estudiante (true/false)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.relationshipTypeId) {
      where.tipoParentescoId = filters.relationshipTypeId;
    }
    if (filters.firstName !== undefined) {
      where.nombres = filters.firstName;
    }
    if (filters.lastName !== undefined) {
      where.apellidos = filters.lastName;
    }
    if (filters.cellphone1 !== undefined) {
      where.celular1 = filters.cellphone1;
    }
    if (filters.cellphone2 !== undefined) {
      where.celular2 = filters.cellphone2;
    }
    if (filters.livesWithStudent !== undefined) {
      where.viveConEstudiante = filters.livesWithStudent;
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
    return ['nombres', 'apellidos', 'celular1', 'celular2'];
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studentGuardians';
  }
}

