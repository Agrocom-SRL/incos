/**
 * Interfaz base genérica para todos los repositorios
 * Define métodos comunes que todos los repositorios deben implementar
 */
export class IRepository {
  /**
   * Buscar por ID
   * @param {number} id - ID del registro a buscar
   * @param {Object} options - Opciones opcionales
   *   - attributes: Array de campos a seleccionar (opcional, ej: ['id', 'nombre'])
   * @returns {Promise<Object|null>} Entidad encontrada o null
   */
  async findById(id, options = {}) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Buscar un solo registro según criterios
   * @param {Object} criteria - Criterios de búsqueda (ej: { studentCode: "2025-001", ci: "1234567", expedicion: "LP" })
   * @param {Object} options - Opciones opcionales (puede incluir 'includeInactive' para incluir inactivos)
   * @returns {Promise<Object|null>} Un solo registro o null si no se encuentra
   */
  async findBy(criteria, options = {}) {
    throw new Error('Method findBy must be implemented');
  }

  /**
   * Buscar todos los registros activos
   * @param {Object} filters - Filtros opcionales (puede incluir 'includeInactive' para incluir inactivos)
   * @param {number} page - Página (opcional, para paginación)
   * @param {number} limit - Límite por página (opcional, para paginación)
   * @returns {Promise<Object[]|{data: Object[], total: number}>}
   */
  async findAll(filters = {}, page = null, limit = null) {
    throw new Error('Method findAll must be implemented');
  }

  /**
   * Crear un nuevo registro
   * @param {Object} data - Datos del registro
   * @param {number} userId - ID del usuario que crea (opcional)
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object>}
   */
  async create(data, userId = null, options = {}) {
    throw new Error('Method create must be implemented');
  }

  /**
   * Actualizar un registro
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @param {number} userId - ID del usuario que actualiza (opcional)
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object>}
   */
  async update(id, data, userId = null, options = {}) {
    throw new Error('Method update must be implemented');
  }

  /**
   * Eliminar un registro (soft delete)
   * @param {number} id - ID del registro
   * @param {number} userId - ID del usuario que elimina (opcional)
   * @returns {Promise<boolean>}
   */
  async delete(id, userId = null) {
    throw new Error('Method delete must be implemented');
  }

  /**
   * Buscar con término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones opcionales (puede incluir 'includeInactive' para incluir inactivos)
   * @returns {Promise<Object[]>}
   */
  async search(searchTerm, options = {}) {
    throw new Error('Method search must be implemented');
  }

  /**
   * Contar registros según filtros
   * @param {Object} filters - Filtros opcionales (puede incluir 'includeInactive' para incluir inactivos)
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    throw new Error('Method count must be implemented');
  }
}
