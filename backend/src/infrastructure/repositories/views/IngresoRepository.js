import { sequelize } from '../../database/sequelize.js';
import { IIngresoRepository } from '../../../domain/interfaces/repositories/IIngresoRepository.js';

/**
 * Columnas ordenables de la vista 184 (allowlist: evita interpolar un campo
 * arbitrario en el ORDER BY, igual que StudentRepository.listFromView).
 */
const ALLOWED_SORT_FIELDS = [
  'fecha_pago',
  'monto',
  'numero_recibo',
  'persona_apellido_paterno',
  'persona_codigo',
  'concepto',
  'origen',
  'id_local',
];

/**
 * Lecturas del listado unificado de transacciones de ingreso (módulo
 * Finanzas · "Registro de ingresos").
 *
 * Consume la vista SQL `vista_ingresos_listado` (184): 1 fila = 1 pago real
 * (monto > 0), uniendo aportes académicos (pago_cuotas) y pagos de
 * capacitación (capacitacion_pagos) ya normalizados y con el nombre del
 * método de pago resuelto.
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IngresoRepository extends IIngresoRepository {
  /**
   * Listado paginado de ingresos (vista 184): COUNT + SELECT con mismo WHERE.
   *
   * @param {Object} params - { page, limit, search, origen, sortField, sortOrder }
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findAll({ page = 1, limit = 50, search, origen, sortField, sortOrder } = {}) {
    const whereConditions = [];
    const replacements = [];

    if (origen) {
      whereConditions.push('origen = ?');
      replacements.push(origen);
    }

    if (search && String(search).trim() !== '') {
      const term = `%${String(search).trim()}%`;
      whereConditions.push(
        '(persona_apellido_paterno LIKE ? OR persona_apellido_materno LIKE ? OR persona_nombres LIKE ? OR persona_codigo LIKE ? OR numero_recibo LIKE ?)'
      );
      replacements.push(term, term, term, term, term);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderBy = 'fecha_pago DESC, id_local DESC';
    if (sortField && ALLOWED_SORT_FIELDS.includes(sortField)) {
      const direction = String(sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      orderBy = `${sortField} ${direction}`;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM vista_ingresos_listado ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_ingresos_listado
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }
}
