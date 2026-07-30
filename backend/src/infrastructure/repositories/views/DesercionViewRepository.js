import { sequelize } from '../../database/sequelize.js';
import { IDesercionViewRepository } from '../../../domain/interfaces/repositories/IDesercionViewRepository.js';

/**
 * Lectura de la métrica institucional de deserción (vistas 172/173).
 * Arquetipo B (SOLO LECTURA sobre 03-views/).
 *
 * Grano ANUAL por estados consolidados ABANDONO/RETIRADO de matriculas_materia
 * (decisión de usuario 2026-07-29; NO confundir con el riesgo pedagógico por
 * notas del módulo TUT, vistas 156/157).
 */
export class DesercionViewRepository extends IDesercionViewRepository {
  /**
   * Agregado carrera × gestión (vista 173), con denominadores.
   * @param {{ gestionId?: (number|null), carreraId?: (number|null) }} params
   * @returns {Promise<Array<Object>>}
   */
  async listarResumenCarreraGestion({ gestionId = null, carreraId = null } = {}) {
    const filtros = [];
    if (gestionId != null) filtros.push('AND gestion_id = :gestionId');
    if (carreraId != null) filtros.push('AND carrera_id = :carreraId');
    return sequelize.query(
      `
      SELECT *
      FROM vista_desercion_carrera_gestion
      WHERE 1 = 1
        ${filtros.join('\n        ')}
      ORDER BY gestion_anio DESC, carrera_nombre ASC
      `,
      {
        replacements: { gestionId, carreraId },
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * Detalle de desertores (vista 172, es_desercion = 1): una fila por
   * matrícula de materia en ABANDONO/RETIRADO.
   * @param {{ gestionId?: (number|null), carreraId?: (number|null) }} params
   * @returns {Promise<Array<Object>>}
   */
  async listarDesertores({ gestionId = null, carreraId = null } = {}) {
    const filtros = [];
    if (gestionId != null) filtros.push('AND gestion_id = :gestionId');
    if (carreraId != null) filtros.push('AND carrera_id = :carreraId');
    return sequelize.query(
      `
      SELECT *
      FROM vista_base_desercion_matricula_fila
      WHERE es_desercion = 1
        ${filtros.join('\n        ')}
      ORDER BY gestion_anio DESC, carrera_nombre ASC, nombre_completo ASC, asignatura_sigla ASC
      `,
      {
        replacements: { gestionId, carreraId },
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }
}

export default DesercionViewRepository;
