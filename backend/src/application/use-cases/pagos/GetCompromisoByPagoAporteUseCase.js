import { ValidationError } from '../../../domain/errors/AppError.js';
import { buildCompromisoContract } from './helpers/compromisoContract.js';

/**
 * Obtiene el compromiso de pago VIGENTE (activo) de una cabecera de aporte.
 *
 * Devuelve `null` cuando la cabecera no tiene compromiso vigente. Cuando existe,
 * se devuelve con la forma del contrato compartido (`compromisoContract`), la
 * misma que consumen el detalle y el listado (id, fechaCompromiso, observacion,
 * estado, diasAtraso, alerta).
 *
 * El negocio (qué cuenta como vigente) vive en el repositorio CRUD; aquí solo se
 * valida la entrada y se resuelve la lectura.
 */
export class GetCompromisoByPagoAporteUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../domain/interfaces/repositories/ICompromisoPagoRepository.js').ICompromisoPagoRepository} params.compromisoPagoRepository
   * @param {Object} params.logger
   */
  constructor({ compromisoPagoRepository, logger }) {
    this.compromisoPagoRepository = compromisoPagoRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string|number} params.pagoAporteId
   * @returns {Promise<Object|null>} compromiso vigente o null
   */
  async execute({ pagoAporteId: raw }) {
    const pagoAporteId = this._parseId(raw);
    const entity = await this.compromisoPagoRepository.findVigenteByPagoAporteId(pagoAporteId);
    return buildCompromisoContract(entity);
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('pagoAporteId inválido');
    }
    return id;
  }
}
