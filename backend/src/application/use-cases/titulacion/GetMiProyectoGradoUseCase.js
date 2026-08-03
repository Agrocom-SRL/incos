import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';
import { ESTADOS_PROYECTO_GRADO_VIGENTES } from '../../../domain/constants/titulacion.constants.js';

/**
 * Use Case: GetMiProyectoGradoUseCase (T4)
 * Módulo: Tutorías (TUT · titulación · portal del estudiante)
 *
 * "Mi proyecto": ficha del proyecto de grado VIGENTE del estudiante de la
 * SESIÓN. El estudiante se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveEstudianteIdForUsuario); NUNCA se acepta estudianteId del cliente.
 *
 * Si el estudiante no tiene proyecto vigente devuelve
 * { proyectoGrado: null } (el frontend muestra el estado vacío, nunca 500).
 */
export class GetMiProyectoGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoListadoViewRepository - Vistas 159/160
   * @param {Object} params.getProyectoGradoByIdUseCase - Reutiliza la ficha (T6)
   * @param {Object} params.studentRepository - Resolución estudiante por usuario
   * @param {Object} params.userRepository - Fallback referencia polimórfica
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoListadoViewRepository,
    getProyectoGradoByIdUseCase,
    studentRepository,
    userRepository,
    logger,
  }) {
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.getProyectoGradoByIdUseCase = getProyectoGradoByIdUseCase;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{proyectoGrado: Object|null, estudianteId: number}>}
   */
  async execute({ usuarioId } = {}) {
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const membresias =
      await this.proyectoGradoListadoViewRepository.findIntegranteRowsByEstudianteId(estudianteId);

    const vigente = membresias.find((row) =>
      ESTADOS_PROYECTO_GRADO_VIGENTES.includes(row.proyecto_estado)
    );

    if (!vigente) {
      this.logger.info('[Tutorías] Mi proyecto: estudiante sin proyecto vigente', {
        usuarioId,
        estudianteId,
      });
      return { proyectoGrado: null, estudianteId };
    }

    const proyectoGrado = await this.getProyectoGradoByIdUseCase.execute(vigente.proyecto_grado_id);

    this.logger.info('[Tutorías] Mi proyecto obtenido', {
      usuarioId,
      estudianteId,
      proyectoGradoId: vigente.proyecto_grado_id,
    });

    return { proyectoGrado, estudianteId };
  }
}
