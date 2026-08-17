import { ValidationError, ConflictError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_PROYECTO_GRADO,
  TRANSICIONES_PROYECTO_GRADO,
  TIPOS_DICTAMEN_TUTORIA,
  RESULTADOS_DICTAMEN_TUTORIA,
  TIPOS_BITACORA_TUTORIA,
  ESTADOS_BITACORA_TUTORIA,
} from '../../../domain/constants/titulacion.constants.js';
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
  [ESTADOS_PROYECTO_GRADO.SUFICIENCIA]: 'fechaInformeSuficiencia',
  [ESTADOS_PROYECTO_GRADO.PREDEFENSA]: 'fechaPresentacionPredefensa',
  [ESTADOS_PROYECTO_GRADO.APROBADO_PREDEFENSA]: 'fechaAprobacionPredefensa',
  [ESTADOS_PROYECTO_GRADO.DEFENSA]: 'fechaDefensa',
  [ESTADOS_PROYECTO_GRADO.APROBADO]: 'fechaAprobacion',
  [ESTADOS_PROYECTO_GRADO.REPROBADO]: 'fechaAprobacion',
};

/** Nota de predefensa mínima (exclusiva) para la exención de defensa (salto directo a APROBADO). */
const NOTA_MINIMA_EXENCION_DEFENSA = 90;

/** Campos requeridos en el body cuando la transición destino es SUFICIENCIA. */
const CAMPOS_INFORME_SUFICIENCIA = [
  'aspectosFormato',
  'contenidoProyecto',
  'procesoTutoria',
  'resultadoSuficiencia',
];

/**
 * Veredicto válido del informe de suficiencia (reutiliza el vocabulario del
 * documento físico: "APROBADO"/"NO APROBADO"). Subconjunto de
 * RESULTADOS_DICTAMEN_TUTORIA_VALUES — OBSERVADO/RECHAZADO no aplican aquí.
 */
const RESULTADOS_INFORME_SUFICIENCIA_VALUES = [
  RESULTADOS_DICTAMEN_TUTORIA.APROBADO,
  RESULTADOS_DICTAMEN_TUTORIA.NO_APROBADO,
];

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
 * dictamenes_proyecto (tipo VIABILIDAD_TECNICA) — SIN resultado propio (ver
 * nota 2026-08-11 abajo).
 *
 * Extensión 2026-08-11 (pedido explícito del usuario): además, registra la
 * transición como una entrada de bitácora del proyecto (fecha, etapa origen →
 * destino y observaciones si el body las trae). También deja de auto-asignar
 * `resultado` (antes siempre "APROBADO") al dictamen de viabilidad técnica en
 * `dictamenes_proyecto`: es documentación oficial que firman todas las
 * partes, decidir ese resultado está fuera del alcance del sistema — el PDF
 * se sigue emitiendo igual, solo cambia el registro que guarda el sistema.
 *
 * Extensión 2026-08-17 (informe de suficiencia + exención de defensa):
 * - `DESARROLLO → SUFICIENCIA` exige en el body los 3 criterios del tutor
 *   (`aspectosFormato`, `contenidoProyecto`, `procesoTutoria`) y el veredicto
 *   `resultadoSuficiencia` (APROBADO|NO_APROBADO — NO bloquea la transición,
 *   es contenido del documento, decisión del tutor). Emite y guarda el PDF
 *   INFORME_SUFICIENCIA (mismo mecanismo que `_emitirViabilidadTecnica`).
 * - `APROBADO_PREDEFENSA → APROBADO` (salto directo, sin pasar por DEFENSA)
 *   es la exención de defensa: exige `notaPredefensa > 90`; `notaFinal` se
 *   copia de `notaPredefensa` (no depende de `body.nota`, no hay acta). No
 *   crea fila en `actas_defensa` — eso es responsabilidad exclusiva de
 *   `RegistrarActaDefensaUseCase`.
 */
export class AprobarEtapaProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.proyectoGradoListadoViewRepository - Vistas 159/160
   * @param {Object} params.dictamenProyectoRepository
   * @param {Object} params.bitacoraProyectoRepository
   * @param {Object} params.managementRepository - Año de gestión para el PDF
   * @param {Object} params.studentRepository - Datos del titular para el informe de suficiencia (CI/expedición/celular)
   * @param {Object} params.viabilidadProyectoPdfGenerator - IViabilidadProyectoPdfGenerator
   * @param {Object} params.informeSuficienciaPdfGenerator - IInformeSuficienciaPdfGenerator
   * @param {Object} params.uploadsStorage - IUploadsStorage
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    proyectoGradoListadoViewRepository,
    dictamenProyectoRepository,
    bitacoraProyectoRepository,
    managementRepository,
    studentRepository,
    viabilidadProyectoPdfGenerator,
    informeSuficienciaPdfGenerator,
    uploadsStorage,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.dictamenProyectoRepository = dictamenProyectoRepository;
    this.bitacoraProyectoRepository = bitacoraProyectoRepository;
    this.managementRepository = managementRepository;
    this.studentRepository = studentRepository;
    this.viabilidadProyectoPdfGenerator = viabilidadProyectoPdfGenerator;
    this.informeSuficienciaPdfGenerator = informeSuficienciaPdfGenerator;
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

    if (destino === ESTADOS_PROYECTO_GRADO.SUFICIENCIA) {
      this._validarCamposInformeSuficiencia(body);
    }

    const esExencionDefensa =
      proyecto.estado === ESTADOS_PROYECTO_GRADO.APROBADO_PREDEFENSA &&
      destino === ESTADOS_PROYECTO_GRADO.APROBADO;
    if (esExencionDefensa) {
      this._validarExencionDefensa(proyecto);
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
    if (
      destino === ESTADOS_PROYECTO_GRADO.APROBADO &&
      body.nota !== undefined &&
      body.nota !== null
    ) {
      data.notaFinal = Number(body.nota);
    }
    if (esExencionDefensa) {
      // Exención de defensa: la nota final ES la de predefensa (no hay acta
      // de defensa que aporte body.nota en este camino).
      data.notaFinal = Number(proyecto.notaPredefensa);
    }
    if (body.observaciones !== undefined) {
      data.observacionesComite = body.observaciones ?? null;
    }

    const updated = await this.proyectoGradoRepository.update(proyectoGradoId, data, userId);

    // Registro automático, no una observación pendiente de resolución: nace
    // ya SUBSANADO y "confirmado" (nadie debe atenderlo ni firmarlo).
    await this.bitacoraProyectoRepository.create(
      {
        proyectoGradoId,
        tipo: TIPOS_BITACORA_TUTORIA.REUNION,
        fecha,
        actividad: `Transición de etapa: ${proyecto.estado} → ${destino}`,
        observaciones: body.observaciones ?? null,
        estado: ESTADOS_BITACORA_TUTORIA.SUBSANADO,
        confirmadoEstudiante: true,
        fechaConfirmacion: fecha,
      },
      userId
    );

    // Aprobación final → informe de VIABILIDAD TÉCNICA con PDF.
    if (destino === ESTADOS_PROYECTO_GRADO.APROBADO) {
      await this._emitirViabilidadTecnica(updated, body, fecha, userId);
    }

    // DESARROLLO → SUFICIENCIA → informe de SUFICIENCIA del tutor con PDF.
    if (destino === ESTADOS_PROYECTO_GRADO.SUFICIENCIA) {
      await this._emitirInformeSuficiencia(updated, body, fecha, userId);
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
      dictamenProyectoRepository: this.dictamenProyectoRepository,
      proyectoGradoId: proyecto.id,
      buffer,
      fileName: `viabilidad_tecnica_${proyecto.id}_${Date.now()}.pdf`,
      dictamenData: {
        tipo: TIPOS_DICTAMEN_TUTORIA.VIABILIDAD_TECNICA,
        numeroInforme: body.numeroInforme ?? null,
        // Extensión 2026-08-11 (pedido explícito del usuario): el sistema ya
        // no se auto-asigna un resultado — es documentación oficial que
        // firman todas las partes, fuera del alcance del sistema decidirlo.
        resultado: null,
        fechaEmision,
        destinatario,
        contenido: body.contenido ?? `Informe de viabilidad técnica del proyecto "${proyecto.titulo}".`,
      },
      userId,
    });
  }

  /**
   * Valida que el body traiga los 3 criterios del tutor + el veredicto antes
   * de aplicar la transición DESARROLLO → SUFICIENCIA (documento formal, no
   * se emite en blanco).
   * @private
   */
  _validarCamposInformeSuficiencia(body) {
    const faltantes = CAMPOS_INFORME_SUFICIENCIA.filter((campo) => {
      const valor = body[campo];
      return valor === undefined || valor === null || String(valor).trim() === '';
    });
    if (faltantes.length > 0) {
      throw new ValidationError(
        `Para registrar el informe de suficiencia debe completar: ${faltantes.join(', ')}.`
      );
    }
    if (!RESULTADOS_INFORME_SUFICIENCIA_VALUES.includes(body.resultadoSuficiencia)) {
      throw new ValidationError(
        `resultadoSuficiencia debe ser ${RESULTADOS_DICTAMEN_TUTORIA.APROBADO} o ${RESULTADOS_DICTAMEN_TUTORIA.NO_APROBADO}`
      );
    }
  }

  /**
   * Exención de defensa (salto directo APROBADO_PREDEFENSA → APROBADO):
   * exige notaPredefensa > 90. Lanza ConflictError si no se cumple.
   * @private
   */
  _validarExencionDefensa(proyecto) {
    const notaPredefensa =
      proyecto.notaPredefensa != null ? Number(proyecto.notaPredefensa) : null;
    if (notaPredefensa === null || !(notaPredefensa > NOTA_MINIMA_EXENCION_DEFENSA)) {
      throw new ConflictError(
        `La exención de defensa requiere una nota de predefensa mayor a ${NOTA_MINIMA_EXENCION_DEFENSA}.`
      );
    }
  }

  /**
   * Emite y guarda el INFORME DE SUFICIENCIA del tutor (dictamenes_proyecto,
   * tipo INFORME_SUFICIENCIA). Mismo mecanismo que `_emitirViabilidadTecnica`.
   * Los datos del titular (nombres/CI/expedición/celular) no están en la
   * vista 159/160: se resuelven vía studentRepository (mismo patrón que
   * `ExportFormularioModalidadGradoPdfUseCase`).
   * @private
   */
  async _emitirInformeSuficiencia(proyecto, body, fechaEmision, userId) {
    const { proyectoPdf, integrantes, tutorNombre } = await buildContextoDictamenPdf({
      proyectoGradoListadoViewRepository: this.proyectoGradoListadoViewRepository,
      managementRepository: this.managementRepository,
      proyecto,
    });

    const titular = integrantes.find((i) => i.rol === 'TITULAR') ?? integrantes[0] ?? null;
    let estudiante = {};
    if (titular?.estudianteId) {
      const estudianteEntity = await this.studentRepository.findById(titular.estudianteId);
      if (estudianteEntity) {
        estudiante = {
          nombres: estudianteEntity.firstName ?? null,
          apellidoPaterno: estudianteEntity.lastName ?? null,
          apellidoMaterno: estudianteEntity.motherLastName ?? null,
          nombreCompleto: titular.estudianteNombre ?? titular.nombreCompleto ?? null,
          ci: estudianteEntity.ci ?? null,
          expedicion: estudianteEntity.expedition ?? null,
          celular: estudianteEntity.mobilePhone ?? null,
        };
      }
    }

    const { resultadoSuficiencia } = body;
    const contenido = [
      `Aspectos de formato: ${body.aspectosFormato}`,
      `Contenido del proyecto: ${body.contenidoProyecto}`,
      `Proceso de tutoría: ${body.procesoTutoria}`,
    ].join('\n\n');

    const buffer = await this.informeSuficienciaPdfGenerator.generate({
      estudiante,
      proyecto: proyectoPdf,
      tutorNombre,
      aspectosFormato: body.aspectosFormato,
      contenidoProyecto: body.contenidoProyecto,
      procesoTutoria: body.procesoTutoria,
      resultadoSuficiencia,
      fechaEmision,
    });

    await guardarDictamenConPdf({
      uploadsStorage: this.uploadsStorage,
      dictamenProyectoRepository: this.dictamenProyectoRepository,
      proyectoGradoId: proyecto.id,
      buffer,
      fileName: `informe_suficiencia_${proyecto.id}_${Date.now()}.pdf`,
      dictamenData: {
        tipo: TIPOS_DICTAMEN_TUTORIA.INFORME_SUFICIENCIA,
        numeroInforme: null,
        resultado: resultadoSuficiencia,
        fechaEmision,
        destinatario: 'Dirección Académica',
        contenido,
      },
      userId,
    });
  }
}
