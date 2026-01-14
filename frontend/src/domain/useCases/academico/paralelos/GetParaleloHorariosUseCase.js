/**
 * Use Case: Obtener Horarios de Paralelo
 * 
 * Single Responsibility: Orquestar la obtención de horarios completos de un paralelo
 * Dependency Inversion: Depende de la abstracción IParaleloRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Obtener los horarios completos de un paralelo por ID
 * - Incluye cursos, materias, horarios y aulas
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/academico/paralelos
 */

import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class GetParaleloHorariosUseCase {
  /**
   * @param {IParaleloRepository} paraleloRepository - Repositorio de paralelos
   */
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener horarios de un paralelo
   * 
   * @param {number} parallelId - ID del paralelo
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(parallelId) {
    try {
      if (!parallelId) {
        return {
          success: false,
          error: 'ID del paralelo es requerido',
        };
      }

      // El repositorio hace la llamada HTTP
      // GET /v1/paralelos/:id/schedule
      const result = await this.paraleloRepository.obtenerHorarios({ parallelId });
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // La estructura viene como { schedule: [...] }
      return {
        success: true,
        data: result.data || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener horarios del paralelo',
      };
    }
  }
}
