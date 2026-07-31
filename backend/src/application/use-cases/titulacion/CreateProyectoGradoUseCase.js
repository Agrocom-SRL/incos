import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_PROYECTO_GRADO,
  MODALIDAD_GRUPAL_CODIGO,
  ROLES_INTEGRANTE_TUTORIA,
  ESTADOS_INTEGRANTE_TUTORIA,
} from '../../../domain/constants/titulacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { assertEstudianteSinProyectoVigente } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: CreateProyectoGradoUseCase (T7)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Crea el proyecto de grado (raíz proyectos_grado) y sus integrantes
 * (integrantes_proyecto) en UNA transacción:
 * - Siempre se crea el TITULAR en integrantes_proyecto (también en proyectos
 *   individuales; los consumidores nuevos leen la satélite, no la raíz).
 * - Solo la modalidad PSP (MODALIDAD_GRUPAL_CODIGO) admite varios integrantes.
 * - Regla: un estudiante solo puede tener UN proyecto vigente.
 * - `estudiante_id` legacy de la raíz: titular en individuales, NULL en grupales.
 * - `estado` SIEMPRE nace en PERFIL (transiciones vía T11).
 */
export class CreateProyectoGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.integranteProyectoRepository
   * @param {Object} params.modalidadGradoRepository
   * @param {Object} params.studentRepository - Validación de estudiantes
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
   * @param {Object} body - Datos del proyecto + estudianteIds (+ titularEstudianteId)
   * @param {number|null} userId
   * @returns {Promise<{proyectoGrado: Object}>}
   */
  async execute(body = {}, userId = null) {
    const estudianteIds = this._normalizeEstudianteIds(body.estudianteIds);
    const titularEstudianteId = this._resolveTitular(body, estudianteIds);
    const modalidad = await this._validateModalidad(body.modalidadId, estudianteIds);
    await this._validateEstudiantes(estudianteIds);

    const esGrupal = modalidad.codigo === MODALIDAD_GRUPAL_CODIGO;

    const data = {
      // Raíz legacy: titular en individuales, NULL en grupales.
      estudianteId: esGrupal ? null : titularEstudianteId,
      modalidadId: modalidad.id,
      tutorId: null,
      carreraId: body.carreraId ?? null,
      gestionId: body.gestionId ?? null,
      titulo: String(body.titulo).trim(),
      descripcion: body.descripcion ?? null,
      objetivos: body.objetivos ?? null,
      alcance: body.alcance ?? null,
      metodologia: body.metodologia ?? null,
      estado: ESTADOS_PROYECTO_GRADO.PERFIL,
      fechaPresentacionPerfil: body.fechaPresentacionPerfil ?? null,
    };

    let created = null;
    await sequelize.transaction(async (transaction) => {
      created = await this.proyectoGradoRepository.create(data, userId, { transaction });
      const fechaIncorporacion =
        body.fechaPresentacionPerfil ?? new Date().toISOString().slice(0, 10);
      for (const estudianteId of estudianteIds) {
        // eslint-disable-next-line no-await-in-loop
        await this.integranteProyectoRepository.create(
          {
            proyectoGradoId: created.id,
            estudianteId,
            rol:
              estudianteId === titularEstudianteId
                ? ROLES_INTEGRANTE_TUTORIA.TITULAR
                : ROLES_INTEGRANTE_TUTORIA.INTEGRANTE,
            estado: ESTADOS_INTEGRANTE_TUTORIA.ACTIVO,
            fechaIncorporacion,
          },
          userId,
          { transaction }
        );
      }
    });

    this.logger.info('[Tutorías] Proyecto de grado creado', {
      id: created.id,
      modalidad: modalidad.codigo,
      integrantes: estudianteIds.length,
    });

    return { proyectoGrado: created };
  }

  /** @private */
  _normalizeEstudianteIds(estudianteIds) {
    if (!Array.isArray(estudianteIds) || estudianteIds.length === 0) {
      throw new ValidationError('estudianteIds debe ser un array con al menos un estudiante');
    }
    const ids = estudianteIds.map((id) => Number(id));
    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new ValidationError('estudianteIds debe contener solo enteros positivos');
    }
    const unicos = [...new Set(ids)];
    if (unicos.length !== ids.length) {
      throw new ValidationError('estudianteIds contiene estudiantes duplicados');
    }
    return unicos;
  }

  /** @private */
  _resolveTitular(body, estudianteIds) {
    const titular = body.titularEstudianteId ? Number(body.titularEstudianteId) : estudianteIds[0];
    if (!estudianteIds.includes(titular)) {
      throw new ValidationError('titularEstudianteId debe ser uno de los estudianteIds');
    }
    return titular;
  }

  /** @private */
  async _validateModalidad(modalidadId, estudianteIds) {
    if (!modalidadId) {
      throw new ValidationError('modalidadId es requerido');
    }
    const modalidad = await this.modalidadGradoRepository.findById(modalidadId);
    if (!modalidad) {
      throw new NotFoundError(`modalidad de grado con ID ${modalidadId}`);
    }
    if (modalidad.codigo !== MODALIDAD_GRUPAL_CODIGO && estudianteIds.length > 1) {
      throw new ValidationError(
        `Solo la modalidad ${MODALIDAD_GRUPAL_CODIGO} (grupal) admite más de un integrante`
      );
    }
    return modalidad;
  }

  /** @private */
  async _validateEstudiantes(estudianteIds) {
    for (const estudianteId of estudianteIds) {
      // eslint-disable-next-line no-await-in-loop
      const estudiante = await this.studentRepository.findById(estudianteId);
      if (!estudiante) {
        throw new NotFoundError(`estudiante con ID ${estudianteId}`);
      }
      // eslint-disable-next-line no-await-in-loop
      await assertEstudianteSinProyectoVigente({
        integranteProyectoRepository: this.integranteProyectoRepository,
        proyectoGradoRepository: this.proyectoGradoRepository,
        estudianteId,
      });
    }
  }
}
