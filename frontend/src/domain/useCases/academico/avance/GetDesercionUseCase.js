/**
 * Deserción estudiantil ANUAL (pestaña Deserción de /academico/avance):
 * agregado carrera × gestión + detalle de desertores + resumen global.
 */

export class GetDesercionUseCase {
  /**
   * @param {import('@infrastructure/repositories/DesercionRepository.js').default} desercionRepository
   */
  constructor(desercionRepository) {
    this.desercionRepository = desercionRepository;
  }

  /**
   * @param {Object} [params]
   * @param {number|null} [params.gestionId] - null = todas las gestiones.
   * @param {number|null} [params.carreraId] - null = todas las carreras.
   */
  async ejecutar({ gestionId = null, carreraId = null } = {}) {
    return this.desercionRepository.obtenerDesercion({ gestionId, carreraId });
  }
}
