import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../../utils/validacionEntrada.js';
import { FichaSeguimientoMapper } from '../../../mappers/docentes/FichaSeguimientoMapper.js';
import {
  assertAsignacionDocenteVigente,
  assertAsistenciaCoherente,
} from './helpers/fichaSeguimientoGuards.js';

/**
 * Use Case: UpdateFichaSeguimientoUseCase (S4)
 * Módulo: Docentes (DOC · supervisión docente)
 *
 * Actualiza la ficha (payload parcial). `supervisorId` NUNCA se toca desde el
 * cliente: el evaluador queda fijado al usuario que registró la ficha. Si se
 * cambia la asignación observada, debe existir y estar vigente.
 */
export class UpdateFichaSeguimientoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.fichaSeguimientoClaseRepository - Raíz fichas_seguimiento_clase
   * @param {Object} params.teacherAssignmentRepository - Valida asignación vigente
   * @param {ILogger} params.logger
   */
  constructor({ fichaSeguimientoClaseRepository, teacherAssignmentRepository, logger }) {
    this.fichaSeguimientoClaseRepository = fichaSeguimientoClaseRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {Object} data - Payload parcial camelCase
   * @param {number|null} usuarioId - Usuario de la sesión (auditoría updated_by)
   * @returns {Promise<{fichaSeguimiento: Object}>}
   */
  async execute(rawId, data, usuarioId = null) {
    const id = parseIdPositivo(rawId, 'id');
    const current = await this.fichaSeguimientoClaseRepository.findById(id);
    if (!current) {
      throw new NotFoundError(`ficha de seguimiento con ID ${id}`);
    }

    if (
      data.asignacionDocenteId !== undefined &&
      Number(data.asignacionDocenteId) !== Number(current.asignacionDocenteId)
    ) {
      const asignacionId = parseIdPositivo(data.asignacionDocenteId, 'asignacionDocenteId');
      await assertAsignacionDocenteVigente({
        teacherAssignmentRepository: this.teacherAssignmentRepository,
        asignacionDocenteId: asignacionId,
      });
    }

    // Coherencia contra el valor FINAL (payload o actual) de cada cantidad.
    assertAsistenciaCoherente(
      data.estudiantesEnPlanilla !== undefined
        ? data.estudiantesEnPlanilla
        : current.estudiantesEnPlanilla,
      data.estudiantesAsistentes !== undefined
        ? data.estudiantesAsistentes
        : current.estudiantesAsistentes
    );

    // toPersistence SIN supervisorId: el evaluador no se reasigna por PUT.
    const payload = FichaSeguimientoMapper.toPersistence(data);
    const fichaSeguimiento = await this.fichaSeguimientoClaseRepository.update(
      id,
      payload,
      usuarioId
    );

    this.logger.info('[Supervisión docente] Ficha actualizada', { id });

    return { fichaSeguimiento };
  }
}
