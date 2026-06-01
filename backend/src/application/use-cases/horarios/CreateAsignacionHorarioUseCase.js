import { NotFoundError, ValidationError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { assertParaleloGestionHorarioEditable } from '../../utils/horarios/assertParaleloGestionHorarioEditable.js';
import { AsignacionHorarioPresentationMapper } from '../../mappers/horarios/AsignacionHorarioPresentationMapper.js';

export class CreateAsignacionHorarioUseCase {
  constructor({
    asignacionHorarioRepository,
    teacherAssignmentRepository,
    parallelManagementRepository,
    scheduleRepository,
    horarioConflictosService,
    logger,
  }) {
    this.asignacionHorarioRepository = asignacionHorarioRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.scheduleRepository = scheduleRepository;
    this.horarioConflictosService = horarioConflictosService;
    this.logger = logger;
  }

  async execute(body, userId = null) {
    const asignacionDocenteId = Number(body?.asignacion_docente_id ?? body?.asignacionDocenteId);
    const horarioId = Number(body?.horario_id ?? body?.horarioId);
    const aulaIdRaw = body?.aula_id ?? body?.aulaId;
    const aulaId =
      aulaIdRaw == null || aulaIdRaw === '' ? null : Number(aulaIdRaw);
    const ordenSecuencia = Number(body?.orden_secuencia ?? body?.ordenSecuencia ?? 1);

    if (!Number.isFinite(asignacionDocenteId) || asignacionDocenteId < 1) {
      throw new ValidationError('asignacion_docente_id es requerido');
    }
    if (!Number.isFinite(horarioId) || horarioId < 1) {
      throw new ValidationError('horario_id es requerido');
    }
    if (aulaId != null && (!Number.isFinite(aulaId) || aulaId < 1)) {
      throw new ValidationError('aula_id debe ser null o un id válido');
    }

    const assignment = await this.teacherAssignmentRepository.findEnrichedById(asignacionDocenteId);
    if (!assignment?.vigente) {
      throw new NotFoundError('Asignación docente');
    }

    const pg = await this.parallelManagementRepository.findById(assignment.paralelo_gestion_id);
    if (!pg) throw new NotFoundError('Paralelo en gestión');

    assertParaleloGestionHorarioEditable(pg.state);

    const horario = await this.scheduleRepository.findById(horarioId);
    if (!horario) throw new NotFoundError('Horario');

    const { valido, conflictos } = await this.horarioConflictosService.validarPropuesta({
      asignacionDocenteId,
      horarioId,
      aulaId,
    });
    if (!valido) {
      throw new UnprocessableEntityError('Conflicto de horario', conflictos);
    }

    const created = await this.asignacionHorarioRepository.create(
      {
        teacherAssignmentId: asignacionDocenteId,
        scheduleId: horarioId,
        classroomId: aulaId,
        sequenceOrder: Number.isFinite(ordenSecuencia) && ordenSecuencia > 0 ? ordenSecuencia : 1,
      },
      userId
    );

    this.logger.info('[Horarios] Bloque creado', {
      asignacionHorarioId: created.id,
      asignacionDocenteId,
      horarioId,
    });

    return {
      asignacion_horario: AsignacionHorarioPresentationMapper.toPresentation(created),
    };
  }
}
