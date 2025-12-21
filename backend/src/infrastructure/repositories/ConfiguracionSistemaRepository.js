import { ConfiguracionSistema as ConfiguracionSistemaModel } from '../database/models/ConfiguracionSistema.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Repositorio de configuración del sistema
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * Convierte un modelo Sequelize a objeto plano
   * @param {Object} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    return {
      id: model.id,
      clave: model.clave,
      valor: model.valor,
      tipo: model.tipo,
      descripcion: model.descripcion,
      categoria: model.categoria,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['clave', 'descripcion', 'categoria'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['categoria', 'ASC'], ['clave', 'ASC']];
  }

  /**
   * Mapea datos a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      clave: data.clave,
      valor: data.valor,
      tipo: data.tipo || 'STRING',
      descripcion: data.descripcion,
      categoria: data.categoria,
      created_by: userId,
    };
  }

  /**
   * Mapea datos de actualización
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.valor !== undefined) {
      updateData.valor = data.valor;
    }
    if (data.tipo !== undefined) {
      updateData.tipo = data.tipo;
    }
    if (data.descripcion !== undefined) {
      updateData.descripcion = data.descripcion;
    }
    if (data.categoria !== undefined) {
      updateData.categoria = data.categoria;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }
    if (userId) {
      updateData.updated_by = userId;
    }

    return updateData;
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
   * @param {string} clave - Clave de la configuración
   * @param {Object} options - Opciones opcionales
   * @returns {Promise<Object|null>}
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
    return this.toEntity(model);
  }

  /**
   * Obtiene todas las configuraciones de una categoría
   * @param {string} categoria - Categoría de las configuraciones
   * @param {Object} options - Opciones opcionales
   * @returns {Promise<Object[]>}
   */
  async findByCategoria(categoria, options = {}) {
    const Model = this.getModel();
    const where = {
      categoria,
    };

    if (!options.includeInactive) {
      where.activo = true;
    }

    const models = await Model.findAll({
      where,
      order: this.getDefaultSort(),
    });

    return models.map((model) => this.toEntity(model));
  }

  /**
   * Obtiene o crea una configuración por clave
   * @param {string} clave - Clave de la configuración
   * @param {string} valor - Valor por defecto si no existe
   * @param {string} tipo - Tipo de dato
   * @param {string} descripcion - Descripción
   * @param {string} categoria - Categoría
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async findOrCreate(clave, valor, tipo = 'STRING', descripcion = null, categoria = null, userId = null) {
    const existing = await this.findByClave(clave, { includeInactive: true });
    
    if (existing) {
      return existing;
    }

    const data = {
      clave,
      valor,
      tipo,
      descripcion,
      categoria,
    };

    return await this.create(data, userId);
  }

  /**
   * Incrementa un valor numérico de configuración
   * @param {string} clave - Clave de la configuración
   * @param {number} incremento - Cantidad a incrementar (default: 1)
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async incrementValue(clave, incremento = 1, userId = null) {
    const Model = this.getModel();
    
    // Obtener configuración actual
    const config = await this.findByClave(clave, { includeInactive: true });
    
    if (!config) {
      throw new Error(`Configuración con clave '${clave}' no encontrada`);
    }

    if (config.tipo !== 'NUMBER') {
      throw new Error(`La configuración '${clave}' no es de tipo NUMBER`);
    }

    const nuevoValor = (parseInt(config.valor, 10) || 0) + incremento;
    
    return await this.update(config.id, { valor: nuevoValor.toString() }, userId);
  }
}
