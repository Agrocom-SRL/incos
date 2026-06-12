/**
 * Periodos/etapas de la gestión vigente para la pantalla de configuración de
 * bimestres (Institucional → Gestión actual → Control de bimestres).
 * Lectura sobre `CronogramaGestionRepository.obtenerPeriodosGestion` (todas las
 * divisiones: PLAN, BIM1–BIM4, CLAU y etapas adicionales).
 */

const mapPeriodo = (row) => ({
  id: row.periodoAcademicoId,
  nombre: row.nombre,
  division: row.division,
  numeroOrden: row.numeroOrden ?? null,
  colorHex: row.color ?? null,
  fechaInicio: row.fechaInicio,
  fechaFin: row.fechaFin,
});

export class GetPeriodosGestionUseCase {
  constructor({ calificacionContextoRepository, cronogramaGestionRepository, logger }) {
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cronogramaGestionRepository = cronogramaGestionRepository;
    this.logger = logger;
  }

  async execute() {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx) {
      const err = new Error('No hay gestión académica vigente');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const periodos = await this.cronogramaGestionRepository.obtenerPeriodosGestion(ctx.gestion_id);

    return {
      gestion: {
        id: ctx.gestion_id,
        anio: ctx.gestion_anio,
        nombre: ctx.gestion_nombre,
        codigo: ctx.gestion_codigo ?? null,
        fechaInicio: ctx.gestion_fecha_inicio ?? null,
        fechaFin: ctx.gestion_fecha_fin ?? null,
      },
      periodos: periodos.map(mapPeriodo),
    };
  }
}
