/**
 * Cronograma académico de la gestión vigente.
 *
 * Devuelve las actividades del calendario agrupadas por periodo (planificación,
 * bimestres, clausura) y una lista corta de próximas actividades. Lo consume
 * Institucional → Gestión actual (`institucional.gestion.actual` LISTAR) y, por
 * compartir el endpoint, también Calificaciones.
 */

const mapActividad = (row) => ({
  id: row.actividad_calendario_id,
  actividadId: row.actividad_id ?? null,
  periodoAcademicoId: row.periodo_academico_id,
  periodoNombre: row.periodo_nombre,
  nombre: row.nombre,
  descripcion: row.descripcion ?? null,
  tipo: row.tipo ?? null,
  icono: row.icono ?? null,
  esDestacada: Boolean(row.es_destacada),
  codigo: row.codigo ?? null,
  fechaInicio: row.fecha_inicio,
  fechaFin: row.fecha_fin ?? null,
  estado: row.estado_actividad,
});

export class GetCronogramaGestionUseCase {
  constructor({ cronogramaGestionRepository, logger }) {
    this.cronogramaGestionRepository = cronogramaGestionRepository;
    this.logger = logger;
  }

  async execute() {
    const data = await this.cronogramaGestionRepository.obtenerCronogramaVigente();
    if (!data) {
      const err = new Error('No hay gestión académica vigente');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const { contexto, actividades } = data;

    const gestion = {
      id: contexto.gestion_id,
      anio: contexto.gestion_anio,
      nombre: contexto.gestion_nombre,
      codigo: contexto.gestion_codigo ?? null,
      bimestreVigente: contexto.bimestre_vigente ?? null,
    };

    // Agrupar por periodo conservando el orden cronológico ya aplicado en la vista.
    const periodosMap = new Map();
    for (const row of actividades) {
      const key = row.periodo_academico_id;
      if (!periodosMap.has(key)) {
        periodosMap.set(key, {
          periodoAcademicoId: row.periodo_academico_id,
          nombre: row.periodo_nombre,
          division: row.periodo_division,
          numeroOrden: row.periodo_numero_orden ?? null,
          color: row.periodo_color ?? null,
          fechaInicio: row.periodo_fecha_inicio ?? null,
          fechaFin: row.periodo_fecha_fin ?? null,
          actividades: [],
        });
      }
      periodosMap.get(key).actividades.push(mapActividad(row));
    }
    const periodos = Array.from(periodosMap.values());

    // Próximas actividades: vigentes + futuras, las 6 más cercanas por fecha de inicio.
    const proximasActividades = actividades
      .filter((a) => a.estado_actividad === 'futura' || a.estado_actividad === 'vigente')
      .map(mapActividad)
      .sort((x, y) => String(x.fechaInicio).localeCompare(String(y.fechaInicio)))
      .slice(0, 6);

    this.logger?.info?.('[Institucional] Cronograma gestión cargado', {
      gestionId: gestion.id,
      periodos: periodos.length,
      actividades: actividades.length,
    });

    return { gestion, periodos, proximasActividades };
  }
}
