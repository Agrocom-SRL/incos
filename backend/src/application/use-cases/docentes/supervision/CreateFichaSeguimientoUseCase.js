import { ValidationError } from '../../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../../utils/validacionEntrada.js';
import { FichaSeguimientoMapper } from '../../../mappers/docentes/FichaSeguimientoMapper.js';
import {
  assertAsignacionDocenteVigente,
  assertAsistenciaCoherente,
} from './helpers/fichaSeguimientoGuards.js';

/**
 * Use Case: CreateFichaSeguimientoUseCase (S3)
 * Módulo: Docentes (DOC · supervisión docente)
 *
 * Registra la ficha de seguimiento en clase (formulario ya realizado):
 * - la asignación docente observada debe existir y estar VIGENTE,
 * - `supervisorId` = usuario de la SESIÓN (req.usuario.id), JAMÁS del cliente
 *   (el evaluador es quien está autenticado — anti-suplantación),
 * - coherencia de asistencia: asistentes ≤ en planilla cuando ambos vienen.
 */
export class CreateFichaSeguimientoUseCase {
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
   * @param {Object} data - Payload camelCase de la ficha
   * @param {number|null} usuarioId - Usuario de la sesión (evaluador + auditoría created_by)
   * @returns {Promise<{fichaSeguimiento: Object}>}
   */
  async execute(data, usuarioId = null) {
    if (data.asignacionDocenteId === undefined || data.asignacionDocenteId === null) {
      throw new ValidationError('asignacionDocenteId es requerido');
    }
    const asignacionId = parseIdPositivo(data.asignacionDocenteId, 'asignacionDocenteId');
    await assertAsignacionDocenteVigente({
      teacherAssignmentRepository: this.teacherAssignmentRepository,
      asignacionDocenteId: asignacionId,
    });
    assertAsistenciaCoherente(data.estudiantesEnPlanilla, data.estudiantesAsistentes);

    const payload = FichaSeguimientoMapper.toPersistence(data, { supervisorId: usuarioId });
    const fichaSeguimiento = await this.fichaSeguimientoClaseRepository.create(payload, usuarioId);

    this.logger.info('[Supervisión docente] Ficha registrada', {
      id: fichaSeguimiento.id,
      asignacionDocenteId: fichaSeguimiento.asignacionDocenteId,
      supervisorId: fichaSeguimiento.supervisorId,
    });

    return { fichaSeguimiento };
  }
}
