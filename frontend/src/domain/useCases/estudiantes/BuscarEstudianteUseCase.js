/**
 * Use Case: Buscar Estudiante
 * 
 * Single Responsibility: Orquestar la búsqueda de estudiantes por término de búsqueda
 * Dependency Inversion: Depende de la abstracción IEstudianteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Validación de parámetros de entrada (searchTerm y limit)
 * - Buscar estudiantes por término de búsqueda (texto libre)
 * - Busca en: codigo_estudiante, ci, apellido_paterno, apellido_materno, nombres
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * Las validaciones se hacen aquí usando validators del Domain Layer.
 */

import { IEstudianteRepository } from '@repositories/IEstudianteRepository';
import { validateSearchQuery, validateSearchLimit } from '@domain/validators/common';

export class BuscarEstudianteUseCase {
  /**
   * @param {IEstudianteRepository} estudianteRepository - Repositorio de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * Ejecuta el caso de uso de búsqueda de estudiantes
   * 
   * @param {string} terminoBusqueda - Término de búsqueda (texto libre)
   * @param {Object} options - Opciones opcionales
   * @param {number} options.limit - Límite de resultados (opcional, default: 50)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(terminoBusqueda, options = {}) {
    try {
      // Validar término de búsqueda usando validator común
      const queryValidation = validateSearchQuery(terminoBusqueda);
      if (!queryValidation.isValid) {
        return {
          success: false,
          error: queryValidation.error,
        };
      }

      // Validar límite usando validator común (solo si se proporciona)
      if (options.limit !== undefined && options.limit !== null) {
        const limitValidation = validateSearchLimit(options.limit);
        if (!limitValidation.isValid) {
          return {
            success: false,
            error: limitValidation.error,
          };
        }
      }

      // El repositorio hace la llamada HTTP
      // GET /v1/estudiantes/search?query=termino (sin limit si no se proporciona)
      // GET /v1/estudiantes/search?query=termino&limit=10 (con limit si se proporciona)
      const trimmedQuery = terminoBusqueda.trim();
      const result = await this.estudianteRepository.buscar(trimmedQuery, {
        params: {
          // Solo incluir limit si se proporciona explícitamente
          ...(options.limit !== undefined && options.limit !== null && { limit: options.limit }),
        },
      });
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend (sin transformación)
      // La transformación se hace en el Hook usando mappers
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al buscar estudiantes',
      };
    }
  }
}
