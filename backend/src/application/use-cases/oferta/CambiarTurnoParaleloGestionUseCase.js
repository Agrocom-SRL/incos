import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { TURNOS_VALUES } from '../../../domain/constants/cursos.constants.js';
import { TURNOS_EDITABLES_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';
import { entityToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

export class CambiarTurnoParaleloGestionUseCase {
  constructor({ parallelManagementRepository, grillaBloqueViewRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.grillaBloqueViewRepository = grillaBloqueViewRepository;
    this.logger = logger;
  }

  async execute(id, { turno }, userId = null) {
    if (!turno || !TURNOS_VALUES.includes(turno)) {
      throw new ValidationError('turno inválido');
    }

    const pg = await this.parallelManagementRepository.findById(id);
    if (!pg) throw new NotFoundError('paralelo de gestión');

    if (!TURNOS_EDITABLES_PARALELO_GESTION.includes(pg.state)) {
      throw new ValidationError(
        'No se puede cambiar el turno cuando el paralelo está PUBLICADO o CERRADO'
      );
    }

    // Este flujo no reubica bloques: con bloques armados cambiar el turno los dejaría en el
    // turno equivocado. Para eso existe `cambiar-turno-con-bloques`.
    if (pg.shift !== turno && this.grillaBloqueViewRepository) {
      const bloques = await this.grillaBloqueViewRepository.findByParaleloGestionId(Number(id));
      if ((bloques?.length ?? 0) > 0) {
        throw new ValidationError(
          'El paralelo ya tiene bloques de horario: use cambiar-turno-con-bloques para reubicarlos',
          { bloques: bloques.length }
        );
      }
    }

    const updated = await this.parallelManagementRepository.update(
      id,
      { shift: turno },
      userId
    );

    this.logger.info('[Oferta] Turno de paralelo-gestión actualizado', {
      id,
      turnoAnterior: pg.shift,
      turnoNuevo: turno,
    });

    return { paraleloGestion: entityToPresentation(updated) };
  }
}
