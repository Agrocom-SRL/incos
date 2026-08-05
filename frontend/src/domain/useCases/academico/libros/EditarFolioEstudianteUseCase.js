/**
 * Edita la OBSERVACIÓN de la fila de un estudiante en un folio (PATCH
 * /libros/:id/folios/:folioId/estudiantes/:filaId). El ESTADO académico no
 * es editable a mano: siempre deriva del centralizador de calificaciones.
 * Solo si el folio NO está ANULADO (terminal).
 */

export class EditarFolioEstudianteUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {number} id - Libro
   * @param {number} folioId
   * @param {number} filaId
   * @param {{ observaciones?: string|null }} payload
   */
  async ejecutar(id, folioId, filaId, payload) {
    return this.libroRegistroRepository.editarFolioEstudiante(id, folioId, filaId, payload);
  }
}

export default EditarFolioEstudianteUseCase;
