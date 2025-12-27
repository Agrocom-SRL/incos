/**
 * Use Case: Obtener Carreras
 * 
 * Single Responsibility: Solo se encarga de obtener carreras del sistema
 * Dependency Inversion: Depende de la abstracción ICarreraRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta Repository y Mapper)
 * 
 * Este Use Case:
 * - Para casos simples (solo mostrar): retorna datos mapeados directamente (sin entidad)
 * - Para casos complejos (validaciones, lógica): usaría entidad Career
 * 
 * NOTA: Para el dashboard solo necesitamos mostrar datos, no validaciones complejas.
 * Por eso retornamos datos simples mapeados, no entidades completas.
 */

import { ICarreraRepository } from '@/domain/repositories/ICarreraRepository';
import { CarreraMapper } from '@/domain/mappers/CarreraMapper';
import { Career } from '@/domain/entities/Career';

export class GetCarrerasUseCase {
  /**
   * @param {ICarreraRepository} carreraRepository - Repositorio de carreras
   */
  constructor(carreraRepository) {
    this.carreraRepository = carreraRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener carreras
   * @param {Object} options - Opciones de filtrado
   * @param {boolean} options.onlyActive - Solo carreras activas (default: true)
   * @param {boolean} options.simple - Retornar datos simples para UI (default: true)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async execute(options = {}) {
    const { onlyActive = true, simple = true } = options;

    try {
      // Obtener datos del repositorio (solo HTTP, sin lógica)
      const result = await this.carreraRepository.getAll();
      
      if (!result.success) {
        return result;
      }

      // Mapear datos del backend según el tipo de respuesta necesaria
      let carreras;
      if (simple) {
        // Para casos simples (solo mostrar): datos mapeados directamente
        carreras = CarreraMapper.arrayToSimpleUI(result.data || []);
      } else {
        // Para casos complejos (con validaciones): usar entidad Career
        const dataNormalizada = CarreraMapper.arrayToDomain(result.data || []);
        carreras = dataNormalizada.map(data => new Career(data));
      }
      
      // Filtrar solo activas si se solicita
      const filteredCarreras = onlyActive 
        ? carreras.filter(c => c.activa === true)
        : carreras;

      // Si está vacío, retornar vacío (no inventar datos)
      return {
        success: true,
        data: filteredCarreras,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener carreras',
      };
    }
  }
}

