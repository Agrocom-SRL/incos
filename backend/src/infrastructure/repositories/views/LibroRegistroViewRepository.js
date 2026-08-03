import { sequelize } from '../../database/sequelize.js';
import { ILibroRegistroViewRepository } from '../../../domain/interfaces/repositories/ILibroRegistroViewRepository.js';
import { ESTADOS_FOLIO, ordenCarreraLibro } from '../../../domain/constants/libros.constants.js';

/**
 * Lectura del módulo Libros de registro (schema 25) sobre vistas.
 * Repositorio de SOLO LECTURA (arquetipo views/; la interfaz NO extiende IRepository).
 *
 * Vistas:
 * - 175 vista_libros_registro_listado        → grano libro (+agregados de folios)
 * - 176 vista_base_libro_folio_fila          → grano folio (+contexto vista 127)
 * - 177 vista_base_libro_paralelo_estudiante → nómina estudiante × paralelo_gestion
 * - 127 vista_base_paralelo_gestion_ficha    → paralelos de la gestión (3 carreras)
 *   (reutilizada tal cual para el apoyo del generador; sin vista nueva).
 */
export class LibroRegistroViewRepository extends ILibroRegistroViewRepository {
  /**
   * Libros de registro (vista 175).
   * @param {Object} [filtros] - { gestionId? }
   * @returns {Promise<Array<Object>>}
   */
  async listarLibros(filtros = {}) {
    const whereConditions = [];
    const replacements = [];

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
      ORDER BY gestion_anio DESC, numero_libro DESC
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
   * TODOS los paralelos de una gestión (las 3 carreras; vista 127), con el
   * conteo de estudiantes de la nómina (vista 177) y, si se pasa `libroId`, el
   * conteo de folios vigentes ya generados en ESE libro. Único método para las
   * dos formas de consumo (antes eran dos SELECTs casi idénticos sobre la
   * misma vista base, fusionados 2026-08-03): generación MASIVA de folios de
   * la gestión (POST /libros/gestiones/:gestionId/folios, sin `libroId`) y
   * paralelos candidatos / generación de UN paralelo de un libro puntual
   * (GET /libros/:id/paralelos, POST /libros/:id/folios — con `libroId`).
   * Reutiliza la 127 tal cual en vez de crear una vista nueva.
   *
   * Orden en MEMORIA (no en SQL) por `ordenCarreraLibro` (Contaduría →
   * Administración → Informática, NUNCA por id de carrera) → periodoNumero →
   * paraleloNombre (alfabético A, B, C, D).
   *
   * @param {number} gestionId
   * @param {Object} [opts] - { libroId? }
   * @returns {Promise<Array<Object>>}
   */
  async listarParalelosPorGestion(gestionId, { libroId } = {}) {
    const foliosVigentesSelect = libroId
      ? `,(
          SELECT COUNT(*)
          FROM folios_libro fl
          WHERE fl.libro_id = ?
            AND fl.paralelo_gestion_id = v127.id
            AND fl.deleted_at IS NULL
            AND fl.activo = TRUE
            AND fl.estado <> ?
        ) AS folios_vigentes`
      : '';
    const replacements = libroId
      ? [libroId, ESTADOS_FOLIO.ANULADO, gestionId]
      : [gestionId];

    const rows = await sequelize.query(
      `
      SELECT
        v127.id             AS paralelo_gestion_id,
        v127.paraleloNombre AS paralelo_nombre,
        v127.turno          AS turno,
        v127.estado         AS paralelo_estado,
        v127.periodoId      AS periodo_id,
        v127.periodoNumero  AS periodo_numero,
        v127.periodoNombre  AS periodo_nombre,
        v127.carreraId      AS carrera_id,
        v127.carreraNombre  AS carrera_nombre,
        v127.carreraCodigo  AS carrera_codigo,
        v127.gestionId      AS gestion_id,
        v127.gestionAnio    AS gestion_anio,
        (
          SELECT COUNT(*)
          FROM vista_base_libro_paralelo_estudiante n
          WHERE n.paralelo_gestion_id = v127.id
        ) AS total_estudiantes
        ${foliosVigentesSelect}
      FROM vista_base_paralelo_gestion_ficha v127
      WHERE v127.gestionId = ?
        AND v127.deletedAt IS NULL
        AND v127.activo = TRUE
      `,
      { replacements, type: sequelize.QueryTypes.SELECT },
    );

    return rows.sort((a, b) => {
      const ordenCarrera =
        ordenCarreraLibro(a.carrera_codigo) - ordenCarreraLibro(b.carrera_codigo);
      if (ordenCarrera !== 0) return ordenCarrera;
      const ordenPeriodo = (a.periodo_numero ?? 0) - (b.periodo_numero ?? 0);
      if (ordenPeriodo !== 0) return ordenPeriodo;
      return String(a.paralelo_nombre ?? '').localeCompare(String(b.paralelo_nombre ?? ''));
    });
  }

  /**
   * Folios VIGENTES (estado <> ANULADO) de UN paralelo (vista 176), + el
   * estado propio del LIBRO (`libros_registro.estado`, ABIERTO/CERRADO — no
   * viene en la 176, que solo trae el estado del FOLIO). Sin vista nueva: JOIN
   * directo a la tabla base `libros_registro` por `libro_id`.
   * Consumidor: Centralizador (badge LIBRO/FOLIO real) y export "Centralizador
   * anual" (Bloque D).
   *
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async listarFoliosPorParaleloGestion(paraleloGestionId) {
    return sequelize.query(
      `
      SELECT
        vf.*,
        lr.estado AS libro_estado
      FROM vista_base_libro_folio_fila vf
      INNER JOIN libros_registro lr
        ON lr.id = vf.libro_id
        AND lr.deleted_at IS NULL
      WHERE vf.paralelo_gestion_id = ?
        AND vf.estado <> ?
      ORDER BY vf.numero_folio ASC
      `,
      {
        replacements: [paraleloGestionId, ESTADOS_FOLIO.ANULADO],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * Ubicación de cada estudiante del paralelo dentro del libro: JOIN
   * `folio_estudiantes` × vista 176, filtrado a folios VIGENTES. Consumidor:
   * Centralizador (columna FOLIO N° / orden por estudiante).
   *
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>} filas: estudiante_id, numero_folio,
   *   numero_orden, estado_academico.
   */
  async listarUbicacionEstudiantesPorParaleloGestion(paraleloGestionId) {
    return sequelize.query(
      `
      SELECT
        fe.estudiante_id    AS estudiante_id,
        vf.numero_folio     AS numero_folio,
        fe.numero_orden     AS numero_orden,
        fe.estado_academico AS estado_academico
      FROM folio_estudiantes fe
      INNER JOIN vista_base_libro_folio_fila vf
        ON vf.id = fe.folio_id
      WHERE vf.paralelo_gestion_id = ?
        AND vf.estado <> ?
        AND fe.deleted_at IS NULL
        AND fe.activo = TRUE
      ORDER BY vf.numero_folio ASC, fe.numero_orden ASC
      `,
      {
        replacements: [paraleloGestionId, ESTADOS_FOLIO.ANULADO],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }
}

export default LibroRegistroViewRepository;
