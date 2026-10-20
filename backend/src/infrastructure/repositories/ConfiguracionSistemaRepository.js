import { ConfiguracionSistema as ConfiguracionSistemaModel } from '../database/models/configuracion_sistema.js';
import { BaseRepository } from './BaseRepository.js';
import { SystemConfigurationMapper } from '../mappers/SystemConfigurationMapper.js';

/**
 * Repositorio de configuración del sistema
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * @implements {IConfiguracionSistemaRepository}
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a SystemConfigurationMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa SystemConfigurationMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta
 * - Usa SystemConfigurationMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * Esta clase cumple con el contrato del repositorio:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminaron findByClave(), findOrCreate() e incrementValue() porque son redundantes o deben estar en casos de uso.
 * Usar en su lugar:
 * - findBy({ key: 'CONFIG_KEY' }) → Reemplaza findByClave()
 * - findOrCreate() debe implementarse en caso de uso si es necesario
 * - incrementValue() debe implementarse en caso de uso si es necesario
 */
export class ConfiguracionSistemaRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize
   * @returns {Object} Modelo ConfiguracionSistema
   */
  getModel() {
    return ConfiguracionSistemaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a SystemConfigurationMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {SystemConfiguration|null} Entidad de dominio
   */
  toEntity(model) {
    return SystemConfigurationMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad SystemConfiguration
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findBy({ key: 'MAX_STUDENTS' }) → Busca configuración por clave
   * - findAll({ type: 'NUMBER' }) → Busca configuraciones numéricas
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - key: Clave de la configuración (búsqueda exacta, para búsqueda de texto usar search())
   *   - value: Valor de la configuración (búsqueda exacta)
   *   - type: Tipo de configuración (STRING, NUMBER, BOOLEAN, JSON)
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.key !== undefined) {
      where.clave = filters.key;
    }
    if (filters.value !== undefined) {
      where.valor = filters.value;
    }
    if (filters.type) {
      where.tipo = filters.type;
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
    return ['clave', 'descripcion'];
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
   * Delega la responsabilidad de mapeo a SystemConfigurationMapper
   *
   * @param {SystemConfiguration|Object} data - Entidad SystemConfiguration o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return SystemConfigurationMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a SystemConfigurationMapper
   *
   * @param {SystemConfiguration|Object} data - Entidad SystemConfiguration o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return SystemConfigurationMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'systemConfigurations';
  }

  // ============================================
  // Acceso clave-valor (configuracion_sistema es una tabla clave-valor).
  // ============================================

  /**
   * Valor (string) de una clave de configuración, o null si no existe.
   * @param {string} clave
   * @returns {Promise<string|null>}
   */
  async obtenerValorPorClave(clave) {
    const cfg = await this.findBy({ key: clave });
    return cfg ? (cfg.value ?? null) : null;
  }

  /**
   * Upsert de una clave de configuración (crea si no existe, actualiza el valor si existe).
   * @param {string} clave
   * @param {string|number|boolean} valor
   * @param {{ tipo?: string, descripcion?: string|null }} [meta]
   * @param {number|null} userId
   */
  async establecerValor(clave, valor, { tipo = 'STRING', descripcion = null } = {}, userId = null) {
    const existing = await this.findBy({ key: clave });
    if (existing) {
      return this.update(existing.id, { value: String(valor) }, userId);
    }
    return this.create(
      { key: clave, value: String(valor), type: tipo, description: descripcion },
      userId,
    );
  }
}
