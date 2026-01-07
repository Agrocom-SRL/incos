import { ConfiguracionSistema as ConfiguracionSistemaModel } from '../database/models/configuracion_sistema.js';
import { BaseRepository } from './BaseRepository.js';
import { SystemConfigurationMapper } from '../mappers/SystemConfigurationMapper.js';
import { Op } from 'sequelize';

/**
 * Repositorio de configuración del sistema
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['clave', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a SystemConfigurationMapper
   * 
   * @param {SystemConfiguration|Object} data - Entidad SystemConfiguration o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
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
  mapDataToUpdate(data, userId = null) {
    return SystemConfigurationMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'configuraciones';
  }

  /**
   * Obtiene una configuración por su clave
   * 
   * @param {string} clave - Clave de la configuración
   * @param {Object} options - Opciones opcionales
   * @returns {Promise<SystemConfiguration|null>} Entidad SystemConfiguration o null
   */
  async findByClave(clave, options = {}) {
    const Model = this.getModel();
    const where = {
      clave,
    };

    if (!options.includeInactive) {
      where.activo = true;
    }

    const model = await Model.findOne({ where });
    return SystemConfigurationMapper.toEntity(model);
  }


  /**
   * Obtiene o crea una configuración por clave
   * 
   * @param {string} clave - Clave de la configuración
   * @param {string} valor - Valor por defecto si no existe
   * @param {string} tipo - Tipo de dato
   * @param {string} descripcion - Descripción
   * @param {number} userId - ID del usuario
   * @returns {Promise<SystemConfiguration>} Entidad SystemConfiguration
   */
  async findOrCreate(clave, valor, tipo = 'STRING', descripcion = null, userId = null) {
    const existing = await this.findByClave(clave, { includeInactive: true });
    
    if (existing) {
      return existing;
    }

    const data = {
      key: clave,
      value: valor,
      type: tipo,
      description: descripcion,
    };

    return await this.create(data, userId);
  }

  /**
   * Incrementa un valor numérico de configuración
   * 
   * @param {string} clave - Clave de la configuración
   * @param {number} incremento - Cantidad a incrementar (default: 1)
   * @param {number} userId - ID del usuario
   * @returns {Promise<SystemConfiguration>} Entidad SystemConfiguration actualizada
   */
  async incrementValue(clave, incremento = 1, userId = null) {
    // Obtener configuración actual
    const config = await this.findByClave(clave, { includeInactive: true });
    
    if (!config) {
      throw new Error(`Configuración con clave '${clave}' no encontrada`);
    }

    if (config.type !== 'NUMBER') {
      throw new Error(`La configuración '${clave}' no es de tipo NUMBER`);
    }

    const nuevoValor = (parseInt(config.value, 10) || 0) + incremento;
    
    return await this.update(config.id, { value: nuevoValor.toString() }, userId);
  }
}
