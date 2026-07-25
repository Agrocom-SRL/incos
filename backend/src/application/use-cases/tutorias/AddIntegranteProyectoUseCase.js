import { NotFoundError, ValidationError, ConflictError } from '../../../domain/errors/AppError.js';
import {
  MODALIDAD_GRUPAL_CODIGO,
  ROLES_INTEGRANTE_TUTORIA,
  ESTADOS_INTEGRANTE_TUTORIA,
} from '../../../domain/constants/tutorias.constants.js';
import {
  getProyectoOrFail,
  assertEstudianteSinProyectoVigente,
} from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: AddIntegranteProyectoUseCase (T12)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Agrega un integrante al proyecto de grado. Reglas:
 * - Solo la modalidad grupal (PSP) admite más de un integrante activo.
 * - El estudiante no puede estar duplicado en el proyecto.
 * - Un estudiante solo puede tener UN proyecto vigente.
 */
export class AddIntegranteProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.tutoriaIntegranteRepository
   * @param {Object} params.modalidadGradoRepository
   * @param {Object} params.studentRepository
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    tutoriaIntegranteRepository,
    modalidadGradoRepository,
    studentRepository,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.tutoriaIntegranteRepository = tutoriaIntegranteRepository;
    this.modalidadGradoRepository = modalidadGradoRepository;
    this.studentRepository = studentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {Object} body - { estudianteId, rol?, fechaIncorporacion?, observaciones? }
   * @param {number|null} userId
   * @returns {Promise<{integrante: Object}>}
   */
  async execute(proyectoGradoId, body = {}, userId = null) {
    const estudianteId = Number(body.estudianteId);
    if (!Number.isInteger(estudianteId) || estudianteId <= 0) {
      throw new ValidationError('estudianteId es requerido y debe ser un entero positivo');
    }

    const proyecto = await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const estudiante = await this.studentRepository.findById(estudianteId);
    if (!estudiante) {
      throw new NotFoundError(`estudiante con ID ${estudianteId}`);
    }

    // Duplicado en el mismo proyecto.
    const existente = await this.tutoriaIntegranteRepository.findActivoByProyectoAndEstudiante(
      proyectoGradoId,
      estudianteId
    );
    if (existente) {
      throw new ConflictError('El estudiante ya es integrante activo de este proyecto.');
    }

    // Grupalidad: solo PSP admite más de un integrante activo.
    const activos = await this.tutoriaIntegranteRepository.findByProyectoGradoId(proyectoGradoId);
    const activosCount = activos.filter(
      (integrante) => integrante.estado === ESTADOS_INTEGRANTE_TUTORIA.ACTIVO
    ).length;
    if (activosCount >= 1) {
      const modalidad = proyecto.modalidadId
        ? await this.modalidadGradoRepository.findById(proyecto.modalidadId)
        : null;
      if (!modalidad || modalidad.codigo !== MODALIDAD_GRUPAL_CODIGO) {
        throw new ConflictError(
          `Solo la modalidad ${MODALIDAD_GRUPAL_CODIGO} (grupal) admite más de un integrante activo.`
        );
      }
    }

    // Un solo proyecto vigente por estudiante.
    await assertEstudianteSinProyectoVigente({
      tutoriaIntegranteRepository: this.tutoriaIntegranteRepository,
      proyectoGradoRepository: this.proyectoGradoRepository,
      estudianteId,
    });

    const integrante = await this.tutoriaIntegranteRepository.create(
      {
        proyectoGradoId,
        estudianteId,
        rol: body.rol ?? ROLES_INTEGRANTE_TUTORIA.INTEGRANTE,
        estado: ESTADOS_INTEGRANTE_TUTORIA.ACTIVO,
        fechaIncorporacion: body.fechaIncorporacion ?? new Date().toISOString().slice(0, 10),
        observaciones: body.observaciones ?? null,
      },
      userId
    );

    this.logger.info('[Tutorías] Integrante agregado al proyecto', {
      proyectoGradoId,
      estudianteId,
      integranteId: integrante.id,
    });

    return { integrante };
  }
}
