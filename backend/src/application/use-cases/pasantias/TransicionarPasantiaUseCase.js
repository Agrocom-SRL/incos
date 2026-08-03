import { ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_PASANTIA,
  TRANSICIONES_PASANTIA,
} from '../../../domain/constants/pasantias.constants.js';
import { getPasantiaOrFail } from './helpers/pasantiaGuards.js';

/**
 * Use Case: TransicionarPasantiaUseCase (P6)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Máquina de estados POR CAMINO (TRANSICIONES_PASANTIA):
 * - PASANTIA: SOLICITADA → [EN_CURSO, RECHAZADA]; EN_CURSO → [FINALIZADA, CANCELADA].
 * - CONVALIDACION: SOLICITADA → [CONVALIDADA, RECHAZADA].
 * FINALIZADA exige horasCumplidas >= horasRequeridas (R.M. 487/2023).
 */
export class TransicionarPasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaRepository, logger }) {
    this.pasantiaRepository = pasantiaRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {Object} data - { estado (destino), observaciones? }
   * @param {number|null} userId - Usuario de la sesión (auditoría updated_by)
   * @returns {Promise<{pasantia: Object}>}
   */
  async execute(id, data, userId = null) {
    const current = await getPasantiaOrFail(this.pasantiaRepository, id);
    const estadoDestino = data?.estado;

    const permitidos = TRANSICIONES_PASANTIA[current.tipo]?.[current.estado] ?? [];
    if (!permitidos.includes(estadoDestino)) {
      throw new ValidationError(
        `No se puede cambiar una pasantía ${current.tipo} de ${current.estado} a ${estadoDestino}`
      );
    }

    if (
      estadoDestino === ESTADOS_PASANTIA.FINALIZADA &&
      Number(current.horasCumplidas) < Number(current.horasRequeridas)
    ) {
      throw new ValidationError('No se puede finalizar antes de cumplir las horas requeridas');
    }

    const pasantia = await this.pasantiaRepository.update(
      id,
      { estado: estadoDestino, observaciones: data.observaciones ?? current.observaciones },
      userId
    );

    this.logger.info('[Pasantías] Transición de estado aplicada', {
      id,
      de: current.estado,
      a: estadoDestino,
      tipo: current.tipo,
    });

    return { pasantia };
  }
}
