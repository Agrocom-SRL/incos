/**
 * Centralizador de calificaciones por paralelo.
 *
 * Lee la vista base 135 en formato LARGO (una fila por estudiante × oferta_curso)
 * y la PIVOTA a matriz: columnas = asignaturas (identidad = oferta_curso_id,
 * orden por asignatura_orden), filas = estudiantes (orden por nombre_completo).
 * Cada celda lleva las 4 notas de bimestre, el promedio anual y la nota final
 * tal cual los entrega la vista, MÁS la nota anual ponderada (`notaAnual`),
 * `gestionCompleta` y la `observacion` (APROBADO/REPROBADO) calculadas con los
 * pesos de bimestre de la política — el mismo cálculo que el Registro académico
 * por curso, para que el número coincida en ambas pantallas.
 */

import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { calcularNotaFinalGestion } from '../../utils/cuadernoNotasCalculo.js';

const toNumberOrNull = (value) => (value == null ? null : Number(value));

export class GetCentralizadorParaleloUseCase {
  constructor({
    calificacionCentralizadorRepository,
    calificacionContextoRepository,
    evaluationConfigurationRepository,
    subjectEnrollmentBimesterRepository,
    logger,
  }) {
    if (!calificacionCentralizadorRepository) {
      throw new Error('calificacionCentralizadorRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
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
    // pesosBimestres = pesos institucionales de los 4 bimestres (p. ej. 25/25/25/25)
    // para ponderar la nota anual igual que el Registro académico / Consolidado.
    const { notaMinimaAprobacion, pesosBimestres } = cuotas;

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

      // Nota ANUAL ponderada por asignatura: Σ(nota_bimestre × peso) / Σ(pesos de
      // los 4 bimestres). El divisor es siempre el 100 % del año, así un bimestre
      // aún no cargado NO infla la nota (mismo cálculo que el Consolidado por
      // curso → el mismo número aparece en ambas pantallas). 'gestionCompleta' es
      // true solo cuando los 4 bimestres tienen nota; recién entonces hay estado.
      const bimes = [
        toNumberOrNull(row.bim1),
        toNumberOrNull(row.bim2),
        toNumberOrNull(row.bim3),
        toNumberOrNull(row.bim4),
      ];
      const { notaFinal: notaAnual, gestionCompleta } = calcularNotaFinalGestion(
        bimes.map((nota, i) => ({ numero: i + 1, nota })),
        pesosBimestres,
      );
      let observacion = null;
      if (gestionCompleta && notaAnual != null) {
        observacion = notaAnual >= notaMinimaAprobacion ? 'APROBADO' : 'REPROBADO';
      }

      estudiante.notas[ofertaCursoId] = {
        bim1: bimes[0],
        bim2: bimes[1],
        bim3: bimes[2],
        bim4: bimes[3],
        promedioAnual: toNumberOrNull(row.promedio_anual),
        notaFinal: toNumberOrNull(row.nota_final),
        notaAnual,
        gestionCompleta,
        observacion,
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

    // Observaciones del bimestre (bimestres_matricula.observaciones), una por estudiante.
    if (this.subjectEnrollmentBimesterRepository) {
      const obsRows =
        await this.subjectEnrollmentBimesterRepository.listarObservacionesBimestrePorParaleloGestion(
          pgId,
        );
      const obsPorEstudiante = new Map();
      for (const row of obsRows ?? []) {
        const estId = Number(row.estudiante_id);
        const bim = Number(row.bimestre);
        if (!Number.isFinite(estId) || !Number.isFinite(bim)) continue;
        if (!obsPorEstudiante.has(estId)) {
          obsPorEstudiante.set(estId, { 1: null, 2: null, 3: null, 4: null });
        }
        const texto = row.observacion != null ? String(row.observacion).trim() : '';
        obsPorEstudiante.get(estId)[bim] = texto || null;
      }
      for (const est of estudiantes) {
        est.observacionesBimestre = obsPorEstudiante.get(est.estudianteId) ?? {
          1: null,
          2: null,
          3: null,
          4: null,
        };
      }
    }

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
