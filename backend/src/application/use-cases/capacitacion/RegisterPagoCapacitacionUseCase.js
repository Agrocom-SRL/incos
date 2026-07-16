import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { PagoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: RegisterPagoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Registra un pago de una inscripción a capacitación
 * (POST /inscripciones-capacitacion/:id/pagos, permiso capacitacion.pago CREAR).
 *
 * Reglas:
 * - La inscripción debe existir y estar vigente (estado INSCRITO).
 * - El monto no puede superar el saldo pendiente (costo − total pagado).
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
   * @param {Object} params.cursoCapacitacionRepository
   * @param {Object} params.paymentMethodRepository - Catálogo metodos_pago (reutilizado)
   * @param {Object} params.paymentAccountRepository - Catálogo cuentas_pago (reutilizado)
   * @param {ILogger} params.logger
   */
  constructor({
    pagoCapacitacionRepository,
    inscripcionCapacitacionRepository,
    cursoCapacitacionRepository,
    paymentMethodRepository,
    paymentAccountRepository,
    logger,
  }) {
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
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

    // 1. Inscripción vigente
    const inscripcion = await this.inscripcionCapacitacionRepository.findById(
      capacitacionInscritoId,
      { transaction }
    );
    if (!inscripcion) throw new NotFoundError('inscripción de capacitación');
    if (inscripcion.estado !== ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO) {
      throw new ConflictError(
        'No se puede registrar un pago sobre una inscripción retirada'
      );
    }

    // 2. Monto vs saldo pendiente (costo del curso − total pagado)
    const monto = Number(body.monto);
    if (Number.isNaN(monto) || monto <= 0) {
      throw new ValidationError('monto debe ser un número mayor a 0');
    }

    const curso = await this.cursoCapacitacionRepository.findById(inscripcion.capacitacionId, {
      transaction,
    });
    if (!curso) throw new NotFoundError('curso de capacitación de la inscripción');

    const totalPagado = await this.pagoCapacitacionRepository.sumMontoByInscripcionId(
      capacitacionInscritoId,
      { transaction }
    );
    const saldo = Math.max(0, Number(curso.costo ?? 0) - totalPagado);
    if (monto > saldo) {
      throw new ValidationError(
        `El monto del pago (Bs. ${monto.toFixed(2)}) no puede superar el saldo pendiente (Bs. ${saldo.toFixed(2)})`
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

    return { pagoCapacitacion: PagoCapacitacionMapper.entityToPresentation(actualizado) };
  }
}
