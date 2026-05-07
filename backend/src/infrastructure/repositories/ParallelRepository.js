import { IParallelRepository } from '../../domain/interfaces/repositories/IParallelRepository.js';
import { Paralelo as ParaleloModel } from '../database/models/paralelo.js';
import { BaseRepository } from './BaseRepository.js';
import { ParallelMapper } from '../mappers/ParallelMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * Implementación del repositorio de paralelos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ParallelMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ParallelMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IParallelRepository
 * - Usa ParallelMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IParallelRepository}
 * 
 * Esta clase cumple con el contrato IParallelRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class ParallelRepository extends BaseRepository {
  getModel() {
    return ParaleloModel;
  }

  toEntity(model) {
    return ParallelMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Parallel
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ careerId: 1 }) → Busca paralelos de una carrera
   * - findAll({ periodId: 2, shift: 'MAÑANA' }) → Busca paralelos de un periodo y turno
   * - findBy({ careerId: 1, periodId: 2, name: 'A' }) → Busca paralelo específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - careerId: ID de la carrera
   *   - periodId: ID del periodo
   *   - name: Nombre del paralelo (búsqueda exacta, para búsqueda de texto usar search())
   *   - shift: Turno (MAÑANA, TARDE, NOCHE)
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.periodId) {
      where.periodoId = filters.periodId;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.shift) {
      where.turno = filters.shift;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
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
    return ['nombre', 'descripcion'];
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

  mapDataToModel(data, userId = null) {
    return ParallelMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ParallelMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'parallels';
  }

  /**
   * Obtiene estadísticas de inscripción por paralelo para una gestión y datos del periodo.
   * Consulta la vista vista_paralelos_estadisticas_gestion_resueltas
   * (backend/database/03-views/57-vista-paralelos-estadisticas-gestion-resueltas.sql).
   *
   * @param {number[]} parallelIds - IDs de paralelos
   * @param {number} managementId - ID de la gestión académica
   * @returns {Promise<Array>} Array de objetos planos: paralelo_id, total_inscritos, total_hombres, total_mujeres, periodo_numero, periodo_nombre
   */
  async obtenerEstadisticasYPeriodoPorGestion(parallelIds, managementId) {
    if (!Array.isArray(parallelIds) || parallelIds.length === 0) {
      return [];
    }

    const placeholders = parallelIds.map(() => '?').join(',');
    const query = `
      SELECT
        paralelo_id,
        gestion_id,
        total_inscritos,
        total_hombres,
        total_mujeres,
        periodo_numero,
        periodo_nombre
      FROM vista_paralelos_estadisticas_gestion_resueltas
      WHERE paralelo_id IN (${placeholders})
        AND gestion_id = ?
    `;

    const results = await sequelize.query(query, {
      replacements: [...parallelIds, managementId],
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  }

  async obtenerParalelosEstadoDashboard(filters = {}) {
    const where = [];
    const replacements = {};

    if (filters.carrera_id != null) {
      where.push('carrera_id = :carrera_id');
      replacements.carrera_id = Number(filters.carrera_id);
    }
    if (filters.turno) {
      where.push('turno = :turno');
      replacements.turno = String(filters.turno).toUpperCase();
    }

    const query = `
      SELECT
        paralelo_id,
        paralelo_nombre,
        turno,
        carrera_id,
        carrera_nombre,
        carrera_color_hex,
        periodo_nombre,
        asignaturas_requeridas,
        cursos_con_horario,
        estado
      FROM vista_horarios_paralelo_estado
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY carrera_nombre ASC, periodo_nombre ASC, paralelo_nombre ASC
    `;

    return sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  async obtenerAsignaturasSinCursoDashboard() {
    const query = `
      SELECT
        carrera_id,
        carrera_nombre,
        periodo_id,
        periodo_nombre,
        materia_sigla,
        materia_nombre,
        horas_semanales
      FROM vista_horarios_asignaturas_sin_curso
      ORDER BY carrera_nombre ASC, periodo_nombre ASC, materia_nombre ASC
    `;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  }

  async obtenerCapacidadTurnoDashboard() {
    const query = `
      SELECT
        turno,
        aulas_en_uso,
        total_aulas,
        porcentaje_ocupacion
      FROM vista_horarios_capacidad_turno
      ORDER BY turno ASC
    `;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  }
}
