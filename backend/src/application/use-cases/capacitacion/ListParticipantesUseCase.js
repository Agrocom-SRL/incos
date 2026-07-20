import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ParticipanteMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: ListParticipantesUseCase
 * Módulo: Capacitación (CAP)
 *
 * Lista participantes de cursos de capacitación con búsqueda por CI, nombres,
 * apellidos o celular (campos de búsqueda del repositorio), paginación y
 * soporte de incluirInactivos. Orden estándar de personas:
 * APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
 */
export class ListParticipantesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.participanteRepository
   * @param {ILogger} params.logger
   */
  constructor({ participanteRepository, logger }) {
    super({
      repository: participanteRepository,
      logger,
      moduleName: 'Capacitación',
      resourceName: 'participantes',
      // collectionFieldName: nombre del campo retornado por repository.getCollectionName()
      collectionFieldName: 'participantes',
      // dataFieldName: nombre del campo en la respuesta final de la API
      dataFieldName: 'participantes',
    });
  }

  /**
   * @returns {ParticipanteMapper}
   */
  getMapper() {
    return ParticipanteMapper;
  }

  /**
   * Filtros específicos: ci (búsqueda exacta), incluirInactivos y
   * sinInscripcionActiva (paso 1 del wizard "Inscribir participante": solo
   * candidatos sin inscripción vigente en `capacitacion_inscritos`).
   * @param {Object} queryParams
   * @param {Object} baseFilters
   * @returns {Object}
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.ci) {
      filters.ci = String(queryParams.ci).trim();
    }

    if (queryParams.incluirInactivos !== undefined) {
      filters.includeInactive =
        queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true;
    }

    if (queryParams.sinInscripcionActiva !== undefined) {
      filters.sinInscripcionActiva =
        queryParams.sinInscripcionActiva === 'true' || queryParams.sinInscripcionActiva === true;
    }

    return filters;
  }
}
