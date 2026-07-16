import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/cursos-capacitacion
 * Crea un curso de capacitación (+ junction de bloques horarios).
 */
export class CreateCursoCapacitacionController extends BaseCreateController {
  constructor({ createCursoCapacitacionUseCase, logger, responseFormatter }) {
    super({
      useCase: createCursoCapacitacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'curso de capacitación',
      dataFieldName: 'cursoCapacitacion',
    });
  }

  /**
   * Pasa userId de la sesión al caso de uso (auditoría created_by).
   */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request de creación de curso de capacitación', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('Error al crear curso de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
