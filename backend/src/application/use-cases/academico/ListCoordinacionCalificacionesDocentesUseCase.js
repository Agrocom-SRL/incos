/**
 * Listado de docentes para coordinación de calificaciones (gestión vigente + búsqueda).
 */

export class ListCoordinacionCalificacionesDocentesUseCase {
  constructor({
    calificacionContextoRepository,
    calificacionCoordinacionRepository,
    logger,
  }) {
    if (!calificacionContextoRepository) {
      throw new Error('calificacionContextoRepository es requerido');
    }
    if (!calificacionCoordinacionRepository) {
      throw new Error('calificacionCoordinacionRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.logger = logger;
  }

  async execute({ q, limit = 50, preliminar = false }) {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
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
      rows = await this.calificacionCoordinacionRepository.listarDocentesCoordinacion({
        preliminar: true,
        limit,
      });
    } else {
      const term = String(q ?? '').trim();
      if (term.length < 2) {
        rows = await this.calificacionCoordinacionRepository.listarDocentesCoordinacion({
          preliminar: true,
          limit,
        });
      } else {
        rows = await this.calificacionCoordinacionRepository.listarDocentesCoordinacion({
          q: term,
          limit,
        });
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
