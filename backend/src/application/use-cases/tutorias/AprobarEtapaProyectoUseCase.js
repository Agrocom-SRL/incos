import { ValidationError, ConflictError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_PROYECTO_GRADO,
  TRANSICIONES_PROYECTO_GRADO,
  TIPOS_DICTAMEN_TUTORIA,
  RESULTADOS_DICTAMEN_TUTORIA,
} from '../../../domain/constants/tutorias.constants.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';
import {
  buildContextoDictamenPdf,
  guardarDictamenConPdf,
  hoyISO,
} from './helpers/dictamenPdfHelpers.js';

/** Campo de fecha de la raíz que fija cada estado destino. */
const FECHA_POR_ESTADO = {
  [ESTADOS_PROYECTO_GRADO.APROBADO_PERFIL]: 'fechaAprobacionPerfil',
  [ESTADOS_PROYECTO_GRADO.DESARROLLO]: 'fechaInicioDesarrollo',
  [ESTADOS_PROYECTO_GRADO.PREDEFENSA]: 'fechaPresentacionPredefensa',
  [ESTADOS_PROYECTO_GRADO.APROBADO_PREDEFENSA]: 'fechaAprobacionPredefensa',
  [ESTADOS_PROYECTO_GRADO.DEFENSA]: 'fechaDefensa',
  [ESTADOS_PROYECTO_GRADO.APROBADO]: 'fechaAprobacion',
  [ESTADOS_PROYECTO_GRADO.REPROBADO]: 'fechaAprobacion',
};

/** Campo de nota que puede acompañar cada estado destino. */
const NOTA_POR_ESTADO = {
  [ESTADOS_PROYECTO_GRADO.APROBADO_PERFIL]: 'notaPerfil',
  [ESTADOS_PROYECTO_GRADO.APROBADO_PREDEFENSA]: 'notaPredefensa',
  [ESTADOS_PROYECTO_GRADO.APROBADO]: 'notaDefensa',
  [ESTADOS_PROYECTO_GRADO.REPROBADO]: 'notaDefensa',
};

/**
 * Use Case: AprobarEtapaProyectoUseCase (T11)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Transición de estado del proyecto de grado (máquina de estados
 * TRANSICIONES_PROYECTO_GRADO). Fija automáticamente la fecha de la etapa y,
 * cuando la transición es a APROBADO (aprobación final), emite el INFORME DE
 * VIABILIDAD TÉCNICA: PDF guardado en uploads y registrado en
 * tutoria_dictamenes (tipo VIABILIDAD_TECNICA).
 */
export class AprobarEtapaProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.proyectoGradoListadoViewRepository - Vistas 159/160
   * @param {Object} params.tutoriaDictamenRepository
   * @param {Object} params.managementRepository - Año de gestión para el PDF
   * @param {Object} params.viabilidadProyectoPdfGenerator - IViabilidadProyectoPdfGenerator
   * @param {Object} params.uploadsStorage - IUploadsStorage
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    proyectoGradoListadoViewRepository,
    tutoriaDictamenRepository,
    managementRepository,
    viabilidadProyectoPdfGenerator,
    uploadsStorage,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.tutoriaDictamenRepository = tutoriaDictamenRepository;
    this.managementRepository = managementRepository;
    this.viabilidadProyectoPdfGenerator = viabilidadProyectoPdfGenerator;
    this.uploadsStorage = uploadsStorage;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {Object} body - { estado, fecha?, nota?, observaciones?, numeroInforme?, contenido?, destinatario? }
   * @param {number|null} userId
   * @returns {Promise<{proyectoGrado: Object}>}
   */
  async execute(proyectoGradoId, body = {}, userId = null) {
    const destino = body.estado;
    if (!destino) {
      throw new ValidationError('estado (destino de la transición) es requerido');
    }

    const proyecto = await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const permitidas = TRANSICIONES_PROYECTO_GRADO[proyecto.estado] ?? [];
    if (!permitidas.includes(destino)) {
      throw new ConflictError(
        `Transición no permitida: ${proyecto.estado} → ${destino}. Transiciones válidas: ${
          permitidas.length > 0 ? permitidas.join(', ') : 'ninguna'
        }.`
      );
    }

    const fecha = body.fecha ?? hoyISO();
    const data = { estado: destino };

    const campoFecha = FECHA_POR_ESTADO[destino];
    if (campoFecha) {
      data[campoFecha] = fecha;
    }
    const campoNota = NOTA_POR_ESTADO[destino];
    if (campoNota && body.nota !== undefined && body.nota !== null) {
      data[campoNota] = Number(body.nota);
    }
    if (destino === ESTADOS_PROYECTO_GRADO.APROBADO && body.nota !== undefined && body.nota !== null) {
      data.notaFinal = Number(body.nota);
    }
    if (body.observaciones !== undefined) {
      data.observacionesComite = body.observaciones ?? null;
    }

    const updated = await this.proyectoGradoRepository.update(proyectoGradoId, data, userId);

    // Aprobación final → informe de VIABILIDAD TÉCNICA con PDF.
    if (destino === ESTADOS_PROYECTO_GRADO.APROBADO) {
      await this._emitirViabilidadTecnica(updated, body, fecha, userId);
    }

    this.logger.info('[Tutorías] Transición de etapa del proyecto aplicada', {
      proyectoGradoId,
      desde: proyecto.estado,
      hacia: destino,
    });

    return { proyectoGrado: updated };
  }

  /** @private */
  async _emitirViabilidadTecnica(proyecto, body, fechaEmision, userId) {
    const destinatario = body.destinatario ?? 'Dirección Académica';
    const { proyectoPdf, integrantes, tutorNombre } = await buildContextoDictamenPdf({
      proyectoGradoListadoViewRepository: this.proyectoGradoListadoViewRepository,
      managementRepository: this.managementRepository,
      proyecto,
    });

    const buffer = await this.viabilidadProyectoPdfGenerator.generate({
      proyecto: { ...proyectoPdf, estado: proyecto.estado },
      tutorNombre,
      integrantes,
      resultado: RESULTADOS_DICTAMEN_TUTORIA.APROBADO,
      contenido: body.contenido ?? null,
      numeroInforme: body.numeroInforme ?? null,
      fechaEmision,
      destinatario,
    });

    await guardarDictamenConPdf({
      uploadsStorage: this.uploadsStorage,
      tutoriaDictamenRepository: this.tutoriaDictamenRepository,
      proyectoGradoId: proyecto.id,
      buffer,
      fileName: `viabilidad_tecnica_${proyecto.id}_${Date.now()}.pdf`,
      dictamenData: {
        tipo: TIPOS_DICTAMEN_TUTORIA.VIABILIDAD_TECNICA,
        numeroInforme: body.numeroInforme ?? null,
        resultado: RESULTADOS_DICTAMEN_TUTORIA.APROBADO,
        fechaEmision,
        destinatario,
        contenido: body.contenido ?? `Informe de viabilidad técnica del proyecto "${proyecto.titulo}".`,
      },
      userId,
    });
  }
}
