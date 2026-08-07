/**
 * Listado de eventos de historial de matrícula (+ nivelación vinculada) de un
 * paralelo en gestión — pantalla Nivelaciones (ACA). Lee la vista base 185
 * (vista_base_nivelacion_paralelo_fila) y agrupa por estudiante; NO pivota a
 * una matriz de materias como el Centralizador (decisión de arquitectura:
 * Centralizador↔Nivelación separados, ver
 * docs/plan/calificaciones-centralizador-nivelacion-rediseno.md).
 *
 * v1: cada estudiante lleva su lista plana de eventos (una fila por materia
 * arrastrada/en nivelación). El frontend decide cómo visualizarlo (tabla o
 * grilla estilo Excel); no requiere cambios de backend para evolucionar esa
 * presentación, ya que el dato ya viene completo por evento.
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
   * @returns {Promise<{paraleloGestionId: number, estudiantes: Array<Object>}>}
   */
  async execute({ paraleloGestionId }) {
    const pgId = Number(paraleloGestionId);

    const rows =
      await this.nivelacionParaleloViewRepository.listarEventosPorParaleloGestion(pgId);
    const safeRows = Array.isArray(rows) ? rows : [];

    const estudiantesMap = new Map();
    for (const row of safeRows) {
      const estudianteId = Number(row.estudiante_id);
      if (!estudiantesMap.has(estudianteId)) {
        estudiantesMap.set(estudianteId, {
          estudianteId,
          codigoEstudiante: row.codigo_estudiante ?? null,
          nombreCompleto: row.nombre_completo ?? '',
          eventos: [],
        });
      }

      estudiantesMap.get(estudianteId).eventos.push({
        historialMatriculaId: toNumberOrNull(row.historial_matricula_id),
        subjectEnrollmentId: toNumberOrNull(row.matricula_materia_id),
        enrollmentId: toNumberOrNull(row.inscripcion_id),
        planSubjectId: toNumberOrNull(row.asignatura_plan_id),
        stateType: row.tipo_estado ?? null,
        resultingGrade: toNumberOrNull(row.nota_resultante),
        forcedGrade: Boolean(row.nota_forzada),
        transitionDate: row.fecha_transicion ?? null,
        observations: row.historial_observaciones ?? null,
        asignaturaSigla: row.asignatura_sigla ?? null,
        asignaturaNombre: row.asignatura_nombre ?? null,
        esMateriaCursada: Boolean(row.es_materia_cursada),
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
      });
    }

    const estudiantes = Array.from(estudiantesMap.values()).sort((a, b) =>
      String(a.nombreCompleto).localeCompare(String(b.nombreCompleto)),
    );

    this.logger.info('[Nivelaciones] Listado por paralelo', {
      paraleloGestionId: pgId,
      estudiantes: estudiantes.length,
    });

    return { paraleloGestionId: pgId, estudiantes };
  }
}

export default ListHistorialMatriculaParaleloUseCase;
