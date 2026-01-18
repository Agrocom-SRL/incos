/**
 * Use Case: Obtener Todos los Bancos Autorizados
 * 
 * Single Responsibility: Orquestar la obtención de todos los bancos autorizados (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IAuthorizedBankRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todos los bancos autorizados
 * - Buscar bancos autorizados (parámetro busqueda)
 * - Filtrar bancos autorizados (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/pagos
 */

import { IAuthorizedBankRepository } from '@repositories/IAuthorizedBankRepository';

export class GetTodosAuthorizedBanksUseCase {
  /**
   * @param {IAuthorizedBankRepository} authorizedBankRepository - Repositorio de bancos autorizados
   */
  constructor(authorizedBankRepository) {
    this.authorizedBankRepository = authorizedBankRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todos los bancos autorizados
   * 
   * @param {Object} options - Opciones para obtener bancos autorizados
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "nombre", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/bancos-autorizados?pagina=1&limite=10&busqueda=...&ordenar=nombre
      const result = await this.authorizedBankRepository.obtenerTodos({ params });
      
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
        error: error.message || 'Error al obtener bancos autorizados',
      };
    }
  }
}
