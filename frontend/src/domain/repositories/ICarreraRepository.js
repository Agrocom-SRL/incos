/**
 * Interfaz del Repositorio de Carreras
 * Define el contrato que deben cumplir las implementaciones
 * 
 * Interface Segregation Principle: Interfaz específica para carreras
 * Dependency Inversion Principle: Dependemos de abstracción, no de implementación
 */

export class ICarreraRepository {
  /**
   * Obtiene todas las carreras
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getAll(options = {}) {
    throw new Error('Method getAll() must be implemented');
  }

  /**
   * Obtiene una carrera por ID
   * @param {string|number} id - ID de la carrera
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getById(id) {
    throw new Error('Method getById() must be implemented');
  }

  /**
   * Crea una nueva carrera
   * @param {Object} carreraData - Datos de la carrera
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async create(carreraData) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Actualiza una carrera
   * @param {string|number} id - ID de la carrera
   * @param {Object} carreraData - Datos a actualizar
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async update(id, carreraData) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Elimina una carrera (soft delete)
   * @param {string|number} id - ID de la carrera
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }
}

