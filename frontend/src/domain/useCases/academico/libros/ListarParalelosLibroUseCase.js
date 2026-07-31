/**
 * Paralelos candidatos del generador de folios (GET /libros/:id/paralelos).
 */

export class ListarParalelosLibroUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /** @param {number} id - Libro */
  async ejecutar(id) {
    return this.libroRegistroRepository.listarParalelos(id);
  }
}

export default ListarParalelosLibroUseCase;
