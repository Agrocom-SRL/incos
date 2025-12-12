import { logger } from '../../../shared/logger.js';

/**
 * GET /api/v1/estudiantes/:id
 * Controller para obtener detalle completo de un estudiante
 */
export class GetStudentByIdController {
  constructor({ getStudentByIdUseCase }) {
    this.getStudentByIdUseCase = getStudentByIdUseCase;
  }

  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de detalle de estudiante', {
        studentId: id,
        userId,
      });

      // TODO: Implementar GetStudentByIdUseCase
      // const student = await this.getStudentByIdUseCase.execute(
      //   parseInt(id),
      //   userId
      // );

      // Por ahora retornar placeholder
      res.status(200).json({
        success: true,
        data: null,
        message: 'Detalle de estudiante (pendiente de implementación)',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
