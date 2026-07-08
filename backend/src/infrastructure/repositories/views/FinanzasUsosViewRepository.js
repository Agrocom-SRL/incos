import { sequelize } from '../../database/sequelize.js';
import { IFinanzasUsosViewRepository } from '../../../domain/interfaces/repositories/IFinanzasUsosViewRepository.js';

/**
 * Conteos de uso de los catálogos de configuración de Finanzas.
 *
 * Lee la vista delgada `vista_catalogos_finanzas_usos` (152), que entrega
 * 1 fila por catálogo + ítem con la cantidad de pagos, cuentas de pago y
 * asignaciones de beca activas que lo referencian. Los ítems sin uso NO
 * aparecen en la vista; el consumidor asume 0 por defecto.
 *
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo B / `views/`, no CRUD
 * Sequelize).
 */
export class FinanzasUsosViewRepository extends IFinanzasUsosViewRepository {
  /**
   * Conteos de uso de los ítems de un catálogo de Finanzas.
   *
   * @param {'METODO_PAGO'|'BANCO'|'CUENTA_PAGO'|'BECA_DESCUENTO'} catalogo
   * @returns {Promise<Map<number, {cantidadPagos: number, cantidadCuentas: number, cantidadAsignaciones: number}>>}
   */
  async getUsosByCatalogo(catalogo) {
    const rows = await sequelize.query(
      `
      SELECT
        item_id,
        cantidad_pagos,
        cantidad_cuentas,
        cantidad_asignaciones
      FROM vista_catalogos_finanzas_usos
      WHERE catalogo = :catalogo
      `,
      { replacements: { catalogo }, type: sequelize.QueryTypes.SELECT },
    );

    const usos = new Map();
    rows.forEach((row) => {
      usos.set(Number(row.item_id), {
        cantidadPagos: Number(row.cantidad_pagos) || 0,
        cantidadCuentas: Number(row.cantidad_cuentas) || 0,
        cantidadAsignaciones: Number(row.cantidad_asignaciones) || 0,
      });
    });
    return usos;
  }
}
