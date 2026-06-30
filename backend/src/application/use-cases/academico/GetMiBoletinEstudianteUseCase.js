/**
 * Use Case: GetMiBoletinEstudianteUseCase
 * Módulo: Académico / Calificaciones (Portal del estudiante)
 *
 * Boletín de calificaciones del estudiante de la SESIÓN (gestión vigente). El
 * estudiante se resuelve SIEMPRE en servidor desde req.usuario.id (evita IDOR).
 *
 * Reutiliza la vista 135 (vista_base_calificacion_centralizador_paralelo_fila) ya
 * acotada a la asignación vigente/activa, filtrando por estudiante. La carrera se
 * deriva de la cabecera del paralelo (vista 87) vía ParallelRepository, ya que la
 * vista 135 no la incluye.
 *
 * Clean Architecture / SOLID: Application Layer; una sola responsabilidad.
 */

import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';

export class GetMiBoletinEstudianteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.calificacionCentralizadorRepository - Lectura vista 135 (solo lectura)
   * @param {Object} params.studentRepository - Repositorio de estudiantes (resolución por usuario)
   * @param {Object} params.userRepository - Repositorio de usuarios (fallback de referencia)
   * @param {Object} params.parallelRepository - Cabecera de paralelo (carrera)
   * @param {ILogger} params.logger
   */
  constructor({
    calificacionCentralizadorRepository,
    studentRepository,
    userRepository,
    parallelRepository,
    logger,
  }) {
    if (!calificacionCentralizadorRepository) {
      throw new Error('calificacionCentralizadorRepository es requerido');
    }
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!parallelRepository) throw new Error('parallelRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.parallelRepository = parallelRepository;
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

    if (!filas || filas.length === 0) {
      this.logger.info('[Calificaciones] Mi boletín sin filas (estudiante sin curso vigente)', {
        usuarioId,
        estudianteId,
      });
      return {
        gestion: null,
        estudiante: { codigo: null, nombreCompleto: null, ci: null },
        carrera: null,
        asignaturas: [],
        promedioGeneral: null,
        paraleloGestionId: null,
      };
    }

    const first = filas[0];
    const paraleloGestionId = Number(first.paralelo_gestion_id);

    // Carrera desde la cabecera del paralelo (vista 87); la vista 135 no la trae.
    let carrera = null;
    try {
      const cabecera =
        await this.parallelRepository.obtenerCabeceraParaleloGestion(paraleloGestionId);
      if (cabecera?.carrera_nombre) {
        carrera = { nombre: cabecera.carrera_nombre };
      }
    } catch (err) {
      this.logger.warn('[Calificaciones] Mi boletín: no se pudo derivar la carrera', {
        paraleloGestionId,
        error: err.message,
      });
    }

    const asignaturas = [...filas]
      .sort((a, b) => (a.asignatura_orden ?? 0) - (b.asignatura_orden ?? 0))
      .map((row) => ({
        asignaturaSigla: row.asignatura_sigla ?? null,
        asignaturaNombre: row.asignatura_nombre ?? null,
        docenteNombre: row.docente_nombre ?? null,
        bim1: row.bim1 != null ? Number(row.bim1) : null,
        bim2: row.bim2 != null ? Number(row.bim2) : null,
        bim3: row.bim3 != null ? Number(row.bim3) : null,
        bim4: row.bim4 != null ? Number(row.bim4) : null,
        promedioAnual: row.promedio_anual != null ? Number(row.promedio_anual) : null,
        notaFinal: row.nota_final != null ? Number(row.nota_final) : null,
        estado: row.estado ?? null,
      }));

    const promedios = asignaturas
      .map((a) => a.promedioAnual)
      .filter((v) => v != null && Number.isFinite(v));
    const promedioGeneral =
      promedios.length > 0
        ? Math.round((promedios.reduce((s, v) => s + v, 0) / promedios.length) * 100) / 100
        : null;

    this.logger.info('[Calificaciones] Mi boletín obtenido', {
      usuarioId,
      estudianteId,
      paraleloGestionId,
      asignaturas: asignaturas.length,
    });

    return {
      gestion: {
        id: first.gestion_id != null ? Number(first.gestion_id) : null,
        anio: first.gestion_anio ?? null,
        nombre: first.gestion_nombre ?? null,
      },
      estudiante: {
        codigo: first.codigo_estudiante ?? null,
        nombreCompleto: first.nombre_completo ?? null,
        ci: first.ci ?? null,
      },
      carrera,
      asignaturas,
      promedioGeneral,
      paraleloGestionId,
    };
  }
}

export default GetMiBoletinEstudianteUseCase;
