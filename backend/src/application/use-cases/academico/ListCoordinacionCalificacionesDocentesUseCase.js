/**
 * Listado de docentes para coordinación de calificaciones (gestión vigente + búsqueda).
 */

export class ListCoordinacionCalificacionesDocentesUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../infrastructure/repositories/CalificacionRepository.js').CalificacionRepository} params.calificacionRepository
   * @param {Object} params.logger
   */
  constructor({ calificacionRepository, logger }) {
    if (!calificacionRepository) throw new Error('calificacionRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.calificacionRepository = calificacionRepository;
    this.logger = logger;
  }

  /**
   * @param {{ q?: string, limit?: number, preliminar?: boolean }} input
   * @returns {Promise<{ gestionVigente: string|null, docentes: Array }>}
   */
  async execute({ q, limit = 50, preliminar = false }) {
    const ctx = await this.calificacionRepository.obtenerContextoVigente();
    const gestionVigente =
      ctx?.gestion_nombre != null
        ? String(ctx.gestion_nombre)
        : ctx?.gestion_anio != null
          ? String(ctx.gestion_anio)
          : null;

    const mapCarreras = (raw) =>
      String(raw ?? '')
        .split('|||')
        .map((chunk) => {
          const partes = chunk.split(':::');
          const nombre = (partes[0] ?? '').trim();
          if (!nombre) return null;
          const colorHex = (partes[1] ?? '').trim() || null;
          return { nombre, colorHex };
        })
        .filter(Boolean);

    let rows;
    if (preliminar) {
      rows = await this.calificacionRepository.listarDocentesCoordinacion({ preliminar: true, limit });
    } else {
      const term = String(q ?? '').trim();
      if (term.length < 2) {
        rows = await this.calificacionRepository.listarDocentesCoordinacion({ preliminar: true, limit });
      } else {
        rows = await this.calificacionRepository.listarDocentesCoordinacion({ q: term, limit });
      }
    }

    const docentes = rows.map((row) => ({
      id: row.docente_id,
      nombre: row.docente_nombre ?? '',
      especialidad: row.docente_especialidad ?? null,
      cantidadCursos: Number(row.cantidad_cursos ?? 0),
      cantidadMaterias: Number(row.cantidad_materias ?? 0),
      cantidadEstudiantes: Number(row.cantidad_estudiantes ?? 0),
      carreras: mapCarreras(row.carreras_detalle),
    }));

    return {
      gestionVigente,
      docentes,
    };
  }
}
