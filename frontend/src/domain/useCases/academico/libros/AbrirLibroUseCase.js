/**
 * Abre un libro de registro para una carrera y gestión (POST /libros).
 * `numeroLibro` es obligatorio (se ingresa cada gestión, sin auto-sugerencia);
 * `codigoRegistro` es opcional (el front puede prellenar 81981609 como sugerencia).
 */

export class AbrirLibroUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {Object} payload - { carreraId, gestionId, numeroLibro, codigoRegistro?,
   *   folioInicial?, folioFinal?, fechaApertura?, observaciones? }
   */
  async ejecutar(payload) {
    return this.libroRegistroRepository.abrir(payload);
  }
}

export default AbrirLibroUseCase;
