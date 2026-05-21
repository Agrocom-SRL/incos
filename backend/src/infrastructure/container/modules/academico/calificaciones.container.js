/**
 * Registro de dependencias del recurso Calificaciones (Académico)
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListCoordinacionCalificacionesDocentesUseCase } from '../../../../application/use-cases/academico/ListCoordinacionCalificacionesDocentesUseCase.js';
import { ListCursosCalificacionesUseCase } from '../../../../application/use-cases/academico/ListCursosCalificacionesUseCase.js';
import { GetPoliticaInstitucionalUseCase } from '../../../../application/use-cases/academico/GetPoliticaInstitucionalUseCase.js';
import { GetPoliticaCatalogoUseCase } from '../../../../application/use-cases/academico/GetPoliticaCatalogoUseCase.js';
import { ListTiposEvaluacionUseCase } from '../../../../application/use-cases/academico/ListTiposEvaluacionUseCase.js';
import { SavePoliticaInstitucionalUseCase } from '../../../../application/use-cases/academico/SavePoliticaInstitucionalUseCase.js';
import { ListCoordinacionCalificacionesDocentesController } from '../../../../presentation/controllers/academico/calificaciones/list-coordinacion-docentes.controller.js';
import { ListCursosCalificacionesController } from '../../../../presentation/controllers/academico/calificaciones/list-cursos-calificaciones.controller.js';
import { GetPoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/get-politica-institucional.controller.js';
import { GetPoliticaCatalogoController } from '../../../../presentation/controllers/academico/calificaciones/get-politica-catalogo.controller.js';
import { ListTiposEvaluacionController } from '../../../../presentation/controllers/academico/calificaciones/list-tipos-evaluacion.controller.js';
import { SavePoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/save-politica-institucional.controller.js';
import { buildCalificacionesRouter } from '../../../../presentation/routes/calificaciones.routes.js';

export function registerCalificacionesResource(container) {
  registerComponent(
    container,
    ACADEMICO_TOKENS.listCursosCalificacionesUseCase,
    (c) =>
      new ListCursosCalificacionesUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

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
    ACADEMICO_TOKENS.getPoliticaCatalogoUseCase,
    (c) =>
      new GetPoliticaCatalogoUseCase({
        careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
        periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listTiposEvaluacionUseCase,
    (c) =>
      new ListTiposEvaluacionUseCase({
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
    ACADEMICO_TOKENS.getPoliticaCatalogoController,
    (c) =>
      new GetPoliticaCatalogoController({
        getPoliticaCatalogoUseCase: c.resolve(ACADEMICO_TOKENS.getPoliticaCatalogoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listTiposEvaluacionController,
    (c) =>
      new ListTiposEvaluacionController({
        listTiposEvaluacionUseCase: c.resolve(ACADEMICO_TOKENS.listTiposEvaluacionUseCase),
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
    ACADEMICO_TOKENS.listCursosCalificacionesController,
    (c) =>
      new ListCursosCalificacionesController({
        listCursosCalificacionesUseCase: c.resolve(ACADEMICO_TOKENS.listCursosCalificacionesUseCase),
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
      listCursosCalificacionesController: c.resolve(
        ACADEMICO_TOKENS.listCursosCalificacionesController
      ),
      listCoordinacionCalificacionesDocentesController: c.resolve(
        ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesController
      ),
      getPoliticaInstitucionalController: c.resolve(
        ACADEMICO_TOKENS.getPoliticaInstitucionalController
      ),
      getPoliticaCatalogoController: c.resolve(ACADEMICO_TOKENS.getPoliticaCatalogoController),
      listTiposEvaluacionController: c.resolve(ACADEMICO_TOKENS.listTiposEvaluacionController),
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
