/**
 * Controllers REST /api/v1/asignaciones-docentes
 */

import { ListRequestDTO } from '../../../application/dtos/common/index.js';
import { CreateTeacherAssignmentController } from '../docentes/create-assignment.controller.js';
import { UpdateTeacherAssignmentController } from '../docentes/update-assignment.controller.js';
import { DeleteTeacherAssignmentController } from '../docentes/delete-assignment.controller.js';

export class ListAsignacionesDocentesController {
  constructor({ listTeacherAssignmentsUseCase, logger, responseFormatter }) {
    this.useCase = listTeacherAssignmentsUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { page, limit } = ListRequestDTO.fromQuery(req.query);
      this.logger.info('Request listado asignaciones-docentes', { page, limit, query: req.query });

      const result = await this.useCase.execute({}, page, limit, req.query, { snakeCase: true });

      return this.responseFormatter._success(
        res,
        { asignaciones: result.asignaciones || [] },
        {
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        req
      );
    } catch (error) {
      this.logger.error('Error listando asignaciones-docentes', { error: error.message });
      return next(error);
    }
  }
}

export class GetAsignacionDocenteByIdController {
  constructor({ getTeacherAssignmentByIdUseCase, logger, responseFormatter }) {
    this.useCase = getTeacherAssignmentByIdUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, { snakeCase: true });
      return this.responseFormatter._success(res, { asignacion: result.asignacion }, {}, req);
    } catch (error) {
      this.logger.error('Error detalle asignación docente', { error: error.message, id: req.params.id });
      return next(error);
    }
  }
}

export class CreateAsignacionDocenteController extends CreateTeacherAssignmentController {
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request POST asignaciones-docentes', { body });
      const userId = req.user?.id ?? null;
      const result = await this.useCase.execute(body, userId);
      const asignacion = result.asignacion;
      return this.responseFormatter._success(
        res,
        { asignacion },
        { statusCode: 201 },
        req
      );
    } catch (error) {
      this.logger.error('Error POST asignaciones-docentes', { error: error.message });
      return next(error);
    }
  }
}

export class UpdateAsignacionDocenteController extends UpdateTeacherAssignmentController {
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      this.logger.info('Request PUT asignaciones-docentes', { id });
      const userId = req.user?.id ?? null;
      const result = await this.useCase.execute(id, body, userId);
      return this.responseFormatter._success(res, { asignacion: result.asignacion }, {}, req);
    } catch (error) {
      this.logger.error('Error PUT asignaciones-docentes', { error: error.message, id: req.params.id });
      return next(error);
    }
  }
}

export class DeleteAsignacionDocenteController extends DeleteTeacherAssignmentController {}
