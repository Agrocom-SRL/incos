import { sequelize } from '../../database/sequelize.js';
import { IAsistenciaConsolidadoViewRepository } from '../../../domain/interfaces/repositories/IAsistenciaConsolidadoViewRepository.js';

/**
 * Lectura del consolidado % de asistencia (vista 169). Arquetipo B
 * (SOLO LECTURA sobre 03-views/).
 *
 * Formato LARGO: una fila por estudiante × curso × bimestre. El pivote a
 * matriz (estudiantes × asignaturas, patrón centralizador) y el acumulado
 * anual se hacen en GetConsolidadoAsistenciaUseCase.
 */
export class AsistenciaConsolidadoViewRepository extends IAsistenciaConsolidadoViewRepository {
  /**
   * @param {{ paraleloGestionId: number, bimestre?: (number|null) }} params
   * @returns {Promise<Array<Object>>}
   */
  async listarFilasConsolidado({ paraleloGestionId, bimestre = null }) {
    const filtroBimestre = bimestre != null ? 'AND bimestre = :bimestre' : '';
    return sequelize.query(
      `
      SELECT *
      FROM vista_asistencia_consolidado_bimestre_fila
      WHERE paralelo_gestion_id = :paraleloGestionId
        ${filtroBimestre}
      ORDER BY estudiante_nombre ASC, asignatura_orden ASC, bimestre ASC
      `,
      {
        replacements: { paraleloGestionId, bimestre },
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }
}

export default AsistenciaConsolidadoViewRepository;
