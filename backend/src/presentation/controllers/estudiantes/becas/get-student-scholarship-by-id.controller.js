/**
 * GET /api/v1/estudiantes/becas/:id
 * Detalle de una asignación de beca con estudiante, tipo de beca, gestión y pago vinculado (si existe).
 */

import { BaseGetController } from '../../base/BaseGetController.js';

export class GetStudentScholarshipByIdController extends BaseGetController {
  /**
   * @param {Object} params
   * @param {GetStudentScholarshipByIdUseCase} params.getStudentScholarshipByIdUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getStudentScholarshipByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getStudentScholarshipByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'asignación de beca',
      dataFieldName: 'beca',
    });
  }
}
