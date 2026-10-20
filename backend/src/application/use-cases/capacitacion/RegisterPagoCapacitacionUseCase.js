import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_INSCRIPCION_CAPACITACION,
  ESTADOS_PAGO_INSCRITO_CAPACITACION,
  ESTADOS_COMPROMISO_CAPACITACION,
} from '../../../domain/constants/capacitacion.constants.js';
import { PagoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: RegisterPagoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Registra un pago (cuota) de una inscripción a capacitación
 * (POST /inscripciones-capacitacion/:id/pagos, permiso capacitacion.pago CREAR).
 * También se usa compuesto dentro de CreateInscripcionCapacitacionUseCase para
 * el pago inicial (misma transacción).
 *
 * Reglas:
 * - La inscripción debe existir y estar vigente (estado PENDIENTE o INSCRITO;
 *   RETIRADO/ANULADO rechazan con ConflictError).
 * - El monto no puede superar el saldo pendiente, calculado contra el
 *   SNAPSHOT `inscripcion.montoObligatorio` (no el costo actual del curso,
 *   que puede haber cambiado desde que se inscribió).
 * - Tras registrar el pago, si el total acumulado cubre `montoObligatorio`:
 *   `estadoPago` pasa a CANCELADO, `estado` pasa de PENDIENTE a INSCRITO (si
 *   correspondía), y el compromiso VIGENTE de la inscripción (si existe) se
 *   marca CUMPLIDO. Esto aplica igual sin importar si el pago llegó antes o
 *   después de la fecha de compromiso — NO hay penalización por pago
 *   atrasado, se acepta con total normalidad.
 * - `numero_recibo` se genera en lógica de negocio con el patrón de pagos de
 *   aportes: se crea con número temporal (NOT NULL) y se reemplaza por el ID
 *   del pago rellenado a 6 dígitos (unicidad en lógica).
 * - Valida método de pago (catálogo `metodos_pago`) y cuenta opcional
 *   (catálogo `cuentas_pago`).
 */
export class RegisterPagoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.pagoCapacitacionRepository
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.capacitacionCompromisoRepository
   * @param {Object} params.paymentMethodRepository - Catálogo metodos_pago (reutilizado)
   * @param {Object} params.paymentAccountRepository - Catálogo cuentas_pago (reutilizado)
   * @param {ILogger} params.logger
   */
  constructor({
    pagoCapacitacionRepository,
    inscripcionCapacitacionRepository,
    capacitacionCompromisoRepository,
    paymentMethodRepository,
    paymentAccountRepository,
    logger,
  }) {
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.paymentAccountRepository = paymentAccountRepository;
    this.logger = logger;
  }

  /**
   * @param {number} capacitacionInscritoId - ID de la inscripción
   * @param {Object} body - { monto, metodoPagoId, cuentaPagoId?, fechaPago?, observaciones? }
   * @param {number|null} userId - Usuario que registra (auditoría)
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`, para
   *   componer dentro de CreateInscripcionCapacitacionUseCase)
   * @returns {Promise<{pagoCapacitacion: Object}>}
   */
  async execute(capacitacionInscritoId, body = {}, userId = null, options = {}) {
    const { transaction } = options;

    // 1. Inscripción vigente (PENDIENTE o INSCRITO; nunca RETIRADO/ANULADO)
    const inscripcion = await this.inscripcionCapacitacionRepository.findById(
      capacitacionInscritoId,
      { transaction }
    );
    if (!inscripcion) throw new NotFoundError('inscripción de capacitación');
    const ESTADOS_QUE_ACEPTAN_PAGO = [
      ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
      ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
    ];
    if (!ESTADOS_QUE_ACEPTAN_PAGO.includes(inscripcion.estado)) {
      throw new ConflictError(
        'No se puede registrar un pago sobre una inscripción retirada o anulada'
      );
    }

    // 2. Monto vs saldo pendiente (monto_obligatorio SNAPSHOT − total pagado)
    const monto = Number(body.monto);
    if (Number.isNaN(monto) || monto <= 0) {
      throw new ValidationError('monto debe ser un número mayor a 0');
    }

    const totalPagadoPrevio = await this.pagoCapacitacionRepository.sumMontoByInscripcionId(
      capacitacionInscritoId,
      { transaction }
    );
    const montoObligatorio = Number(inscripcion.montoObligatorio ?? 0);
    const saldo = Math.max(0, montoObligatorio - totalPagadoPrevio);
    if (monto > saldo) {
      const limite = totalPagadoPrevio > 0 ? 'el saldo pendiente' : 'el costo del curso';
      throw new ValidationError(
        `El monto del pago (Bs. ${monto.toFixed(2)}) no puede superar ${limite} (Bs. ${saldo.toFixed(2)})`
      );
    }

    // 3. Método de pago y cuenta (catálogos reutilizados)
    const metodoPagoId = body.metodoPagoId !== undefined ? Number(body.metodoPagoId) : null;
    if (!metodoPagoId) {
      throw new ValidationError('metodoPagoId es requerido');
    }
    const metodoPago = await this.paymentMethodRepository.findById(metodoPagoId);
    if (!metodoPago) throw new NotFoundError(`método de pago con ID ${metodoPagoId}`);

    const cuentaPagoId =
      body.cuentaPagoId !== undefined && body.cuentaPagoId !== null
        ? Number(body.cuentaPagoId)
        : null;
    if (cuentaPagoId) {
      const cuenta = await this.paymentAccountRepository.findById(cuentaPagoId);
      if (!cuenta) throw new NotFoundError(`cuenta de pago con ID ${cuentaPagoId}`);
    }

    // 4. Crear pago con numero_recibo temporal (NOT NULL); luego se reemplaza
    //    por el ID a 6 dígitos (mismo patrón que pago_cuotas de aportes)
    const fechaPago = body.fechaPago ?? new Date().toISOString().slice(0, 10);
    const pago = await this.pagoCapacitacionRepository.create(
      {
        capacitacionInscritoId,
        metodoPagoId,
        cuentaPagoId,
        monto,
        fechaPago,
        numeroRecibo: `TEMP-${capacitacionInscritoId}-${Date.now()}`,
        observaciones: body.observaciones ?? null,
      },
      userId,
      { transaction }
    );

    const numeroRecibo = String(pago.id).padStart(6, '0');
    const actualizado = await this.pagoCapacitacionRepository.update(
      pago.id,
      { numeroRecibo },
      userId,
      { transaction }
    );

    this.logger.info('[Capacitación] Pago de capacitación registrado', {
      id: pago.id,
      capacitacionInscritoId,
      monto,
      numeroRecibo,
    });

    // 5. Recalcular saldo con el pago recién creado; transicionar estado/estado_pago
    //    y cerrar el compromiso VIGENTE si el saldo queda cancelado. Sin penalización
    //    por pago atrasado: se aplica igual sin importar si venció o no la fecha de
    //    compromiso (ver reglas de negocio del módulo CAP).
    const totalPagadoActual = totalPagadoPrevio + monto;
    if (totalPagadoActual >= montoObligatorio) {
      const dataActualizacion = { estadoPago: ESTADOS_PAGO_INSCRITO_CAPACITACION.CANCELADO };
      if (inscripcion.estado === ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE) {
        dataActualizacion.estado = ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO;
      }
      await this.inscripcionCapacitacionRepository.update(
        capacitacionInscritoId,
        dataActualizacion,
        userId,
        { transaction }
      );

      const compromisoVigente =
        await this.capacitacionCompromisoRepository.findVigenteByInscripcionId(
          capacitacionInscritoId,
          { transaction }
        );
      if (compromisoVigente) {
        await this.capacitacionCompromisoRepository.update(
          compromisoVigente.id,
          { estado: ESTADOS_COMPROMISO_CAPACITACION.CUMPLIDO },
          userId,
          { transaction }
        );
      }

      this.logger.info('[Capacitación] Saldo cancelado tras el pago; inscripción/compromiso actualizados', {
        capacitacionInscritoId,
        estadoAnterior: inscripcion.estado,
        compromisoCerrado: Boolean(compromisoVigente),
      });
    }

    return { pagoCapacitacion: PagoCapacitacionMapper.entityToPresentation(actualizado) };
  }
}
