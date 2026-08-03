/**
 * Ficha del libro: cabecera + tabla de folios (P2 · LibroDetailPage).
 */

export class ObtenerLibroPorIdUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /** @param {number} id */
  async ejecutar(id) {
    return this.libroRegistroRepository.obtenerPorId(id);
  }
}

export default ObtenerLibroPorIdUseCase;
