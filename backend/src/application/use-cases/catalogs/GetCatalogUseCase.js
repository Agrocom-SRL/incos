/**
 * Use Case: GetCatalogUseCase
 * Módulo: Catálogos
 * Obtiene datos de catálogos genéricos (carreras, gestiones, municipios, etc.)
 */

import { logger } from '../../../shared/logger.js';

export class GetCatalogUseCase {
  constructor({ repository, logger: loggerInstance, mapper }) {
    this.repository = repository;
    this.logger = loggerInstance || logger;
    this.mapper = mapper || ((item) => item);
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros opcionales
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Lista de elementos del catálogo
   */
  async execute(filters = {}, options = {}) {
    this.logger.debug('[Catalogs] Obteniendo catálogo', {
      filters,
      options,
    });

    let result;

    // Si hay filtros específicos, usar métodos del repositorio
    if (filters.paisId && this.repository.findByPaisId) {
      result = await this.repository.findByPaisId(parseInt(filters.paisId));
    } else if (filters.departamentoId && this.repository.findByDepartamentoId) {
      result = await this.repository.findByDepartamentoId(parseInt(filters.departamentoId));
    } else if (filters.provinciaId && this.repository.findByProvinciaId) {
      result = await this.repository.findByProvinciaId(parseInt(filters.provinciaId));
    } else {
      // Obtener todos los elementos
      result = await this.repository.findAll({}, null, null);
    }

    // Normalizar resultado (puede venir como objeto con propiedad o como array)
    let items = [];
    if (result) {
      if (Array.isArray(result)) {
        items = result;
      } else if (typeof result === 'object') {
        // Buscar propiedad que contenga el array (ej: careers, countries, etc.)
        const arrayProperty = Object.keys(result).find(
          key => Array.isArray(result[key])
        );
        items = arrayProperty ? result[arrayProperty] : [];
      }
    }

    // Aplicar mapper si existe
    const mappedItems = items.map(item => this.mapper(item));

    this.logger.debug('[Catalogs] Catálogo obtenido exitosamente', {
      total: mappedItems.length,
    });

    return mappedItems;
  }
}

