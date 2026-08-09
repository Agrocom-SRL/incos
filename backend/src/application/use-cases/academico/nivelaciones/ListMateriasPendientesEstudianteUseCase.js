/**
 * Materias pendientes/arrastradas de UN estudiante (B2, "Gap 2") — pantalla
 * `/academico/nivelaciones/inscribir` sin contexto (buscador de estudiante,
 * acceso por menú). Lee la MISMA vista base 185
 * (vista_base_nivelacion_paralelo_fila) que la grilla por paralelo, filtrada
 * por `estudiante_id` en vez de `paralelo_gestion_id`, quedándose solo con
 * las filas que YA tienen un evento de historial vigente.
 *
 * A diferencia de la grilla (`ListHistorialMatriculaParaleloUseCase`), que no
 * expone el ancla de escritura de la celda (gap real del contrato, documentado
 * en la Fase D), este use case SÍ expone `matriculaMateriaId`/`inscripcionId`+
 * `asignaturaPlanId` — es el origen real para el que quedó preparado el modo
 * `crear` de `EventoHistorialDrawer` (registrar un evento NUEVO, que expira el
 * vigente de la misma ancla, sin necesidad del deep-link de la grilla).
 */
const toNumberOrNull = (value) => (value == null ? null : Number(value));

export class ListMateriasPendientesEstudianteUseCase {
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
   * @param {number} params.estudianteId
   * @returns {Promise<{
   *   estudianteId: number,
   *   codigoEstudiante: string|null,
   *   nombreCompleto: string,
   *   materiasPendientes: Array<Object>,
   * }|null>} null si el estudiante no tiene ningún evento de historial vigente.
   */
  async execute({ estudianteId }) {
    const estId = Number(estudianteId);

    const rows = await this.nivelacionParaleloViewRepository.listarEventosPorEstudiante(estId);
    const safeRows = Array.isArray(rows) ? rows : [];

    if (safeRows.length === 0) {
      this.logger.info('[Nivelaciones] Materias pendientes de estudiante: sin eventos', {
        estudianteId: estId,
      });
      return null;
    }

    const primera = safeRows[0];

    const materiasPendientes = safeRows.map((row) => ({
      paraleloGestionId: toNumberOrNull(row.paralelo_gestion_id),
      ofertaCursoId: toNumberOrNull(row.oferta_curso_id),
      asignaturaPlanId: toNumberOrNull(row.asignatura_plan_id),
      asignaturaSigla: row.asignatura_sigla ?? null,
      asignaturaNombre: row.asignatura_nombre ?? null,
      matriculaMateriaId: toNumberOrNull(row.matricula_materia_id),
      inscripcionId: toNumberOrNull(row.inscripcion_id),
      esAnclaDirecta: Boolean(row.es_ancla_directa),
      evento: {
        historialMatriculaId: toNumberOrNull(row.historial_matricula_id),
        stateType: row.tipo_estado ?? null,
        resultingGrade: toNumberOrNull(row.nota_resultante),
        forcedGrade: Boolean(row.nota_forzada),
        transitionDate: row.fecha_transicion ?? null,
        observations: row.historial_observaciones ?? null,
        nivelacion:
          row.nivelacion_id != null
            ? {
                id: toNumberOrNull(row.nivelacion_id),
                status: row.nivelacion_estado ?? null,
                levelingGrade: toNumberOrNull(row.nota_nivelacion),
                passed: row.nivelacion_aprobada == null ? null : Boolean(row.nivelacion_aprobada),
                examDate: row.fecha_examen ?? null,
              }
            : null,
      },
    }));

    this.logger.info('[Nivelaciones] Materias pendientes de estudiante listadas', {
      estudianteId: estId,
      materias: materiasPendientes.length,
    });

    return {
      estudianteId: estId,
      codigoEstudiante: primera.codigo_estudiante ?? null,
      nombreCompleto: primera.nombre_completo ?? '',
      materiasPendientes,
    };
  }
}

export default ListMateriasPendientesEstudianteUseCase;
