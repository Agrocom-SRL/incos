import { IEstudianteRepository } from '../../domain/interfaces/repositories/IEstudianteRepository.js';
import { Estudiante as EstudianteModel } from '../database/models/estudiante.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentMapper } from '../mappers/StudentMapper.js';

/**
 * Implementación del repositorio de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteRepository
 * - Usa StudentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstudianteRepository}
 * 
 * Esta clase cumple con el contrato IEstudianteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 */
export class StudentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de estudiantes
   * @returns {Object} Modelo Estudiante
   */
  getModel() {
    return EstudianteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Student|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda: ci, expedicion, studentCode, personalEmail, userId, gender, hasDisability
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - ci: Cédula de identidad
   *   - expedicion: Expedición del CI (se convierte a mayúsculas)
   *   - studentCode: Código del estudiante (codigoEstudiante)
   *   - personalEmail: Email personal (se convierte a minúsculas)
   *   - userId: ID del usuario
   *   - gender: Género
   *   - hasDisability: Si tiene discapacidad
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Criterios de búsqueda únicos (para findBy)
    if (filters.ci && filters.expedicion) {
      where.ci = filters.ci;
      where.expedicion = filters.expedicion.toUpperCase();
    }
    if (filters.studentCode) {
      where.codigoEstudiante = filters.studentCode;
    }
    if (filters.personalEmail) {
      where.emailPersonal = filters.personalEmail.toLowerCase();
    }

    // Filtros generales (para findAll)
    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.gender) {
      where.genero = filters.gender;
    }
    if (filters.hasDisability !== undefined) {
      where.tieneDiscapacidad = filters.hasDisability;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigoEstudiante', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal'];
  }

  /**
   * Retorna el orden por defecto
   * Orden: primero por código de estudiante (año y correlativo), luego por apellidos y nombres
   * @returns {Array}
   */
  getDefaultSort() {
    return [['codigoEstudiante', 'ASC'], ['apellidoPaterno', 'ASC'], ['apellidoMaterno', 'ASC'], ['nombres', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentMapper
   * 
   * @param {Student|Object} data - Entidad Student o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentMapper
   * 
   * @param {Student|Object} data - Entidad Student o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'students';
  }

  // NOTA: Los métodos específicos (findByCI, findByCodigo, findByEmail, getNextStudentNumber) 
  // han sido eliminados. Ahora se usan los métodos base de IRepository:
  // - findBy({ ci, expedicion }) para buscar por CI
  // - findBy({ studentCode }) para buscar por código
  // - findBy({ personalEmail }) para buscar por email
  // - getNextStudentNumber debe moverse a un caso de uso o servicio de generación de códigos
}

