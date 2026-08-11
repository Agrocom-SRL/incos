import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  TIPOS_DICTAMEN_TUTORIA,
  TIPOS_BITACORA_TUTORIA,
  ESTADOS_BITACORA_TUTORIA,
} from '../../../domain/constants/titulacion.constants.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';
import {
  buildContextoDictamenPdf,
  guardarDictamenConPdf,
  hoyISO,
} from './helpers/dictamenPdfHelpers.js';

/**
 * Use Case: AsignarTutorProyectoUseCase (T10)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Asigna (o reasigna) el tutor del proyecto de grado y emite el INFORME DE
 * DESIGNACIÓN OFICIAL: genera el PDF (IncosPDFLibBase + Plantilla.pdf), lo
 * guarda en uploads/documentos/proyectos-grado/:id/ y lo registra en
 * dictamenes_proyecto (tipo DESIGNACION_OFICIAL) para su envío a la DDE.
 *
 * Extensión 2026-08-11 (pedido explícito del usuario): además, registra la
 * designación como una entrada de bitácora del proyecto (fecha, actividad y
 * observaciones si el body las trae) — el historial de tutoría queda visible
 * en la bitácora sin que el usuario tenga que registrarlo a mano.
 */
export class AsignarTutorProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.proyectoGradoListadoViewRepository - Vistas 159/160
   * @param {Object} params.dictamenProyectoRepository
   * @param {Object} params.bitacoraProyectoRepository
   * @param {Object} params.teacherRepository - Validación del docente tutor
   * @param {Object} params.managementRepository - Año de gestión para el PDF
   * @param {Object} params.designacionTutorPdfGenerator - IDesignacionTutorPdfGenerator
   * @param {Object} params.uploadsStorage - IUploadsStorage
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    proyectoGradoListadoViewRepository,
    dictamenProyectoRepository,
    bitacoraProyectoRepository,
    teacherRepository,
    managementRepository,
    designacionTutorPdfGenerator,
    uploadsStorage,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.dictamenProyectoRepository = dictamenProyectoRepository;
    this.bitacoraProyectoRepository = bitacoraProyectoRepository;
    this.teacherRepository = teacherRepository;
    this.managementRepository = managementRepository;
    this.designacionTutorPdfGenerator = designacionTutorPdfGenerator;
    this.uploadsStorage = uploadsStorage;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {Object} body - { tutorId, observaciones?, numeroInforme?, fechaEmision?, destinatario? }
   * @param {number|null} userId
   * @returns {Promise<{proyectoGrado: Object}>}
   */
  async execute(proyectoGradoId, body = {}, userId = null) {
    if (!body.tutorId) {
      throw new ValidationError('tutorId es requerido');
    }

    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const docente = await this.teacherRepository.findById(Number(body.tutorId));
    if (!docente) {
      throw new NotFoundError(`docente con ID ${body.tutorId}`);
    }

    const updated = await this.proyectoGradoRepository.update(
      proyectoGradoId,
      { tutorId: Number(body.tutorId) },
      userId
    );

    const tutorNombre = this._nombreDocente(docente);
    const fechaEmision = body.fechaEmision ?? hoyISO();
    const destinatario = body.destinatario ?? 'Dirección Departamental de Educación (DDE)';

    const { proyectoPdf, integrantes } = await buildContextoDictamenPdf({
      proyectoGradoListadoViewRepository: this.proyectoGradoListadoViewRepository,
      managementRepository: this.managementRepository,
      proyecto: updated,
    });

    const buffer = await this.designacionTutorPdfGenerator.generate({
      proyecto: proyectoPdf,
      tutorNombre,
      integrantes,
      numeroInforme: body.numeroInforme ?? null,
      fechaEmision,
      destinatario,
    });

    await guardarDictamenConPdf({
      uploadsStorage: this.uploadsStorage,
      dictamenProyectoRepository: this.dictamenProyectoRepository,
      proyectoGradoId,
      buffer,
      fileName: `designacion_tutor_${proyectoGradoId}_${Date.now()}.pdf`,
      dictamenData: {
        tipo: TIPOS_DICTAMEN_TUTORIA.DESIGNACION_OFICIAL,
        numeroInforme: body.numeroInforme ?? null,
        resultado: null,
        fechaEmision,
        destinatario,
        contenido: `Designación oficial del tutor ${tutorNombre} para el proyecto "${updated.titulo}".`,
      },
      userId,
    });

    // Registro automático, no una observación pendiente de resolución: nace
    // ya SUBSANADO y "confirmado" (nadie debe atenderlo ni firmarlo).
    await this.bitacoraProyectoRepository.create(
      {
        proyectoGradoId,
        tipo: TIPOS_BITACORA_TUTORIA.REUNION,
        fecha: fechaEmision,
        actividad: `Asignación de tutor: ${tutorNombre}`,
        observaciones: body.observaciones ?? null,
        estado: ESTADOS_BITACORA_TUTORIA.SUBSANADO,
        confirmadoEstudiante: true,
        fechaConfirmacion: fechaEmision,
      },
      userId
    );

    this.logger.info('[Tutorías] Tutor asignado y designación emitida', {
      proyectoGradoId,
      tutorId: body.tutorId,
    });

    return { proyectoGrado: updated };
  }

  /** @private Nombre en orden institucional (apellidos primero). */
  _nombreDocente(docente) {
    const plain = docente?.toPlainObject?.() ?? docente ?? {};
    return [
      plain.lastName ?? plain.apellidoPaterno,
      plain.motherLastName ?? plain.apellidoMaterno,
      plain.firstName ?? plain.nombres,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  }
}
