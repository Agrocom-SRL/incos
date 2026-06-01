export class ValidarConflictoHorarioUseCase {
  constructor({ horarioConflictosService }) {
    this.horarioConflictosService = horarioConflictosService;
  }

  async execute(body) {
    const asignacionDocenteId = Number(
      body?.asignacion_docente_id ?? body?.asignacionDocenteId
    );
    const horarioId = Number(body?.horario_id ?? body?.horarioId);
    const aulaIdRaw = body?.aula_id ?? body?.aulaId;
    const aulaId =
      aulaIdRaw == null || aulaIdRaw === '' ? null : Number(aulaIdRaw);
    const excludeAsignacionHorarioId =
      body?.asignacion_horario_id ?? body?.asignacionHorarioId ?? body?.exclude_id;

    return this.horarioConflictosService.validarPropuesta({
      asignacionDocenteId,
      horarioId,
      aulaId,
      excludeAsignacionHorarioId,
    });
  }
}
