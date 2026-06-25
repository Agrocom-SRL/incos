/**
 * Centralizador de calificaciones por paralelo.
 *
 * Lee la vista base 135 en formato LARGO (una fila por estudiante × oferta_curso)
 * y la PIVOTA a matriz: columnas = asignaturas (identidad = oferta_curso_id,
 * orden por asignatura_orden), filas = estudiantes (orden por nombre_completo).
 * Cada celda lleva las 4 notas de bimestre, el promedio anual, la nota final y
 * el estado tal cual los entrega la vista (sin recalcular).
 */

const toNumberOrNull = (value) => (value == null ? null : Number(value));

export class GetCentralizadorParaleloUseCase {
  constructor({ calificacionCentralizadorRepository, logger }) {
    if (!calificacionCentralizadorRepository) {
      throw new Error('calificacionCentralizadorRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.paraleloGestionId
   */
  async execute({ paraleloGestionId }) {
    const pgId = Number(paraleloGestionId);

    const rows =
      await this.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion(
        pgId,
      );

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        paraleloGestionId: pgId,
        gestionId: null,
        asignaturas: [],
        estudiantes: [],
      };
    }

    let gestionId = null;
    const asignaturasMap = new Map(); // ofertaCursoId -> { ofertaCursoId, sigla, nombre, orden }
    const estudiantesMap = new Map(); // estudianteId -> { ...datos, notas }

    for (const row of rows) {
      if (gestionId == null && row.gestion_id != null) {
        gestionId = Number(row.gestion_id);
      }

      const ofertaCursoId = Number(row.oferta_curso_id);
      if (!asignaturasMap.has(ofertaCursoId)) {
        asignaturasMap.set(ofertaCursoId, {
          ofertaCursoId,
          sigla: row.asignatura_sigla ?? null,
          nombre: row.asignatura_nombre ?? null,
          orden: toNumberOrNull(row.asignatura_orden),
          docenteNombre: row.docente_nombre ?? null,
        });
      }

      const estudianteId = Number(row.estudiante_id);
      if (!estudiantesMap.has(estudianteId)) {
        estudiantesMap.set(estudianteId, {
          estudianteId,
          codigoEstudiante: row.codigo_estudiante ?? null,
          ci: row.ci ?? null,
          nombreCompleto: row.nombre_completo ?? '',
          notas: {},
        });
      }

      const estudiante = estudiantesMap.get(estudianteId);
      estudiante.notas[ofertaCursoId] = {
        bim1: toNumberOrNull(row.bim1),
        bim2: toNumberOrNull(row.bim2),
        bim3: toNumberOrNull(row.bim3),
        bim4: toNumberOrNull(row.bim4),
        promedioAnual: toNumberOrNull(row.promedio_anual),
        notaFinal: toNumberOrNull(row.nota_final),
        estado: row.estado ?? null,
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

    return {
      paraleloGestionId: pgId,
      gestionId,
      asignaturas,
      estudiantes,
    };
  }
}
