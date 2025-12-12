import apiClient from '../api/client.js';

/**
 * Repositorio para operaciones relacionadas con estudiantes
 */
export class StudentRepository {
  /**
   * Registra un nuevo estudiante
   * @param {Object} studentData - Datos del estudiante a registrar
   * @returns {Promise<Object>} Respuesta del servidor con el estudiante creado
   */
  async register(studentData) {
    try {
      const response = await apiClient.post('/v1/estudiantes', studentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      // Manejo de errores de validación del servidor
      if (error.response?.data?.error?.details) {
        const validationErrors = error.response.data.error.details.reduce(
          (acc, err) => {
            acc[err.field] = err.message;
            return acc;
          },
          {}
        );
        return {
          success: false,
          error: error.response.data.error.message || 'Error de validación',
          validationErrors,
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Error al registrar el estudiante',
      };
    }
  }

  /**
   * Obtiene la lista de estudiantes
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<Object>} Lista de estudiantes
   */
  async list(params = {}) {
    try {
      const response = await apiClient.get('/v1/estudiantes', { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Error al obtener estudiantes',
      };
    }
  }

  /**
   * Obtiene un estudiante por ID
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<Object>} Datos del estudiante
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/v1/estudiantes/${id}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Error al obtener el estudiante',
      };
    }
  }
}

export default new StudentRepository();