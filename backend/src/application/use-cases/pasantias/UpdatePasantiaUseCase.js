import {
  assertEstudianteSinPasantiaVigente,
  getPasantiaOrFail,
} from './helpers/pasantiaGuards.js';
import { validatePasantiaPayload } from './helpers/pasantiaPayload.js';

/**
 * Use Case: UpdatePasantiaUseCase (P4)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Actualiza datos del trámite (payload parcial). Si cambia el estudiante,
 * re-verifica la regla "un trámite vigente por estudiante". Las transiciones
 * de estado NO pasan por aquí (TransicionarPasantiaUseCase).
 */
export class UpdatePasantiaUseCase {
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
   * @param {Object} data - Payload parcial camelCase
   * @param {number|null} userId - Usuario de la sesión (auditoría updated_by)
   * @returns {Promise<{pasantia: Object}>}
   */
  async execute(id, data, userId = null) {
    const current = await getPasantiaOrFail(this.pasantiaRepository, id);
    validatePasantiaPayload(data, { partial: true, tipoActual: current.tipo });

    if (data.estudianteId && Number(data.estudianteId) !== Number(current.estudianteId)) {
      await assertEstudianteSinPasantiaVigente({
        pasantiaRepository: this.pasantiaRepository,
        estudianteId: data.estudianteId,
        excludePasantiaId: id,
      });
    }

    const pasantia = await this.pasantiaRepository.update(id, data, userId);

    this.logger.info('[Pasantías] Trámite actualizado', { id });

    return { pasantia };
  }
}
