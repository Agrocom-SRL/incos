import { sequelize } from '../../database/sequelize.js';
import { ILibroRegistroViewRepository } from '../../../domain/interfaces/repositories/ILibroRegistroViewRepository.js';
import { ESTADOS_FOLIO } from '../../../domain/constants/libros.constants.js';

/**
 * Lectura del módulo Libros de registro (schema 25) sobre vistas.
 * Repositorio de SOLO LECTURA (arquetipo views/; la interfaz NO extiende IRepository).
 *
 * Vistas:
 * - 175 vista_libros_registro_listado        → grano libro (+agregados de folios)
 * - 176 vista_base_libro_folio_fila          → grano folio (+contexto vista 127)
 * - 177 vista_base_libro_paralelo_estudiante → nómina estudiante × paralelo_gestion
 * - 127 vista_base_paralelo_gestion_ficha    → paralelos de la carrera+gestión
 *   (reutilizada tal cual para el apoyo del generador; sin vista nueva).
 */
export class LibroRegistroViewRepository extends ILibroRegistroViewRepository {
  /**
   * Libros de registro (vista 175).
   * @param {Object} [filtros] - { carreraId?, gestionId? }
   * @returns {Promise<Array<Object>>}
   */
  async listarLibros(filtros = {}) {
    const whereConditions = [];
    const replacements = [];

    if (filtros.carreraId) {
      whereConditions.push('carrera_id = ?');
      replacements.push(filtros.carreraId);
    }
    if (filtros.gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(filtros.gestionId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    return sequelize.query(
      `
      SELECT *
      FROM vista_libros_registro_listado
      ${whereClause}
      ORDER BY gestion_anio DESC, carrera_nombre ASC, numero_libro DESC
      `,
      { replacements, type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * Un libro por id (vista 175) o null.
   * @param {number} libroId
   * @returns {Promise<Object|null>}
   */
  async obtenerLibroPorId(libroId) {
    const rows = await sequelize.query(
      `
      SELECT *
      FROM vista_libros_registro_listado
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [libroId], type: sequelize.QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }

  /**
   * Folios de un libro (vista 176), opcionalmente de un solo paralelo.
   * @param {number} libroId
   * @param {Object} [opts] - { paraleloGestionId? }
   * @returns {Promise<Array<Object>>}
   */
  async listarFoliosPorLibro(libroId, opts = {}) {
    const whereConditions = ['libro_id = ?'];
    const replacements = [libroId];

    if (opts.paraleloGestionId) {
      whereConditions.push('paralelo_gestion_id = ?');
      replacements.push(opts.paraleloGestionId);
    }

    return sequelize.query(
      `
      SELECT *
      FROM vista_base_libro_folio_fila
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY numero_folio ASC
      `,
      { replacements, type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * Un folio por id (vista 176) o null.
   * @param {number} folioId
   * @returns {Promise<Object|null>}
   */
  async obtenerFolioPorId(folioId) {
    const rows = await sequelize.query(
      `
      SELECT *
      FROM vista_base_libro_folio_fila
      WHERE id = ?
      LIMIT 1
      `,
      { replacements: [folioId], type: sequelize.QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }

  /**
   * Nómina de un paralelo en gestión (vista 177), ordenada por apellido.
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async listarNominaPorParaleloGestion(paraleloGestionId) {
    return sequelize.query(
      `
      SELECT *
      FROM vista_base_libro_paralelo_estudiante
      WHERE paralelo_gestion_id = ?
      ORDER BY apellido_paterno ASC, apellido_materno ASC, nombres ASC
      `,
      { replacements: [paraleloGestionId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * Paralelos de la carrera+gestión de un libro (vista 127) con el conteo de
   * estudiantes de la nómina (vista 177) y de folios vigentes ya generados —
   * apoyo del generador (GET /libros/:id/paralelos). Reutiliza la 127 tal cual
   * en vez de crear una vista nueva (consumidor único y acotado).
   *
   * @param {Object} params - { carreraId, gestionId, libroId }
   * @returns {Promise<Array<Object>>}
   */
  async listarParalelosParaLibro({ carreraId, gestionId, libroId }) {
    return sequelize.query(
      `
      SELECT
        v127.id            AS paralelo_gestion_id,
        v127.paraleloNombre AS paralelo_nombre,
        v127.turno          AS turno,
        v127.estado         AS paralelo_estado,
        v127.periodoId      AS periodo_id,
        v127.periodoNumero  AS periodo_numero,
        v127.periodoNombre  AS periodo_nombre,
        v127.carreraId      AS carrera_id,
        v127.carreraNombre  AS carrera_nombre,
        v127.gestionId      AS gestion_id,
        v127.gestionAnio    AS gestion_anio,
        (
          SELECT COUNT(*)
          FROM vista_base_libro_paralelo_estudiante n
          WHERE n.paralelo_gestion_id = v127.id
        ) AS total_estudiantes,
        (
          SELECT COUNT(*)
          FROM folios_libro fl
          WHERE fl.libro_id = ?
            AND fl.paralelo_gestion_id = v127.id
            AND fl.deleted_at IS NULL
            AND fl.activo = TRUE
            AND fl.estado <> ?
        ) AS folios_vigentes
      FROM vista_base_paralelo_gestion_ficha v127
      WHERE v127.carreraId = ?
        AND v127.gestionId = ?
        AND v127.deletedAt IS NULL
        AND v127.activo = TRUE
      ORDER BY v127.periodoNumero ASC, v127.paraleloNombre ASC
      `,
      {
        replacements: [libroId, ESTADOS_FOLIO.ANULADO, carreraId, gestionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }
}

export default LibroRegistroViewRepository;
