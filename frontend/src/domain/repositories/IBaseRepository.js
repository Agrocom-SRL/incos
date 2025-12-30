/**
 * Interfaz Base para Repositorios
 * Define métodos comunes que todos los repositorios deben implementar
 * 
 * Todos los schemas tienen campos estándar: activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by
 * 
 * Los métodos SOLO hacen llamadas HTTP (Infrastructure Layer), retornan datos crudos.
 * La lógica de negocio está en los Use Cases (Application Layer).
 */

export class IBaseRepository {
  /**
   * Obtiene un registro por ID
   * GET /v1/{resource}/:id
   * 
   * @param {string|number} id - ID del registro
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getById(id) {
    throw new Error('Method getById() must be implemented');
  }

  /**
   * Obtiene todos los registros con filtros y paginación
   * GET /v1/{resource}?page=1&limit=10&filters=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP (filtros, paginación, búsqueda)
   * @param {number} options.params.page - Número de página (paginación)
   * @param {number} options.params.limit - Cantidad por página (paginación)
   * @param {Object} options.params.filters - Filtros específicos del recurso
   * @param {string} options.params.search - Término de búsqueda general
   * @param {boolean} options.params.includeInactive - Incluir registros inactivos (activo = false)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getAll(options = {}) {
    throw new Error('Method getAll() must be implemented');
  }

  /**
   * Crea un nuevo registro
   * POST /v1/{resource}
   * 
   * @param {Object} data - Datos del registro
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Actualiza un registro
   * PUT /v1/{resource}/:id
   * 
   * @param {string|number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Elimina un registro (soft delete)
   * DELETE /v1/{resource}/:id
   * 
   * @param {string|number} id - ID del registro
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Busca registros con término de búsqueda
   * GET /v1/{resource}?search=term
   * 
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones opcionales
   * @param {Object} options.params - Parámetros adicionales de consulta HTTP
   * @param {boolean} options.params.includeInactive - Incluir registros inactivos
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async search(searchTerm, options = {}) {
    throw new Error('Method search() must be implemented');
  }

  /**
   * Cuenta registros según filtros
   * GET /v1/{resource}/count?filters=...
   * 
   * @param {Object} filters - Filtros opcionales
   * @param {boolean} filters.includeInactive - Incluir registros inactivos en el conteo
   * @returns {Promise<{success: boolean, data?: number, error?: string}>}
   */
  async count(filters = {}) {
    throw new Error('Method count() must be implemented');
  }

  /**
   * Cambia el estado activo/inactivo de un registro
   * PATCH /v1/{resource}/:id/activo
   * 
   * Método genérico para cambiar el campo 'activo' (estándar en todos los schemas)
   * 
   * @param {string|number} id - ID del registro
   * @param {boolean} activo - Nuevo estado (true = activo, false = inactivo)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async change(id, activo) {
    throw new Error('Method change() must be implemented');
  }
}

