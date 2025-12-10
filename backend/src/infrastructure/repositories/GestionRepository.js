import { sequelize } from '../database/config/sequelize.js';

/**
 * Repositorio simplificado para gestiones
 * TODO: Crear modelo completo de Gestion más adelante
 */
export class GestionRepository {
  async findById(id) {
    const [results] = await sequelize.query(
      `SELECT id, codigo, anio FROM gestiones WHERE id = :id AND activo = 1 AND deleted_at IS NULL`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return results || null;
  }
}
