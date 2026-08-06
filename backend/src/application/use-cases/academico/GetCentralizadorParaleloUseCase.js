/**
 * Centralizador de calificaciones por paralelo.
 *
 * Lee la vista base 135 en formato LARGO (una fila por estudiante × oferta_curso)
 * y la PIVOTA a matriz: columnas = asignaturas (identidad = oferta_curso_id,
 * orden por asignatura_orden), filas = estudiantes (orden por nombre_completo).
 * Cada celda lleva las 4 notas de bimestre, el promedio anual y la nota final
 * tal cual los entrega la vista, MÁS `notaAnual`/`gestionCompleta`/`observacion`
 * (APROBADO/REPROBADO). `gestionCompleta` (¿están los 4 bimestres cargados?)
 * sigue viniendo de `calcularNotaFinalGestion` con los pesos de la política,
 * pero la nota y el veredicto YA NO se recalculan aquí: `notaAnual` es
 * `nota_final` (el mismo caché autoritativo de `matriculas_materia` que usa
 * el folio del Libro de registro) y `observacion` sale de
 * `calcularVeredictoMateria` (`libros/helpers/folioCeldasHelper.js`) — la
 * MISMA función que usa el folio, para que ambas pantallas emitan siempre el
 * mismo veredicto sobre el mismo dato.
 *
 * Integración con Libros de registro (opcional, no rompe si no está inyectada):
 * si `libroRegistroViewRepository` está presente, agrega `libro` (cabecera del
 * libro/folios del paralelo) y, por estudiante, `folioNumero`/`numeroOrdenFolio`
 * cuando el paralelo YA tiene folios generados. Sin folios generados, `libro`
 * queda en `null` (nunca un placeholder inventado).
 */

import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { calcularNotaFinalGestion } from '../../utils/cuadernoNotasCalculo.js';
import { calcularVeredictoMateria } from './libros/helpers/folioCeldasHelper.js';
import { ESTADOS_ACADEMICOS_FOLIO } from '../../../domain/constants/libros.constants.js';

const toNumberOrNull = (value) => (value == null ? null : Number(value));

export class GetCentralizadorParaleloUseCase {
  constructor({
    calificacionCentralizadorRepository,
    calificacionContextoRepository,
    evaluationConfigurationRepository,
    subjectEnrollmentBimesterRepository,
    libroRegistroViewRepository,
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
    // Cruce de dominio con Libros de registro (mismo dominio ACA), opcional:
    // si no está inyectada, el use case sigue funcionando sin el bloque `libro`.
    this.libroRegistroViewRepository = libroRegistroViewRepository;
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
        libro: null,
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
          // Ubicación en el Libro de registro (folio/orden), solo si el
          // paralelo ya tiene folios generados — ver bloque `libro` más abajo.
          folioNumero: null,
          numeroOrdenFolio: null,
          notas: {},
        });
      }

      const estudiante = estudiantesMap.get(estudianteId);

      // 'gestionCompleta' (¿están los 4 bimestres cargados?) sigue viniendo de
      // calcularNotaFinalGestion con los pesos de la política — eso NO cambia.
      // La nota y el veredicto YA NO se recalculan aquí: notaAnual es
      // nota_final (el mismo caché autoritativo que usa el folio del Libro) y
      // observacion sale de calcularVeredictoMateria (misma función que usa
      // el folio) — así ambas pantallas emiten siempre el mismo veredicto
      // sobre el mismo dato.
      const bimes = [
        toNumberOrNull(row.bim1),
        toNumberOrNull(row.bim2),
        toNumberOrNull(row.bim3),
        toNumberOrNull(row.bim4),
      ];
      const { gestionCompleta } = calcularNotaFinalGestion(
        bimes.map((nota, i) => ({ numero: i + 1, nota })),
        pesosBimestres,
      );
      const notaFinal = toNumberOrNull(row.nota_final);

      // La nota anual solo es un dato real cuando la gestión está completa (4
      // bimestres cargados). Con gestión incompleta se expone null, igual que
      // la observación — mostrar un número aquí induciría a leerlo como
      // definitivo cuando en realidad es un cálculo parcial sobre bimestres
      // sin cargar (bug histórico ya corregido: antes solo se gateaba 'observacion').
      let observacion = null;
      if (gestionCompleta) {
        const veredicto = calcularVeredictoMateria(row, notaMinimaAprobacion);
        observacion =
          veredicto === ESTADOS_ACADEMICOS_FOLIO.APROBADO ||
          veredicto === ESTADOS_ACADEMICOS_FOLIO.REPROBADO
            ? veredicto
            : null;
      }

      estudiante.notas[ofertaCursoId] = {
        bim1: bimes[0],
        bim2: bimes[1],
        bim3: bimes[2],
        bim4: bimes[3],
        promedioAnual: toNumberOrNull(row.promedio_anual),
        notaFinal,
        notaAnual: gestionCompleta ? notaFinal : null,
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

    // Bloque LIBRO/FOLIO real (Libros de registro, schema 25) — opcional y
    // read-only: no falla si no está inyectada o el paralelo aún no tiene
    // folios generados (`libro` queda en null, nunca un placeholder inventado).
    let libro = null;
    if (this.libroRegistroViewRepository) {
      const foliosDelParalelo =
        await this.libroRegistroViewRepository.listarFoliosPorParaleloGestion(pgId);
      if (Array.isArray(foliosDelParalelo) && foliosDelParalelo.length > 0) {
        const numerosFolio = foliosDelParalelo
          .map((f) => Number(f.numero_folio))
          .filter((n) => Number.isFinite(n));
        const primerFolio = foliosDelParalelo[0];
        libro = {
          numeroLibro: primerFolio.numero_libro ?? null,
          codigoRegistro: primerFolio.codigo_registro ?? null,
          folioDesde: numerosFolio.length > 0 ? Math.min(...numerosFolio) : null,
          folioHasta: numerosFolio.length > 0 ? Math.max(...numerosFolio) : null,
          estadoLibro: primerFolio.libro_estado ?? null,
        };

        const ubicaciones =
          await this.libroRegistroViewRepository.listarUbicacionEstudiantesPorParaleloGestion(
            pgId,
          );
        const ubicacionPorEstudiante = new Map();
        for (const row of ubicaciones ?? []) {
          const estId = Number(row.estudiante_id);
          if (Number.isFinite(estId)) {
            ubicacionPorEstudiante.set(estId, {
              folioNumero: row.numero_folio ?? null,
              numeroOrdenFolio: row.numero_orden ?? null,
            });
          }
        }
        for (const est of estudiantes) {
          const ubicacion = ubicacionPorEstudiante.get(est.estudianteId);
          if (ubicacion) {
            est.folioNumero = ubicacion.folioNumero;
            est.numeroOrdenFolio = ubicacion.numeroOrdenFolio;
          }
        }
      }
    }

    return {
      paraleloGestionId: pgId,
      gestionId,
      gestionAnio,
      gestionNombre,
      notaMinimaAprobacion,
      libro,
      asignaturas,
      estudiantes,
    };
  }
}
