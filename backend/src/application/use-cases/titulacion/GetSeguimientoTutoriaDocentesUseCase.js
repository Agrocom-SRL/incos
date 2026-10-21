import { parseAnioMes, parseFiltroId } from '../../utils/validacionEntrada.js';
import { TutoriaAvanceMapper } from '../../mappers/titulacion/index.js';

/**
 * Use Case: GetSeguimientoTutoriaDocentesUseCase
 * Módulo: Titulación (TIT) — extensión 2026-08-10
 *
 * Reporte ADMINISTRATIVO de seguimiento de tutorías A LOS DOCENTES (no a
 * los estudiantes), para que Dirección Académica verifique que cada
 * docente-tutor cumple sus tutorías. Reemplaza la "Planilla de avance 10 en
 * 10" de 3er año, que dependía de Matrícula (`periodo_numero = 3`, sin datos
 * en desarrollo) y no correspondía a ningún documento físico real. Réplica
 * digital de "PLANILLA DE SEGUIMIENTO DE TUTORIA 2026.xlsx".
 *
 * Roster de tutoriados ACTIVOS por docente-tutor (vista 181), con el
 * agregado mensual de bitácora (vista 180) ya resuelto por el repositorio
 * (LEFT JOIN filtrado por año/mes — ningún tutoriado se pierde si su
 * proyecto no tuvo bitácora ese mes, queda con 0/NULL). Filtro temporal por
 * MES + AÑO calendario (no bimestre): default = mes/año actual del
 * servidor, resuelto aquí (no en la vista, no hay dependencia de
 * `periodos_academicos`).
 */
export class GetSeguimientoTutoriaDocentesUseCase {
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
   * @returns {Promise<{seguimientoTutoriaDocentes: Object}>}
   */
  async execute(queryParams = {}) {
    const ahora = new Date();
    const { anio, mes } = parseAnioMes(queryParams, {
      anioDefecto: ahora.getFullYear(),
      mesDefecto: ahora.getMonth() + 1,
    });
    const docenteId = parseFiltroId(queryParams.docenteId, 'docenteId');
    const carreraId = parseFiltroId(queryParams.carreraId, 'carreraId');

    const rows = await this.tutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes({
      docenteId,
      carreraId,
      anio,
      mes,
    });

    const filas = TutoriaAvanceMapper.seguimientoDocentesRowsToPresentation(rows);

    const docentes = this._agruparPorDocente(filas);

    const seguimientoTutoriaDocentes = { anio, mes, docentes };

    this.logger.info('[Titulación] Seguimiento de tutorías a docentes generado', {
      anio,
      mes,
      docenteId,
      carreraId,
      docentes: docentes.length,
      tutoriados: filas.length,
    });

    return { seguimientoTutoriaDocentes };
  }

  /**
   * Agrupa las filas planas (un tutoriado por fila) en bloques por docente,
   * con la lista de carreras distintas del docente y el total de tutorías
   * ejecutadas en el mes (suma por PROYECTO distinto, no por estudiante: en
   * proyecto grupal el conteo es el mismo para todos sus integrantes).
   * @private
   * @param {Array<Object>} filas
   * @returns {Array<Object>}
   */
  _agruparPorDocente(filas) {
    const bloques = new Map();
    const proyectosContadosPorDocente = new Map();

    for (const fila of filas) {
      if (!bloques.has(fila.docenteId)) {
        bloques.set(fila.docenteId, {
          docenteId: fila.docenteId,
          docenteNombre: fila.docenteNombre,
          carreras: [],
          tutoriasEjecutadasMes: 0,
          tutoriados: [],
        });
        proyectosContadosPorDocente.set(fila.docenteId, new Set());
      }

      const bloque = bloques.get(fila.docenteId);
      const proyectosContados = proyectosContadosPorDocente.get(fila.docenteId);

      if (fila.carreraId != null && !bloque.carreras.some((c) => c.carreraId === fila.carreraId)) {
        bloque.carreras.push({ carreraId: fila.carreraId, carreraNombre: fila.carreraNombre });
      }

      if (fila.proyectoGradoId != null && !proyectosContados.has(fila.proyectoGradoId)) {
        proyectosContados.add(fila.proyectoGradoId);
        bloque.tutoriasEjecutadasMes += fila.tutoriasEjecutadasMes;
      }

      bloque.tutoriados.push({
        estudianteId: fila.estudianteId,
        nombreCompleto: fila.nombreCompleto,
        ci: fila.ci,
        proyectoGradoId: fila.proyectoGradoId,
        proyectoTitulo: fila.proyectoTitulo,
        carreraNombre: fila.carreraNombre,
        tutoriasEjecutadasMes: fila.tutoriasEjecutadasMes,
        porcentajeAvance: fila.porcentajeAvance,
        ultimaActividad: fila.ultimaActividad,
        ultimaObservacion: fila.ultimaObservacion,
      });
    }

    return [...bloques.values()]
      .map((bloque) => ({
        ...bloque,
        carreras: bloque.carreras.sort((a, b) =>
          (a.carreraNombre ?? '').localeCompare(b.carreraNombre ?? '')
        ),
      }))
      .sort((a, b) => (a.docenteNombre ?? '').localeCompare(b.docenteNombre ?? ''));
  }
}
