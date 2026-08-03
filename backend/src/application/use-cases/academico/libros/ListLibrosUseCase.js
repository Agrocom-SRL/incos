import { toLibroDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Lista los libros de registro del centralizador (vista 175).
 * Permiso: academico.libro · LISTAR.
 */
export class ListLibrosUseCase {
  constructor({ libroRegistroViewRepository, logger }) {
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} [params] - { gestionId? }
   * @returns {Promise<{libros: Object[]}>}
   */
  async execute({ gestionId } = {}) {
    const rows = await this.libroRegistroViewRepository.listarLibros({
      gestionId: gestionId ? Number(gestionId) : undefined,
    });
    const libros = rows.map(toLibroDTO);

    this.logger?.info('[Libros] Listado', { total: libros.length });
    return { libros };
  }
}

export default ListLibrosUseCase;
