/**
 * Edita la fila de un estudiante en un folio — columnas ESTADO/OBSERVACIONES
 * del centralizador (PATCH /libros/:id/folios/:folioId/estudiantes/:filaId).
 * Solo si el folio NO está FIRMADO (inmutable) ni ANULADO (terminal).
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
   * @param {{ estadoAcademico?: string|null, observaciones?: string|null }} payload
   */
  async ejecutar(id, folioId, filaId, payload) {
    return this.libroRegistroRepository.editarFolioEstudiante(id, folioId, filaId, payload);
  }
}

export default EditarFolioEstudianteUseCase;
