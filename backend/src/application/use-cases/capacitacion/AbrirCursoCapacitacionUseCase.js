import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_CAPACITACION,
  MODALIDADES_CAPACITACION,
} from '../../../domain/constants/capacitacion.constants.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { resolveEstadoEfectivoCurso } from './helpers/cursoEstadoEfectivo.js';

/**
 * Use Case: AbrirCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Transición manual de negocio: PROPUESTO → ABIERTO ("abrir inscripciones").
 * Solo procede si el estado EFECTIVO actual es PROPUESTO. No confundir con
 * `SetEstadoCursoCapacitacionUseCase` (ese es el toggle booleano `activo`).
 *
 * Coherencia con la modalidad (se valida aquí y no al guardar el borrador): si la
 * modalidad NO es VIRTUAL, el curso debe tener al menos un grupo con al menos
 * un horario; un curso VIRTUAL no exige horario.
 */
export class AbrirCursoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository
   * @param {Object} params.grupoCapacitacionRepository
   * @param {Object} params.bloqueCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({
    cursoCapacitacionRepository,
    grupoCapacitacionRepository,
    bloqueCapacitacionRepository,
    logger,
  }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.grupoCapacitacionRepository = grupoCapacitacionRepository;
    this.bloqueCapacitacionRepository = bloqueCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del curso
   * @param {number|null} userId - Usuario que realiza el cambio (auditoría)
   * @returns {Promise<{cursoCapacitacion: Object}>}
   */
  async execute(id, userId = null) {
    const curso = await this.cursoCapacitacionRepository.findById(id);
    if (!curso) throw new NotFoundError('curso de capacitación');

    const efectivo = resolveEstadoEfectivoCurso(curso.estado, curso.fechaInicio, curso.fechaFin);
    if (efectivo !== ESTADOS_CAPACITACION.PROPUESTO) {
      throw new ConflictError(
        `El curso "${curso.titulo}" no puede abrirse desde su estado actual (${efectivo})`
      );
    }

    await this._validarHorariosSegunModalidad(curso);

    const updated = await this.cursoCapacitacionRepository.update(
      id,
      { estado: ESTADOS_CAPACITACION.ABIERTO },
      userId
    );

    this.logger.info('[Capacitación] Curso abierto para inscripciones', { id });

    return { cursoCapacitacion: CursoCapacitacionMapper.entityToPresentation(updated) };
  }

  /**
   * Un curso no VIRTUAL necesita al menos un grupo con al menos un horario.
   * @private
   */
  async _validarHorariosSegunModalidad(curso) {
    if (curso.modalidad === MODALIDADES_CAPACITACION.VIRTUAL) return;

    const grupos = await this.grupoCapacitacionRepository.findByCapacitacionId(curso.id);
    if (grupos.length === 0) {
      throw new ValidationError(
        'Un curso no virtual necesita al menos un grupo con horarios antes de abrir las inscripciones'
      );
    }
    const bloques = await this.bloqueCapacitacionRepository.findByCapacitacionId(curso.id);
    const gruposConHorario = new Set(bloques.map((b) => b.grupoId));
    if (!grupos.some((g) => gruposConHorario.has(g.id))) {
      throw new ValidationError(
        'Ningún grupo tiene horarios: agregue al menos un horario a un grupo antes de abrir las inscripciones'
      );
    }
  }
}
