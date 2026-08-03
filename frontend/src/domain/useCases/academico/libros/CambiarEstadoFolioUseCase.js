/**
 * Cambia el estado de un folio: BORRADOR → IMPRESO → FIRMADO / ANULADO
 * (PATCH /libros/:id/folios/:folioId/estado). FIRMADO es inmutable; ANULADO
 * exige motivo. Permiso `academico.libro` · APROBAR.
 */

export class CambiarEstadoFolioUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {number} id - Libro
   * @param {number} folioId
   * @param {{ estado: string, motivo?: string }} payload
   */
  async ejecutar(id, folioId, payload) {
    return this.libroRegistroRepository.cambiarEstadoFolio(id, folioId, payload);
  }
}

export default CambiarEstadoFolioUseCase;
