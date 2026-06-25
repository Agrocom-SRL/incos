/**
 * Centralizador de calificaciones por paralelo.
 *
 * Lee la vista base 135 en formato LARGO (una fila por estudiante × oferta_curso)
 * y la PIVOTA a matriz: columnas = asignaturas (identidad = oferta_curso_id,
 * orden por asignatura_orden), filas = estudiantes (orden por nombre_completo).
 * Cada celda lleva las 4 notas de bimestre, el promedio anual, la nota final y
 * el estado tal cual los entrega la vista (sin recalcular).
 */

import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';

const toNumberOrNull = (value) => (value == null ? null : Number(value));

export class GetCentralizadorParaleloUseCase {
  constructor({
    calificacionCentralizadorRepository,
    calificacionContextoRepository,
    evaluationConfigurationRepository,
    logger,
  }) {
    if (!calificacionCentralizadorRepository) {
      throw new Error('calificacionCentralizadorRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
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
    const safeRows = Array.isArray(rows) ? rows : [];

    // Cabecera de gestión (todas las filas comparten gestión).
    const gestionId = safeRows[0]?.gestion_id != null ? Number(safeRows[0].gestion_id) : null;
    const gestionAnio = safeRows[0]?.gestion_anio != null ? Number(safeRows[0].gestion_anio) : null;
    const gestionNombre = safeRows[0]?.gestion_nombre ?? null;

    // Nota mínima de aprobación desde la política institucional (no hardcodeada).
    const cuotas = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });
    const notaMinimaAprobacion = cuotas.notaMinimaAprobacion;

    if (safeRows.length === 0) {
      return {
        paraleloGestionId: pgId,
        gestionId,
        gestionAnio,
        gestionNombre,
        notaMinimaAprobacion,
        asignaturas: [],
        estudiantes: [],
      };
    }

    const asignaturasMap = new Map(); // ofertaCursoId -> { ofertaCursoId, sigla, nombre, orden }
    const estudiantesMap = new Map(); // estudianteId -> { ...datos, notas }

    for (const row of safeRows) {
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
      gestionAnio,
      gestionNombre,
      notaMinimaAprobacion,
      asignaturas,
      estudiantes,
    };
  }
}
