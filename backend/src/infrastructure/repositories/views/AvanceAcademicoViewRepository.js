import { sequelize } from '../../database/sequelize.js';
import { IAvanceAcademicoViewRepository } from '../../../domain/interfaces/repositories/IAvanceAcademicoViewRepository.js';

/**
 * Lectura del avance académico estudiante × plan (vista 171). Arquetipo B
 * (SOLO LECTURA sobre 03-views/).
 *
 * El % de avance NO viene de la vista: lo deriva el use case a partir de
 * materias_avanzadas / total_asignaturas_plan (negocio en aplicación).
 */
export class AvanceAcademicoViewRepository extends IAvanceAcademicoViewRepository {
  /**
   * @param {{ carreraId?: (number|null), estudianteId?: (number|null) }} params
   * @returns {Promise<Array<Object>>}
   */
  async listarAvance({ carreraId = null, estudianteId = null } = {}) {
    const filtros = [];
    if (carreraId != null) filtros.push('AND carrera_id = :carreraId');
    if (estudianteId != null) filtros.push('AND estudiante_id = :estudianteId');
    return sequelize.query(
      `
      SELECT *
      FROM vista_avance_academico_estudiante
      WHERE 1 = 1
        ${filtros.join('\n        ')}
      ORDER BY carrera_nombre ASC, nombre_completo ASC
      `,
      {
        replacements: { carreraId, estudianteId },
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }
}

export default AvanceAcademicoViewRepository;
