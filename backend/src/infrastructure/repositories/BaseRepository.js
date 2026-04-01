import { Op } from 'sequelize';
import { IRepository } from '../../domain/interfaces/repositories/IRepository.js';
import { sequelize } from '../database/sequelize.js';

/** Tope de `limit` en `_queryViewPaged`; debe coincidir con `list.validator` (query limit max 10000). */
const LIST_VIEW_MAX_LIMIT = 10000;

/**
 * Clase base abstracta para repositorios usando el patrón Template Method
 * 
 * Este patrón define el esqueleto de un algoritmo en una clase base,
 * delegando algunos pasos a métodos abstractos que las subclases deben implementar.
 * 
 * Los métodos template (findById, findBy, findAll, create, update, delete, search, count) contienen
 * la lógica común, mientras que los métodos abstractos permiten personalización.
 * 
 * Extiende IRepository para cumplir con el contrato base de repositorios.
 */
export class BaseRepository extends IRepository {
  /**
   * Obtiene el modelo Sequelize asociado a este repositorio
   * @abstract
   * @returns {Object} Modelo Sequelize
   */
  getModel() {
    throw new Error('Method getModel must be implemented by subclass');
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @abstract
   * @param {Object} model - Modelo Sequelize
   * @returns {Object|null} Entidad de dominio
   */
  toEntity(model) {
    throw new Error('Method toEntity must be implemented by subclass');
  }

  /**
   * Construye la cláusula WHERE para filtros específicos del repositorio
   * @abstract
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    // Implementación por defecto: retorna objeto vacío
    // Las subclases pueden sobrescribir para agregar filtros específicos
    return {};
  }

  /**
   * Retorna los campos que se usarán para búsqueda en el método search()
   * @abstract
   * @returns {string[]} Array de nombres de campos para búsqueda
   */
  getSearchFields() {
    throw new Error('Method getSearchFields must be implemented by subclass');
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Ordena por ID para mantener el orden original de inserción en la base de datos
   * Las subclases pueden sobrescribir este método si necesitan un orden diferente
   * 
   * IMPORTANTE: Si la subclase retorna un array vacío [], se usa este orden por defecto
   * 
   * @returns {Array} Array de arrays [campo, dirección] para Sequelize order
   */
  getDefaultSort() {
    return [['id', 'ASC']];
  }

  /**
   * Mapea los datos de dominio a formato del modelo Sequelize (para creación)
   * @abstract
   * @param {Object} data - Datos en formato de dominio
   * @param {number} userId - ID del usuario (opcional)
   * @returns {Object} Datos mapeados para el modelo
   */
  mapDataToModel(data, userId = null) {
    throw new Error('Method mapDataToModel must be implemented by subclass');
  }

  /**
   * Mapea los datos de actualización de dominio a formato del modelo
   * @abstract
   * @param {Object} data - Datos en formato de dominio
   * @param {number} userId - ID del usuario (opcional)
   * @returns {Object} Datos mapeados para actualización
   */
  mapDataToUpdate(data, userId = null) {
    throw new Error('Method mapDataToUpdate must be implemented by subclass');
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * Este nombre se usa en las respuestas de la API, NO para el schema de BD
   * 
   * Ejemplo: 
   * - Tabla BD: 'paises' (español, snake_case)
   * - Collection name: 'countries' (inglés, plural, para respuesta JSON)
   * 
   * @abstract
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    throw new Error('Method getCollectionName must be implemented by subclass');
  }

  /**
   * Helper interno: Obtiene el orden efectivo para las consultas
   * Si la subclase retorna un array vacío, usa el orden por defecto de BaseRepository
   * 
   * @private
   * @returns {Array} Orden efectivo para la consulta
   */
  _getEffectiveSort() {
    const subclassSort = this.getDefaultSort();
    // Si la subclase retorna array vacío, usar orden por defecto [['id', 'ASC']]
    return subclassSort.length === 0 ? [['id', 'ASC']] : subclassSort;
  }

  /**
   * TEMPLATE METHOD: Buscar por ID
   * Define el algoritmo común, delega la conversión a toEntity()
   * Con paranoid: true, automáticamente excluye registros eliminados
   * 
   * @param {number} id - ID del registro a buscar
   * @param {Object} options - Opciones opcionales
   *   - attributes: Array de campos a seleccionar (opcional, ej: ['id', 'nombre'])
   * @returns {Promise<Object|null>} Entidad encontrada o null
   */
  async findById(id, options = {}) {
    const Model = this.getModel();
    const queryOptions = {};
    
    // Agregar attributes si se especifican (optimización para traer solo campos necesarios)
    if (options.attributes && Array.isArray(options.attributes) && options.attributes.length > 0) {
      queryOptions.attributes = options.attributes;
    }
    if (options.paranoid === false) {
      queryOptions.paranoid = false;
    }
    
    // findByPk con paranoid: true automáticamente excluye deletedAt !== null
    const model = await Model.findByPk(id, queryOptions);
    return this.toEntity(model);
  }

  /**
   * TEMPLATE METHOD: Buscar un solo registro según criterios
   * Define el algoritmo común de búsqueda de un solo registro
   * 
   * IMPORTANTE:
   * - Con paranoid: true, Sequelize automáticamente excluye registros con deletedAt (soft delete)
   * - Por defecto solo busca en registros activos (activo: true)
   * - Para incluir inactivos, pasar options.includeInactive = true
   * 
   * @param {Object} criteria - Criterios de búsqueda (ej: { studentCode: "2025-001", ci: "1234567", expedicion: "LP" })
   * @param {Object} options - Opciones opcionales
   *   - includeInactive: Si incluir registros inactivos (default: false)
   *   - attributes: Array de campos a seleccionar (opcional, ej: ['id', 'nombre'])
   * @returns {Promise<Object|null>} Un solo registro o null si no se encuentra
   */
  async findBy(criteria, options = {}) {
    const Model = this.getModel();
    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      ...this.buildWhereClause(criteria),
    };

    // Filtrar por estado activo/inactivo (solo si no se solicita incluir inactivos)
    if (!options.includeInactive) {
      where.activo = true; // Solo registros activos por defecto
    }

    const queryOptions = {
      where,
      order: this._getEffectiveSort(),
    };

    // Agregar attributes si se especifican (optimización para traer solo campos necesarios)
    if (options.attributes && Array.isArray(options.attributes) && options.attributes.length > 0) {
      queryOptions.attributes = options.attributes;
    }

    const model = await Model.findOne(queryOptions);

    return this.toEntity(model);
  }

  /**
   * TEMPLATE METHOD: Buscar todos los registros
   * Define el algoritmo común de búsqueda con filtros y paginación
   * 
   * IMPORTANTE: 
   * - Con paranoid: true, Sequelize automáticamente excluye registros con deletedAt (soft delete)
   * - Por defecto solo trae registros activos (activo: true)
   * - Para incluir inactivos, pasar filters.includeInactive = true
   * 
   * @param {Object} filters - Filtros opcionales
   *   - search: Término de búsqueda
   *   - includeInactive: Si incluir registros inactivos (default: false)
   *   - sort: Ordenamiento (ej: "nombre:ASC" o "nombre:DESC")
   *   - attributes: Array de campos a seleccionar (opcional, ej: ['id', 'nombre'])
   * @param {number} page - Página (opcional)
   * @param {number} limit - Límite por página (opcional)
   * @returns {Promise<Object>} Objeto con colección, total, page y limit
   */
  async findAll(filters = {}, page = null, limit = null) {
    const Model = this.getModel();
    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      ...this.buildWhereClause(filters),
    };

    // Filtrar por estado activo/inactivo (solo si no se solicita incluir inactivos)
    if (!filters.includeInactive) {
      where.activo = true; // Solo registros activos por defecto
    }

    // Agregar búsqueda de texto si existe
    if (filters.search) {
      const searchFields = this.getSearchFields();
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${filters.search}%` },
      }));
    }

    const options = {
      where,
      order: filters.sort
        ? [[filters.sort.split(':')[0], filters.sort.includes(':') ? filters.sort.split(':')[1] : 'ASC']]
        : this._getEffectiveSort(),
    };

    // Agregar attributes si se especifican (optimización para traer solo campos necesarios)
    if (filters.attributes && Array.isArray(filters.attributes) && filters.attributes.length > 0) {
      options.attributes = filters.attributes;
    }

    if (page && limit) {
      const offset = (page - 1) * limit;
      options.limit = limit;
      options.offset = offset;

      const { count, rows } = await Model.findAndCountAll(options);
      const collectionName = this.getCollectionName();
      return {
        [collectionName]: rows.map((model) => this.toEntity(model)),
        total: count,
        page,
        limit,
      };
    }

    const rows = await Model.findAll(options);
    const collectionName = this.getCollectionName();
    return {
      [collectionName]: rows.map((model) => this.toEntity(model)),
      total: rows.length,
    };
  }

  /**
   * TEMPLATE METHOD: Crear un nuevo registro
   * Define el algoritmo común de creación
   * 
   * @param {Object} data - Datos para crear el registro
   * @param {number} userId - ID del usuario que crea (opcional)
   * @returns {Promise<Object>} Entidad creada
   */
  async create(data, userId = null) {
    const Model = this.getModel();
    const modelData = {
      ...this.mapDataToModel(data, userId),
      activo: 'active' in data ? data.active : ('activo' in data ? data.activo : true),
      createdBy: userId,
    };

    const model = await Model.create(modelData);
    return this.toEntity(model);
  }

  /**
   * TEMPLATE METHOD: Actualizar un registro
   * Define el algoritmo común de actualización
   * 
   * @param {number} id - ID del registro a actualizar
   * @param {Object} data - Datos para actualizar
   * @param {number} userId - ID del usuario que actualiza (opcional)
   * @returns {Promise<Object>} Entidad actualizada
   */
  async update(id, data, userId = null) {
    const Model = this.getModel();
    const updateData = {
      ...this.mapDataToUpdate(data, userId),
      updatedBy: userId,
    };

    await Model.update(updateData, {
      where: { id },
    });

    return this.findById(id);
  }

  /**
   * TEMPLATE METHOD: Eliminar un registro (soft delete)
   * Usa el método destroy() de Sequelize que respeta paranoid: true
   * Esto automáticamente establece deletedAt y respeta el soft delete
   * También marca el registro como inactivo (activo = false)
   * 
   * @param {number} id - ID del registro a eliminar
   * @param {number} userId - ID del usuario que elimina (opcional)
   * @returns {Promise<boolean>} true si se eliminó correctamente, false si no se encontró
   */
  async delete(id, userId = null) {
    const Model = this.getModel();
    
    // Sequelize con paranoid: true usa destroy() para soft delete
    // Esto automáticamente establece deletedAt
    const model = await Model.findByPk(id);
    if (!model) {
      return false;
    }

    // Actualizar campos antes de eliminar: activo = false y deletedBy
    const updateData = {
      activo: false,
    };
    
    if (userId) {
      updateData.deletedBy = userId;
    }

    await Model.update(updateData, {
      where: { id },
    });

    // destroy() con paranoid: true hace soft delete (establece deletedAt)
    await model.destroy();

    return true;
  }

  /**
   * TEMPLATE METHOD: Buscar con término de búsqueda
   * Define el algoritmo común de búsqueda de texto
   * 
   * IMPORTANTE:
   * - Con paranoid: true, Sequelize automáticamente excluye registros con deletedAt (soft delete)
   * - Por defecto solo busca en registros activos (activo: true)
   * - Para incluir inactivos, pasar options.includeInactive = true
   * 
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones opcionales
   *   - limit: Límite de resultados (default: 50)
   *   - includeInactive: Si incluir registros inactivos (default: false)
   *   - attributes: Array de campos a seleccionar (opcional, ej: ['id', 'nombre'])
   * @returns {Promise<Object[]>} Array de entidades encontradas
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();
    const searchFields = this.getSearchFields();
    const limit = options.limit || 50;

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: searchFields.map((field) => ({
        [field]: { [Op.like]: `%${searchTerm}%` },
      })),
    };

    // Filtrar por estado activo/inactivo (solo si no se solicita incluir inactivos)
    if (!options.includeInactive) {
      where.activo = true; // Solo registros activos por defecto
    }

    const queryOptions = {
      where,
      order: this._getEffectiveSort(),
      limit,
    };

    // Agregar attributes si se especifican (optimización para traer solo campos necesarios)
    if (options.attributes && Array.isArray(options.attributes) && options.attributes.length > 0) {
      queryOptions.attributes = options.attributes;
    }

    const models = await Model.findAll(queryOptions);

    return models.map((model) => this.toEntity(model));
  }

  /**
   * TEMPLATE METHOD: Contar registros
   * Cuenta el total de registros según filtros
   * 
   * IMPORTANTE:
   * - Con paranoid: true, Sequelize automáticamente excluye registros con deletedAt (soft delete)
   * - Por defecto solo cuenta registros activos (activo: true)
   * - Para incluir inactivos, pasar filters.includeInactive = true
   * 
   * @param {Object} filters - Filtros opcionales
   *   - includeInactive: Si incluir registros inactivos (default: false)
   * @returns {Promise<number>} Cantidad de registros
   */
  async count(filters = {}) {
    const Model = this.getModel();
    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      ...this.buildWhereClause(filters),
    };

    // Filtrar por estado activo/inactivo (solo si no se solicita incluir inactivos)
    if (!filters.includeInactive) {
      where.activo = true; // Solo registros activos por defecto
    }

    const count = await Model.count({ where });
    return count;
  }

  /**
   * Consulta una vista (o tabla) con paginación: COUNT + SELECT con mismo WHERE.
   * Reutilizable por repositorios que listan desde vistas (misma lógica que tabla con datos extras).
   *
   * @protected
   * @param {string} viewName - Nombre de la vista/tabla (ej: vista_pago_aporte_listado)
   * @param {string[]} whereConditions - Fragmentos SQL para WHERE (ej: ['estudiante_id = ?', 'estado = ?'])
   * @param {Array} replacements - Valores para los ? del WHERE (y luego limit/offset)
   * @param {string} orderClause - Cláusula ORDER BY (ej: 'ORDER BY id ASC')
   * @param {number} page - Página (1-based)
   * @param {number} limit - Límite por página
   * @returns {Promise<{rows: Array, total: number}>}
   */
  async _queryViewPaged(viewName, whereConditions, replacements, orderClause, page, limit) {
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(LIST_VIEW_MAX_LIMIT, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM ${viewName} ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `SELECT * FROM ${viewName} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

}

