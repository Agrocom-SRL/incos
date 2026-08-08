/**
 * Use Case: GetMiMatriculaEstudianteUseCase
 * Módulo: Estudiantes (Portal del estudiante)
 *
 * "Mi matrícula" del estudiante de la SESIÓN: sus materias matriculadas en la
 * gestión vigente + su horario semanal (grilla del paralelo en gestión). Todo de
 * SOLO LECTURA. Espejo del patrón de "Mi boletín".
 *
 * El estudiante se resuelve SIEMPRE en servidor desde req.usuario.id (anti-IDOR):
 * nunca se confía en ids del cliente. Si el usuario no está vinculado a un
 * estudiante, resolveEstudianteIdForUsuario lanza ForbiddenError (403).
 *
 * Reutiliza, sin duplicar nada:
 *   - Vista 135 (vista_base_calificacion_centralizador_paralelo_fila) vía
 *     CalificacionCentralizadorRepository: paralelo_gestion_id, gestión y materias.
 *   - Cabecera del paralelo (vista 87) vía ParallelRepository: carrera.
 *   - GetParaleloGestionGrillaHorarioUseCase: grilla semanal del paralelo (se pasa
 *     tal cual, sin re-mapear).
 *
 * Si el estudiante no tiene curso vigente (sin matrícula) → materias:[], horario:null.
 *
 * Clean Architecture / SOLID: Application Layer; una sola responsabilidad (componer).
 */

import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';

export class GetMiMatriculaEstudianteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.calificacionCentralizadorRepository - Lectura vista 135 (solo lectura)
   * @param {Object} params.studentRepository - Repositorio de estudiantes (resolución por usuario)
   * @param {Object} params.userRepository - Repositorio de usuarios (fallback de referencia)
   * @param {Object} params.parallelRepository - Cabecera de paralelo (carrera)
   * @param {Object} params.getParaleloGestionGrillaHorarioUseCase - Grilla semanal del paralelo
   * @param {ILogger} params.logger
   */
  constructor({
    calificacionCentralizadorRepository,
    studentRepository,
    userRepository,
    parallelRepository,
    getParaleloGestionGrillaHorarioUseCase,
    logger,
  }) {
    if (!calificacionCentralizadorRepository) {
      throw new Error('calificacionCentralizadorRepository es requerido');
    }
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!parallelRepository) throw new Error('parallelRepository es requerido');
    if (!getParaleloGestionGrillaHorarioUseCase) {
      throw new Error('getParaleloGestionGrillaHorarioUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.parallelRepository = parallelRepository;
    this.getParaleloGestionGrillaHorarioUseCase = getParaleloGestionGrillaHorarioUseCase;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   */
  async execute({ usuarioId }) {
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const filas =
      await this.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante(
        estudianteId
      );

    // Estudiante sin curso vigente (sin matrícula): respuesta vacía, sin romper.
    if (!filas || filas.length === 0) {
      this.logger.info('[Estudiantes] Mi matrícula sin curso vigente', {
        usuarioId,
        estudianteId,
      });
      return {
        estudiante: { nombre: null, codigo: null },
        gestion: null,
        carrera: null,
        paraleloGestionId: null,
        materias: [],
        horario: null,
      };
    }

    const first = filas[0];
    const paraleloGestionId = Number(first.paralelo_gestion_id);

    // Materias matriculadas (DISTINCT por asignatura; el grano de la vista 135 es
    // una fila por estudiante × oferta_curso, así que ya viene una por materia).
    // Excluye ABANDONO/RETIRADO: desde la Fase C la 135 ya no filtra por estado
    // (para que Centralizador/boletín las sigan mostrando), pero "Mi matrícula"
    // es el roster de lo que el estudiante cursa ACTIVAMENTE — igual criterio
    // que ya protege al docente en cuaderno/asistencia (vista 110). Sin este
    // filtro, una materia retirada aparecía en la lista sin ninguna marca.
    const ESTADOS_MATERIA_ACTIVA = ['INSCRITO', 'CURSANDO'];
    const seen = new Set();
    const materias = [...filas]
      .filter((row) => ESTADOS_MATERIA_ACTIVA.includes(row.estado))
      .sort((a, b) => (a.asignatura_orden ?? 0) - (b.asignatura_orden ?? 0))
      .filter((row) => {
        const key = row.asignatura_sigla ?? row.asignatura_nombre ?? JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((row) => ({
        asignaturaSigla: row.asignatura_sigla ?? null,
        asignaturaNombre: row.asignatura_nombre ?? null,
        docenteNombre: row.docente_nombre ?? null,
      }));

    // Carrera desde la cabecera del paralelo (vista 87); la vista 135 no la trae.
    let carrera = null;
    try {
      const cabecera =
        await this.parallelRepository.obtenerCabeceraParaleloGestion(paraleloGestionId);
      if (cabecera?.carrera_nombre) {
        carrera = { nombre: cabecera.carrera_nombre };
      }
    } catch (err) {
      this.logger.warn('[Estudiantes] Mi matrícula: no se pudo derivar la carrera', {
        paraleloGestionId,
        error: err.message,
      });
    }

    // Horario semanal: se delega íntegro al use case de horarios (no se re-mapea).
    let horario = null;
    try {
      horario = await this.getParaleloGestionGrillaHorarioUseCase.execute(paraleloGestionId);
    } catch (err) {
      this.logger.warn('[Estudiantes] Mi matrícula: no se pudo obtener la grilla de horario', {
        paraleloGestionId,
        error: err.message,
      });
    }

    this.logger.info('[Estudiantes] Mi matrícula obtenida', {
      usuarioId,
      estudianteId,
      paraleloGestionId,
      materias: materias.length,
      tieneHorario: horario != null,
    });

    return {
      estudiante: {
        nombre: first.nombre_completo ?? null,
        codigo: first.codigo_estudiante ?? null,
      },
      gestion: {
        id: first.gestion_id != null ? Number(first.gestion_id) : null,
        anio: first.gestion_anio ?? null,
        nombre: first.gestion_nombre ?? null,
      },
      carrera,
      paraleloGestionId,
      materias,
      horario,
    };
  }
}

export default GetMiMatriculaEstudianteUseCase;
