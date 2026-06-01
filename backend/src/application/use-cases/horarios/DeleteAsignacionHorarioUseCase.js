import { NotFoundError, ValidationError } from '../../../domain/errors/index.js';
import { assertParaleloGestionHorarioEditable } from '../../utils/horarios/assertParaleloGestionHorarioEditable.js';

export class DeleteAsignacionHorarioUseCase {
  constructor({
    asignacionHorarioRepository,
    teacherAssignmentRepository,
    parallelManagementRepository,
    logger,
  }) {
    this.asignacionHorarioRepository = asignacionHorarioRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const bloqueId = Number(id);
    if (!Number.isFinite(bloqueId) || bloqueId < 1) {
      throw new ValidationError('id de bloque inválido');
    }

    const existing = await this.asignacionHorarioRepository.findById(bloqueId);
    if (!existing) throw new NotFoundError('Bloque de horario');

    const assignment = await this.teacherAssignmentRepository.findEnrichedById(
      existing.teacherAssignmentId
    );
    if (!assignment) throw new NotFoundError('Asignación docente');

    const pg = await this.parallelManagementRepository.findById(assignment.paralelo_gestion_id);
    if (!pg) throw new NotFoundError('Paralelo en gestión');

    assertParaleloGestionHorarioEditable(pg.state);

    await this.asignacionHorarioRepository.delete(bloqueId, userId);

    this.logger.info('[Horarios] Bloque eliminado', { asignacionHorarioId: bloqueId });

    return { eliminado: true, id: bloqueId };
  }
}
