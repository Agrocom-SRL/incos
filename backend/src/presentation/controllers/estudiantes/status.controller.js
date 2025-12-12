import { logger } from '../../../config/logger.js';

/**
 * PATCH /api/v1/estudiantes/:id/estado
 * Controller para cambiar estado académico del estudiante
 */
export class ChangeStudentStatusController {
  constructor({ changeStudentStatusUseCase }) {
    this.changeStudentStatusUseCase = changeStudentStatusUseCase;
  }

  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const { nuevoEstado, motivo, observaciones } = req.body;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de cambio de estado académico', {
        studentId: id,
        nuevoEstado,
        userId,
      });

      // TODO: Implementar ChangeStudentStatusUseCase
      // const result = await this.changeStudentStatusUseCase.execute(
      //   parseInt(id),
      //   { nuevoEstado, motivo, observaciones },
      //   userId
      // );

      // Por ahora retornar placeholder
      res.status(200).json({
        success: true,
        data: {
          estudianteId: parseInt(id),
          estadoAnterior: 'REGULAR',
          estadoNuevo: nuevoEstado,
          fechaCambio: new Date().toISOString(),
        },
        message: 'Cambio de estado (pendiente de implementación)',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
