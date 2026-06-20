import { sequelize } from '../../database/sequelize.js';
import { IBecasPorCarreraViewRepository } from '../../../domain/interfaces/repositories/IBecasPorCarreraViewRepository.js';

/**
 * Filas crudas para la planilla de control de becas por carrera.
 *
 * Reutiliza la vista existente
 * `vista_base_reporte_excel_lista_aportes_por_carrera_filas` (vista 89),
 * que ya entrega 1 fila por estudiante matriculado por carrera/gestión.
 *
 * NOTA sobre columnas: la vista 89 NO expone `estudiante_beca_id` como
 * columna de salida; el indicador fiable de "tiene beca" es
 * `beca_porcentaje > 0` (la vista hace COALESCE(porcentaje, 0)) confirmado
 * por `beca_tipo_nombre <> 'NO APLICA'`. Se selecciona `beca_tipo_nombre`
 * como señal de presencia de beca para el use case.
 *
 * Repositorio de SOLO LECTURA para reportes (arquetipo B / `views/`).
 */
export class BecasPorCarreraViewRepository extends IBecasPorCarreraViewRepository {
  /**
   * @param {number} gestionId
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findRowsByGestionId(gestionId) {
    const query = `
      SELECT
        carrera_id,
        carrera_nombre,
        carrera_codigo,
        estudiante_id,
        beca_porcentaje,
        beca_tipo_nombre
      FROM vista_base_reporte_excel_lista_aportes_por_carrera_filas
      WHERE gestion_id = :gestionId
      ORDER BY carrera_nombre, estudiante_id
    `;

    return sequelize.query(query, {
      replacements: { gestionId },
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
