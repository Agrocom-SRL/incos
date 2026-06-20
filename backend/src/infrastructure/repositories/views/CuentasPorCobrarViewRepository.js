import { sequelize } from '../../database/sequelize.js';
import { ICuentasPorCobrarViewRepository } from '../../../domain/interfaces/repositories/ICuentasPorCobrarViewRepository.js';

/**
 * Filas crudas para la planilla de control de Cuentas por cobrar.
 *
 * Reutiliza la vista existente
 * `vista_base_reporte_excel_lista_aportes_por_carrera_filas` (vista 89), que ya
 * entrega 1 fila por estudiante matriculado por carrera/paralelo/gestión con
 * carrera, paralelo, CI, nombres, monto obligatorio, total pagado y saldo.
 *
 * La fecha del último pago NO está en la vista 89 (es cabecera agregada), por lo
 * que se obtiene aparte desde `pago_cuotas` (MAX(fecha_pago) por pago_aporte_id),
 * sin crear vistas nuevas.
 *
 * Repositorio de SOLO LECTURA para reportes (arquetipo B / `views/`).
 */
export class CuentasPorCobrarViewRepository extends ICuentasPorCobrarViewRepository {
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
        paralelo_id,
        paralelo_nombre,
        paralelo_turno,
        estudiante_id,
        codigo_estudiante,
        ci,
        apellido_paterno,
        apellido_materno,
        nombres,
        nombre_completo,
        pago_aporte_id,
        monto_total_deuda,
        monto_pagado,
        saldo_pendiente,
        estado_aporte
      FROM vista_base_reporte_excel_lista_aportes_por_carrera_filas
      WHERE gestion_id = :gestionId
      ORDER BY carrera_nombre, paralelo_nombre, apellido_paterno, apellido_materno, nombres
    `;

    return sequelize.query(query, {
      replacements: { gestionId },
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * MAX(fecha_pago) por cabecera (pago_aporte_id) de las cabeceras de la gestión.
   *
   * @param {number} gestionId
   * @returns {Promise<Array<{ pago_aporte_id: number, fecha_ultimo_pago: string|null }>>}
   */
  async findUltimoPagoByGestionId(gestionId) {
    const query = `
      SELECT
        pc.pago_aporte_id AS pago_aporte_id,
        MAX(pc.fecha_pago) AS fecha_ultimo_pago
      FROM pago_cuotas pc
      INNER JOIN pago_aporte pa ON pa.id = pc.pago_aporte_id
      WHERE pa.gestion_id = :gestionId
        AND pc.activo = TRUE
        AND pc.deleted_at IS NULL
      GROUP BY pc.pago_aporte_id
    `;

    return sequelize.query(query, {
      replacements: { gestionId },
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
