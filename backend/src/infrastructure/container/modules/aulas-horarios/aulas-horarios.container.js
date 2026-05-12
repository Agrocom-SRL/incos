import {
  AULAS_HORARIOS_TOKENS,
  REPOSITORIOS_TOKENS,
  SERVICIOS_TOKENS,
} from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListAulasHorariosUseCase } from '../../../../application/use-cases/aulas-horarios/ListAulasHorariosUseCase.js';
import { PatchAulaHorarioUseCase } from '../../../../application/use-cases/aulas-horarios/PatchAulaHorarioUseCase.js';
import { ListAulasHorariosController } from '../../../../presentation/controllers/aulas-horarios/list-aulas-horarios.controller.js';
import { PatchAulaHorarioController } from '../../../../presentation/controllers/aulas-horarios/patch-aula-horario.controller.js';
import { buildAulasHorariosRouter } from '../../../../presentation/routes/aulas-horarios.routes.js';

export function registerAulasHorariosModule(container) {
  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.listAulasHorariosUseCase,
    (c) =>
      new ListAulasHorariosUseCase({
        aulasHorariosSemanaRepository: c.resolve(REPOSITORIOS_TOKENS.aulasHorariosSemanaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.patchAulaHorarioUseCase,
    (c) =>
      new PatchAulaHorarioUseCase({
        courseScheduleRepository: c.resolve(REPOSITORIOS_TOKENS.courseScheduleRepository),
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.listAulasHorariosController,
    (c) =>
      new ListAulasHorariosController({
        listAulasHorariosUseCase: c.resolve(AULAS_HORARIOS_TOKENS.listAulasHorariosUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.patchAulaHorarioController,
    (c) =>
      new PatchAulaHorarioController({
        patchAulaHorarioUseCase: c.resolve(AULAS_HORARIOS_TOKENS.patchAulaHorarioUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    AULAS_HORARIOS_TOKENS.aulasHorariosRouter,
    (c) =>
      buildAulasHorariosRouter({
        controllers: {
          listAulasHorariosController: c.resolve(AULAS_HORARIOS_TOKENS.listAulasHorariosController),
          patchAulaHorarioController: c.resolve(AULAS_HORARIOS_TOKENS.patchAulaHorarioController),
        },
        middlewares: {
          validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
        },
      })
  );

  return container;
}

