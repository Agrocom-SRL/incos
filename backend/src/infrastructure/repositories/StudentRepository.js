import { IStudentRepository } from '../../domain/interfaces/repositories/IStudentRepository.js';
import { Estudiante as EstudianteModel } from '../database/models/estudiante.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentMapper } from '../mappers/StudentMapper.js';
import { Op } from 'sequelize';

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
 * - Infrastructure Layer: Implementación concreta de IStudentRepository
 * - Usa StudentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IStudentRepository}
 * 
 * Esta clase cumple con el contrato IStudentRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCI(), findByCodigo(), findByEmail() y getNextStudentNumber() que son requeridos por IStudentRepository
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
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

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

  /**
   * Método específico: Buscar estudiante por CI y expedición
   * 
   * @param {string} ci - Cédula de identidad
   * @param {string} expedicion - Expedición del CI
   * @returns {Promise<Student|null>} Entidad Student o null
   */
  async findByCI(ci, expedicion) {
    const model = await this.getModel().findOne({
      where: {
        ci: ci,
        expedicion: expedicion.toUpperCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return StudentMapper.toEntity(model);
  }

  /**
   * Método específico: Buscar estudiante por código
   * 
   * @param {string} codigoEstudiante - Código del estudiante
   * @returns {Promise<Student|null>} Entidad Student o null
   */
  async findByCodigo(codigoEstudiante) {
    const model = await this.getModel().findOne({
      where: {
        codigoEstudiante: codigoEstudiante,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return StudentMapper.toEntity(model);
  }

  /**
   * Método específico: Buscar estudiante por email
   * 
   * @param {string} email - Email personal del estudiante
   * @returns {Promise<Student|null>} Entidad Student o null
   */
  async findByEmail(email) {
    const model = await this.getModel().findOne({
      where: {
        emailPersonal: email.toLowerCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return StudentMapper.toEntity(model);
  }

  /**
   * Método específico: Obtiene el siguiente número para generar código de estudiante
   * @param {string} gestionCodigo - Código de la gestión (ej: "2025-1")
   * @returns {Promise<number>}
   */
  async getNextStudentNumber(gestionCodigo) {
    // Buscar el último código que empiece con el código de gestión
    const prefix = gestionCodigo.replace('-', '');
    const pattern = `${prefix}%`;

    const lastStudent = await this.getModel().findOne({
      where: {
        codigoEstudiante: { [Op.like]: pattern },
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['codigoEstudiante', 'DESC']],
    });

    if (!lastStudent) {
      return 1; // Primer estudiante de la gestión
    }

    // Extraer el número del último código (ej: "20251-001" -> 1)
    const lastCode = lastStudent.codigoEstudiante;
    const parts = lastCode.split('-');
    if (parts.length === 2) {
      const lastNumber = parseInt(parts[1], 10);
      return isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    return 1;
  }
}

