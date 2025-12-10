import { sequelize } from '../database/config/sequelize.js';

/**
 * Repositorio simplificado para estudiantes_datos_academicos
 */
export class StudentAcademicDataRepository {
  async create(data, userId) {
    const [result] = await sequelize.query(
      `INSERT INTO estudiantes_datos_academicos 
       (estudiante_id, carrera_id, gestion_ingreso_id, estado_academico, 
        unidad_educativa_procedencia, anio_egreso_secundaria, promedio_anual, 
        created_by, activo)
       VALUES (:estudianteId, :carreraId, :gestionIngresoId, :estadoAcademico,
               :unidadEducativaProcedencia, :anioEgresoSecundaria, :promedioAnual,
               :createdBy, 1)`,
      {
        replacements: {
          estudianteId: data.estudianteId,
          carreraId: data.carreraId,
          gestionIngresoId: data.gestionIngresoId,
          estadoAcademico: data.estadoAcademico || 'REGULAR',
          unidadEducativaProcedencia: data.unidadEducativaProcedencia,
          anioEgresoSecundaria: data.anioEgresoSecundaria,
          promedioAnual: data.promedioAnual,
          createdBy: userId,
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );
    return { id: result[0] };
  }
}
