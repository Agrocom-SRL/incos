import { NotFoundError } from '../../../domain/errors/AppError.js';
import { SesionRefuerzoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: GetSesionRefuerzoByIdUseCase (A5)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Ficha de la sesión (vista 161) + estudiantes enriquecidos con sus datos
 * y sus notas en la materia reforzada (join a la vista 156).
 */
export class GetSesionRefuerzoByIdUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.acompanamientoSesionViewRepository - Vistas 161/156
   * @param {ILogger} params.logger
   */
  constructor({ acompanamientoSesionViewRepository, logger }) {
    this.acompanamientoSesionViewRepository = acompanamientoSesionViewRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @returns {Promise<Object>} Ficha de la sesión con estudiantes
   */
  async execute(id) {
    const row = await this.acompanamientoSesionViewRepository.findSesionById(id);
    if (!row) {
      throw new NotFoundError(`sesión de refuerzo con ID ${id}`);
    }

    const presentation = SesionRefuerzoMapper.viewRowToPresentation(row);
    const estudianteRows =
      await this.acompanamientoSesionViewRepository.findEstudiantesBySesionId(id);
    presentation.estudiantes =
      SesionRefuerzoMapper.estudianteRowsToPresentation(estudianteRows);

    this.logger.info('[Tutorías] Ficha de sesión de refuerzo obtenida', {
      id,
      estudiantes: presentation.estudiantes.length,
    });

    return presentation;
  }
}
