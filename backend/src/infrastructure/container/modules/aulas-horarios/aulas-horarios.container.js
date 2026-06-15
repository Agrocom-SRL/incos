import {
  AULAS_HORARIOS_TOKENS,
  REPOSITORIOS_TOKENS,
  SERVICIOS_TOKENS,
} from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListAulasCatalogUseCase } from '../../../../application/use-cases/aulas-horarios/ListAulasCatalogUseCase.js';
import { ListAulasCatalogController } from '../../../../presentation/controllers/aulas-horarios/list-aulas-catalog.controller.js';
import { buildAulasHorariosRouter } from '../../../../presentation/routes/aulas-horarios.routes.js';

export function registerAulasHorariosModule(container) {
  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.listAulasCatalogUseCase,
    (c) =>
      new ListAulasCatalogUseCase({
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.listAulasCatalogController,
    (c) =>
      new ListAulasCatalogController({
        listAulasCatalogUseCase: c.resolve(AULAS_HORARIOS_TOKENS.listAulasCatalogUseCase),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.aulasHorariosRouter,
    (c) =>
      buildAulasHorariosRouter({
        controllers: {
          listAulasCatalogController: c.resolve(AULAS_HORARIOS_TOKENS.listAulasCatalogController),
        },
        middlewares: {
          validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
        },
      })
  );

  return container;
}
