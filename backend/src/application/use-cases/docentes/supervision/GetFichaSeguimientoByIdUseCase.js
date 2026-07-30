import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { FichaSeguimientoMapper } from '../../../mappers/docentes/FichaSeguimientoMapper.js';

/**
 * Use Case: GetFichaSeguimientoByIdUseCase (S2)
 * Módulo: Docentes (DOC · supervisión docente)
 *
 * Ficha completa: entidad raíz (todos los campos del formulario, incluidos
 * los TEXT de observaciones) + contexto de cabecera desde la vista 174
 * (docente, asignatura, carrera, paralelo, gestión, evaluador).
 *
 * Devuelve la presentación PLANA (patrón GetPasantiaUseCase): BaseGetController
 * la expone como data del recurso (dataFieldName 'fichaSeguimiento').
 */
export class GetFichaSeguimientoByIdUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.fichaSeguimientoClaseRepository - Raíz fichas_seguimiento_clase
   * @param {Object} params.fichaSeguimientoListadoViewRepository - Vista 174
   * @param {ILogger} params.logger
   */
  constructor({ fichaSeguimientoClaseRepository, fichaSeguimientoListadoViewRepository, logger }) {
    this.fichaSeguimientoClaseRepository = fichaSeguimientoClaseRepository;
    this.fichaSeguimientoListadoViewRepository = fichaSeguimientoListadoViewRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @returns {Promise<Object>} Ficha (presentación camelCase)
   */
  async execute(id) {
    const entity = await this.fichaSeguimientoClaseRepository.findById(id);
    if (!entity) {
      throw new NotFoundError(`ficha de seguimiento con ID ${id}`);
    }

    const row = await this.fichaSeguimientoListadoViewRepository.findListadoById(id);

    this.logger.info('[Supervisión docente] Ficha obtenida', { id });

    return FichaSeguimientoMapper.toDetail(entity, row);
  }
}
