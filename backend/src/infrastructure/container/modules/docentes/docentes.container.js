/**
 * Registro del módulo Docentes (listado inicial).
 */

import { DOCENTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListTeachersUseCase } from '../../../../application/use-cases/docentes/ListTeachersUseCase.js';
import { GetTeacherDetailUseCase } from '../../../../application/use-cases/docentes/GetTeacherDetailUseCase.js';
import { ListTeachersController, GetTeacherByIdController } from '../../../../presentation/controllers/docentes/index.js';
import { buildDocentesRouter } from '../../../../presentation/routes/docentes.routes.js';

export function registerDocentesModule(container) {
  registerComponent(
    container,
    DOCENTES_TOKENS.listTeachersUseCase,
    (c) =>
      new ListTeachersUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getTeacherDetailUseCase,
    (c) =>
      new GetTeacherDetailUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listTeachersController,
    (c) =>
      new ListTeachersController({
        listTeachersUseCase: c.resolve(DOCENTES_TOKENS.listTeachersUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getTeacherByIdController,
    (c) =>
      new GetTeacherByIdController({
        getTeacherDetailUseCase: c.resolve(DOCENTES_TOKENS.getTeacherDetailUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.docentesRouter,
    (c) => {
      const controllers = {
        listTeachersController: c.resolve(DOCENTES_TOKENS.listTeachersController),
        getTeacherByIdController: c.resolve(DOCENTES_TOKENS.getTeacherByIdController),
      };
      const middlewares = {
        validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
      };
      return buildDocentesRouter({ controllers, middlewares });
    }
  );

  return container;
}
