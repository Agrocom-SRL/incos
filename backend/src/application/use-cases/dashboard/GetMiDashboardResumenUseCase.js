/**
 * Use Case: GetMiDashboardResumenUseCase
 * Módulo: Dashboard (Portal del estudiante)
 *
 * Resumen del panel principal del estudiante de la SESIÓN: su identidad, su carrera,
 * sus docentes, su feed de actividad propio y conteo de sesiones.
 *
 * El estudiante se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveEstudianteIdForUsuario), nunca desde un id del cliente (evita IDOR).
 * Lanza ForbiddenError (403) si el usuario no está vinculado a un estudiante.
 *
 * Clean Architecture / SOLID:
 * - Application Layer: orquesta resolución del estudiante + lecturas agregadas.
 * - Single Responsibility: arma el resumen propio del estudiante (sin negocio en
 *   controller ni repositorio).
 */

import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';

export class GetMiDashboardResumenUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/views/DashboardRepository.js').DashboardRepository} deps.dashboardRepository
   * @param {Object} deps.studentRepository - Resolución del estudiante por usuario
   * @param {Object} deps.userRepository - Fallback de referencia polimórfica
   * @param {Object} deps.logger
   */
  constructor({ dashboardRepository, studentRepository, userRepository, logger }) {
    if (!dashboardRepository) throw new Error('dashboardRepository es requerido');
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.dashboardRepository = dashboardRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} input
   * @param {number} input.usuarioId - Usuario autenticado (req.usuario.id)
   * @param {number} [input.docentesLimit=10]
   * @param {number} [input.actividadesLimit=10]
   * @returns {Promise<{
   *   estudiante: { nombre: string, codigo: string },
   *   carrera: { id, codigo, nombre, colorHex, imagenRuta }|null,
   *   docentes: Array<Object>,
   *   actividades: Array<Object>,
   *   stats: { sesionesHoy: number, sesionesMes: number },
   *   saldoPendiente: number
   * }>}
   */
  async execute({ usuarioId, docentesLimit = 10, actividadesLimit = 10 } = {}) {
    // Resolución anti-IDOR: el estudiante SIEMPRE sale del usuario de la sesión.
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    this.logger.info('[Dashboard] Mi resumen: estudiante resuelto', { usuarioId, estudianteId });

    const [estudiante, carreraRow, docentes, actividades, sesiones, saldoPendiente] =
      await Promise.all([
        this.dashboardRepository.findEstudianteResumen(estudianteId),
        this.dashboardRepository.findCarreraDeEstudiante(estudianteId),
        this.dashboardRepository.findDocentesDeEstudiante(estudianteId, docentesLimit),
        this.dashboardRepository.findActividadesDeEstudiante(estudianteId, actividadesLimit),
        this.dashboardRepository.countSesionesUsuarioHoyYMes(usuarioId),
        this.dashboardRepository.findSaldoPendienteEstudiante(estudianteId),
      ]);

    const carrera = carreraRow
      ? {
          id: carreraRow.id,
          codigo: carreraRow.codigo,
          nombre: carreraRow.nombre,
          colorHex: carreraRow.color_hex ?? null,
          imagenRuta: carreraRow.imagen_ruta ?? null,
        }
      : null;

    return {
      estudiante,
      carrera,
      docentes,
      actividades,
      stats: {
        sesionesHoy: sesiones.hoy,
        sesionesMes: sesiones.mes,
      },
      saldoPendiente: Math.round(Number(saldoPendiente) || 0),
    };
  }
}

export default GetMiDashboardResumenUseCase;
