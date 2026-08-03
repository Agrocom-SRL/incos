/**
 * Listado de libros de registro (P1 · LibrosListPage).
 */

export class ListarLibrosUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {{ gestionId?: number }} [params]
   */
  async ejecutar(params = {}) {
    return this.libroRegistroRepository.listar(params);
  }
}

export default ListarLibrosUseCase;
