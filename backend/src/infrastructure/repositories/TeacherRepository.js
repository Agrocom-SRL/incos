import { IDocenteRepository } from '../../domain/interfaces/repositories/IDocenteRepository.js';
import { Docente as DocenteModel } from '../database/models/docente.js';
import { BaseRepository } from './BaseRepository.js';
import { TeacherMapper } from '../mappers/TeacherMapper.js';

/**
 * Implementación del repositorio de docentes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a TeacherMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa TeacherMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IDocenteRepository
 * - Usa TeacherMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IDocenteRepository}
 * 
 * Esta clase cumple con el contrato IDocenteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCI() que es requerido por IDocenteRepository
 */
export class TeacherRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de docentes
   * @returns {Object} Modelo Docente
   */
  getModel() {
    return DocenteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a TeacherMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Teacher|null} Entidad de dominio
   */
  toEntity(model) {
    return TeacherMapper.toEntity(model);
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
    if (filters.laborState) {
      where.estadoLaboral = filters.laborState;
    }
    if (filters.contractType) {
      where.tipoContrato = filters.contractType;
    }
    if (filters.academicLevel) {
      where.nivelAcademico = filters.academicLevel;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal', 'tituloProfesional', 'especialidad'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a TeacherMapper
   * 
   * @param {Teacher|Object} data - Entidad Teacher o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return TeacherMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a TeacherMapper
   * 
   * @param {Teacher|Object} data - Entidad Teacher o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return TeacherMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'teachers';
  }

  /**
   * Método específico: Buscar docente por CI y expedición
   * 
   * @param {string} ci - Cédula de identidad
   * @param {string} expedicion - Expedición del CI
   * @returns {Promise<Teacher|null>} Entidad Teacher o null si no se encuentra
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
    return this.toEntity(model);
  }
}

