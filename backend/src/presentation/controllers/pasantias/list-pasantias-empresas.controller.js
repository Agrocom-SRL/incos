import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/pasantias/empresas (P7)
 * Catálogo de empresas para práctica laboral (soporta incluirInactivos).
 * dataFieldName: 'pasantiasEmpresas'.
 */
export class ListPasantiasEmpresasController extends BaseListController {
  constructor({ listPasantiasEmpresasUseCase, logger, responseFormatter }) {
    super({
      useCase: listPasantiasEmpresasUseCase,
      logger,
      responseFormatter,
      resourceName: 'empresas de pasantía',
      dataFieldName: 'pasantiasEmpresas',
    });
  }
}
