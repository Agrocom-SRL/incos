/**
 * Use Case: Obtener Todas las Discapacidades
 * 
 * Single Responsibility: Orquestar la obtención de todas las discapacidades (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IDiscapacidadRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todas las discapacidades
 * - Buscar discapacidades (parámetro busqueda)
 * - Filtrar discapacidades (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/configuracion/complementario/discapacidad
 */

import { IDiscapacidadRepository } from '@repositories/IDiscapacidadRepository';

export class GetTodasDiscapacidadesUseCase {
  /**
   * @param {IDiscapacidadRepository} discapacidadRepository - Repositorio de discapacidades
   */
  constructor(discapacidadRepository) {
    this.discapacidadRepository = discapacidadRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todas las discapacidades
   * 
   * @param {Object} options - Opciones para obtener discapacidades
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general (nombre, descripción)
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "nombre", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/discapacidad?pagina=1&limite=10&busqueda=...&ordenar=nombre
      const result = await this.discapacidadRepository.obtenerTodos({ params });
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener discapacidades',
      };
    }
  }
}

