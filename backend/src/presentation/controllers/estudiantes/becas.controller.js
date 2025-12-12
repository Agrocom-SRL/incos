import { logger } from '../../../shared/logger.js';

/**
 * POST /api/v1/estudiantes/:id/becas
 * Controller para asignar beca a un estudiante
 */
export class AssignBecaController {
  constructor({ assignBecaUseCase }) {
    this.assignBecaUseCase = assignBecaUseCase;
  }

  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const { becaDescuentoId, gestionId, motivo, fechaInicio, fechaFin, documentosRespaldo } =
        req.body;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de asignación de beca', {
        studentId: id,
        becaDescuentoId,
        gestionId,
        userId,
      });

      // TODO: Implementar AssignBecaUseCase
      // const beca = await this.assignBecaUseCase.execute(
      //   parseInt(id),
      //   { becaDescuentoId, gestionId, motivo, fechaInicio, fechaFin, documentosRespaldo },
      //   userId
      // );

      // Por ahora retornar placeholder
      res.status(201).json({
        success: true,
        data: {
          estudianteId: parseInt(id),
          becaDescuentoId,
          estado: 'PENDIENTE',
        },
        message: 'Asignación de beca (pendiente de implementación)',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
