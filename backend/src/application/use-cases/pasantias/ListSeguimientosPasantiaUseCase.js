import { getPasantiaOrFail } from './helpers/pasantiaGuards.js';

/**
 * Use Case: ListSeguimientosPasantiaUseCase (P15)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Lista los seguimientos del trámite (FORMULARIO DE SEGUIMIENTO DE PASANTÍA,
 * uno por visita del docente supervisor), en orden cronológico.
 */
export class ListSeguimientosPasantiaUseCase {
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
   * @returns {Promise<{seguimientos: Array, total: number}>}
   */
  async execute(pasantiaId) {
    await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    const seguimientos = await this.pasantiaSeguimientoRepository.findByPasantiaId(pasantiaId);

    this.logger.info('[Pasantías] Seguimientos del trámite listados', {
      pasantiaId,
      total: seguimientos.length,
    });

    // La ruta del archivo adjunto NO se expone en el listado.
    return {
      seguimientos: seguimientos.map(
        ({ rutaArchivo: _rutaArchivo, ...seguimiento }) => seguimiento
      ),
      total: seguimientos.length,
    };
  }
}
