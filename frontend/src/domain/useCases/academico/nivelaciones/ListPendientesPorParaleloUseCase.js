/**
 * Conteo de "pendientes de nivelación" por paralelo (selector P1 nivel 1 de
 * Nivelaciones). Se fusiona en el hook de estado con el dataset compartido
 * de paralelos (`useParalelosEstadoApi`) por `paraleloGestionId`.
 */

export class ListPendientesPorParaleloUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  async ejecutar() {
    return this.nivelacionRepository.listarPendientesPorParalelo();
  }
}

export default ListPendientesPorParaleloUseCase;
