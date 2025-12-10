import { sequelize } from '../database/config/sequelize.js';

/**
 * Repositorio simplificado para carreras
 * TODO: Crear modelo completo de Carrera más adelante
 */
export class CarreraRepository {
  async findById(id) {
    const [results] = await sequelize.query(
      `SELECT id, codigo, nombre FROM carreras WHERE id = :id AND activo = 1 AND deleted_at IS NULL`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return results || null;
  }
}
