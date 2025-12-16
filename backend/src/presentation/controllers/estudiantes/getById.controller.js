import { logger } from '../../../shared/logger.js';
import { StudentMapper } from '../../../application/mappers/StudentMapper.js';
import container from '../../../infrastructure/container/index.js';

/**
 * GET /api/v1/estudiantes/:id
 * Controller para obtener detalle completo de un estudiante
 * 
 * NOTA: Implementación rápida para presentación - usa repositorio directamente
 */
export class GetStudentByIdController {
  constructor({ getStudentByIdUseCase }) {
    this.getStudentByIdUseCase = getStudentByIdUseCase;
  }

  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const estudianteId = parseInt(id);
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de detalle de estudiante', {
        studentId: estudianteId,
        userId,
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

      // Implementación rápida: usar repositorio directamente
      // TODO: Crear GetStudentByIdUseCase cuando se tenga tiempo
      const studentRepository = container.resolve('studentRepository');
      const student = await studentRepository.findById(estudianteId);

      if (!student) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Estudiante no encontrado',
          },
        });
      }

      // Convertir entidad a formato de presentación (castellano)
      const estudianteData = StudentMapper.entityToPresentation(student);

      res.status(200).json({
        success: true,
        data: estudianteData,
        message: 'Estudiante obtenido correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error al obtener estudiante por ID', {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}
