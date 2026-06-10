/**
 * Detalle de una actividad del cronograma (ficha DETALLE y precarga del form de edición).
 */
export class GetActividadCronogramaUseCase {
  constructor({ cronogramaGestionRepository, logger }) {
    this.cronogramaGestionRepository = cronogramaGestionRepository;
    this.logger = logger;
  }

  async execute(id) {
    const actividad = await this.cronogramaGestionRepository.obtenerActividadAdminPorId(id);
    if (!actividad) {
      const err = new Error('La actividad de cronograma no existe');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return {
      id: actividad.id,
      periodoAcademicoId: actividad.periodoAcademicoId,
      periodoNombre: actividad.periodoNombre,
      periodoColor: actividad.periodoColor ?? null,
      actividadId: actividad.actividadId ?? null,
      nombrePersonalizado: actividad.nombrePersonalizado ?? null,
      catalogoNombre: actividad.catalogoNombre ?? null,
      nombre: actividad.nombre,
      tipo: actividad.tipo ?? null,
      icono: actividad.icono ?? null,
      esDestacada: Boolean(actividad.esDestacada),
      codigo: actividad.codigo ?? null,
      fechaInicio: actividad.fechaInicio,
      fechaFin: actividad.fechaFin ?? null,
      estado: actividad.estado ?? null,
    };
  }
}
