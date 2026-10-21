import fs from 'fs';
import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  CONCEPTOS_PAGO_CAPACITACION,
  CONCEPTOS_PAGO_CAPACITACION_VALUES,
  ESTADOS_INSCRIPCION_CAPACITACION,
} from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { PagoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { parseFechaISO, parseIdPositivo, parseNumero } from '../../utils/validacionEntrada.js';
import { aCentavos, recalcularEstadoInscripcion } from './helpers/estadoInscripcion.js';

/**
 * Use Case: RegisterPagoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Registra un pago (cuota) de una inscripción a capacitación
 * (POST /inscripciones-capacitacion/:id/pagos, permiso capacitacion.pago CREAR).
 * También se usa compuesto dentro de CreateInscripcionCapacitacionUseCase para
 * el pago inicial (misma transacción).
 *
 * Matrícula y costo del curso son instituciones distintas y se pagan por
 * separado: todo pago lleva un `concepto` (`MATRICULA` | `CURSO`) y los pagos
 * pueden llegar en cualquier orden.
 *
 * Reglas:
 * - La inscripción debe existir y estar vigente (estado PENDIENTE o INSCRITO;
 *   RETIRADO/ANULADO rechazan con ConflictError).
 * - `concepto` es obligatorio. El monto no puede superar el saldo pendiente
 *   DEL CONCEPTO, calculado contra el SNAPSHOT de la inscripción
 *   (`montoMatricula` / `montoObligatorio`), no contra el costo actual del curso.
 * - Tras registrar el pago se recalculan los estados por concepto y el global
 *   (`recalcularEstadoInscripcion`): la inscripción pasa a INSCRITO solo con
 *   matrícula y curso cancelados Y requisitos obligatorios entregados; el
 *   compromiso VIGENTE se marca CUMPLIDO cuando no queda saldo. Sin penalización
 *   por pago atrasado.
 * - El comprobante (imagen/PDF subido por multipart, campo `comprobante`) es
 *   OPCIONAL; también puede adjuntarse después (AdjuntarComprobantePagoCapacitacionUseCase).
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
   * @param {Object} params.capacitacionInscritoRequisitoRepository
   * @param {Object} params.paymentMethodRepository - Catálogo metodos_pago (reutilizado)
   * @param {Object} params.paymentAccountRepository - Catálogo cuentas_pago (reutilizado)
   * @param {ILogger} params.logger
   * @param {Object} [params.fileSystem] - Módulo fs (inyectable para pruebas)
   */
  constructor({
    pagoCapacitacionRepository,
    inscripcionCapacitacionRepository,
    capacitacionCompromisoRepository,
    capacitacionInscritoRequisitoRepository,
    paymentMethodRepository,
    paymentAccountRepository,
    logger,
    fileSystem = fs,
  }) {
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.capacitacionInscritoRequisitoRepository = capacitacionInscritoRequisitoRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.paymentAccountRepository = paymentAccountRepository;
    this.logger = logger;
    this.fileSystem = fileSystem;
  }

  /**
   * @param {number} capacitacionInscritoId - ID de la inscripción
   * @param {Object} body - { concepto, monto, metodoPagoId, cuentaPagoId?, fechaPago?, observaciones? }
   * @param {number|null} userId - Usuario que registra (auditoría)
   * @param {Object} options - `{ transaction }` (si se compone dentro de otra
   *   transacción) y `{ file }` (archivo multer del comprobante, opcional)
   * @returns {Promise<{pagoCapacitacion: Object}>}
   */
  async execute(capacitacionInscritoId, body = {}, userId = null, options = {}) {
    const { file = null } = options;
    try {
      if (options.transaction) {
        return await this._registrar(capacitacionInscritoId, body, userId, options.transaction, file);
      }
      return await sequelize.transaction((transaction) =>
        this._registrar(capacitacionInscritoId, body, userId, transaction, file)
      );
    } catch (error) {
      // El archivo ya quedó en disco (multer corre antes): no dejarlo huérfano si el pago falla.
      this._descartarArchivo(file);
      throw error;
    }
  }

  /** @private */
  async _registrar(rawInscritoId, body, userId, transaction, file) {
    const capacitacionInscritoId = parseIdPositivo(rawInscritoId, 'id de la inscripción');

    // 1. Inscripción vigente (PENDIENTE o INSCRITO; nunca RETIRADO/ANULADO)
    const inscripcion = await this.inscripcionCapacitacionRepository.findById(
      capacitacionInscritoId,
      { transaction, ...(transaction?.LOCK ? { lock: transaction.LOCK.UPDATE } : {}) }
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

    // 2. Concepto y monto vs saldo pendiente DEL CONCEPTO (snapshot − pagado)
    const concepto = this._parseConcepto(body.concepto);
    const monto = parseNumero(body.monto, 'monto', { min: 0.01, max: 99999999.99 });
    if (Math.abs(monto * 100 - Math.round(monto * 100)) > 1e-6) {
      throw new ValidationError('monto admite como máximo 2 decimales');
    }

    const totales = await this.pagoCapacitacionRepository.sumMontosPorConcepto(
      capacitacionInscritoId,
      { transaction }
    );
    const esMatricula = concepto === CONCEPTOS_PAGO_CAPACITACION.MATRICULA;
    const montoObjetivo = Number(
      (esMatricula ? inscripcion.montoMatricula : inscripcion.montoObligatorio) ?? 0
    );
    const pagadoConcepto = Number(totales[concepto] ?? 0);
    const saldoC = Math.max(0, aCentavos(montoObjetivo) - aCentavos(pagadoConcepto));
    if (aCentavos(monto) > saldoC) {
      const nombre = esMatricula ? 'la matrícula' : 'el costo del curso';
      const limite = pagadoConcepto > 0 ? `el saldo pendiente de ${nombre}` : nombre;
      throw new ValidationError(
        `El monto del pago (Bs. ${monto.toFixed(2)}) no puede superar ${limite} (Bs. ${(saldoC / 100).toFixed(2)})`
      );
    }

    // 3. Método de pago y cuenta (catálogos reutilizados)
    if (body.metodoPagoId === undefined || body.metodoPagoId === null || body.metodoPagoId === '') {
      throw new ValidationError('metodoPagoId es requerido');
    }
    const metodoPagoId = parseIdPositivo(body.metodoPagoId, 'metodoPagoId');
    const metodoPago = await this.paymentMethodRepository.findById(metodoPagoId);
    if (!metodoPago) throw new NotFoundError(`método de pago con ID ${metodoPagoId}`);

    let cuentaPagoId = null;
    if (body.cuentaPagoId !== undefined && body.cuentaPagoId !== null && body.cuentaPagoId !== '') {
      cuentaPagoId = parseIdPositivo(body.cuentaPagoId, 'cuentaPagoId');
      const cuenta = await this.paymentAccountRepository.findById(cuentaPagoId);
      if (!cuenta) throw new NotFoundError(`cuenta de pago con ID ${cuentaPagoId}`);
    }

    const fechaPago =
      body.fechaPago === undefined || body.fechaPago === null || body.fechaPago === ''
        ? new Date().toISOString().slice(0, 10)
        : parseFechaISO(body.fechaPago, 'fechaPago');

    // 4. Crear pago con numero_recibo temporal (NOT NULL); luego se reemplaza
    //    por el ID a 6 dígitos (mismo patrón que pago_cuotas de aportes)
    const pago = await this.pagoCapacitacionRepository.create(
      {
        capacitacionInscritoId,
        metodoPagoId,
        cuentaPagoId,
        concepto,
        monto,
        fechaPago,
        numeroRecibo: `TEMP-${capacitacionInscritoId}-${Date.now()}`,
        observaciones: body.observaciones ?? null,
        ...(file ? { comprobanteRuta: file.path, comprobanteNombre: file.originalname } : {}),
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
      concepto,
      monto,
      numeroRecibo,
      conComprobante: Boolean(file),
    });

    // 5. Recalcular estados por concepto/global (y requisitos) y cerrar el compromiso si no queda saldo
    const resumen = await recalcularEstadoInscripcion({
      inscripcion,
      pagoCapacitacionRepository: this.pagoCapacitacionRepository,
      capacitacionInscritoRequisitoRepository: this.capacitacionInscritoRequisitoRepository,
      inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
      capacitacionCompromisoRepository: this.capacitacionCompromisoRepository,
      userId,
      transaction,
    });

    const presentation = PagoCapacitacionMapper.entityToPresentation(actualizado);
    presentation.inscripcion = {
      id: capacitacionInscritoId,
      estado: resumen.estado,
      estadoPago: resumen.estadoPago,
      estadoPagoCurso: resumen.estadoPagoCurso,
      estadoPagoMatricula: resumen.estadoPagoMatricula,
      saldoCurso: resumen.saldoCurso,
      saldoMatricula: resumen.saldoMatricula,
    };
    return { pagoCapacitacion: presentation };
  }

  /**
   * Concepto obligatorio: MATRICULA | CURSO (sin distinguir mayúsculas).
   * @private
   */
  _parseConcepto(valor) {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new ValidationError(
        `concepto es requerido (${CONCEPTOS_PAGO_CAPACITACION_VALUES.join(' o ')})`
      );
    }
    const concepto = valor.trim().toUpperCase();
    if (!CONCEPTOS_PAGO_CAPACITACION_VALUES.includes(concepto)) {
      throw new ValidationError(
        `concepto debe ser uno de: ${CONCEPTOS_PAGO_CAPACITACION_VALUES.join(', ')}`
      );
    }
    return concepto;
  }

  /** Borra (mejor esfuerzo) el archivo subido cuando el pago no se registró. @private */
  _descartarArchivo(file) {
    if (!file?.path) return;
    try {
      this.fileSystem.unlinkSync(file.path);
    } catch (error) {
      this.logger.warn?.('[Capacitación] No se pudo descartar el comprobante huérfano', {
        path: file.path,
        error: error.message,
      });
    }
  }
}
