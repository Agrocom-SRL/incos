import { IEstudianteDatosAcademicosRepository } from '../../domain/interfaces/repositories/IEstudianteDatosAcademicosRepository.js';
import { EstudianteDatosAcademicos as EstudianteDatosAcademicosModel } from '../database/models/estudiante_datos_academicos.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentAcademicDataMapper } from '../mappers/StudentAcademicDataMapper.js';
import { sequelize } from '../database/sequelize.js';

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
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
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
   * Maneja todos los criterios de búsqueda de la entidad StudentAcademicData
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ studentId: 1 }) → Busca datos académicos de un estudiante
   * - findAll({ careerId: 1 }) → Busca estudiantes de una carrera
   * - findAll({ academicState: 'REGULAR' }) → Busca estudiantes regulares
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante
   *   - careerId: ID de la carrera
   *   - managementId: ID de la gestión de ingreso
   *   - academicState: Estado académico (REGULAR, RETIRADO, ABANDONO, etc.)
   *   - registrationState: Estado de registro (BORRADOR, PENDIENTE, ADMITIDO)
   *   - annualAverage: Promedio anual
   *   - photoUrl: URL de la foto
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
    if (filters.annualAverage !== undefined) {
      where.promedioAnual = filters.annualAverage;
    }
    if (filters.photoUrl !== undefined) {
      where.fotoUrl = filters.photoUrl;
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
    return []; // Sin campos de texto para búsqueda por término (promedio_anual es numérico)
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studentAcademicData';
  }

  /**
   * Obtiene datos académicos desde vista_estudiante_datos_academicos.
   * Consulta directa a la vista. Retorna objetos planos, no entidades.
   *
   * @param {Object} filters - Filtros opcionales
   *   - estudiante_id: ID del estudiante
   *   - codigo_estudiante: Código único del estudiante
   *   - ci: Cédula de identidad
   * @param {number[]|null} estudianteIds - Si se pasa, filtra por estudiante_id IN (...). Ignora filters para estudiante.
   * @returns {Promise<Array>} Array de objetos planos con datos académicos
   */
  async obtenerDatosAcademicos(filters = {}, estudianteIds = null) {
    const whereConditions = [];
    const replacements = [];

    if (estudianteIds != null && Array.isArray(estudianteIds) && estudianteIds.length > 0) {
      const placeholders = estudianteIds.map(() => '?').join(', ');
      whereConditions.push(`estudiante_id IN (${placeholders})`);
      replacements.push(...estudianteIds);
    } else {
      if (filters.estudiante_id !== undefined) {
        whereConditions.push('estudiante_id = ?');
        replacements.push(filters.estudiante_id);
      }
      if (filters.codigo_estudiante !== undefined) {
        whereConditions.push('codigo_estudiante = ?');
        replacements.push(filters.codigo_estudiante);
      }
      if (filters.ci !== undefined) {
        whereConditions.push('ci = ?');
        replacements.push(filters.ci);
      }
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT *
      FROM vista_estudiante_datos_academicos
      ${whereClause}
      ORDER BY estudiante_id ASC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  }

  /**
   * Obtiene datos académicos por una lista de IDs de estudiante.
   * Delega en obtenerDatosAcademicos({}, estudianteIds).
   *
   * @param {number[]} estudianteIds - IDs de estudiantes
   * @returns {Promise<Array>} Array de objetos planos con datos académicos
   */
  async obtenerDatosAcademicosPorEstudianteIds(estudianteIds) {
    return this.obtenerDatosAcademicos({}, estudianteIds);
  }

  /**
   * Obtiene el resumen académico por estudiante desde vista_estudiante_resumen_academico
   * (una fila por estudiante: periodo/paralelo actual en la gestión vigente +
   * promedio entero del historial académico).
   *
   * @param {number[]} estudianteIds - IDs de estudiantes
   * @returns {Promise<Array>} Array de objetos planos con el resumen académico
   */
  async obtenerResumenAcademicoPorEstudianteIds(estudianteIds) {
    if (!Array.isArray(estudianteIds) || estudianteIds.length === 0) {
      return [];
    }

    const placeholders = estudianteIds.map(() => '?').join(', ');
    const query = `
      SELECT
        estudiante_id,
        periodo_actual_numero,
        periodo_actual_nombre,
        paralelo_actual,
        promedio_historial
      FROM vista_estudiante_resumen_academico
      WHERE estudiante_id IN (${placeholders})
    `;

    return sequelize.query(query, {
      replacements: estudianteIds,
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
