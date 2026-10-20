/**
 * Búsqueda de estudiantes para el wizard de Inscripción nueva.
 * No excluye a los ya matriculados en la gestión vigente (el operador puede
 * buscar sin saber si el estudiante ya está inscrito); solo los prioriza al
 * final y anota el flag yaMatriculadoGestionActual para que el frontend
 * bloquee la selección con un aviso.
 *
 * Modo soloNuevos: devuelve únicamente estudiantes con total_inscripciones = 0
 * (nuevos en el sistema, vista 153), orden created_at DESC, sin exigir término
 * de búsqueda — es la muestra inicial del paso «Buscar» del wizard.
 */

export class SearchStudentsForInscripcionUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.studentRepository - StudentRepository
   * @param {Object} params.logger
   */
  constructor({ studentRepository, logger }) {
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.studentRepository = studentRepository;
    this.logger = logger;
  }

  /**
   * @param {{ q?: string, limit?: number, preliminar?: boolean, soloNuevos?: boolean }} input
   * @returns {Promise<Array<Object>>}
   */
  async execute({ q, limit = 50, preliminar = false, soloNuevos = false }) {
    let rows;
    if (soloNuevos) {
      rows = await this.studentRepository.buscarParaInscripcion({
        soloNuevos: true,
        q: String(q ?? '').trim(),
        limit,
      });
    } else if (preliminar) {
      rows = await this.studentRepository.buscarParaInscripcion({ preliminar: true, limit });
    } else {
      const term = String(q ?? '').trim();
      if (term.length < 2) {
        return [];
      }
      rows = await this.studentRepository.buscarParaInscripcion({ q: term, limit });
    }

    return rows.map((row) => this.mapRowToDto(row));
  }

  mapRowToDto(row) {
    const nombres = row.nombres ?? '';
    const ap1 = row.apellido_paterno ?? '';
    const ap2 = row.apellido_materno ?? '';
    // Orden canónico de persona en colecciones: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES
    // (mismo criterio que buildFullName en el frontend y que las vistas de listado).
    const nombreCompleto =
      [ap1, ap2, nombres].filter((x) => String(x).trim()).join(' ').trim() || row.codigo_estudiante;

    const totalInscripciones =
      row.total_inscripciones != null ? Number(row.total_inscripciones) : 0;

    return {
      id: row.id,
      codigoEstudiante: row.codigo_estudiante,
      nombres: row.nombres,
      apellidoPaterno: row.apellido_paterno,
      apellidoMaterno: row.apellido_materno,
      nombreCompleto,
      emailPersonal: row.email_personal ?? null,
      celular: row.celular ?? null,
      telefonoFijo: row.telefono_fijo ?? null,
      ci: row.ci ?? null,
      expedicion: row.expedicion ?? null,
      carreraNombre: row.carrera_nombre ?? null,
      carreraCodigo: row.carrera_codigo ?? null,
      carreraId: row.carrera_id ?? null,
      tipoAdmision: row.tipo_admision ?? null,
      esNuevoSistema: totalInscripciones === 0,
      totalInscripciones,
      createdAt: row.created_at ?? null,
      yaMatriculadoGestionActual: row.inscripcion_gestion_actual_id != null,
      inscripcionGestionActualId: row.inscripcion_gestion_actual_id ?? null,
      gestionActualAnio: row.inscripcion_gestion_actual_anio ?? null,
      gestionActualNombre: row.inscripcion_gestion_actual_nombre ?? null,
    };
  }
}
