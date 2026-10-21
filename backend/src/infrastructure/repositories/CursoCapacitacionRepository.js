import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { CursoCapacitacion as CursoCapacitacionModel } from '../database/models/curso_capacitacion.js';

/**
 * Repositorio CRUD de cursos de capacitación (tabla raíz `capacitaciones`)
 * (los grupos y sus bloques horarios tienen repositorios propios).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository.
 *
 * Las lecturas ricas del listado/ficha (inscritos_count, cupo_disponible,
 * horarios_detalle) viven en views/CursoCapacitacionFichaViewRepository
 * (vistas 154/155); aquí solo el CRUD.
 *
 * @implements {ICursoCapacitacionRepository}
 */
export class CursoCapacitacionRepository extends BaseRepository {
  getModel() {
    return CursoCapacitacionModel;
  }

  /**
   * Convierte el modelo Sequelize a objeto de dominio (claves del contrato).
   * @param {Object|null} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      titulo: v.titulo ?? null,
      descripcion: v.descripcion ?? null,
      costo: v.costo !== undefined && v.costo !== null ? Number(v.costo) : null,
      tieneCosto: Boolean(v.tieneCosto),
      cobraMatricula: Boolean(v.cobraMatricula),
      costoMatricula:
        v.costoMatricula !== undefined && v.costoMatricula !== null ? Number(v.costoMatricula) : 0,
      entidadCertificadora: v.entidadCertificadora ?? null,
      modalidad: v.modalidad ?? null,
      nivel: v.nivel ?? null,
      dirigidoA: v.dirigidoA ?? null,
      duracion: v.duracion ?? null,
      cupoMaximo: v.cupoMaximo ?? null,
      fechaInicio: v.fechaInicio ?? null,
      fechaFin: v.fechaFin ?? null,
      estado: v.estado ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.estado !== undefined) {
      where.estado = filters.estado;
    }
    return where;
  }

  getSearchFields() {
    return ['titulo', 'descripcion'];
  }

  getDefaultSort() {
    return [
      ['fechaInicio', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('titulo' in data) model.titulo = data.titulo;
    if ('descripcion' in data) model.descripcion = data.descripcion ?? null;
    if ('tieneCosto' in data) model.tieneCosto = data.tieneCosto;
    if ('cobraMatricula' in data) model.cobraMatricula = data.cobraMatricula;
    if ('costo' in data) model.costo = data.costo;
    if ('costoMatricula' in data) model.costoMatricula = data.costoMatricula;
    if ('entidadCertificadora' in data) model.entidadCertificadora = data.entidadCertificadora ?? null;
    if ('modalidad' in data) model.modalidad = data.modalidad;
    if ('nivel' in data) model.nivel = data.nivel ?? null;
    if ('dirigidoA' in data) model.dirigidoA = data.dirigidoA ?? null;
    if ('duracion' in data) model.duracion = data.duracion ?? null;
    if ('cupoMaximo' in data) model.cupoMaximo = data.cupoMaximo;
    if ('fechaInicio' in data) model.fechaInicio = data.fechaInicio;
    if ('fechaFin' in data) model.fechaFin = data.fechaFin ?? null;
    if ('estado' in data) model.estado = data.estado;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    // Toggle de activo (patrón PATCH /:id/estado)
    if ('activo' in data) model.activo = data.activo;
    if ('active' in data) model.activo = data.active;
    return model;
  }

  getCollectionName() {
    return 'cursosCapacitacion';
  }

  // ============================================
  // CATÁLOGO: horarios tipo_horario='CAPACITACION'
  // ============================================

  /**
   * Catálogo de horarios propios de capacitación (`tipo_horario='CAPACITACION'`)
   * con `cursosEnUso` (cursos vigentes que lo usan en algún grupo). Con `aulaId`
   * calcula `ocupado` (choque con paralelos académicos u otro curso de
   * capacitación en esa aula, excluyendo `excludeCursoId`); sin aula, `ocupado`
   * es siempre 0 (el aula es opcional en capacitación).
   *
   * @param {Object} [params]
   * @param {number|null} [params.aulaId]
   * @param {number|null} [params.excludeCursoId]
   * @param {string|null} [params.search] - Texto en nombre o día
   * @param {{campo: string, direccion: string}|null} [params.orden] - campo: dia|hora|nombre
   * @returns {Promise<Array<Object>>} Filas camelCase con `ocupado` 0|1 y `cursosEnUso`
   */
  async listHorariosCapacitacion({ aulaId = null, excludeCursoId = null, search = null, orden = null } = {}) {
    const conAula = aulaId !== null && aulaId !== undefined;
    const direccion = orden?.direccion === 'DESC' ? 'DESC' : 'ASC';
    const ordenDia = `CASE h.dia
          WHEN 'LUNES' THEN 1 WHEN 'MARTES' THEN 2 WHEN 'MIERCOLES' THEN 3
          WHEN 'JUEVES' THEN 4 WHEN 'VIERNES' THEN 5 WHEN 'SABADO' THEN 6
          WHEN 'DOMINGO' THEN 7 ELSE 8 END`;
    const ordenPorCampo = {
      dia: `${ordenDia} ${direccion}, h.hora_inicio ASC`,
      hora: `h.hora_inicio ${direccion}, ${ordenDia} ASC`,
      nombre: `h.nombre ${direccion}, ${ordenDia} ASC, h.hora_inicio ASC`,
    };
    const orderBy = ordenPorCampo[orden?.campo] ?? `${ordenDia} ASC, h.hora_inicio ASC`;

    const ocupado = conAula
      ? 'CASE WHEN op.horario_id IS NOT NULL OR ocap.horario_id IS NOT NULL THEN 1 ELSE 0 END'
      : '0';
    const joinsOcupado = conAula
      ? `LEFT JOIN (
           SELECT DISTINCT ah.horario_id
           FROM asignacion_horarios ah
           INNER JOIN asignaciones_docentes ad
             ON ad.id = ah.asignacion_docente_id AND ad.deleted_at IS NULL AND ad.activo = TRUE
           INNER JOIN oferta_cursos oc
             ON oc.id = ad.oferta_curso_id AND oc.deleted_at IS NULL AND oc.activo = TRUE
           INNER JOIN paralelos_gestion pg
             ON pg.id = oc.paralelo_gestion_id AND pg.deleted_at IS NULL AND pg.activo = TRUE
             AND pg.aula_id = :aulaId
           WHERE ah.deleted_at IS NULL AND ah.activo = TRUE
         ) op ON op.horario_id = h.id
         LEFT JOIN (
           SELECT DISTINCT ch.horario_id
           FROM capacitacion_horarios ch
           INNER JOIN capacitacion_grupos cg
             ON cg.id = ch.grupo_id AND cg.deleted_at IS NULL AND cg.activo = TRUE
             AND cg.aula_id = :aulaId
           INNER JOIN capacitaciones c
             ON c.id = ch.capacitacion_id AND c.deleted_at IS NULL AND c.activo = TRUE
             AND (:excludeCursoId IS NULL OR c.id <> :excludeCursoId)
           WHERE ch.deleted_at IS NULL AND ch.activo = TRUE
         ) ocap ON ocap.horario_id = h.id`
      : '';
    const filtroBusqueda = search ? 'AND (h.nombre LIKE :search OR h.dia LIKE :search)' : '';

    return sequelize.query(
      `SELECT
         h.id AS horarioId,
         h.nombre AS nombre,
         h.dia AS dia,
         h.hora_inicio AS horaInicio,
         h.hora_fin AS horaFin,
         h.tipo_horario AS tipoHorario,
         ${ocupado} AS ocupado,
         (SELECT COUNT(DISTINCT c2.id)
            FROM capacitacion_horarios ch2
            INNER JOIN capacitaciones c2
              ON c2.id = ch2.capacitacion_id AND c2.deleted_at IS NULL AND c2.activo = TRUE
           WHERE ch2.horario_id = h.id AND ch2.deleted_at IS NULL AND ch2.activo = TRUE) AS cursosEnUso
       FROM horarios h
       ${joinsOcupado}
       WHERE h.tipo_horario = 'CAPACITACION' AND h.activo = TRUE AND h.deleted_at IS NULL
         ${filtroBusqueda}
       ORDER BY ${orderBy}, h.id ASC`,
      {
        replacements: {
          aulaId: aulaId ?? null,
          excludeCursoId: excludeCursoId ?? null,
          search: search ? `%${search}%` : null,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  // ============================================
  // CATÁLOGO: bloques horarios (tipo_horario='CLASES') LIBRES por aula
  // ============================================

  /**
   * Los 60 bloques `horarios` (tipo_horario='CLASES', mismo catálogo que
   * arma horarios de paralelos académicos) con un flag `ocupado` calculado
   * para un aula: choca con paralelos académicos vigentes en esa aula
   * (cadena asignacion_horarios → asignaciones_docentes → oferta_cursos →
   * paralelos_gestion.aula_id, igual que la vista 54) O con otro curso de
   * capacitación vigente en esa misma aula (capacitacion_horarios →
   * capacitacion_grupos.aula_id), excluyendo opcionalmente el propio curso en
   * edición (`excludeCursoId`).
   *
   * Query ad-hoc parametrizada (no vista SQL): el filtro por aula + exclusión
   * del curso propio es dinámico por request.
   *
   * @param {Object} params
   * @param {number} params.aulaId - Aula a consultar (catálogo `aulas`)
   * @param {number|null} [params.excludeCursoId] - Curso a excluir (modo edición)
   * @returns {Promise<Array<Object>>} Filas camelCase con `ocupado` 0|1
   */
  async listHorariosDisponibles({ aulaId, excludeCursoId = null }) {
    const query = `
      SELECT
        h.id AS horarioId,
        h.nombre AS nombre,
        h.dia AS dia,
        h.hora_inicio AS horaInicio,
        h.hora_fin AS horaFin,
        h.turno AS turno,
        h.numero_bloque AS numeroBloque,
        CASE WHEN op.horario_id IS NOT NULL OR ocap.horario_id IS NOT NULL THEN 1 ELSE 0 END AS ocupado
      FROM horarios h
      LEFT JOIN (
        SELECT DISTINCT ah.horario_id
        FROM asignacion_horarios ah
        INNER JOIN asignaciones_docentes ad
          ON ad.id = ah.asignacion_docente_id AND ad.deleted_at IS NULL AND ad.activo = TRUE
        INNER JOIN oferta_cursos oc
          ON oc.id = ad.oferta_curso_id AND oc.deleted_at IS NULL AND oc.activo = TRUE
        INNER JOIN paralelos_gestion pg
          ON pg.id = oc.paralelo_gestion_id AND pg.deleted_at IS NULL AND pg.activo = TRUE
          AND pg.aula_id = :aulaId
        WHERE ah.deleted_at IS NULL AND ah.activo = TRUE
      ) op ON op.horario_id = h.id
      LEFT JOIN (
        SELECT DISTINCT ch.horario_id
        FROM capacitacion_horarios ch
        INNER JOIN capacitacion_grupos cg
          ON cg.id = ch.grupo_id AND cg.deleted_at IS NULL AND cg.activo = TRUE
          AND cg.aula_id = :aulaId
        INNER JOIN capacitaciones c
          ON c.id = ch.capacitacion_id AND c.deleted_at IS NULL AND c.activo = TRUE
          AND (:excludeCursoId IS NULL OR c.id <> :excludeCursoId)
        WHERE ch.deleted_at IS NULL AND ch.activo = TRUE
      ) ocap ON ocap.horario_id = h.id
      WHERE h.tipo_horario = 'CLASES'
        AND h.activo = TRUE
        AND h.deleted_at IS NULL
      ORDER BY
        CASE h.dia
          WHEN 'LUNES' THEN 1 WHEN 'MARTES' THEN 2 WHEN 'MIERCOLES' THEN 3 WHEN 'MIÉRCOLES' THEN 3
          WHEN 'JUEVES' THEN 4 WHEN 'VIERNES' THEN 5 WHEN 'SABADO' THEN 6 WHEN 'SÁBADO' THEN 6
          WHEN 'DOMINGO' THEN 7 ELSE 8
        END,
        h.hora_inicio
    `;

    return sequelize.query(query, {
      replacements: { aulaId, excludeCursoId: excludeCursoId ?? null },
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
