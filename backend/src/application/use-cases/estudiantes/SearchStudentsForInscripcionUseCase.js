/**
 * Búsqueda de estudiantes para el wizard de Inscripción nueva.
 * No excluye a los ya matriculados en la gestión vigente (el operador puede
 * buscar sin saber si el estudiante ya está inscrito); solo los prioriza al
 * final y anota el flag yaMatriculadoGestionActual para que el frontend
 * bloquee la selección con un aviso.
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
   * @param {{ q?: string, limit?: number, preliminar?: boolean }} input
   * @returns {Promise<Array<Object>>}
   */
  async execute({ q, limit = 50, preliminar = false }) {
    let rows;
    if (preliminar) {
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
    const nombreCompleto =
      [nombres, ap1, ap2].filter((x) => String(x).trim()).join(' ').trim() || row.codigo_estudiante;

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
      createdAt: row.created_at ?? null,
      yaMatriculadoGestionActual: row.inscripcion_gestion_actual_id != null,
      inscripcionGestionActualId: row.inscripcion_gestion_actual_id ?? null,
      gestionActualAnio: row.inscripcion_gestion_actual_anio ?? null,
      gestionActualNombre: row.inscripcion_gestion_actual_nombre ?? null,
    };
  }
}
