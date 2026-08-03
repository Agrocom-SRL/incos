import { getPasantiaOrFail } from './helpers/pasantiaGuards.js';

/**
 * Use Case: CreateSeguimientoPasantiaUseCase (P16)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Registra un seguimiento del trámite (FORMULARIO DE SEGUIMIENTO DE PASANTÍA:
 * fecha, descripción del trabajo, nivel de desempeño, fortalezas, áreas a
 * mejorar, firmas del docente y la empresa).
 */
export class CreateSeguimientoPasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaSeguimientoRepository - CRUD pasantias_seguimientos
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaRepository, pasantiaSeguimientoRepository, logger }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaSeguimientoRepository = pasantiaSeguimientoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} pasantiaId
   * @param {Object} data - Payload camelCase del seguimiento
   * @param {number|null} userId - Usuario de la sesión (auditoría created_by)
   * @returns {Promise<{seguimiento: Object}>}
   */
  async execute(pasantiaId, data, userId = null) {
    await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);

    const seguimiento = await this.pasantiaSeguimientoRepository.create(
      { ...data, pasantiaId },
      userId
    );

    this.logger.info('[Pasantías] Seguimiento registrado', {
      pasantiaId,
      seguimientoId: seguimiento.id,
      fecha: seguimiento.fecha,
    });

    return { seguimiento };
  }
}
