import {
  NotFoundError,
  UnprocessableEntityError,
  ValidationError,
} from '../../../domain/errors/AppError.js';
import { parseFechaISO, parseIdPositivo } from '../../utils/validacionEntrada.js';

/**
 * Edita las fechas (inicio/fin) de un periodo/etapa de la gestión vigente.
 * Reutiliza `AcademicPeriodRepository.update` (CRUD heredado de BaseRepository).
 */

const toPeriodoPresentation = (e) => ({
  id: e.id,
  nombre: e.name,
  division: e.division,
  numeroOrden: e.orderNumber ?? null,
  colorHex: e.colorHex ?? null,
  fechaInicio: e.startDate,
  fechaFin: e.endDate,
});

export class UpdatePeriodoFechasUseCase {
  constructor({ academicPeriodRepository, calificacionContextoRepository, logger }) {
    this.academicPeriodRepository = academicPeriodRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.logger = logger;
  }

  /**
   * @param {{ id: number, fechaInicio: string, fechaFin: string }} params
   * @param {number|null} userId
   */
  async execute({ id, fechaInicio: inicioRaw, fechaFin: finRaw }, userId = null) {
    const periodoId = parseIdPositivo(id, 'id de periodo');
    if (inicioRaw == null || inicioRaw === '' || finRaw == null || finRaw === '') {
      throw new ValidationError('fechaInicio y fechaFin son obligatorias');
    }
    const fechaInicio = parseFechaISO(inicioRaw, 'fechaInicio');
    const fechaFin = parseFechaISO(finRaw, 'fechaFin');
    if (fechaFin < fechaInicio) {
      throw new UnprocessableEntityError('La fecha de fin no puede ser anterior a la de inicio.', [
        { field: 'fechaFin', message: 'Rango de fechas inválido' },
      ]);
    }

    const existing = await this.academicPeriodRepository.findById(periodoId);
    if (!existing) {
      throw new NotFoundError(`Periodo con ID ${periodoId}`);
    }

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx || existing.managementId !== ctx.gestion_id) {
      throw new UnprocessableEntityError('El periodo no pertenece a la gestión vigente.');
    }

    const updated = await this.academicPeriodRepository.update(
      periodoId,
      { startDate: fechaInicio, endDate: fechaFin },
      userId,
    );

    this.logger?.info?.('[Institucional] Fechas de periodo actualizadas', {
      periodoId,
      fechaInicio,
      fechaFin,
    });

    return toPeriodoPresentation(updated);
  }
}
