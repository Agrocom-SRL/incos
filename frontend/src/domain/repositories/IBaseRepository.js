/**
 * Interfaz Base para Repositorios
 * Define métodos comunes que todos los repositorios deben implementar
 * 
 * Interface Segregation Principle: Métodos comunes genéricos
 * Dependency Inversion Principle: Dependemos de abstracción, no de implementación
 * 
 * Clean Architecture:
 * - Domain Layer: Contrato base para repositorios
 */

export class IBaseRepository {
  /**
   * Obtiene un registro por ID
   * @param {string|number} id - ID del registro
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getById(id) {
    throw new Error('Method getById() must be implemented');
  }

  /**
   * Obtiene todos los registros
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getAll(options = {}) {
    throw new Error('Method getAll() must be implemented');
  }

  /**
   * Crea un nuevo registro
   * @param {Object} data - Datos del registro
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Actualiza un registro
   * @param {string|number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Elimina un registro (soft delete)
   * @param {string|number} id - ID del registro
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }
}

