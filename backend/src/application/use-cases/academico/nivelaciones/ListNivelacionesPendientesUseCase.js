/**
 * Bandeja plana de exámenes de nivelación PROGRAMADA/EN_CURSO, cruzando
 * todos los paralelos — landing de `/academico/nivelaciones/aprobar` (B3).
 * Lee la vista base 187 (vista_base_nivelacion_bandeja_fila): grano 1 fila
 * por nivelación, sin pasar por el pivote de paralelo (185) — no depende de
 * que el evento tenga columna coincidente en el plan vigente del paralelo.
 */
const toNumberOrNull = (value) => (value == null ? null : Number(value));

export class ListNivelacionesPendientesUseCase {
  constructor({ nivelacionParaleloViewRepository, logger }) {
    if (!nivelacionParaleloViewRepository) {
      throw new Error('nivelacionParaleloViewRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.nivelacionParaleloViewRepository = nivelacionParaleloViewRepository;
    this.logger = logger;
  }

  /**
   * @returns {Promise<{nivelaciones: Array<Object>}>}
   */
  async execute() {
    const rows = await this.nivelacionParaleloViewRepository.listarNivelacionesPendientes();
    const safeRows = Array.isArray(rows) ? rows : [];

    const nivelaciones = safeRows.map((row) => ({
      nivelacionId: toNumberOrNull(row.nivelacion_id),
      status: row.nivelacion_estado ?? null,
      levelingGrade: toNumberOrNull(row.nota_nivelacion),
      passed: row.nivelacion_aprobada == null ? null : Boolean(row.nivelacion_aprobada),
      examDate: row.fecha_examen ?? null,
      evaluatorTeacherId: toNumberOrNull(row.docente_evaluador_id),
      historialMatriculaId: toNumberOrNull(row.historial_matricula_id),
      stateType: row.tipo_estado ?? null,
      transitionDate: row.fecha_transicion ?? null,
      observations: row.historial_observaciones ?? null,
      subjectEnrollmentId: toNumberOrNull(row.matricula_materia_id),
      estudianteId: toNumberOrNull(row.estudiante_id),
      codigoEstudiante: row.codigo_estudiante ?? null,
      nombreCompleto: row.nombre_completo ?? '',
      asignaturaSigla: row.asignatura_sigla ?? null,
      asignaturaNombre: row.asignatura_nombre ?? null,
      // Solo presente cuando la materia se cursa este año (ancla directa);
      // null en materias arrastradas (sin oferta_curso este año).
      paraleloGestionId: toNumberOrNull(row.paralelo_gestion_id),
    }));

    this.logger.info('[Nivelaciones] Bandeja de pendientes', { total: nivelaciones.length });

    return { nivelaciones };
  }
}

export default ListNivelacionesPendientesUseCase;
