import { NotFoundError, UnprocessableEntityError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Baja (soft delete) de una etapa adicional de la gestión vigente.
 * Protege los periodos estructurales (bimestres, planificación, clausura) que
 * sustentan el flujo iniciar/cerrar. FK de `actividades_calendario` es
 * ON DELETE SET NULL, así que las actividades quedan sin etapa, no se borran.
 */

const PROTEGIDOS = ['BIMESTRE', 'PLANIFICACION', 'CLAUSURA'];

export class DeletePeriodoEtapaUseCase {
  constructor({ academicPeriodRepository, calificacionContextoRepository, logger }) {
    this.academicPeriodRepository = academicPeriodRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const periodoId = Number(id);
    if (!Number.isFinite(periodoId) || periodoId < 1) {
      throw new ValidationError('id de periodo inválido');
    }

    const existing = await this.academicPeriodRepository.findById(periodoId);
    if (!existing) {
      throw new NotFoundError(`Periodo con ID ${periodoId}`);
    }

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx || existing.managementId !== ctx.gestion_id) {
      throw new UnprocessableEntityError('El periodo no pertenece a la gestión vigente.');
    }

    if (PROTEGIDOS.includes(existing.division)) {
      throw new UnprocessableEntityError(
        'Las etapas estructurales (bimestres, planificación y clausura) no se pueden eliminar.',
      );
    }

    await this.academicPeriodRepository.delete(periodoId, userId);
    this.logger?.info?.('[Institucional] Etapa de periodo eliminada', { periodoId });
    return { id: periodoId };
  }
}
