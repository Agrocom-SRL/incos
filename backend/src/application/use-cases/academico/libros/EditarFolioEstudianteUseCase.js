import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_FOLIO } from '../../../../domain/constants/libros.constants.js';
import { toFolioEstudianteDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Edita la OBSERVACIÓN de la fila de un estudiante en un folio (PATCH
 * /libros/:id/folios/:folioId/estudiantes/:filaId). Permiso: academico.libro
 * · EDITAR.
 *
 * El ESTADO académico de la fila NO es editable aquí: es siempre el que
 * deriva del centralizador de calificaciones (vista 135) al generar el
 * folio — permitir fijarlo a mano contradiría esa fuente de verdad.
 *
 * Solo si el folio NO está ANULADO (terminal).
 */
export class EditarFolioEstudianteUseCase {
  constructor({ libroRegistroRepository, logger }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id - Libro.
   * @param {number} params.folioId
   * @param {number} params.filaId
   * @param {Object} params.body - { observaciones? }
   * @returns {Promise<{folioEstudiante: Object}>}
   */
  async execute({ usuarioId, id, folioId, filaId, body = {} }) {
    const folio = await this.libroRegistroRepository.findFolioById(Number(folioId));
    if (!folio || Number(folio.libroId) !== Number(id)) {
      throw new NotFoundError('Folio');
    }
    if (folio.estado === ESTADOS_FOLIO.ANULADO) {
      throw new ValidationError('Un folio ANULADO no admite ediciones');
    }

    const fila = await this.libroRegistroRepository.findFolioEstudianteById(Number(filaId));
    if (!fila || Number(fila.folioId) !== Number(folio.id)) {
      throw new NotFoundError('Fila del folio');
    }

    const cambios = {};
    if (body.observaciones !== undefined) {
      cambios.observaciones =
        body.observaciones != null ? String(body.observaciones).trim() : null;
    }
    if (Object.keys(cambios).length === 0) {
      throw new ValidationError('No hay cambios para aplicar');
    }

    await this.libroRegistroRepository.updateFolioEstudiante(fila.id, cambios, usuarioId);

    this.logger?.info('[Libros] Fila de folio editada', {
      libroId: Number(id),
      folioId: folio.id,
      filaId: fila.id,
      cambios: Object.keys(cambios),
    });

    // Fila actualizada con datos del estudiante resueltos (nómina del folio).
    const filas = await this.libroRegistroRepository.listarEstudiantesFolio(folio.id);
    const actualizada = filas.find((f) => Number(f.id) === Number(fila.id)) ?? null;
    return { folioEstudiante: toFolioEstudianteDTO(actualizada) };
  }
}

export default EditarFolioEstudianteUseCase;
