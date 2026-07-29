import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/pasantias/empresas (P8)
 * Alta en el catálogo de empresas. dataFieldName: 'pasantiaEmpresa'.
 */
export class CreatePasantiaEmpresaController extends BaseCreateController {
  constructor({ createPasantiaEmpresaUseCase, logger, responseFormatter }) {
    super({
      useCase: createPasantiaEmpresaUseCase,
      logger,
      responseFormatter,
      resourceName: 'empresa de pasantía',
      dataFieldName: 'pasantiaEmpresa',
    });
  }

  /** Pasa userId de la sesión al caso de uso (auditoría created_by). */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('[Pasantías] Request de alta de empresa', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nueva';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('[Pasantías] Error al registrar empresa', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
