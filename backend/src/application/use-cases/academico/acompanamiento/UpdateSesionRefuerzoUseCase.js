import { NotFoundError } from '../../../../domain/errors/AppError.js';

/** Campos editables de la sesión (estudiantes vía A9). */
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
 * Use Case: UpdateSesionRefuerzoUseCase (A7)
 * Módulo: Académico (ACA · acompañamiento)
 *
 * Actualiza una sesión de refuerzo (incluida la transición de estado
 * PROGRAMADA → REALIZADA/CANCELADA). La asignación docente NO cambia:
 * la sesión pertenece al curso desde su creación.
 */
export class UpdateSesionRefuerzoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionRefuerzoRepository
   * @param {Object} params.classroomRepository - Validación aula si cambia
   * @param {ILogger} params.logger
   */
  constructor({ sesionRefuerzoRepository, classroomRepository, logger }) {
    this.sesionRefuerzoRepository = sesionRefuerzoRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<{sesionRefuerzo: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const sesion = await this.sesionRefuerzoRepository.findById(id);
    if (!sesion) {
      throw new NotFoundError(`sesión de refuerzo con ID ${id}`);
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

    const updated = await this.sesionRefuerzoRepository.update(id, data, userId);

    this.logger.info('[Acompañamiento] Sesión de refuerzo actualizada', {
      id,
      campos: Object.keys(data),
    });

    return { sesionRefuerzo: updated };
  }
}
