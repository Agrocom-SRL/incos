/**
 * Use Case: GetMisEstudiantesDocenteUseCase
 * Módulo: Docentes (Portal del rol docente)
 *
 * "Mis estudiantes": roster de estudiantes matriculados en los cursos VIGENTES
 * del docente de la SESIÓN, en la gestión vigente.
 *
 * El docente se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveDocenteIdForUsuario), nunca desde un id del cliente (evita IDOR).
 * Lanza ForbiddenError (403) si el usuario no está vinculado a un docente.
 *
 * Fuentes (no duplica queries):
 * - roster: vista 150 `vista_docente_curso_estudiantes`
 *   (DashboardRepository.findEstudiantesDeDocente).
 * - gestión vigente: CalificacionContextoRepository (vista de contexto vigente).
 *
 * Si no hay gestión vigente o el docente no tiene cursos, devuelve el shape del
 * contrato con `estudiantes: []` (nunca 500 por datos faltantes).
 *
 * Clean Architecture / SOLID:
 * - Application Layer: orquesta resolución del docente + lectura del roster.
 * - Single Responsibility: arma el payload de "Mis estudiantes" (sin negocio
 *   en controller ni repositorio).
 */

import { resolveDocenteIdForUsuario } from '../../utils/resolveDocenteIdForUsuario.js';

/**
 * Mapper de fila del roster: vista 150 (snake_case) → contrato camelCase.
 *
 * @param {Record<string, unknown>} row
 */
function mapEstudianteCurso(row) {
  return {
    estudianteId: row.estudiante_id != null ? Number(row.estudiante_id) : null,
    codigoEstudiante: row.codigo_estudiante ?? null,
    ci: row.ci ?? null,
    expedicion: row.expedicion ?? null,
    apellidoPaterno: row.apellido_paterno ?? null,
    apellidoMaterno: row.apellido_materno ?? null,
    nombres: row.nombres ?? null,
    genero: row.genero ?? null,
    estadoMatricula: row.estado_matricula ?? null,
    tipoInscripcion: row.tipo_inscripcion ?? null,
    asignacionDocenteId:
      row.asignacion_docente_id != null ? Number(row.asignacion_docente_id) : null,
    ofertaCursoId: row.oferta_curso_id != null ? Number(row.oferta_curso_id) : null,
    materiaSigla: row.materia_sigla ?? null,
    materiaNombre: row.materia_nombre ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraColorHex: row.carrera_color_hex ?? null,
    periodoNombre: row.asignatura_periodo_nombre ?? null,
    paraleloNombre: row.paralelo_nombre ?? null,
    paraleloTurno: row.paralelo_turno ?? null,
  };
}

export class GetMisEstudiantesDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/views/DashboardRepository.js').DashboardRepository} deps.dashboardRepository - Roster (vista 150)
   * @param {Object} deps.calificacionContextoRepository - Gestión vigente (contexto de calificaciones)
   * @param {Object} deps.teacherRepository - Resolución del docente por usuario
   * @param {Object} deps.userRepository - Fallback de referencia polimórfica
   * @param {Object} deps.logger
   */
  constructor({
    dashboardRepository,
    calificacionContextoRepository,
    teacherRepository,
    userRepository,
    logger,
  }) {
    if (!dashboardRepository) throw new Error('dashboardRepository es requerido');
    if (!calificacionContextoRepository) {
      throw new Error('calificacionContextoRepository es requerido');
    }
    if (!teacherRepository) throw new Error('teacherRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.dashboardRepository = dashboardRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{
   *   docente: { id: number, nombre: string },
   *   gestion: { anio: number|null, nombre: string|null }|null,
   *   estudiantes: Array<Object>
   * }>}
   */
  async execute({ usuarioId } = {}) {
    // Resolución anti-IDOR: el docente SIEMPRE sale del usuario de la sesión (403 si no hay vínculo).
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    this.logger.info('[Docentes] Mis estudiantes: docente resuelto', { usuarioId, docenteId });

    const [nombre, ctx] = await Promise.all([
      this.resolverNombreDocente(docenteId),
      this.calificacionContextoRepository.obtenerContextoVigente(),
    ]);

    // Sin gestión vigente: contrato degradado a vacío (nunca 500 por datos faltantes).
    if (ctx?.gestion_id == null) {
      this.logger.warn('[Docentes] Mis estudiantes: sin gestión vigente', { docenteId });
      return {
        docente: { id: docenteId, nombre },
        gestion: null,
        estudiantes: [],
      };
    }

    const rows = await this.dashboardRepository.findEstudiantesDeDocente(
      docenteId,
      Number(ctx.gestion_id)
    );

    return {
      docente: { id: docenteId, nombre },
      gestion: {
        anio: ctx.gestion_anio != null ? Number(ctx.gestion_anio) : null,
        nombre:
          ctx.gestion_nombre ?? (ctx.gestion_anio != null ? `Gestión ${ctx.gestion_anio}` : null),
      },
      estudiantes: (rows ?? []).map(mapEstudianteCurso),
    };
  }

  /**
   * Nombre del docente en orden institucional (APELLIDO_PATERNO APELLIDO_MATERNO
   * NOMBRES) desde la tabla docentes.
   *
   * @param {number} docenteId
   * @returns {Promise<string>}
   */
  async resolverNombreDocente(docenteId) {
    const docente = await this.teacherRepository.findById(docenteId);
    const plain = docente?.toPlainObject?.() ?? docente ?? {};
    return [plain.lastName, plain.motherLastName, plain.firstName]
      .filter(Boolean)
      .join(' ')
      .trim();
  }
}

export default GetMisEstudiantesDocenteUseCase;
