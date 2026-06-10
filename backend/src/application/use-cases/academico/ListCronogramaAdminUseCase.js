/**
 * Datos de la pantalla de administración del Cronograma (gestión vigente):
 * actividades editables + periodos/etapas + catálogo de actividades para los selects.
 */

const mapActividad = (row) => ({
  id: row.id,
  periodoAcademicoId: row.periodoAcademicoId,
  periodoNombre: row.periodoNombre,
  periodoNumeroOrden: row.periodoNumeroOrden ?? null,
  actividadId: row.actividadId ?? null,
  nombrePersonalizado: row.nombrePersonalizado ?? null,
  catalogoNombre: row.catalogoNombre ?? null,
  nombre: row.nombre,
  tipo: row.tipo ?? null,
  icono: row.icono ?? null,
  esDestacada: Boolean(row.esDestacada),
  codigo: row.codigo ?? null,
  fechaInicio: row.fechaInicio,
  fechaFin: row.fechaFin ?? null,
  estado: row.estado,
});

export class ListCronogramaAdminUseCase {
  constructor({ cronogramaGestionRepository, logger }) {
    this.cronogramaGestionRepository = cronogramaGestionRepository;
    this.logger = logger;
  }

  async execute() {
    const data = await this.cronogramaGestionRepository.obtenerAdminVigente();
    if (!data) {
      const err = new Error('No hay gestión académica vigente');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const { contexto, actividades, periodos, catalogo } = data;
    return {
      gestion: {
        id: contexto.gestion_id,
        anio: contexto.gestion_anio,
        nombre: contexto.gestion_nombre,
        codigo: contexto.gestion_codigo ?? null,
      },
      actividades: actividades.map(mapActividad),
      periodos,
      catalogo,
    };
  }
}
