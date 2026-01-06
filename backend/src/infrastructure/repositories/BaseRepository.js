import { Op } from 'sequelize';
import { IRepository } from '../../domain/interfaces/repositories/IRepository.js';

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
   * @abstract
   * @returns {Array} Array de arrays [campo, dirección] para Sequelize order
   */
  getDefaultSort() {
    return [['nombre', 'ASC']];
  }

  /**
   * Mapea los datos de dominio a formato del modelo Sequelize
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
   * TEMPLATE METHOD: Buscar por ID
   * Define el algoritmo común, delega la conversión a toEntity()
   * Con paranoid: true, automáticamente excluye registros eliminados
   */
  async findById(id) {
    const Model = this.getModel();
    // findByPk con paranoid: true automáticamente excluye deletedAt !== null
    const model = await Model.findByPk(id);
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

    const model = await Model.findOne({
      where,
      order: this.getDefaultSort(),
    });

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
   * @param {number} page - Página (opcional)
   * @param {number} limit - Límite por página (opcional)
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
        : this.getDefaultSort(),
    };

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
   */
  async create(data, userId = null) {
    const Model = this.getModel();
    const modelData = {
      ...this.mapDataToModel(data, userId),
      activo: data.activo !== undefined ? data.activo : true,
      createdBy: userId,
    };

    const model = await Model.create(modelData);
    return this.toEntity(model);
  }

  /**
   * TEMPLATE METHOD: Actualizar un registro
   * Define el algoritmo común de actualización
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
   */
  async delete(id, userId = null) {
    const Model = this.getModel();
    
    // Sequelize con paranoid: true usa destroy() para soft delete
    // Esto automáticamente establece deletedAt
    const model = await Model.findByPk(id);
    if (!model) {
      return false;
    }

    // Actualizar deletedBy antes de eliminar
    if (userId) {
      await Model.update(
        { deletedBy: userId },
        { where: { id } }
      );
    }

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
   *   - includeInactive: Si incluir registros inactivos (default: false)
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();
    const searchFields = this.getSearchFields();

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

    const models = await Model.findAll({
      where,
      order: this.getDefaultSort(),
      limit: 50,
    });

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
   * @returns {Promise<number>}
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

}

