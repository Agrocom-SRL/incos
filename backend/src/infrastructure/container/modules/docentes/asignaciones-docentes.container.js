/**
 * Recurso REST asignaciones-docentes (Sprint 4 A3).
 * Reutiliza use cases del módulo docentes migrados a oferta_curso_id.
 */

import {
  ASIGNACIONES_DOCENTES_TOKENS,
  DOCENTES_TOKENS,
  SERVICIOS_TOKENS,
} from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import {
  ListAsignacionesDocentesController,
  GetAsignacionDocenteByIdController,
  CreateAsignacionDocenteController,
  UpdateAsignacionDocenteController,
  DeleteAsignacionDocenteController,
} from '../../../../presentation/controllers/asignaciones-docentes/asignaciones-docentes.controllers.js';
import { buildAsignacionesDocentesRouter } from '../../../../presentation/routes/asignaciones-docentes.routes.js';

export function registerAsignacionesDocentesResource(container) {
  registerComponent(
    container,
    ASIGNACIONES_DOCENTES_TOKENS.listAsignacionesDocentesController,
    (c) =>
      new ListAsignacionesDocentesController({
        listTeacherAssignmentsUseCase: c.resolve(DOCENTES_TOKENS.listTeacherAssignmentsUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ASIGNACIONES_DOCENTES_TOKENS.getAsignacionDocenteByIdController,
    (c) =>
      new GetAsignacionDocenteByIdController({
        getTeacherAssignmentByIdUseCase: c.resolve(DOCENTES_TOKENS.getTeacherAssignmentByIdUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ASIGNACIONES_DOCENTES_TOKENS.createAsignacionDocenteController,
    (c) =>
      new CreateAsignacionDocenteController({
        createTeacherAssignmentUseCase: c.resolve(DOCENTES_TOKENS.createTeacherAssignmentUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ASIGNACIONES_DOCENTES_TOKENS.updateAsignacionDocenteController,
    (c) =>
      new UpdateAsignacionDocenteController({
        updateTeacherAssignmentUseCase: c.resolve(DOCENTES_TOKENS.updateTeacherAssignmentUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ASIGNACIONES_DOCENTES_TOKENS.deleteAsignacionDocenteController,
    (c) =>
      new DeleteAsignacionDocenteController({
        deleteTeacherAssignmentUseCase: c.resolve(DOCENTES_TOKENS.deleteTeacherAssignmentUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ASIGNACIONES_DOCENTES_TOKENS.asignacionesDocentesRouter,
    (c) => {
      const controllers = {
        listAsignacionesDocentesController: c.resolve(
          ASIGNACIONES_DOCENTES_TOKENS.listAsignacionesDocentesController
        ),
        getAsignacionDocenteByIdController: c.resolve(
          ASIGNACIONES_DOCENTES_TOKENS.getAsignacionDocenteByIdController
        ),
        createAsignacionDocenteController: c.resolve(
          ASIGNACIONES_DOCENTES_TOKENS.createAsignacionDocenteController
        ),
        updateAsignacionDocenteController: c.resolve(
          ASIGNACIONES_DOCENTES_TOKENS.updateAsignacionDocenteController
        ),
        deleteAsignacionDocenteController: c.resolve(
          ASIGNACIONES_DOCENTES_TOKENS.deleteAsignacionDocenteController
        ),
      };
      const middlewares = {
        validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
      };
      return buildAsignacionesDocentesRouter({ controllers, middlewares });
    }
  );

  return container;
}
