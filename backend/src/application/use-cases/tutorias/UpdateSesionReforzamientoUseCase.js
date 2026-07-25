import { NotFoundError } from '../../../domain/errors/AppError.js';

/** Campos editables de la sesión (participantes vía A9). */
const CAMPOS_EDITABLES = [
  'fecha',
  'horaInicio',
  'horaFin',
  'modalidad',
  'aulaId',
  'enlaceVirtual',
  'tema',
  'estado',
  'observaciones',
];

/**
 * Use Case: UpdateSesionReforzamientoUseCase (A7)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Actualiza una sesión de reforzamiento (incluida la transición de estado
 * PROGRAMADA → REALIZADA/CANCELADA). La asignación docente NO cambia:
 * la sesión pertenece al curso desde su creación.
 */
export class UpdateSesionReforzamientoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionReforzamientoRepository
   * @param {Object} params.classroomRepository - Validación aula si cambia
   * @param {ILogger} params.logger
   */
  constructor({ sesionReforzamientoRepository, classroomRepository, logger }) {
    this.sesionReforzamientoRepository = sesionReforzamientoRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<{sesionReforzamiento: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const sesion = await this.sesionReforzamientoRepository.findById(id);
    if (!sesion) {
      throw new NotFoundError(`sesión de reforzamiento con ID ${id}`);
    }

    if (body.aulaId) {
      const aula = await this.classroomRepository.findById(Number(body.aulaId));
      if (!aula) {
        throw new NotFoundError(`aula con ID ${body.aulaId}`);
      }
    }

    const data = {};
    for (const campo of CAMPOS_EDITABLES) {
      if (campo in body) {
        data[campo] = body[campo];
      }
    }

    const updated = await this.sesionReforzamientoRepository.update(id, data, userId);

    this.logger.info('[Tutorías] Sesión de reforzamiento actualizada', {
      id,
      campos: Object.keys(data),
    });

    return { sesionReforzamiento: updated };
  }
}
