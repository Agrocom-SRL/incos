import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_PARALELO_GESTION,
  ESTADOS_PARALELO_GESTION_VALUES,
  TRANSICIONES_PARALELO_GESTION,
} from '../../../domain/constants/oferta.constants.js';
import { entityToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

export class UpdateParaleloGestionEstadoUseCase {
  constructor({
    parallelManagementRepository,
    validarOfertaParaleloGestionUseCase,
    logger,
  }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.validarOfertaParaleloGestionUseCase = validarOfertaParaleloGestionUseCase;
    this.logger = logger;
  }

  async execute(id, { estado }, userId = null) {
    if (!estado || !ESTADOS_PARALELO_GESTION_VALUES.includes(estado)) {
      throw new ValidationError('estado inválido para paralelo-gestión');
    }

    const pg = await this.parallelManagementRepository.findById(id);
    if (!pg) throw new NotFoundError('paralelo de gestión');

    const actual = pg.state ?? pg.estado ?? null;
    if (actual !== null && actual !== estado) {
      const permitidos = TRANSICIONES_PARALELO_GESTION[actual] ?? [];
      if (!permitidos.includes(estado)) {
        throw new ValidationError(
          `Transición no permitida: un paralelo ${actual} no puede pasar a ${estado}`,
          { estadoActual: actual, estadoSolicitado: estado, permitidos }
        );
      }
    }

    if (estado === ESTADOS_PARALELO_GESTION.OFERTADO && actual !== ESTADOS_PARALELO_GESTION.PUBLICADO) {
      if (!pg.classroomId) {
        throw new ValidationError('Debe asignar un aula antes de pasar a OFERTADO');
      }
      const validacion = await this.validarOfertaParaleloGestionUseCase.execute(id);
      if (!validacion.valido || (validacion.faltantes?.length ?? 0) > 0) {
        throw new ValidationError(
          'La oferta de cursos debe estar completa antes de pasar a OFERTADO',
          { faltantes: validacion.faltantes }
        );
      }
    }

    if (estado === ESTADOS_PARALELO_GESTION.PUBLICADO) {
      if (pg.state !== ESTADOS_PARALELO_GESTION.OFERTADO) {
        throw new ValidationError('Solo un paralelo OFERTADO puede pasar a PUBLICADO');
      }
      // Validación de bloques y conflictos: Sprint 5
    }

    const updated = await this.parallelManagementRepository.update(
      id,
      { state: estado },
      userId
    );

    return { paraleloGestion: entityToPresentation(updated) };
  }
}
