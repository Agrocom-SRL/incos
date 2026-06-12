import { UnprocessableEntityError, ValidationError } from '../../../domain/errors/AppError.js';
import { DIVISIONES_PERIODO_ACADEMICO_VALUES } from '../../../domain/constants/gestion.constants.js';

/**
 * Crea una etapa (periodo) adicional en la gestión vigente. Pensado para etapas
 * personalizadas del calendario; los 4 bimestres y PLAN/CLAU vienen del seed.
 * Reutiliza `AcademicPeriodRepository.create`.
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

export class CreatePeriodoEtapaUseCase {
  constructor({ academicPeriodRepository, calificacionContextoRepository, logger }) {
    this.academicPeriodRepository = academicPeriodRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.logger = logger;
  }

  async execute({ nombre, fechaInicio, fechaFin, division = 'OTRO', colorHex = null }, userId = null) {
    if (!nombre || !String(nombre).trim()) {
      throw new ValidationError('El nombre de la etapa es obligatorio.');
    }
    if (!fechaInicio || !fechaFin) {
      throw new ValidationError('Las fechas de inicio y fin son obligatorias.');
    }
    if (String(fechaFin) < String(fechaInicio)) {
      throw new UnprocessableEntityError('La fecha de fin no puede ser anterior a la de inicio.', [
        { field: 'fechaFin', message: 'Rango de fechas inválido' },
      ]);
    }
    if (!DIVISIONES_PERIODO_ACADEMICO_VALUES.includes(division)) {
      throw new UnprocessableEntityError('División de periodo inválida.');
    }

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx) {
      const err = new Error('No hay gestión académica vigente');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const created = await this.academicPeriodRepository.create(
      {
        managementId: ctx.gestion_id,
        name: String(nombre).trim(),
        division,
        orderNumber: null,
        startDate: fechaInicio,
        endDate: fechaFin,
        colorHex: colorHex || null,
      },
      userId,
    );

    this.logger?.info?.('[Institucional] Etapa de periodo creada', {
      id: created?.id,
      gestionId: ctx.gestion_id,
    });

    return toPeriodoPresentation(created);
  }
}
