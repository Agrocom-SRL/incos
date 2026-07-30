import { NotFoundError } from '../../../../domain/errors/AppError.js';
import {
  toLibroDTO,
  toFolioDTO,
} from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Ficha del libro: cabecera (vista 175) + tabla de folios (vista 176).
 * Permiso: academico.libro · DETALLE.
 */
export class GetLibroByIdUseCase {
  constructor({ libroRegistroViewRepository, logger }) {
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params - { id }
   * @returns {Promise<{libro: Object}>} libro = cabecera + folios[].
   */
  async execute({ id }) {
    const libroId = Number(id);
    const row = await this.libroRegistroViewRepository.obtenerLibroPorId(libroId);
    if (!row) {
      throw new NotFoundError('Libro de registro');
    }

    const foliosRows = await this.libroRegistroViewRepository.listarFoliosPorLibro(libroId);
    const libro = {
      ...toLibroDTO(row),
      folios: foliosRows.map(toFolioDTO),
    };

    this.logger?.info('[Libros] Detalle', { id: libroId, folios: libro.folios.length });
    return { libro };
  }
}

export default GetLibroByIdUseCase;
