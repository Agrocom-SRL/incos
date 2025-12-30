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
  async obtenerPorId(id) {
    throw new Error('Method obtenerPorId() must be implemented');
  }

  /**
   * Obtiene todos los registros con filtros y paginación
   * GET /v1/{resource}?pagina=1&limite=10&filtros=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP (filtros, paginación, búsqueda)
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {Object} options.params.filtros - Filtros específicos del recurso
   * @param {string} options.params.busqueda - Término de búsqueda general
   * @param {boolean} options.params.incluirInactivos - Incluir registros inactivos (activo = false)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    throw new Error('Method obtenerTodos() must be implemented');
  }

  /**
   * Crea un nuevo registro
   * POST /v1/{resource}
   * 
   * @param {Object} data - Datos del registro
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async crear(data) {
    throw new Error('Method crear() must be implemented');
  }

  /**
   * Actualiza un registro
   * PUT /v1/{resource}/:id
   * 
   * @param {string|number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async actualizar(id, data) {
    throw new Error('Method actualizar() must be implemented');
  }

  /**
   * Elimina un registro (soft delete)
   * DELETE /v1/{resource}/:id
   * 
   * @param {string|number} id - ID del registro
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    throw new Error('Method eliminar() must be implemented');
  }

  /**
   * Busca registros con término de búsqueda
   * GET /v1/{resource}?busqueda=termino
   * 
   * @param {string} terminoBusqueda - Término de búsqueda
   * @param {Object} options - Opciones opcionales
   * @param {Object} options.params - Parámetros adicionales de consulta HTTP
   * @param {boolean} options.params.incluirInactivos - Incluir registros inactivos
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async buscar(terminoBusqueda, options = {}) {
    throw new Error('Method buscar() must be implemented');
  }

  /**
   * Cuenta registros según filtros
   * GET /v1/{resource}/contar?filtros=...
   * 
   * @param {Object} filtros - Filtros opcionales
   * @param {boolean} filtros.incluirInactivos - Incluir registros inactivos en el conteo
   * @returns {Promise<{success: boolean, data?: number, error?: string}>}
   */
  async contar(filtros = {}) {
    throw new Error('Method contar() must be implemented');
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
  async cambiarEstado(id, activo) {
    throw new Error('Method cambiarEstado() must be implemented');
  }
}

