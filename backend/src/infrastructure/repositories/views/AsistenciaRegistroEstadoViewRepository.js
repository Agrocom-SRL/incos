import { sequelize } from '../../database/sequelize.js';
import { IAsistenciaRegistroEstadoViewRepository as IBase } from '../../../domain/interfaces/repositories/IAsistenciaRegistroEstadoViewRepository.js';

/**
 * Lectura del estado de cierre por curso × bimestre (vista 134, derivado).
 * Arquetipo B (SOLO LECTURA sobre 03-views/).
 */
export class AsistenciaRegistroEstadoViewRepository extends IBase {
  /** @param {number} asignacionDocenteId @param {number} periodoAcademicoId */
  async obtenerEstadoBimestre(asignacionDocenteId, periodoAcademicoId) {
    const rows = await sequelize.query(
      `
      SELECT
        asignacion_docente_id,
        periodo_academico_id,
        total_sesiones,
        sesiones_cerradas,
        registro_estado
      FROM vista_base_asistencia_registro_estado_bimestre
      WHERE asignacion_docente_id = ?
        AND periodo_academico_id = ?
      LIMIT 1
      `,
      {
        replacements: [asignacionDocenteId, periodoAcademicoId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0] ?? null;
  }
}

export default AsistenciaRegistroEstadoViewRepository;
