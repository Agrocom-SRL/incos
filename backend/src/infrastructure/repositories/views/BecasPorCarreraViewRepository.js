import { sequelize } from '../../database/sequelize.js';
import { IBecasPorCarreraViewRepository } from '../../../domain/interfaces/repositories/IBecasPorCarreraViewRepository.js';

/**
 * Filas crudas para la planilla de control de becas por carrera.
 *
 * Reutiliza la vista existente
 * `vista_base_reporte_excel_lista_aportes_por_carrera_filas` (vista 89),
 * que ya entrega 1 fila por estudiante matriculado por carrera/gestión.
 *
 * La vista 89 (a través de su base 88) deduplica cada estudiante a su
 * inscripción-paralelo representativa, por lo que cada fila ya trae el grano
 * jerárquico completo carrera → periodo (nivel/año del plan) → paralelo, sin
 * riesgo de doble conteo. El use case arma con esas columnas el árbol de
 * desglose (carrera/periodo/paralelo) que consume el reporte.
 *
 * NOTA sobre columnas: la vista 89 NO expone `estudiante_beca_id` como
 * columna de salida; el indicador fiable de "tiene beca" es
 * `beca_porcentaje > 0` (la vista hace COALESCE(porcentaje, 0)) confirmado
 * por `beca_tipo_nombre <> 'NO APLICA'`. Se selecciona `beca_tipo_nombre`
 * como señal de presencia de beca para el use case. Además, ahora también
 * trae datos identificatorios del estudiante (código, apellidos, nombres,
 * CI) y el detalle económico de su beca (nombre del descuento, monto de
 * descuento y monto base del aporte) para que el use case pueda exponer el
 * detalle de estudiantes por paralelo, sin afectar los agregados existentes.
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
        periodo_id,
        periodo_numero,
        periodo_nombre,
        paralelo_id,
        paralelo_nombre,
        paralelo_turno,
        estudiante_id,
        beca_porcentaje,
        beca_tipo_nombre,
        codigo_estudiante,
        apellido_paterno,
        apellido_materno,
        nombres,
        ci,
        beca_descuento_nombre,
        descuento_beca,
        aporte_monto_base
      FROM vista_base_reporte_excel_lista_aportes_por_carrera_filas
      WHERE gestion_id = :gestionId
      ORDER BY carrera_nombre, periodo_numero, paralelo_nombre, estudiante_id
    `;

    return sequelize.query(query, {
      replacements: { gestionId },
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
