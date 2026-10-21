import { NotFoundError, ValidationError, ConflictError } from '../../../domain/errors/AppError.js';
import {
  MODALIDAD_GRUPAL_CODIGO,
  ROLES_INTEGRANTE_TUTORIA,
  ROLES_INTEGRANTE_TUTORIA_VALUES,
  ESTADOS_INTEGRANTE_TUTORIA,
  ESTADOS_PROYECTO_GRADO_VIGENTES,
} from '../../../domain/constants/titulacion.constants.js';
import {
  getProyectoOrFail,
  assertEstudianteSinProyectoVigente,
} from './helpers/proyectoTutoriaGuards.js';
import { parseFechaISO } from '../../utils/validacionEntrada.js';

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
   * @param {Object} params.integranteProyectoRepository
   * @param {Object} params.modalidadGradoRepository
   * @param {Object} params.studentRepository
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    integranteProyectoRepository,
    modalidadGradoRepository,
    studentRepository,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.integranteProyectoRepository = integranteProyectoRepository;
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

    // Un proyecto en estado final (APROBADO, REPROBADO, CANCELADO) ya no admite integrantes.
    if (!ESTADOS_PROYECTO_GRADO_VIGENTES.includes(proyecto.estado)) {
      throw new ConflictError(
        `No se pueden agregar integrantes a un proyecto en estado ${proyecto.estado}.`
      );
    }

    const rol = body.rol ?? ROLES_INTEGRANTE_TUTORIA.INTEGRANTE;
    if (!ROLES_INTEGRANTE_TUTORIA_VALUES.includes(rol)) {
      throw new ValidationError(`rol debe ser uno de: ${ROLES_INTEGRANTE_TUTORIA_VALUES.join(', ')}`);
    }
    const fechaIncorporacion =
      body.fechaIncorporacion != null
        ? parseFechaISO(body.fechaIncorporacion, 'fechaIncorporacion')
        : new Date().toISOString().slice(0, 10);

    const estudiante = await this.studentRepository.findById(estudianteId);
    if (!estudiante) {
      throw new NotFoundError(`estudiante con ID ${estudianteId}`);
    }

    // Duplicado en el mismo proyecto.
    const existente = await this.integranteProyectoRepository.findActivoByProyectoAndEstudiante(
      proyectoGradoId,
      estudianteId
    );
    if (existente) {
      throw new ConflictError('El estudiante ya es integrante activo de este proyecto.');
    }

    // Grupalidad: solo PSP admite más de un integrante activo.
    const activos = await this.integranteProyectoRepository.findByProyectoGradoId(proyectoGradoId);
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
      integranteProyectoRepository: this.integranteProyectoRepository,
      proyectoGradoRepository: this.proyectoGradoRepository,
      estudianteId,
    });

    const integrante = await this.integranteProyectoRepository.create(
      {
        proyectoGradoId,
        estudianteId,
        rol,
        estado: ESTADOS_INTEGRANTE_TUTORIA.ACTIVO,
        fechaIncorporacion,
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
