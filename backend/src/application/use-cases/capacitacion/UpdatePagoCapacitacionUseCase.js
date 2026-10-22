import { ValidationError } from '../../../domain/errors/AppError.js';
import { CONCEPTOS_PAGO_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { PagoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { aCentavos, deCentavos, recalcularEstadoInscripcion } from './helpers/estadoInscripcion.js';
import {
  esVacio,
  parseConceptoPago,
  parseFechaPago,
  parseMontoPago,
  resolverCuentaPago,
  resolverMetodoPago,
  validarConceptoPermitido,
  validarMontoDentroDelSaldo,
} from './helpers/pagoCapacitacionInput.js';
import { cargarPagoModificable, resumenInscripcion } from './helpers/pagoInscripcionCapacitacion.js';

const CAMPOS_EDITABLES = [
  'concepto',
  'monto',
  'fechaPago',
  'metodoPagoId',
  'cuentaPagoId',
  'observaciones',
];
const LONGITUD_MAXIMA_OBSERVACIONES = 2000;

/**
 * Use Case: UpdatePagoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Corrige un pago registrado (PUT /inscripciones-capacitacion/:id/pagos/:pagoId,
 * permiso capacitacion.inscripcion EDITAR). Campos editables (parciales):
 * `concepto`, `monto`, `fechaPago`, `metodoPagoId`, `cuentaPagoId`,
 * `observaciones`. NO cambian el número de recibo ni el comprobante.
 *
 * Mismas validaciones que el registro (`helpers/pagoCapacitacionInput.js`):
 * monto > 0 con 2 decimales, sobrepago por concepto (descontando el propio pago
 * que se corrige), método/cuenta existentes y, con entidad certificadora, el
 * concepto CURSO se rechaza al cambiar a ese concepto. Solo con la inscripción
 * PENDIENTE o INSCRITO y el pago NO anulado. Tras corregir se recalculan los
 * estados por concepto y el global (la inscripción puede pasar de INSCRITO a
 * PENDIENTE si baja lo pagado).
 */
export class UpdatePagoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.pagoCapacitacionRepository
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.capacitacionCompromisoRepository
   * @param {Object} params.capacitacionInscritoRequisitoRepository
   * @param {Object} params.paymentMethodRepository - Catálogo metodos_pago
   * @param {Object} params.paymentAccountRepository - Catálogo cuentas_pago
   * @param {ILogger} params.logger
   */
  constructor({
    pagoCapacitacionRepository,
    inscripcionCapacitacionRepository,
    capacitacionCompromisoRepository,
    capacitacionInscritoRequisitoRepository,
    paymentMethodRepository,
    paymentAccountRepository,
    logger,
  }) {
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.capacitacionInscritoRequisitoRepository = capacitacionInscritoRequisitoRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.paymentAccountRepository = paymentAccountRepository;
    this.logger = logger;
  }

  /**
   * @param {number} inscripcionId - ID de la inscripción
   * @param {number} pagoId - ID del pago
   * @param {Object} body - { concepto?, monto?, fechaPago?, metodoPagoId?, cuentaPagoId?, observaciones? }
   * @param {number|null} userId - Usuario que corrige (auditoría)
   * @returns {Promise<{pagoCapacitacion: Object}>}
   */
  async execute(inscripcionId, pagoId, body = {}, userId = null) {
    const idInscripcion = parseIdPositivo(inscripcionId, 'id de la inscripción');
    const idPago = parseIdPositivo(pagoId, 'id del pago');
    if (!CAMPOS_EDITABLES.some((campo) => campo in body)) {
      throw new ValidationError(`Debe enviarse al menos un campo a corregir: ${CAMPOS_EDITABLES.join(', ')}`);
    }

    return sequelize.transaction((transaction) =>
      this._corregir(idInscripcion, idPago, body, userId, transaction)
    );
  }

  /** @private */
  async _corregir(idInscripcion, idPago, body, userId, transaction) {
    const { inscripcion, pago } = await cargarPagoModificable({
      inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
      pagoCapacitacionRepository: this.pagoCapacitacionRepository,
      inscripcionId: idInscripcion,
      pagoId: idPago,
      accion: 'modificar',
      transaction,
    });

    const cambios = await this._construirCambios(body, pago, inscripcion, transaction);

    const actualizado = await this.pagoCapacitacionRepository.update(idPago, cambios, userId, {
      transaction,
    });
    this.logger.info('[Capacitación] Pago de capacitación corregido', {
      id: idPago,
      capacitacionInscritoId: idInscripcion,
      campos: Object.keys(cambios),
    });

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
    presentation.inscripcion = resumenInscripcion(idInscripcion, resumen);
    return { pagoCapacitacion: presentation };
  }

  /**
   * Valida los campos recibidos y devuelve solo los cambios a persistir.
   * @private
   */
  async _construirCambios(body, pago, inscripcion, transaction) {
    const cambios = {};

    const concepto = 'concepto' in body ? parseConceptoPago(body.concepto) : pago.concepto;
    const monto = 'monto' in body ? parseMontoPago(body.monto) : Number(pago.monto);
    if (concepto !== pago.concepto) cambios.concepto = concepto;
    if (aCentavos(monto) !== aCentavos(pago.monto)) cambios.monto = monto;

    if (cambios.concepto === CONCEPTOS_PAGO_CAPACITACION.CURSO) {
      const { pagoCursoExterno } =
        await this.capacitacionInscritoRequisitoRepository.resolverPagoCursoExterno(
          inscripcion.id,
          inscripcion.capacitacionId,
          { transaction }
        );
      validarConceptoPermitido(concepto, pagoCursoExterno);
    }

    if ('concepto' in cambios || 'monto' in cambios) {
      // Lo ya pagado del concepto SIN contar el pago que se corrige
      const totales = await this.pagoCapacitacionRepository.sumMontosPorConcepto(inscripcion.id, {
        transaction,
      });
      const propio = concepto === pago.concepto ? aCentavos(pago.monto) : 0;
      validarMontoDentroDelSaldo({
        concepto,
        monto,
        inscripcion,
        pagadoConcepto: deCentavos(Math.max(0, aCentavos(totales[concepto] ?? 0) - propio)),
      });
    }

    if ('metodoPagoId' in body) {
      cambios.metodoPagoId = await resolverMetodoPago(this.paymentMethodRepository, body.metodoPagoId);
    }
    if ('cuentaPagoId' in body) {
      cambios.cuentaPagoId = await resolverCuentaPago(this.paymentAccountRepository, body.cuentaPagoId);
    }
    if ('fechaPago' in body) cambios.fechaPago = parseFechaPago(body.fechaPago, pago.fechaPago);
    if ('observaciones' in body) cambios.observaciones = this._parseObservaciones(body.observaciones);

    return cambios;
  }

  /** @private */
  _parseObservaciones(valor) {
    if (esVacio(valor)) return null;
    if (typeof valor !== 'string') throw new ValidationError('observaciones debe ser texto');
    const texto = valor.trim();
    if (texto.length > LONGITUD_MAXIMA_OBSERVACIONES) {
      throw new ValidationError(
        `observaciones no debe superar los ${LONGITUD_MAXIMA_OBSERVACIONES} caracteres`
      );
    }
    return texto;
  }
}

export default UpdatePagoCapacitacionUseCase;
