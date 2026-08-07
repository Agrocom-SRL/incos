/**
 * Grilla de Nivelación de un paralelo en gestión — pantalla Nivelaciones
 * (ACA), nivel 2 (`/academico/nivelaciones/listar/:paraleloGestionId`). Lee
 * la vista base 185 (vista_base_nivelacion_paralelo_fila) y PIVOTA al mismo
 * grano que el Centralizador (`GetCentralizadorParaleloUseCase`): filas =
 * estudiantes, columnas = asignaturas del plan del paralelo (identidad =
 * ofertaCursoId). Cada celda lleva la nota normal (135) y, si existe, el
 * evento de historial vigente (+ nivelación vinculada) — el frontend decide
 * mostrar la nota o un StatusPill con el evento.
 *
 * Decisión de arquitectura (docs/plan/calificaciones-centralizador-nivelacion-rediseno.md):
 * Centralizador y Nivelación quedan SEPARADOS — este use case NO reutiliza
 * `GetCentralizadorParaleloUseCase`, tiene su propia query (vista 185), pero
 * SÍ comparte el mismo grano de pivote para que la grilla se sienta igual.
 */
const toNumberOrNull = (value) => (value == null ? null : Number(value));

export class ListHistorialMatriculaParaleloUseCase {
  constructor({ nivelacionParaleloViewRepository, logger }) {
    if (!nivelacionParaleloViewRepository) {
      throw new Error('nivelacionParaleloViewRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.nivelacionParaleloViewRepository = nivelacionParaleloViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.paraleloGestionId
   * @returns {Promise<{
   *   paraleloGestionId: number,
   *   asignaturas: Array<Object>,
   *   estudiantes: Array<Object>,
   *   totalEstudiantes: number,
   *   totalPendientes: number,
   * }>}
   */
  async execute({ paraleloGestionId }) {
    const pgId = Number(paraleloGestionId);

    const rows =
      await this.nivelacionParaleloViewRepository.listarEventosPorParaleloGestion(pgId);
    const safeRows = Array.isArray(rows) ? rows : [];

    const asignaturasMap = new Map();
    const estudiantesMap = new Map();

    for (const row of safeRows) {
      const ofertaCursoId = Number(row.oferta_curso_id);
      if (!asignaturasMap.has(ofertaCursoId)) {
        asignaturasMap.set(ofertaCursoId, {
          ofertaCursoId,
          sigla: row.asignatura_sigla ?? null,
          nombre: row.asignatura_nombre ?? null,
          orden: toNumberOrNull(row.asignatura_orden),
        });
      }

      const estudianteId = Number(row.estudiante_id);
      if (!estudiantesMap.has(estudianteId)) {
        estudiantesMap.set(estudianteId, {
          estudianteId,
          codigoEstudiante: row.codigo_estudiante ?? null,
          nombreCompleto: row.nombre_completo ?? '',
          celdas: {},
          tienePendiente: false,
        });
      }

      const estudiante = estudiantesMap.get(estudianteId);
      const tieneEvento = row.historial_matricula_id != null;
      if (tieneEvento) estudiante.tienePendiente = true;

      estudiante.celdas[ofertaCursoId] = {
        notaFinal: toNumberOrNull(row.nota_final),
        estadoMatricula: row.estado_matricula ?? null,
        evento: tieneEvento
          ? {
              historialMatriculaId: toNumberOrNull(row.historial_matricula_id),
              stateType: row.tipo_estado ?? null,
              resultingGrade: toNumberOrNull(row.nota_resultante),
              forcedGrade: Boolean(row.nota_forzada),
              transitionDate: row.fecha_transicion ?? null,
              observations: row.historial_observaciones ?? null,
              esAnclaDirecta: Boolean(row.es_ancla_directa),
              nivelacion:
                row.nivelacion_id != null
                  ? {
                      id: toNumberOrNull(row.nivelacion_id),
                      status: row.nivelacion_estado ?? null,
                      levelingGrade: toNumberOrNull(row.nota_nivelacion),
                      passed:
                        row.nivelacion_aprobada == null
                          ? null
                          : Boolean(row.nivelacion_aprobada),
                      examDate: row.fecha_examen ?? null,
                    }
                  : null,
            }
          : null,
      };
    }

    const asignaturas = Array.from(asignaturasMap.values()).sort((a, b) => {
      const oa = a.orden == null ? Number.POSITIVE_INFINITY : a.orden;
      const ob = b.orden == null ? Number.POSITIVE_INFINITY : b.orden;
      return oa - ob;
    });

    const estudiantes = Array.from(estudiantesMap.values()).sort((a, b) =>
      String(a.nombreCompleto).localeCompare(String(b.nombreCompleto)),
    );

    const totalPendientes = estudiantes.filter((e) => e.tienePendiente).length;

    this.logger.info('[Nivelaciones] Grilla por paralelo', {
      paraleloGestionId: pgId,
      estudiantes: estudiantes.length,
      pendientes: totalPendientes,
    });

    return {
      paraleloGestionId: pgId,
      asignaturas,
      estudiantes,
      totalEstudiantes: estudiantes.length,
      totalPendientes,
    };
  }
}

export default ListHistorialMatriculaParaleloUseCase;
