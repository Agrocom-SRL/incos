/**
 * Interfaz base genérica para todos los repositorios
 * Define métodos comunes que todos los repositorios deben implementar
 */
export class IRepository {
  /**
   * Buscar por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Buscar todos los registros activos
   * @param {Object} filters - Filtros opcionales
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
   * @returns {Promise<Object>}
   */
  async create(data, userId = null) {
    throw new Error('Method create must be implemented');
  }

  /**
   * Actualizar un registro
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @param {number} userId - ID del usuario que actualiza (opcional)
   * @returns {Promise<Object>}
   */
  async update(id, data, userId = null) {
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
   * @returns {Promise<Object[]>}
   */
  async search(searchTerm) {
    throw new Error('Method search must be implemented');
  }
}
