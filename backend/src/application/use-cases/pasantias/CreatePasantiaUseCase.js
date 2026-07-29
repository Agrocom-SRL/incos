import {
  assertEstudianteSinPasantiaVigente,
} from './helpers/pasantiaGuards.js';
import { validatePasantiaPayload } from './helpers/pasantiaPayload.js';

/**
 * Use Case: CreatePasantiaUseCase (P3)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Registra el trámite (camino PASANTIA o CONVALIDACION, R.M. 487/2023):
 * - horasRequeridas entre 300 y 360,
 * - campos de contrato solo si el camino es CONVALIDACION,
 * - un estudiante solo puede tener UN trámite vigente (SOLICITADA/EN_CURSO).
 */
export class CreatePasantiaUseCase {
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
   * @param {Object} data - Payload camelCase del trámite
   * @param {number|null} userId - Usuario de la sesión (auditoría created_by)
   * @returns {Promise<{pasantia: Object}>}
   */
  async execute(data, userId = null) {
    validatePasantiaPayload(data);
    await assertEstudianteSinPasantiaVigente({
      pasantiaRepository: this.pasantiaRepository,
      estudianteId: data.estudianteId,
    });

    const pasantia = await this.pasantiaRepository.create(data, userId);

    this.logger.info('[Pasantías] Trámite registrado', {
      id: pasantia.id,
      tipo: pasantia.tipo,
      estudianteId: pasantia.estudianteId,
    });

    return { pasantia };
  }
}
