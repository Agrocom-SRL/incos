/**
 * Interfaz del Repositorio de Estudiantes
 * Define el contrato que deben cumplir las implementaciones
 * 
 * Interface Segregation Principle: Interfaz específica para estudiantes
 * Dependency Inversion Principle: Dependemos de abstracción, no de implementación
 */

export class IStudentRepository {
  /**
   * Crea un nuevo estudiante
   * @param {Object} studentData - Datos del estudiante
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async create(studentData) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Obtiene un estudiante por ID
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getById(id) {
    throw new Error('Method getById() must be implemented');
  }

  /**
   * Lista estudiantes con filtros y paginación
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async list(params = {}) {
    throw new Error('Method list() must be implemented');
  }

  /**
   * Actualiza un estudiante
   * @param {string|number} id - ID del estudiante
   * @param {Object} studentData - Datos a actualizar
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async update(id, studentData) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Elimina un estudiante (soft delete)
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }
}

