import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_CAPACITACION,
  ESTADOS_INSCRIPCION_CAPACITACION,
} from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import {
  InscripcionCapacitacionMapper,
  ParticipanteMapper,
} from '../../mappers/capacitacion/index.js';
import { resolveEstadoEfectivoCurso } from './helpers/cursoEstadoEfectivo.js';

/**
 * Use Case: CreateInscripcionCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Inscribe un participante a una capacitación en UNA transacción:
 * 1. Resuelve el participante: existente (por `participanteId`) o NUEVO
 *    (objeto `participante` con datos mínimos; valida unicidad CI+expedición).
 * 2. Valida que no exista ya una inscripción vigente del participante al curso
 *    (regla de negocio, sin UNIQUE en BD).
 * 3. Crea la inscripción (fecha_inscripcion = hoy si no se envía).
 * 4. Registra el pago inicial OPCIONAL delegando en
 *    RegisterPagoCapacitacionUseCase (misma transacción).
 *
 * El curso acepta inscripciones mientras esté ABIERTO o EN_CURSO (estado
 * EFECTIVO, calculado por fecha vs `fecha_inicio`/`fecha_fin` en
 * `resolveEstadoEfectivoCurso`) — el corte real es `fecha_fin`: recién al
 * pasarla el curso pasa a CERRADO y deja de aceptar inscripciones. PROPUESTO
 * (aún no abierto) y CANCELADO se rechazan con ConflictError. El frontend ya
 * filtra por estos mismos 2 estados al listar cursos en el wizard
 * (useCursosCapacitacionOptions); esta validación es la defensa real, por si
 * se llama a la API directamente.
 *
 * El cupo del curso es INFORMATIVO en el MVP (decisión §6.9 del plan): no
 * bloquea la inscripción al llegar a cupo_maximo (solo se registra en el log).
 */
export class CreateInscripcionCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.participanteRepository
   * @param {Object} params.cursoCapacitacionRepository
   * @param {Object} params.registerPagoCapacitacionUseCase - Pago inicial (composición)
   * @param {ILogger} params.logger
   */
  constructor({
    inscripcionCapacitacionRepository,
    participanteRepository,
    cursoCapacitacionRepository,
    registerPagoCapacitacionUseCase,
    logger,
  }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.participanteRepository = participanteRepository;
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.registerPagoCapacitacionUseCase = registerPagoCapacitacionUseCase;
    this.logger = logger;
  }

  /**
   * @param {Object} body - { capacitacionId, participanteId? | participante?, fechaInscripcion?, pagoInicial? }
   * @param {number|null} userId - Usuario que inscribe (auditoría)
   * @returns {Promise<{inscripcionCapacitacion: Object}>}
   */
  async execute(body = {}, userId = null) {
    // 1. Curso destino
    const capacitacionId = Number(body.capacitacionId);
    if (!capacitacionId) {
      throw new ValidationError('capacitacionId es requerido');
    }
    const curso = await this.cursoCapacitacionRepository.findById(capacitacionId);
    if (!curso) throw new NotFoundError('curso de capacitación');
    const estadoEfectivo = resolveEstadoEfectivoCurso(
      curso.estado,
      curso.fechaInicio,
      curso.fechaFin
    );
    const ESTADOS_QUE_ACEPTAN_INSCRIPCION = [
      ESTADOS_CAPACITACION.ABIERTO,
      ESTADOS_CAPACITACION.EN_CURSO,
    ];
    if (!ESTADOS_QUE_ACEPTAN_INSCRIPCION.includes(estadoEfectivo)) {
      throw new ConflictError(
        `El curso "${curso.titulo}" no acepta inscripciones en su estado actual (${estadoEfectivo})`
      );
    }

    // 2. Cupo informativo (decisión §6.9: NO bloquea)
    const inscritosVigentes = await this.inscripcionCapacitacionRepository.count({
      capacitacionId,
      estado: ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
    });
    if (curso.cupoMaximo && inscritosVigentes >= curso.cupoMaximo) {
      this.logger.warn('[Capacitación] Inscripción por encima del cupo máximo (informativo)', {
        capacitacionId,
        cupoMaximo: curso.cupoMaximo,
        inscritosVigentes,
      });
    }

    const datosParticipanteNuevo = this._validateParticipantePayload(body);

    let inscripcionCreada = null;
    let participante = null;
    let pagoInicial = null;

    await sequelize.transaction(async (transaction) => {
      // 3. Resolver participante (existente por id o nuevo)
      participante = await this._resolveParticipante(
        body,
        datosParticipanteNuevo,
        userId,
        transaction
      );

      // 4. Regla: una sola inscripción vigente por participante+curso
      const existente =
        await this.inscripcionCapacitacionRepository.findActivaByParticipanteAndCapacitacion(
          participante.id,
          capacitacionId,
          { transaction }
        );
      if (existente) {
        throw new ConflictError(
          `El participante ya tiene una inscripción vigente a este curso (ID ${existente.id})`
        );
      }

      // 5. Crear inscripción
      inscripcionCreada = await this.inscripcionCapacitacionRepository.create(
        {
          participanteId: participante.id,
          capacitacionId,
          fechaInscripcion: body.fechaInscripcion ?? new Date().toISOString().slice(0, 10),
          estado: ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
        },
        userId,
        { transaction }
      );

      // 6. Pago inicial opcional (misma transacción, mismo use case del endpoint de pagos)
      if (body.pagoInicial && Number(body.pagoInicial.monto) > 0) {
        const resultado = await this.registerPagoCapacitacionUseCase.execute(
          inscripcionCreada.id,
          body.pagoInicial,
          userId,
          { transaction }
        );
        pagoInicial = resultado.pagoCapacitacion;
      }
    });

    this.logger.info('[Capacitación] Inscripción creada', {
      id: inscripcionCreada.id,
      participanteId: participante.id,
      capacitacionId,
      conPagoInicial: Boolean(pagoInicial),
    });

    const presentation = InscripcionCapacitacionMapper.entityToPresentation(inscripcionCreada);
    presentation.participante = ParticipanteMapper.entityToPresentation(participante);
    presentation.capacitacionTitulo = curso.titulo;
    presentation.costo = Number(curso.costo ?? 0);
    // pagoInicial ya viene en formato de presentación desde RegisterPagoCapacitacionUseCase
    presentation.pagoInicial = pagoInicial;

    return { inscripcionCapacitacion: presentation };
  }

  /**
   * Valida el payload de participante: participanteId (existente) XOR
   * participante (objeto para alta). Retorna los datos del nuevo o null.
   * @private
   */
  _validateParticipantePayload(body) {
    const tieneId = body.participanteId !== undefined && body.participanteId !== null;
    const tieneObjeto = body.participante && typeof body.participante === 'object';

    if (!tieneId && !tieneObjeto) {
      throw new ValidationError(
        'Debe enviarse participanteId (existente) o participante (datos para alta)'
      );
    }
    if (tieneId && tieneObjeto) {
      throw new ValidationError(
        'Enviar solo uno: participanteId (existente) o participante (nuevo), no ambos'
      );
    }

    if (!tieneObjeto) return null;

    const nuevo = body.participante;
    if (!nuevo.ci || String(nuevo.ci).trim() === '') {
      throw new ValidationError('participante.ci es requerido');
    }
    if (!nuevo.nombres || String(nuevo.nombres).trim() === '') {
      throw new ValidationError('participante.nombres es requerido');
    }
    if (!nuevo.celular || String(nuevo.celular).trim() === '') {
      throw new ValidationError('participante.celular es requerido');
    }
    return nuevo;
  }

  /**
   * Resuelve el participante dentro de la transacción: existente por id o alta
   * nueva validando unicidad CI+expedición.
   * @private
   */
  async _resolveParticipante(body, datosParticipanteNuevo, userId, transaction) {
    if (datosParticipanteNuevo === null) {
      const participante = await this.participanteRepository.findById(
        Number(body.participanteId),
        { transaction }
      );
      if (!participante) throw new NotFoundError('participante');
      return participante;
    }

    const ci = String(datosParticipanteNuevo.ci).trim();
    const expedicion = datosParticipanteNuevo.expedicion ?? null;

    const duplicado = await this.participanteRepository.findByCiExpedicion(ci, expedicion);
    if (duplicado) {
      throw new ConflictError(
        `Ya existe un participante con CI ${ci}${expedicion ? ` ${expedicion}` : ''} (ID ${duplicado.id}). Use participanteId para inscribirlo.`
      );
    }

    return this.participanteRepository.create(
      {
        ci,
        expedicion,
        nombres: String(datosParticipanteNuevo.nombres).trim(),
        apellidoPaterno: datosParticipanteNuevo.apellidoPaterno ?? null,
        apellidoMaterno: datosParticipanteNuevo.apellidoMaterno ?? null,
        celular: String(datosParticipanteNuevo.celular).trim(),
        email: datosParticipanteNuevo.email ?? null,
      },
      userId,
      { transaction }
    );
  }
}
