/**
 * Use Case: GetMiDashboardResumenDocenteUseCase
 * Módulo: Dashboard (Portal del rol docente)
 *
 * Resumen del panel principal del docente de la SESIÓN: su identidad, la gestión
 * vigente (con bimestre), su carga académica, sus cursos y sus bloques de horario.
 *
 * El docente se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveDocenteIdForUsuario), nunca desde un id del cliente (evita IDOR).
 * Lanza ForbiddenError (403) si el usuario no está vinculado a un docente.
 *
 * Reutilización (no duplicar queries):
 * - docente + cursos: delega en GetMisCursosAsistenciaUseCase (misma composición
 *   que GET /asistencia/mis-cursos, vistas 103/106 de calificaciones).
 * - gestión vigente: CalificacionContextoRepository (vista de contexto vigente).
 * - carga: vista 53 `vista_docente_carga_por_gestion` (DashboardRepository).
 * - horarioBloques: vista 128 `vista_base_docente_curso_bloques_horario`
 *   (DashboardRepository).
 * - actividades: vista 149 `vista_dashboard_actividades_recientes` filtrada por
 *   docente_id (DashboardRepository.findActividadesDeDocente), mismas claves
 *   snake_case del feed de mi-resumen del estudiante.
 * - stats: conteo de sesiones del usuario hoy/mes (countSesionesUsuarioHoyYMes,
 *   ya existente para el portal del estudiante).
 *
 * Si no hay gestión vigente o el docente no tiene cursos/bloques, devuelve el
 * shape del contrato con arrays vacíos y nulls (nunca 500 por datos faltantes).
 *
 * Clean Architecture / SOLID:
 * - Application Layer: orquesta resolución del docente + lecturas agregadas.
 * - Single Responsibility: arma el resumen propio del docente (sin negocio en
 *   controller ni repositorio).
 */

import { resolveDocenteIdForUsuario } from '../../utils/resolveDocenteIdForUsuario.js';

/**
 * Mapper de bloque de horario: vista 128 (`vista_base_docente_curso_bloques_horario`,
 * columnas ya recortadas por DashboardRepository) → contrato camelCase del panel.
 *
 * Mapeo vista → contrato:
 * - dia               → dia
 * - hora_inicio       → horaInicio (ya en formato HH:MM vía TIME_FORMAT en el repo)
 * - hora_fin          → horaFin (ídem)
 * - materia_sigla     → materiaSigla
 * - materia_nombre    → materia
 * - paralelo_nombre   → paralelo
 * - aula              → aula (COALESCE(aula_codigo, aula_nombre); null si el paralelo no tiene aula)
 * - curso_color_hex   → colorHex (color del docente en la grilla de horarios)
 *
 * @param {Record<string, unknown>} row
 */
function mapBloqueHorario(row) {
  return {
    dia: row.dia ?? null,
    horaInicio: row.hora_inicio ?? null,
    horaFin: row.hora_fin ?? null,
    materiaSigla: row.materia_sigla ?? null,
    materia: row.materia_nombre ?? null,
    paralelo: row.paralelo_nombre ?? null,
    aula: row.aula ?? null,
    colorHex: row.curso_color_hex ?? null,
  };
}

export class GetMiDashboardResumenDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/views/DashboardRepository.js').DashboardRepository} deps.dashboardRepository - Carga (vista 53) y bloques de horario (vista 128)
   * @param {Object} deps.getMisCursosAsistenciaUseCase - Reuso de la composición docente + cursos de mis-cursos
   * @param {Object} deps.calificacionContextoRepository - Gestión/bimestre vigentes (contexto de calificaciones)
   * @param {Object} deps.teacherRepository - Resolución del docente por usuario
   * @param {Object} deps.userRepository - Fallback de referencia polimórfica
   * @param {Object} deps.logger
   */
  constructor({
    dashboardRepository,
    getMisCursosAsistenciaUseCase,
    calificacionContextoRepository,
    teacherRepository,
    userRepository,
    logger,
  }) {
    if (!dashboardRepository) throw new Error('dashboardRepository es requerido');
    if (!getMisCursosAsistenciaUseCase) {
      throw new Error('getMisCursosAsistenciaUseCase es requerido');
    }
    if (!calificacionContextoRepository) {
      throw new Error('calificacionContextoRepository es requerido');
    }
    if (!teacherRepository) throw new Error('teacherRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.dashboardRepository = dashboardRepository;
    this.getMisCursosAsistenciaUseCase = getMisCursosAsistenciaUseCase;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} input
   * @param {number} input.usuarioId - Usuario autenticado (req.usuario.id)
   * @returns {Promise<{
   *   docente: { id: number, nombre: string },
   *   gestion: { anio: number|null, nombre: string|null, bimestre: number|null, bimestreNombre: string|null }|null,
   *   carga: { totalAsignaciones: number, horasSemanales: number },
   *   cursos: Array<Object>,
   *   horarioBloques: Array<Object>,
   *   actividades: Array<Object>,
   *   stats: { sesionesHoy: number, sesionesMes: number }
   * }>}
   */
  async execute({ usuarioId } = {}) {
    // Resolución anti-IDOR: el docente SIEMPRE sale del usuario de la sesión (403 si no hay vínculo).
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    this.logger.info('[Dashboard] Mi resumen docente: docente resuelto', { usuarioId, docenteId });

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();

    // docente + cursos: reuso de la composición de mis-cursos. Si no hay gestión
    // vigente (o el docente no figura activo en la vista de encabezado), el panel
    // se degrada a vacío en lugar de propagar el 404 del caso de uso base.
    let base = null;
    if (ctx?.gestion_id != null) {
      try {
        base = await this.getMisCursosAsistenciaUseCase.execute({ usuarioId, docenteId });
      } catch (error) {
        if (Number(error?.statusCode) !== 404) {
          throw error;
        }
        this.logger.warn('[Dashboard] Mi resumen docente: sin cursos base (404 tolerado)', {
          docenteId,
          motivo: error.message,
        });
      }
    }

    const [carga, bloques, actividades, sesiones] = await Promise.all([
      ctx?.gestion_anio != null
        ? this.dashboardRepository.findCargaDocenteGestion(docenteId, ctx.gestion_anio)
        : Promise.resolve(null),
      ctx?.gestion_id != null
        ? this.dashboardRepository.findHorarioBloquesDocenteGestion(docenteId, ctx.gestion_id)
        : Promise.resolve([]),
      this.dashboardRepository.findActividadesDeDocente(docenteId),
      this.dashboardRepository.countSesionesUsuarioHoyYMes(usuarioId),
    ]);

    const nombre = base?.docente?.nombre || (await this.resolverNombreDocente(docenteId));

    const gestion = ctx
      ? {
          anio: ctx.gestion_anio != null ? Number(ctx.gestion_anio) : null,
          nombre:
            ctx.gestion_nombre ??
            (ctx.gestion_anio != null ? `Gestión ${ctx.gestion_anio}` : null),
          bimestre: Number(ctx.bimestre_vigente) || null,
          bimestreNombre: ctx.bimestre_nombre ?? null,
        }
      : null;

    return {
      docente: { id: docenteId, nombre },
      gestion,
      carga: {
        totalAsignaciones: Number(carga?.total_asignaciones ?? 0),
        horasSemanales: Number(carga?.horas_semanales ?? 0),
      },
      cursos: base?.cursos ?? [],
      horarioBloques: (bloques ?? []).map(mapBloqueHorario),
      // Feed propio del docente (claves snake_case, mismo contrato que el
      // feed de mi-resumen del estudiante: el frontend reusa mapActividad).
      actividades: actividades ?? [],
      stats: {
        sesionesHoy: Number(sesiones?.hoy ?? 0),
        sesionesMes: Number(sesiones?.mes ?? 0),
      },
    };
  }

  /**
   * Nombre del docente en orden institucional (APELLIDO_PATERNO APELLIDO_MATERNO
   * NOMBRES) cuando la vista de encabezado no lo aporta (p. ej. docente sin
   * gestión vigente o con estado laboral distinto de ACTIVO).
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

export default GetMiDashboardResumenDocenteUseCase;
