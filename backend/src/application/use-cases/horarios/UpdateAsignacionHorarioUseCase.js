import { NotFoundError, ValidationError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { assertParaleloGestionHorarioReubicable } from '../../utils/horarios/assertParaleloGestionHorarioEditable.js';
import { AsignacionHorarioPresentationMapper } from '../../mappers/horarios/AsignacionHorarioPresentationMapper.js';

export class UpdateAsignacionHorarioUseCase {
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

  async execute(id, body, userId = null) {
    const bloqueId = Number(id);
    if (!Number.isFinite(bloqueId) || bloqueId < 1) {
      throw new ValidationError('id de bloque inválido');
    }

    const existing = await this.asignacionHorarioRepository.findById(bloqueId);
    if (!existing) throw new NotFoundError('Bloque de horario');

    const asignacionDocenteId = Number(
      body?.asignacion_docente_id ?? body?.asignacionDocenteId ?? existing.teacherAssignmentId
    );
    const horarioId = Number(body?.horario_id ?? body?.horarioId ?? existing.scheduleId);
    const ordenSecuencia = Number(
      body?.orden_secuencia ?? body?.ordenSecuencia ?? existing.sequenceOrder ?? 1
    );

    if (!Number.isFinite(asignacionDocenteId) || asignacionDocenteId < 1) {
      throw new ValidationError('asignacion_docente_id inválido');
    }
    if (!Number.isFinite(horarioId) || horarioId < 1) {
      throw new ValidationError('horario_id inválido');
    }
    if (!Number.isFinite(ordenSecuencia) || ordenSecuencia < 1) {
      throw new ValidationError('orden_secuencia inválido');
    }

    const assignment = await this.teacherAssignmentRepository.findEnrichedById(asignacionDocenteId);
    if (!assignment?.vigente) throw new NotFoundError('Asignación docente');

    // Un bloque no puede cambiar de paralelo en gestión: el origen podría estar CERRADO.
    if (asignacionDocenteId !== Number(existing.teacherAssignmentId)) {
      const origen = await this.teacherAssignmentRepository.findEnrichedById(
        Number(existing.teacherAssignmentId)
      );
      if (origen && Number(origen.paralelo_gestion_id) !== Number(assignment.paralelo_gestion_id)) {
        throw new ValidationError('El bloque no puede moverse a una asignación de otro paralelo');
      }
    }

    const pg = await this.parallelManagementRepository.findById(assignment.paralelo_gestion_id);
    if (!pg) throw new NotFoundError('Paralelo en gestión');

    assertParaleloGestionHorarioReubicable(pg.state);

    if (body?.horario_id ?? body?.horarioId) {
      const horario = await this.scheduleRepository.findById(horarioId);
      if (!horario) throw new NotFoundError('Horario');
    }

    const { valido, conflictos } = await this.horarioConflictosService.validarPropuesta({
      asignacionDocenteId,
      horarioId,
      excludeAsignacionHorarioId: bloqueId,
      excludeAsignacionHorarioIds: Array.isArray(body?._exclude_asignacion_horario_ids)
        ? body._exclude_asignacion_horario_ids
        : Array.isArray(body?._excludeAsignacionHorarioIds)
          ? body._excludeAsignacionHorarioIds
          : null,
    });
    if (!valido) {
      throw new UnprocessableEntityError('Conflicto de horario', conflictos);
    }

    const updated = await this.asignacionHorarioRepository.update(
      bloqueId,
      {
        teacherAssignmentId: asignacionDocenteId,
        scheduleId: horarioId,
        sequenceOrder: ordenSecuencia,
      },
      userId
    );

    return {
      asignacion_horario: AsignacionHorarioPresentationMapper.toPresentation(updated),
    };
  }
}
