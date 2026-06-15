import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { TURNOS_VALUES } from '../../../domain/constants/cursos.constants.js';
import { TURNOS_EDITABLES_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';
import { entityToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

export class CambiarTurnoParaleloGestionUseCase {
  constructor({ parallelManagementRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
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

    // TODO Sprint 5: si existen bloques en asignacion_horarios, re-mapear al rango del nuevo turno
    // en la misma transacción antes de persistir el cambio de turno.

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
