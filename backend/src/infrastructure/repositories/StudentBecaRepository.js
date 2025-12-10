import { sequelize } from '../database/config/sequelize.js';

/**
 * Repositorio simplificado para estudiantes_becas
 * TODO: Crear modelo completo más adelante
 */
export class StudentBecaRepository {
  async create(data, userId) {
    const [result] = await sequelize.query(
      `INSERT INTO estudiantes_becas 
       (estudiante_id, beca_descuento_id, gestion_id, fecha_solicitud, estado, observaciones, created_by, activo)
       VALUES (:estudianteId, :becaDescuentoId, :gestionId, :fechaSolicitud, :estado, :observaciones, :createdBy, 1)`,
      {
        replacements: {
          estudianteId: data.estudianteId,
          becaDescuentoId: data.becaDescuentoId,
          gestionId: data.gestionId,
          fechaSolicitud: data.fechaSolicitud,
          estado: data.estado,
          observaciones: data.observaciones,
          createdBy: userId,
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );
    return { id: result[0] };
  }
}
