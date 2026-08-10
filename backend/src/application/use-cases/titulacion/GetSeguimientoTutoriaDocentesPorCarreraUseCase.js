import { TutoriaAvanceMapper } from '../../mappers/titulacion/index.js';

/**
 * Use Case: GetSeguimientoTutoriaDocentesPorCarreraUseCase
 * Módulo: Titulación (TIT) — extensión 2026-08-10
 *
 * Variante POR CARRERA de `GetSeguimientoTutoriaDocentesUseCase`, exclusiva
 * de la exportación Excel "PLANILLA DE SEGUIMIENTO A DOCENTES EN TUTORÍAS":
 * mismo filtro temporal MES + AÑO calendario (default = mes/año actual del
 * servidor) y misma fuente (`findSeguimientoTutoriaDocentes`), pero agrupa
 * las filas planas por CARRERA en vez de por DOCENTE — el reporte físico es
 * "una hoja por carrera" con todos sus docentes-tutores en una tabla plana
 * (columna DOCENTE por fila, sin sub-cabeceras): un docente que tutora en
 * más de una carrera aparece en cada hoja de esas carreras, solo con los
 * tutoriados de esa carrera. El tablero en pantalla sigue usando el use
 * case por docente original, sin cambios.
 */
export class GetSeguimientoTutoriaDocentesPorCarreraUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.tutoriaAvanceViewRepository - Vistas 180/181
   * @param {ILogger} params.logger
   */
  constructor({ tutoriaAvanceViewRepository, logger }) {
    this.tutoriaAvanceViewRepository = tutoriaAvanceViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} [queryParams] - { docenteId, carreraId, anio, mes }
   * @returns {Promise<{seguimientoTutoriaDocentesPorCarrera: Object}>}
   */
  async execute(queryParams = {}) {
    const ahora = new Date();
    const anio = queryParams.anio ? Number(queryParams.anio) : ahora.getFullYear();
    const mes = queryParams.mes ? Number(queryParams.mes) : ahora.getMonth() + 1;
    const docenteId = queryParams.docenteId ? Number(queryParams.docenteId) : undefined;
    const carreraId = queryParams.carreraId ? Number(queryParams.carreraId) : undefined;

    const rows = await this.tutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes({
      docenteId,
      carreraId,
      anio,
      mes,
    });

    const filas = TutoriaAvanceMapper.seguimientoDocentesRowsToPresentation(rows);

    const carreras = this._agruparPorCarrera(filas);

    const seguimientoTutoriaDocentesPorCarrera = { anio, mes, carreras };

    this.logger.info('[Titulación] Seguimiento de tutorías a docentes por carrera generado', {
      anio,
      mes,
      docenteId,
      carreraId,
      carreras: carreras.length,
      tutoriados: filas.length,
    });

    return { seguimientoTutoriaDocentesPorCarrera };
  }

  /**
   * Agrupa las filas planas (un tutoriado por fila) en bloques por CARRERA,
   * con las filas ordenadas por docente y luego por tutoriado (tabla plana,
   * sin sub-cabeceras — la columna DOCENTE de cada fila identifica al tutor).
   * @private
   * @param {Array<Object>} filas
   * @returns {Array<Object>}
   */
  _agruparPorCarrera(filas) {
    const carrerasMap = new Map();

    for (const fila of filas) {
      const carreraKey = fila.carreraId ?? 'sin-carrera';
      if (!carrerasMap.has(carreraKey)) {
        carrerasMap.set(carreraKey, {
          carreraId: fila.carreraId,
          carreraNombre: fila.carreraNombre ?? 'SIN CARRERA',
          tutoriados: [],
        });
      }

      carrerasMap.get(carreraKey).tutoriados.push({
        docenteId: fila.docenteId,
        docenteNombre: fila.docenteNombre,
        estudianteId: fila.estudianteId,
        nombreCompleto: fila.nombreCompleto,
        proyectoGradoId: fila.proyectoGradoId,
        proyectoTitulo: fila.proyectoTitulo,
        totalTutoriasMes: fila.totalTutoriasMes,
        tutoriasEjecutadasMes: fila.tutoriasEjecutadasMes,
        porcentajeAvance: fila.porcentajeAvance,
        ultimaActividad: fila.ultimaActividad,
        ultimaObservacion: fila.ultimaObservacion,
      });
    }

    return [...carrerasMap.values()]
      .map((carrera) => ({
        ...carrera,
        tutoriados: carrera.tutoriados.sort(
          (a, b) =>
            (a.docenteNombre ?? '').localeCompare(b.docenteNombre ?? '') ||
            (a.nombreCompleto ?? '').localeCompare(b.nombreCompleto ?? '')
        ),
      }))
      .sort((a, b) => (a.carreraNombre ?? '').localeCompare(b.carreraNombre ?? ''));
  }
}

export default GetSeguimientoTutoriaDocentesPorCarreraUseCase;
