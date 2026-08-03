import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import {
  ESTADOS_FOLIO,
  ESTADOS_ACADEMICOS_FOLIO_VALUES,
} from '../../../../domain/constants/libros.constants.js';
import { toFolioEstudianteDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Edita la fila de un estudiante en un folio — columnas ESTADO y OBSERVACIONES
 * del centralizador (PATCH /libros/:id/folios/:folioId/estudiantes/:filaId).
 * Permiso: academico.libro · EDITAR.
 *
 * Solo si el folio NO está FIRMADO (inmutable) ni ANULADO (terminal).
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
   * @param {Object} params.body - { estadoAcademico?, observaciones? }
   * @returns {Promise<{folioEstudiante: Object}>}
   */
  async execute({ usuarioId, id, folioId, filaId, body = {} }) {
    const folio = await this.libroRegistroRepository.findFolioById(Number(folioId));
    if (!folio || Number(folio.libroId) !== Number(id)) {
      throw new NotFoundError('Folio');
    }
    if (folio.estado === ESTADOS_FOLIO.FIRMADO) {
      throw new ValidationError('Un folio FIRMADO es inmutable');
    }
    if (folio.estado === ESTADOS_FOLIO.ANULADO) {
      throw new ValidationError('Un folio ANULADO no admite ediciones');
    }

    const fila = await this.libroRegistroRepository.findFolioEstudianteById(Number(filaId));
    if (!fila || Number(fila.folioId) !== Number(folio.id)) {
      throw new NotFoundError('Fila del folio');
    }

    const cambios = {};
    if (body.estadoAcademico !== undefined) {
      if (
        body.estadoAcademico != null &&
        !ESTADOS_ACADEMICOS_FOLIO_VALUES.includes(body.estadoAcademico)
      ) {
        throw new ValidationError('Estado académico inválido (APROBADO, REPROBADO o ABANDONO)');
      }
      cambios.estadoAcademico = body.estadoAcademico ?? null;
    }
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
