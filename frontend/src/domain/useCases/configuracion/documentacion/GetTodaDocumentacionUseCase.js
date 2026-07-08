/**
 * Use Case: Obtener Toda la Documentación
 *
 * Single Responsibility: Orquestar la obtención de los tipos de documentación
 * (listar, buscar, filtrar por tipoDocumento, paginar)
 * Dependency Inversion: Depende de la abstracción IDocumentacionRepository
 *
 * Retorna datos directamente del backend, sin crear entidades.
 *
 * Ubicación: domain/useCases/configuracion/documentacion
 */

import { IDocumentacionRepository } from '@repositories/IDocumentacionRepository';

export class GetTodaDocumentacionUseCase {
  /**
   * @param {IDocumentacionRepository} documentacionRepository - Repositorio de documentación
   */
  constructor(documentacionRepository) {
    this.documentacionRepository = documentacionRepository;
  }

  /**
   * @param {Object} options - Opciones para obtener documentación
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {string} [options.params.tipoDocumento] - Filtro por tipo de documento (ENUM)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.documentacionRepository.obtenerTodos({ params });

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener la documentación',
      };
    }
  }
}
