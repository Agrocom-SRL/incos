/**
 * Registro de dependencias del recurso Calificaciones (Académico)
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListCoordinacionCalificacionesDocentesUseCase } from '../../../../application/use-cases/academico/ListCoordinacionCalificacionesDocentesUseCase.js';
import { GetPoliticaInstitucionalUseCase } from '../../../../application/use-cases/academico/GetPoliticaInstitucionalUseCase.js';
import { SavePoliticaInstitucionalUseCase } from '../../../../application/use-cases/academico/SavePoliticaInstitucionalUseCase.js';
import { ListCoordinacionCalificacionesDocentesController } from '../../../../presentation/controllers/academico/calificaciones/list-coordinacion-docentes.controller.js';
import { GetPoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/get-politica-institucional.controller.js';
import { SavePoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/save-politica-institucional.controller.js';
import { buildCalificacionesRouter } from '../../../../presentation/routes/calificaciones.routes.js';

export function registerCalificacionesResource(container) {
  registerComponent(
    container,
    ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesUseCase,
    (c) =>
      new ListCoordinacionCalificacionesDocentesUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPoliticaInstitucionalUseCase,
    (c) =>
      new GetPoliticaInstitucionalUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.savePoliticaInstitucionalUseCase,
    (c) =>
      new SavePoliticaInstitucionalUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPoliticaInstitucionalController,
    (c) =>
      new GetPoliticaInstitucionalController({
        getPoliticaInstitucionalUseCase: c.resolve(ACADEMICO_TOKENS.getPoliticaInstitucionalUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.savePoliticaInstitucionalController,
    (c) =>
      new SavePoliticaInstitucionalController({
        savePoliticaInstitucionalUseCase: c.resolve(ACADEMICO_TOKENS.savePoliticaInstitucionalUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesController,
    (c) =>
      new ListCoordinacionCalificacionesDocentesController({
        listCoordinacionCalificacionesDocentesUseCase: c.resolve(
          ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(container, ACADEMICO_TOKENS.calificacionesRouter, (c) => {
    const controllers = {
      listCoordinacionCalificacionesDocentesController: c.resolve(
        ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesController
      ),
      getPoliticaInstitucionalController: c.resolve(
        ACADEMICO_TOKENS.getPoliticaInstitucionalController
      ),
      savePoliticaInstitucionalController: c.resolve(
        ACADEMICO_TOKENS.savePoliticaInstitucionalController
      ),
    };
    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };
    return buildCalificacionesRouter({ controllers, middlewares });
  });

  return container;
}
