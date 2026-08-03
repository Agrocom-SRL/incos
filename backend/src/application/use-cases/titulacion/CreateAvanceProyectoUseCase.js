import path from 'path';
import { ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_REVISION_AVANCE } from '../../../domain/constants/titulacion.constants.js';
import { tryResolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';
import { getProyectoOrFail, assertIntegranteActivo } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: CreateAvanceProyectoUseCase (T20)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Registra un archivo de avance del proyecto (subido vía multipart
 * uploadAvanceProyecto: pdf/doc/docx, destino
 * uploads/documentos/proyectos-grado/:id/).
 *
 * Guard: si el usuario de la SESIÓN está vinculado a un estudiante, debe ser
 * integrante ACTIVO del proyecto (anti-IDOR); el avance queda registrado como
 * subido por ese estudiante. Roles administrativos pueden subir sin vínculo.
 */
export class CreateAvanceProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.avanceProyectoRepository
   * @param {Object} params.integranteProyectoRepository
   * @param {Object} params.studentRepository
   * @param {Object} params.userRepository
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    avanceProyectoRepository,
    integranteProyectoRepository,
    studentRepository,
    userRepository,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.avanceProyectoRepository = avanceProyectoRepository;
    this.integranteProyectoRepository = integranteProyectoRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} input
   * @param {number} input.proyectoGradoId
   * @param {Object} input.body - { titulo?, descripcion? }
   * @param {Object} input.file - Archivo de multer (req.file)
   * @param {number} input.usuarioId - Usuario de la sesión
   * @returns {Promise<{avance: Object}>}
   */
  async execute({ proyectoGradoId, body = {}, file, usuarioId } = {}) {
    if (!file) {
      throw new ValidationError('Debe adjuntar el archivo del avance (campo `archivo`).');
    }

    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    // Guard de pertenencia: solo aplica si el usuario está vinculado a un estudiante.
    const estudianteId = await tryResolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });
    if (estudianteId !== null) {
      await assertIntegranteActivo({
        integranteProyectoRepository: this.integranteProyectoRepository,
        proyectoGradoId,
        estudianteId,
      });
    }

    const numeroAvance =
      (await this.avanceProyectoRepository.findMaxNumeroAvance(proyectoGradoId)) + 1;

    const avance = await this.avanceProyectoRepository.create(
      {
        proyectoGradoId,
        subidoPorEstudianteId: estudianteId,
        numeroAvance,
        titulo: body.titulo ?? null,
        descripcion: body.descripcion ?? null,
        nombreArchivo: file.originalname,
        rutaArchivo: file.path,
        extension: path.extname(file.originalname).replace('.', '').toLowerCase() || null,
        tipoMime: file.mimetype ?? null,
        tamanoBytes: file.size ?? null,
        estadoRevision: ESTADOS_REVISION_AVANCE.PENDIENTE_REVISION,
      },
      usuarioId ?? null
    );

    this.logger.info('[Tutorías] Avance de proyecto registrado', {
      proyectoGradoId,
      avanceId: avance.id,
      numeroAvance,
      estudianteId,
    });

    return { avance };
  }
}
