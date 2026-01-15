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
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
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
   * Maneja todos los criterios de búsqueda de la entidad Student
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ ci: '1234567', expedition: 'LP' }) → Busca por CI y expedición
   * - findBy({ studentCode: '2025-001' }) → Busca por código de estudiante
   * - findAll({ userId: 1 }) → Busca estudiantes de un usuario
   * - findAll({ gender: 'M' }) → Busca por género
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - ci: Cédula de identidad
   *   - expedition: Expedición del CI (se convierte a mayúsculas)
   *   - studentCode: Código del estudiante (codigoEstudiante)
   *   - personalEmail: Email personal (se convierte a minúsculas)
   *   - userId: ID del usuario
   *   - gender: Género
   *   - hasDisability: Si tiene discapacidad (true/false)
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
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['codigoEstudiante', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal'];
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
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

