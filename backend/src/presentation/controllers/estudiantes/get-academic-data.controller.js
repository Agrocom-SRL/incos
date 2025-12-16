/**
 * GET /api/v1/estudiantes/:id/datos-academicos
 * Controller para obtener datos académicos de un estudiante
 */

import { logger } from '../../../shared/logger.js';
import container from '../../../infrastructure/container/index.js';

export class GetStudentAcademicDataController {
  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const estudianteId = parseInt(id);

      logger.info('Request de datos académicos de estudiante', {
        studentId: estudianteId,
      });

      if (isNaN(estudianteId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID de estudiante inválido',
          },
        });
      }

      // Obtener repositorio de datos académicos
      const studentAcademicDataRepository = container.resolve('studentAcademicDataRepository');

      // Buscar datos académicos del estudiante
      const datosAcademicos = await studentAcademicDataRepository.findByEstudianteId(estudianteId);

      if (!datosAcademicos) {
        // Retornar 200 con data: null en lugar de 404 para evitar errores en consola del frontend
        // El frontend puede verificar si data es null para determinar si hay datos académicos
        logger.info('No se encontraron datos académicos para el estudiante', {
          studentId: estudianteId,
        });
        return res.status(200).json({
          success: true,
          data: null,
          message: 'No se encontraron datos académicos para este estudiante',
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Convertir entidad a formato de presentación (castellano)
      const datosAcademicosData = {
        id: datosAcademicos.id,
        estudianteId: datosAcademicos.studentId,
        carreraId: datosAcademicos.careerId,
        gestionId: datosAcademicos.managementId,
        gestionIngresoId: datosAcademicos.managementId, // Alias para compatibilidad
        estadoAcademico: datosAcademicos.academicState,
        unidadEducativaProcedencia: datosAcademicos.previousSchool,
        anioEgresoSecundaria: datosAcademicos.highSchoolGraduationYear,
        promedioAnual: datosAcademicos.annualAverage,
        fechaEgreso: datosAcademicos.graduationDate,
        fechaRetiro: datosAcademicos.withdrawalDate,
        motivoRetiro: datosAcademicos.withdrawalReason,
        fotoUrl: datosAcademicos.photoUrl,
        activo: datosAcademicos.activo,
        createdAt: datosAcademicos.createdAt,
        updatedAt: datosAcademicos.updatedAt,
      };

      logger.info('Datos académicos encontrados', {
        studentId: estudianteId,
        carreraId: datosAcademicosData.carreraId,
        gestionId: datosAcademicosData.gestionId,
      });

      res.status(200).json({
        success: true,
        data: datosAcademicosData,
        message: 'Datos académicos obtenidos correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error al obtener datos académicos de estudiante', {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}

