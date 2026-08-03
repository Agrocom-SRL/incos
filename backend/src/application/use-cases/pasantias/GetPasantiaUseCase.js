import { getPasantiaOrFail } from './helpers/pasantiaGuards.js';
import { PasantiaMapper } from '../../mappers/pasantias/index.js';

/**
 * Use Case: GetPasantiaUseCase (P2)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Ficha del trámite: fila de la vista 168 (vista_pasantia_detalle) con
 * identidad resuelta, datos de la empresa y agregados de satélites.
 *
 * Devuelve la presentación PLANA (patrón GetProyectoGradoByIdUseCase):
 * BaseGetController la expone como data del recurso (dataFieldName 'pasantia').
 */
export class GetPasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaViewRepository - Vistas 167/168
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaRepository, pasantiaViewRepository, logger }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaViewRepository = pasantiaViewRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @returns {Promise<Object>} Ficha del trámite (presentación camelCase)
   */
  async execute(id) {
    const entity = await getPasantiaOrFail(this.pasantiaRepository, id);

    const row = await this.pasantiaViewRepository.findListadoById(id);

    // Degradación: la vista filtra trámites inactivos; se usa la entidad raíz.
    const pasantia = row ? PasantiaMapper.detalleRowToPresentation(row) : { ...entity };

    this.logger.info('[Pasantías] Ficha de trámite obtenida', { id });

    return pasantia;
  }
}
