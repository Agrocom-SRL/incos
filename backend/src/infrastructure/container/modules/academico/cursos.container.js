/**
 * Recurso Cursos (oferta académica): PATCH / DELETE sobre maestro `cursos`.
 */
import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { UpdateCursoOfertaUseCase } from '../../../../application/use-cases/academico/UpdateCursoOfertaUseCase.js';
import { DeleteCursoOfertaUseCase } from '../../../../application/use-cases/academico/DeleteCursoOfertaUseCase.js';
import { PatchCursoOfertaController, DeleteCursoOfertaController } from '../../../../presentation/controllers/academico/index.js';
import { buildCursosRouter } from '../../../../presentation/routes/cursos.routes.js';

export function registerCursosResource(container) {
  registerComponent(
    container,
    ACADEMICO_TOKENS.updateCursoOfertaUseCase,
    (c) =>
      new UpdateCursoOfertaUseCase({
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        courseScheduleRepository: c.resolve(REPOSITORIOS_TOKENS.courseScheduleRepository),
        planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
        subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteCursoOfertaUseCase,
    (c) =>
      new DeleteCursoOfertaUseCase({
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        courseScheduleRepository: c.resolve(REPOSITORIOS_TOKENS.courseScheduleRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.patchCursoOfertaController,
    (c) =>
      new PatchCursoOfertaController({
        updateCursoOfertaUseCase: c.resolve(ACADEMICO_TOKENS.updateCursoOfertaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteCursoOfertaController,
    (c) =>
      new DeleteCursoOfertaController({
        deleteCursoOfertaUseCase: c.resolve(ACADEMICO_TOKENS.deleteCursoOfertaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cursosRouter,
    (c) => {
      const controllers = {
        patchCursoOfertaController: c.resolve(ACADEMICO_TOKENS.patchCursoOfertaController),
        deleteCursoOfertaController: c.resolve(ACADEMICO_TOKENS.deleteCursoOfertaController),
      };
      const middlewares = {
        validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
      };
      return buildCursosRouter({ controllers, middlewares });
    },
  );

  return container;
}
