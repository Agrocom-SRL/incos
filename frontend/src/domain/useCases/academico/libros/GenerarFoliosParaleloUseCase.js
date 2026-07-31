/**
 * Genera los folios (páginas del centralizador) de un paralelo del libro
 * (POST /libros/:id/folios). El backend asigna `numeroFolio` correlativo POR
 * GESTIÓN cruzando todas las carreras — el front NO calcula ni sugiere este número.
 */

export class GenerarFoliosParaleloUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {number} id - Libro
   * @param {{ paraleloGestionId: number, fechaRegistro?: string }} payload
   */
  async ejecutar(id, payload) {
    return this.libroRegistroRepository.generarFolios(id, payload);
  }
}

export default GenerarFoliosParaleloUseCase;
