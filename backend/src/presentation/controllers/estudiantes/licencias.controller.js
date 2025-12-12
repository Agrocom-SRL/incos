import { logger } from '../../../shared/logger.js';

/**
 * POST /api/v1/estudiantes/:id/licencias
 * Controller para solicitar licencia estudiantil
 */
export class RequestLicenciaController {
  constructor({ requestLicenciaUseCase }) {
    this.requestLicenciaUseCase = requestLicenciaUseCase;
  }

  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const {
        carreraId,
        gestionId,
        fechaDesde,
        fechaHasta,
        motivo,
        detalleMotivo,
      } = req.body;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de solicitud de licencia', {
        studentId: id,
        motivo,
        fechaDesde,
        fechaHasta,
        userId,
      });

      // TODO: Implementar RequestLicenciaUseCase
      // const licencia = await this.requestLicenciaUseCase.execute(
      //   parseInt(id),
      //   { carreraId, gestionId, fechaDesde, fechaHasta, motivo, detalleMotivo },
      //   userId
      // );

      // Por ahora retornar placeholder
      res.status(201).json({
        success: true,
        data: {
          estudianteId: parseInt(id),
          tipoLicencia: motivo,
          fechaInicio: fechaDesde,
          fechaFin: fechaHasta,
          estado: 'PENDIENTE',
        },
        message: 'Solicitud de licencia (pendiente de implementación)',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
