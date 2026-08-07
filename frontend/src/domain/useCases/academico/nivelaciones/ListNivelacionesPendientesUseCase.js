/**
 * Bandeja plana de nivelaciones PROGRAMADA/EN_CURSO, cruzando todos los
 * paralelos — landing de `/academico/nivelaciones/aprobar` (P3).
 */

export class ListNivelacionesPendientesUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  async ejecutar() {
    return this.nivelacionRepository.listarPendientes();
  }
}

export default ListNivelacionesPendientesUseCase;
