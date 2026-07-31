/**
 * Edita la cabecera del libro, incluido el cierre/reapertura (PATCH /libros/:id).
 * `carreraId`/`gestionId`/`numeroLibro` NO se editan (identifican el libro físico).
 */

export class EditarLibroUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {number} id
   * @param {Object} payload - { codigoRegistro?, folioFinal?, fechaApertura?, observaciones?, estado? }
   */
  async ejecutar(id, payload) {
    return this.libroRegistroRepository.editar(id, payload);
  }
}

export default EditarLibroUseCase;
