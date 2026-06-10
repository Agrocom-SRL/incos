import { sequelize } from '../database/sequelize.js';
import { CalificacionContextoRepository } from './CalificacionContextoRepository.js';

/**
 * Cronograma / calendario académico de la gestión vigente.
 *
 * Lee la vista delgada `vista_base_cronograma_gestion` (actividades_calendario +
 * actividades + periodos_academicos). Estilo de consulta cruda como
 * GestionBimestresRepository (no CRUD Sequelize).
 */
export class CronogramaGestionRepository {
  constructor({ calificacionContextoRepository } = {}) {
    this.contexto =
      calificacionContextoRepository ?? new CalificacionContextoRepository();
  }

  /**
   * Filas planas del cronograma (una por actividad) de una gestión.
   * @param {number} gestionId
   */
  async obtenerActividadesGestion(gestionId) {
    return sequelize.query(
      `
      SELECT
        gestion_id,
        actividad_calendario_id,
        periodo_academico_id,
        periodo_nombre,
        periodo_numero_orden,
        periodo_division,
        periodo_color,
        periodo_fecha_inicio,
        periodo_fecha_fin,
        actividad_id,
        tipo,
        icono,
        es_destacada,
        nombre,
        descripcion,
        codigo,
        fecha_inicio,
        fecha_fin,
        carreras_ids,
        estado_actividad
      FROM vista_base_cronograma_gestion
      WHERE gestion_id = ?
      ORDER BY periodo_fecha_inicio, fecha_inicio, actividad_calendario_id
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /** Cronograma de la gestión vigente (contexto + actividades). */
  async obtenerCronogramaVigente() {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx) return null;
    const actividades = await this.obtenerActividadesGestion(ctx.gestion_id);
    return { contexto: ctx, actividades };
  }

  /**
   * Filas editables para la pantalla de administración (incluye `actividadId` y
   * `nombrePersonalizado` por separado, a diferencia de la vista de lectura que
   * solo expone el nombre ya resuelto). No usa la vista para no acoplar el CRUD.
   * @param {number} gestionId
   */
  async obtenerActividadesAdmin(gestionId) {
    return sequelize.query(
      `
      SELECT
        ac.id,
        ac.periodo_academico_id   AS periodoAcademicoId,
        pa.nombre                 AS periodoNombre,
        pa.numero_orden           AS periodoNumeroOrden,
        ac.actividad_id           AS actividadId,
        a.tipo,
        a.icono,
        a.es_destacada            AS esDestacada,
        ac.nombre_personalizado   AS nombrePersonalizado,
        a.nombre                  AS catalogoNombre,
        COALESCE(ac.nombre_personalizado, a.nombre) AS nombre,
        ac.codigo,
        ac.fecha_inicio           AS fechaInicio,
        ac.fecha_fin              AS fechaFin,
        CASE
          WHEN CURDATE() < ac.fecha_inicio THEN 'futura'
          WHEN ac.fecha_fin IS NOT NULL AND CURDATE() > ac.fecha_fin THEN 'pasada'
          WHEN ac.fecha_fin IS NULL AND CURDATE() > ac.fecha_inicio THEN 'pasada'
          ELSE 'vigente'
        END                       AS estado
      FROM actividades_calendario ac
      JOIN periodos_academicos pa
        ON pa.id = ac.periodo_academico_id AND pa.deleted_at IS NULL
      LEFT JOIN actividades a
        ON a.id = ac.actividad_id AND a.deleted_at IS NULL
      WHERE pa.gestion_id = ?
        AND ac.activo = TRUE
        AND ac.deleted_at IS NULL
      ORDER BY pa.fecha_inicio, ac.fecha_inicio, ac.id
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /** Periodos/etapas de una gestión (todas las divisiones) para el select del formulario. */
  async obtenerPeriodosGestion(gestionId) {
    return sequelize.query(
      `
      SELECT
        id            AS periodoAcademicoId,
        nombre,
        division,
        numero_orden  AS numeroOrden,
        color_hex     AS color,
        fecha_inicio  AS fechaInicio,
        fecha_fin     AS fechaFin
      FROM periodos_academicos
      WHERE gestion_id = ?
        AND activo = TRUE
        AND deleted_at IS NULL
      ORDER BY fecha_inicio, numero_orden
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /** Catálogo maestro de actividades (para el select del formulario). */
  async obtenerCatalogoActividades() {
    return sequelize.query(
      `
      SELECT id, nombre, tipo, icono, es_destacada AS esDestacada
      FROM actividades
      WHERE activo = TRUE
        AND deleted_at IS NULL
      ORDER BY tipo, nombre
      `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  /** Datos completos de la pantalla de administración del cronograma vigente. */
  async obtenerAdminVigente() {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx) return null;
    const [actividades, periodos, catalogo] = await Promise.all([
      this.obtenerActividadesAdmin(ctx.gestion_id),
      this.obtenerPeriodosGestion(ctx.gestion_id),
      this.obtenerCatalogoActividades(),
    ]);
    return { contexto: ctx, actividades, periodos, catalogo };
  }
}
