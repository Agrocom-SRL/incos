/**
 * Implementación del Repositorio de Estudiantes
 * Implementa IStudentRepository usando API client
 * 
 * Single Responsibility: Solo maneja la creación de estudiantes
 * Liskov Substitution Principle: Puede reemplazar IStudentRepository
 */

import apiClient from '../api/client.js';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository.js';

export class StudentRepository extends IStudentRepository {
  /**
   * Crea un nuevo estudiante
   * @param {Object} studentData - Datos del estudiante a registrar
   * @returns {Promise<Object>} Respuesta del servidor con el estudiante creado
   */
  async create(studentData) {
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

  // Métodos no implementados (solo crear estudiante por ahora)
  async list(params) {
    throw new Error('Method not implemented: list');
  }

  async getById(id) {
    throw new Error('Method not implemented: getById');
  }

  async update(id, studentData) {
    throw new Error('Method not implemented: update');
  }

  async changeStatus(id, status) {
    throw new Error('Method not implemented: changeStatus');
  }

  async assignBeca(id, becaData) {
    throw new Error('Method not implemented: assignBeca');
  }

  async requestLicencia(id, licenciaData) {
    throw new Error('Method not implemented: requestLicencia');
  }
}

export default new StudentRepository();