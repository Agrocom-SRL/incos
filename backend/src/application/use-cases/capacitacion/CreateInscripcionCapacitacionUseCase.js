import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_CAPACITACION,
  ESTADOS_INSCRIPCION_CAPACITACION,
  ESTADOS_PAGO_INSCRITO_CAPACITACION,
  ESTADOS_COMPROMISO_CAPACITACION,
} from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import {
  InscripcionCapacitacionMapper,
  ParticipanteMapper,
} from '../../mappers/capacitacion/index.js';
import { parseFechaISO, parseIdPositivo } from '../../utils/validacionEntrada.js';
import { resolveEstadoEfectivoCurso } from './helpers/cursoEstadoEfectivo.js';
import { esCursoGratuito, tienePagoCursoExterno } from './helpers/cursoCapacitacionInput.js';
import { resolverCostoMatricula, resolverGrupoInscripcion } from './helpers/grupoInscripcion.js';
import { validarConceptoPermitido } from './helpers/pagoCapacitacionInput.js';
import {
  calcularEstadosInscripcion,
  recalcularEstadoInscripcion,
} from './helpers/estadoInscripcion.js';

const esVacio = (valor) =>
  valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

/**
 * Use Case: CreateInscripcionCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Inscribe un participante a una capacitación en UNA transacción:
 * 1. Resuelve el participante: existente (por `participanteId`) o NUEVO
 *    (objeto `participante` con datos mínimos; valida unicidad CI+expedición).
 * 2. Valida que no exista ya una inscripción vigente del participante al curso
 *    (regla de negocio, sin UNIQUE en BD).
 * 3. Crea la inscripción (fecha_inscripcion = hoy si no se envía) con los
 *    snapshots `montoObligatorio` = `capacitaciones.costo` (curso) y
 *    `montoMatricula` = matrícula del GRUPO elegido (`capacitacion_grupos.costo_matricula`,
 *    o la del curso si el grupo no tiene) en este momento (0 si
 *    el interruptor `tieneCosto`/`cobraMatricula` del curso está apagado).
 *    El participante elige un GRUPO (`capacitacionGrupoId`): obligatorio si el
 *    curso tiene 2 o más grupos, se asigna solo si tiene uno y es null si no
 *    tiene; debe pertenecer al curso. Si el grupo define su propio
 *    `cupoMaximo`, alcanzarlo bloquea la inscripción (409).
 * 4. Registra los requisitos ya entregados (`requisitosEntregados`: ids de
 *    `capacitacion_requisitos` del curso).
 * 5. Pago inicial OPCIONAL (`pagoInicial: { concepto, monto, ... }`, delega en
 *    RegisterPagoCapacitacionUseCase, misma transacción). Matrícula y curso se
 *    saldan por separado y en cualquier orden. Con entidad certificadora el
 *    concepto CURSO se rechaza (400, antes de crear nada): ese costo se deposita
 *    a la entidad y se acredita con el requisito `acreditaPagoCurso`.
 *
 * La inscripción SIEMPRE se puede registrar: queda INSCRITO solo si matrícula
 * y curso están CANCELADOS y los requisitos obligatorios entregados
 * (`recalcularEstadoInscripcion`); en otro caso queda PENDIENTE. Si queda saldo
 * y se envía `fechaCompromiso`, se crea un `capacitacion_compromiso` VIGENTE
 * (sin cálculo automático de plazo — la fecha la elige el usuario).
 *
 * El curso acepta inscripciones mientras esté ABIERTO o EN_CURSO (estado
 * EFECTIVO, calculado por fecha vs `fecha_inicio`/`fecha_fin` en
 * `resolveEstadoEfectivoCurso`) — con `fecha_fin` definida, recién al pasarla
 * el curso pasa a CERRADO y deja de aceptar inscripciones. PROPUESTO (aún no
 * abierto) y CANCELADO se rechazan con ConflictError.
 *
 * El cupo del curso es INFORMATIVO en el MVP (decisión §6.9 del plan): no
 * bloquea la inscripción al llegar a cupo_maximo (solo se registra en el log).
 * PENDIENTE cuenta como cupo ocupado igual que INSCRITO (ambas son
 * inscripciones vigentes, con o sin saldo pendiente).
 */
export class CreateInscripcionCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.participanteRepository
   * @param {Object} params.cursoCapacitacionRepository
   * @param {Object} params.capacitacionCompromisoRepository
   * @param {Object} params.capacitacionRequisitoRepository
   * @param {Object} params.grupoCapacitacionRepository
   * @param {Object} params.capacitacionInscritoRequisitoRepository
   * @param {Object} params.pagoCapacitacionRepository
   * @param {Object} params.registerPagoCapacitacionUseCase - Pago inicial (composición)
   * @param {ILogger} params.logger
   */
  constructor({
    inscripcionCapacitacionRepository,
    participanteRepository,
    cursoCapacitacionRepository,
    capacitacionCompromisoRepository,
    capacitacionRequisitoRepository,
    grupoCapacitacionRepository,
    capacitacionInscritoRequisitoRepository,
    pagoCapacitacionRepository,
    registerPagoCapacitacionUseCase,
    logger,
  }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.participanteRepository = participanteRepository;
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.capacitacionRequisitoRepository = capacitacionRequisitoRepository;
    this.grupoCapacitacionRepository = grupoCapacitacionRepository;
    this.capacitacionInscritoRequisitoRepository = capacitacionInscritoRequisitoRepository;
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.registerPagoCapacitacionUseCase = registerPagoCapacitacionUseCase;
    this.logger = logger;
  }

  /**
   * @param {Object} body - { capacitacionId (alias cursoId), participanteId? | participante?,
   *   fechaInscripcion?, capacitacionGrupoId?, requisitosEntregados?, pagoInicial?, fechaCompromiso? }
   *   pagoInicial: { concepto, monto, metodoPagoId, cuentaPagoId?, fechaPago?, observaciones?, fechaCompromiso? }
   * @param {number|null} userId - Usuario que inscribe (auditoría)
   * @returns {Promise<{inscripcionCapacitacion: Object}>}
   */
  async execute(body = {}, userId = null) {
    // 1. Curso destino
    const capacitacionId = parseIdPositivo(body.capacitacionId ?? body.cursoId, 'capacitacionId');
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

    // 2. Entradas opcionales: fecha, grupo/horario del curso, requisitos entregados
    const fechaInscripcion = esVacio(body.fechaInscripcion)
      ? new Date().toISOString().slice(0, 10)
      : parseFechaISO(body.fechaInscripcion, 'fechaInscripcion');
    const fechaCompromiso = this._parseFechaCompromiso(body);
    const grupo = await resolverGrupoInscripcion({
      grupoCapacitacionRepository: this.grupoCapacitacionRepository,
      inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
      curso,
      valor: body.capacitacionGrupoId,
    });
    const requisitosEntregados = await this._validarRequisitosEntregados(
      body.requisitosEntregados,
      capacitacionId
    );

    // 3. Cupo informativo (decisión §6.9: NO bloquea). PENDIENTE + INSCRITO ocupan cupo.
    const [pendientesCount, inscritosCount] = await Promise.all([
      this.inscripcionCapacitacionRepository.count({
        capacitacionId,
        estado: ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
      }),
      this.inscripcionCapacitacionRepository.count({
        capacitacionId,
        estado: ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
      }),
    ]);
    const inscritosVigentes = pendientesCount + inscritosCount;
    if (curso.cupoMaximo && inscritosVigentes >= curso.cupoMaximo) {
      this.logger.warn('[Capacitación] Inscripción por encima del cupo máximo (informativo)', {
        capacitacionId,
        cupoMaximo: curso.cupoMaximo,
        inscritosVigentes,
      });
    }

    // 4. Montos (snapshot en este instante). Un curso totalmente gratuito no registra pagos.
    const costo = curso.tieneCosto ? Number(curso.costo ?? 0) : 0;
    const costoMatricula = resolverCostoMatricula(curso, grupo);
    const esGratuito = esCursoGratuito(curso);
    const pagoInicialBody = body.pagoInicial ?? null;
    if (pagoInicialBody !== null && (typeof pagoInicialBody !== 'object' || Array.isArray(pagoInicialBody))) {
      throw new ValidationError('pagoInicial debe ser un objeto { concepto, monto, metodoPagoId, ... }');
    }
    const registrarPagoInicial = pagoInicialBody !== null && !esGratuito;
    // Costo externo: el pago inicial de concepto CURSO se rechaza antes de crear nada
    if (registrarPagoInicial) {
      validarConceptoPermitido(
        String(pagoInicialBody.concepto ?? '').trim().toUpperCase(),
        tienePagoCursoExterno(curso)
      );
    }
    if (pagoInicialBody !== null && esGratuito) {
      this.logger.warn(
        '[Capacitación] Se recibió pagoInicial para un curso gratuito; se ignora (curso gratuito no registra pagos)',
        { capacitacionId }
      );
    }

    const datosParticipanteNuevo = this._validateParticipantePayload(body);

    let inscripcionCreada = null;
    let participante = null;
    let pagoInicial = null;
    let resumen = null;
    let compromisoCreado = null;

    await sequelize.transaction(async (transaction) => {
      // 5. Resolver participante (existente por id o nuevo)
      participante = await this._resolveParticipante(
        body,
        datosParticipanteNuevo,
        userId,
        transaction
      );

      // 6. Regla: una sola inscripción vigente (PENDIENTE o INSCRITO) por participante+curso
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

      // 7. Crear inscripción con los snapshots de costo y matrícula. Nace PENDIENTE; el
      //    estado definitivo lo fija el recálculo (pagos por concepto + requisitos).
      const inicial = calcularEstadosInscripcion({
        montoCurso: costo,
        montoMatricula: costoMatricula,
        pagadoCurso: 0,
        pagadoMatricula: 0,
        requisitosPendientes: 1,
        estadoActual: ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
      });
      inscripcionCreada = await this.inscripcionCapacitacionRepository.create(
        {
          participanteId: participante.id,
          capacitacionId,
          fechaInscripcion,
          estado: ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
          montoObligatorio: costo,
          montoMatricula: costoMatricula,
          estadoPago: inicial.estadoPago,
          estadoPagoCurso: inicial.estadoPagoCurso,
          estadoPagoMatricula: inicial.estadoPagoMatricula,
          capacitacionGrupoId: grupo?.id ?? null,
        },
        userId,
        { transaction }
      );

      // 8. Requisitos ya entregados al inscribirse
      for (const requisitoId of requisitosEntregados) {
        // eslint-disable-next-line no-await-in-loop
        await this.capacitacionInscritoRequisitoRepository.create(
          {
            capacitacionInscritoId: inscripcionCreada.id,
            capacitacionRequisitoId: requisitoId,
            entregado: true,
            fechaEntrega: fechaInscripcion,
          },
          userId,
          { transaction }
        );
      }

      // 9. Pago inicial OPCIONAL (mismo use case de POST /:id/pagos; recalcula estados)
      if (registrarPagoInicial) {
        const resultado = await this.registerPagoCapacitacionUseCase.execute(
          inscripcionCreada.id,
          pagoInicialBody,
          userId,
          { transaction }
        );
        pagoInicial = resultado.pagoCapacitacion;
        resumen = pagoInicial.inscripcion ?? null;
      }
      if (!resumen) {
        resumen = await recalcularEstadoInscripcion({
          inscripcion: inscripcionCreada,
          pagoCapacitacionRepository: this.pagoCapacitacionRepository,
          capacitacionInscritoRequisitoRepository: this.capacitacionInscritoRequisitoRepository,
          inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
          capacitacionCompromisoRepository: this.capacitacionCompromisoRepository,
          userId,
          transaction,
        });
      }

      // El recálculo pudo cambiar estado/estados de pago: releer.
      inscripcionCreada = await this.inscripcionCapacitacionRepository.findById(
        inscripcionCreada.id,
        { transaction }
      );

      // 10. Queda saldo y se acordó una fecha: compromiso VIGENTE (la fecha la elige el usuario)
      if (fechaCompromiso && inscripcionCreada.estadoPago === ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL) {
        compromisoCreado = await this.capacitacionCompromisoRepository.create(
          {
            capacitacionInscritoId: inscripcionCreada.id,
            fechaCompromiso,
            observacion: null,
            estado: ESTADOS_COMPROMISO_CAPACITACION.VIGENTE,
          },
          userId,
          { transaction }
        );
      }
    });

    this.logger.info('[Capacitación] Inscripción creada', {
      id: inscripcionCreada.id,
      participanteId: participante.id,
      capacitacionId,
      estado: inscripcionCreada.estado,
      conPagoInicial: Boolean(pagoInicial),
      requisitosEntregados: requisitosEntregados.length,
      conCompromiso: Boolean(compromisoCreado),
    });

    const presentation = InscripcionCapacitacionMapper.entityToPresentation(inscripcionCreada);
    presentation.participante = ParticipanteMapper.entityToPresentation(participante);
    presentation.capacitacionTitulo = curso.titulo;
    presentation.capacitacionEdicion = curso.edicion ?? null;
    presentation.costo = costo;
    presentation.saldoCurso = resumen?.saldoCurso ?? 0;
    presentation.saldoMatricula = resumen?.saldoMatricula ?? 0;
    // pagoInicial ya viene en formato de presentación desde RegisterPagoCapacitacionUseCase
    presentation.pagoInicial = pagoInicial;
    if (compromisoCreado) {
      presentation.fechaCompromiso = compromisoCreado.fechaCompromiso;
      presentation.compromisoEstado = compromisoCreado.estado;
    }

    return { inscripcionCapacitacion: presentation };
  }

  /**
   * Fecha de compromiso opcional (en `pagoInicial.fechaCompromiso` o en la raíz).
   * @private
   */
  _parseFechaCompromiso(body) {
    const valor = body.pagoInicial?.fechaCompromiso ?? body.fechaCompromiso;
    return esVacio(valor) ? null : parseFechaISO(valor, 'fechaCompromiso');
  }

  /**
   * `requisitosEntregados` opcional: ids de requisitos vigentes DEL curso.
   * @private
   */
  async _validarRequisitosEntregados(valor, capacitacionId) {
    if (valor === undefined || valor === null) return [];
    if (!Array.isArray(valor)) {
      throw new ValidationError('requisitosEntregados debe ser un array de IDs de requisitos');
    }
    const ids = [...new Set(valor.map((id) => parseIdPositivo(id, 'requisitosEntregados')))];
    if (ids.length === 0) return [];
    const requisitosCurso = await this.capacitacionRequisitoRepository.findByCapacitacionId(capacitacionId);
    const permitidos = new Set(requisitosCurso.map((r) => r.id));
    const ajeno = ids.find((id) => !permitidos.has(id));
    if (ajeno !== undefined) {
      throw new ValidationError(`El requisito ${ajeno} no pertenece al curso`);
    }
    return ids;
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
