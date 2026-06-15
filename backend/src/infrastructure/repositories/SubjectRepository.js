import { IMateriaRepository } from '../../domain/interfaces/repositories/IMateriaRepository.js';
import { Materia as MateriaModel } from '../database/models/materia.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectMapper } from '../mappers/SubjectMapper.js';

/**
 * Implementación del repositorio de materias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a SubjectMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa SubjectMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IMateriaRepository
 * - Usa SubjectMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IMateriaRepository}
 * 
 * Esta clase cumple con el contrato IMateriaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminó findByCodigo() porque es redundante.
 * Usar en su lugar:
 * - findBy({ acronym: 'MAT-101' }) → Reemplaza findByCodigo()
 */
export class SubjectRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de materias
   * @returns {Object} Modelo Materia
   */
  getModel() {
    return MateriaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a SubjectMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Subject|null} Entidad de dominio
   */
  toEntity(model) {
    return SubjectMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Subject
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ acronym: 'MAT-101' }) → Busca por sigla
   * - findAll({ type: 'TEORICA' }) → Busca materias teóricas
   * - findAll({ knowledgeArea: 'CIENCIAS' }) → Busca por área de conocimiento
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - acronym: Sigla de la materia (búsqueda exacta, para búsqueda de texto usar search())
   *   - name: Nombre de la materia (búsqueda exacta, para búsqueda de texto usar search())
   *   - objectives: Objetivos (búsqueda exacta, para búsqueda de texto usar search())
   *   - classification: Clasificación
   *   - type: Tipo de materia (TEORICA, PRACTICA, TEORICA_PRACTICA)
   *   - id: ID de la materia (puede ser array para búsqueda múltiple)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.acronym !== undefined) {
      where.sigla = filters.acronym;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.objectives !== undefined) {
      where.objetivos = filters.objectives;
    }
    if (filters.classification !== undefined) {
      where.clasificacion = filters.classification;
    }
    if (filters.type) {
      where.tipo = filters.type;
    }
    if (filters.knowledgeArea) {
      where.areaConocimiento = filters.knowledgeArea;
    }
    // Filtro por IDs de materias (array) - usado cuando se filtra por periodo_id
    // Sequelize automáticamente convierte arrays a IN (1, 2, 3)
    if (filters.id) {
      where.id = filters.id;
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
    return ['codigo', 'nombre', 'nombreCorto', 'descripcion'];
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
   * Delega la responsabilidad de mapeo a SubjectMapper
   * 
   * @param {Subject|Object} data - Entidad Subject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return SubjectMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a SubjectMapper
   * 
   * @param {Subject|Object} data - Entidad Subject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return SubjectMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'subjects';
  }

  /**
   * Asignaturas de la materia en todos los planes (vista_base_materia_asignaturas_matriz).
   * @param {number} materiaId
   * @returns {Promise<Object[]>}
   */
  async findAsignaturasMatrizByMateriaId(materiaId) {
    const sequelize = this.getModel().sequelize;
    const rows = await sequelize.query(
      `
      SELECT *
      FROM vista_base_materia_asignaturas_matriz
      WHERE materia_id = :materiaId
      ORDER BY plan_vigente DESC, nombre_plan ASC, periodo_numero ASC, orden_visualizacion ASC
      `,
      { replacements: { materiaId }, type: sequelize.QueryTypes.SELECT },
    );
    return Array.isArray(rows) ? rows : [];
  }
}

