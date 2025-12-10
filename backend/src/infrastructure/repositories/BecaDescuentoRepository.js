import { sequelize } from '../database/config/sequelize.js';

/**
 * Repositorio simplificado para becas/descuentos
 * TODO: Crear modelo completo más adelante
 */
export class BecaDescuentoRepository {
  async findById(id) {
    const [results] = await sequelize.query(
      `SELECT id, nombre, porcentaje, requiere_documentacion, requiere_aprobacion_rector 
       FROM becas_descuentos 
       WHERE id = :id AND activo = 1 AND deleted_at IS NULL`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return results || null;
  }
}
