/**
 * Detalle de un folio: cabecera de impresión + nómina + celdas de nota final
 * por materia (P3 · FolioPreviewPage).
 */

export class ObtenerFolioPorIdUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {number} id - Libro
   * @param {number} folioId
   */
  async ejecutar(id, folioId) {
    return this.libroRegistroRepository.obtenerFolio(id, folioId);
  }
}

export default ObtenerFolioPorIdUseCase;
