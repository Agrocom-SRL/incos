import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { toParaleloLibroDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Paralelos de las 3 carreras de la gestión del libro, con conteo de
 * estudiantes y de folios vigentes (apoyo del generador: GET /libros/:id/paralelos).
 * Permiso: academico.libro · CREAR (misma acción que generar folios).
 */
export class ListParalelosLibroUseCase {
  constructor({ libroRegistroViewRepository, logger }) {
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params - { id } (libro)
   * @returns {Promise<{paralelos: Object[]}>}
   */
  async execute({ id }) {
    const libroId = Number(id);
    const libro = await this.libroRegistroViewRepository.obtenerLibroPorId(libroId);
    if (!libro) {
      throw new NotFoundError('Libro de registro');
    }

    const rows = await this.libroRegistroViewRepository.listarParalelosPorGestion(
      libro.gestion_id,
      { libroId },
    );
    const paralelos = rows.map(toParaleloLibroDTO);

    this.logger?.info('[Libros] Paralelos del libro', {
      libroId,
      total: paralelos.length,
    });
    return { paralelos };
  }
}

export default ListParalelosLibroUseCase;
