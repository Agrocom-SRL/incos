import { Carrera as CarreraModel } from '../database/models/carrera.js';
import { BaseRepository } from './BaseRepository.js';
import { CareerMapper } from '../mappers/CareerMapper.js';

/**
 * Implementación del repositorio de carreras usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CareerMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CareerMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ICarreraRepository
 * - Usa CareerMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {ICarreraRepository}
 *
 * Esta clase cumple con el contrato ICarreraRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminó findByCodigo() porque es redundante.
 * Usar en su lugar:
 * - findBy({ code: 'SIS-INF' }) → Reemplaza findByCodigo()
 */
export class CareerRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de carreras
   * @returns {Object} Modelo Carrera
   */
  getModel() {
    return CarreraModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CareerMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Career|null} Entidad de dominio
   */
  toEntity(model) {
    return CareerMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Career
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findBy({ code: 'SIS-INF' }) → Busca por código
   * - findAll({ trainingArea: 'TECNOLOGIA' }) → Busca por área de formación
   * - findBy({ code: 'SIS-INF', name: 'Sistemas' }) → Busca por ambos criterios
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - code: Código de la carrera (búsqueda exacta, para búsqueda de texto usar search())
   *   - name: Nombre de la carrera (búsqueda exacta, para búsqueda de texto usar search())
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   *   - trainingArea: Área de formación
   *   - grantedTitle: Título otorgado
   *   - colorHex: Color hexadecimal
   *   - imagePath: Ruta de la imagen
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
    }
    if (filters.trainingArea !== undefined) {
      where.areaFormacion = filters.trainingArea;
    }
    if (filters.grantedTitle !== undefined) {
      where.tituloOtorgado = filters.grantedTitle;
    }
    if (filters.colorHex !== undefined) {
      where.colorHex = filters.colorHex;
    }
    if (filters.imagePath !== undefined) {
      where.imagenRuta = filters.imagePath;
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
    return ['codigo', 'nombre', 'descripcion'];
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
   * Delega la responsabilidad de mapeo a CareerMapper
   *
   * @param {Career|Object} data - Entidad Career o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return CareerMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CareerMapper
   *
   * @param {Career|Object} data - Entidad Career o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return CareerMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'careers';
  }

  /**
   * Conteo de materias y periodos distintos por carrera (planes de la carrera).
   * @param {number[]} carreraIds
   * @returns {Promise<Map<number, { cantidad_materias: number, cantidad_periodos: number }>>}
   */
  async findResumenAcademicoByCarreraIds(carreraIds = []) {
    const ids = [...new Set(carreraIds.filter((id) => Number.isFinite(Number(id))))];
    const map = new Map();
    if (!ids.length) return map;

    const sequelize = this.getModel().sequelize;
    const rows = await sequelize.query(
      `
      SELECT
        pe.carrera_id,
        COUNT(DISTINCT ap.materia_id) AS cantidad_materias,
        COUNT(DISTINCT p.id) AS cantidad_periodos
      FROM planes_estudios pe
      LEFT JOIN periodos p
        ON p.plan_estudio_id = pe.id AND p.deleted_at IS NULL
      LEFT JOIN asignaturas_plan ap
        ON ap.plan_estudio_id = pe.id AND ap.deleted_at IS NULL
      WHERE pe.carrera_id IN (:ids)
        AND pe.deleted_at IS NULL
      GROUP BY pe.carrera_id
      `,
      { replacements: { ids }, type: sequelize.QueryTypes.SELECT },
    );

    for (const row of rows ?? []) {
      map.set(Number(row.carrera_id), {
        cantidad_materias: Number(row.cantidad_materias) || 0,
        cantidad_periodos: Number(row.cantidad_periodos) || 0,
      });
    }
    return map;
  }

  /**
   * Matriz asignaturas por carrera (vista_base_carrera_asignaturas_matriz).
   * @param {number} carreraId
   * @returns {Promise<Object[]>}
   */
  async findAsignaturasMatrizByCarreraId(carreraId) {
    const sequelize = this.getModel().sequelize;
    const rows = await sequelize.query(
      `
      SELECT *
      FROM vista_base_carrera_asignaturas_matriz
      WHERE carrera_id = :carreraId
      ORDER BY periodo_numero ASC, periodo_orden ASC, materia_sigla ASC
      `,
      { replacements: { carreraId }, type: sequelize.QueryTypes.SELECT },
    );
    return Array.isArray(rows) ? rows : [];
  }
}
