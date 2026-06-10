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
}
