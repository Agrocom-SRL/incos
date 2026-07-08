import { sequelize } from '../../database/sequelize.js';
import { IComplementariosUsosViewRepository } from '../../../domain/interfaces/repositories/IComplementariosUsosViewRepository.js';

/**
 * Conteos de uso de los catálogos complementarios de referencia.
 *
 * Lee la vista delgada `vista_catalogos_complementarios_usos` (151), que
 * entrega 1 fila por catálogo + ítem con la cantidad de estudiantes, docentes
 * y personal activos que lo referencian. Los ítems sin uso NO aparecen en la
 * vista; el consumidor asume 0 por defecto.
 *
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo B / `views/`, no CRUD
 * Sequelize).
 */
export class ComplementariosUsosViewRepository extends IComplementariosUsosViewRepository {
  /**
   * Conteos de uso de los ítems de un catálogo complementario.
   *
   * @param {'DISCAPACIDAD'|'PARENTESCO'|'IDIOMA'|'ESTADO_CIVIL'} catalogo
   * @returns {Promise<Map<number, {cantidadEstudiantes: number, cantidadDocentes: number, cantidadPersonal: number}>>}
   */
  async getUsosByCatalogo(catalogo) {
    const rows = await sequelize.query(
      `
      SELECT
        item_id,
        cantidad_estudiantes,
        cantidad_docentes,
        cantidad_personal
      FROM vista_catalogos_complementarios_usos
      WHERE catalogo = :catalogo
      `,
      { replacements: { catalogo }, type: sequelize.QueryTypes.SELECT },
    );

    const usos = new Map();
    rows.forEach((row) => {
      usos.set(Number(row.item_id), {
        cantidadEstudiantes: Number(row.cantidad_estudiantes) || 0,
        cantidadDocentes: Number(row.cantidad_docentes) || 0,
        cantidadPersonal: Number(row.cantidad_personal) || 0,
      });
    });
    return usos;
  }
}
