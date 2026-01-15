/**
 * Use Case: ListParalelosUseCase
 * Módulo: Académico
 * Lista paralelos con filtros, paginación y ordenamiento
 * 
 * Filtros específicos: periodo (número), periodo_id (ID), carrera_id
 * 
 * Si se proporciona periodo (número), busca todos los periodos con ese número
 * y luego filtra paralelos por los IDs obtenidos (devuelve paralelos de todas las carreras)
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ParallelMapper } from '../../mappers/academico/index.js';

export class ListParalelosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {Object} params.periodRepository - Repositorio de periodos
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ parallelRepository, periodRepository, logger }) {
    super({
      repository: parallelRepository,
      logger,
      moduleName: 'Académico',
      resourceName: 'paralelos',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'parallels',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'paralelos',
    });
    this.periodRepository = periodRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Parallel a presentación
   * @returns {ParallelMapper}
   */
  getMapper() {
    return ParallelMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    // periodo_id: filtro directo por ID único
    if (queryParams.periodo_id) {
      filters.periodId = parseInt(queryParams.periodo_id);
    }

    // periodo: se maneja en execute() para obtener IDs de todas las carreras
    // No se agrega aquí, se procesa antes de llamar al método base

    if (queryParams.carrera_id) {
      filters.careerId = parseInt(queryParams.carrera_id);
    }

    return filters;
  }

  /**
   * Prepara filtros cuando hay filtro por periodo (número)
   * 
   * Si viene periodo (número), busca todos los periodos con ese número,
   * obtiene sus IDs y modifica los filtros para usar esos IDs
   * 
   * @param {Object} filters - Filtros ya construidos por buildSpecificFilters
   * @param {Object} queryParams - Query parameters originales (para detectar periodo)
   * @returns {Promise<Object>} Filtros modificados con periodId como array de IDs
   */
  async prepareFilters(filters = {}, queryParams = {}) {
    // Si hay filtro por periodo (número), obtener IDs de periodos primero
    if (queryParams.periodo) {
      const periodoNumero = parseInt(queryParams.periodo);

      // Obtener solo los IDs de periodos con ese número (de todas las carreras)
      const periodosResult = await this.periodRepository.findAll(
        {
          numero: periodoNumero,
          activo: true,
          attributes: ['id'], // Solo traer IDs, sin mapear
        },
        null, // sin paginación
        null
      );

      const periodoIds = (periodosResult.periods || []).map((p) => p.id);

      // Si no hay periodos, retornar filtro que no coincida con nada
      if (periodoIds.length === 0) {
        return { ...filters, periodId: [] };
      }

      // Modificar filtros con los IDs obtenidos
      // Sequelize automáticamente convierte arrays a IN (1, 2, 3)
      return { ...filters, periodId: periodoIds };
    }

    return filters;
  }
}
