import { ValidationError } from '../../../domain/errors/index.js';

export class ValidarConflictoHorarioUseCase {
  constructor({ horarioConflictosService }) {
    this.horarioConflictosService = horarioConflictosService;
  }

  async execute(body) {
    const asignacionDocenteId = Number(
      body?.asignacion_docente_id ?? body?.asignacionDocenteId
    );
    const horarioId = Number(body?.horario_id ?? body?.horarioId);
    if (!Number.isFinite(asignacionDocenteId) || asignacionDocenteId < 1) {
      throw new ValidationError('asignacion_docente_id inválido');
    }
    if (!Number.isFinite(horarioId) || horarioId < 1) {
      throw new ValidationError('horario_id inválido');
    }
    const excludeAsignacionHorarioId =
      body?.asignacion_horario_id ?? body?.asignacionHorarioId ?? body?.exclude_id;

    return this.horarioConflictosService.validarPropuesta({
      asignacionDocenteId,
      horarioId,
      excludeAsignacionHorarioId,
    });
  }
}
