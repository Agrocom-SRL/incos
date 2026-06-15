import { CONFIGURACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { buildPlanesEstudiosRouter } from '../../../../presentation/routes/planes-estudios.routes.js';
import { buildPeriodosRouter } from '../../../../presentation/routes/periodos.routes.js';
import { buildAsignaturasPlanRouter } from '../../../../presentation/routes/asignaturas-plan.routes.js';
import { buildPrerrequisitosRouter } from '../../../../presentation/routes/prerrequisitos.routes.js';

import { ListPlanesEstudiosUseCase } from '../../../../application/use-cases/configuracion/ListPlanesEstudiosUseCase.js';
import { GetPlanEstudiosByIdUseCase } from '../../../../application/use-cases/configuracion/GetPlanEstudiosByIdUseCase.js';
import { GetPlanEstudiosMatrizUseCase } from '../../../../application/use-cases/configuracion/GetPlanEstudiosMatrizUseCase.js';
import { ValidarPlanEstudiosUseCase } from '../../../../application/use-cases/configuracion/ValidarPlanEstudiosUseCase.js';
import { CreatePlanEstudiosUseCase } from '../../../../application/use-cases/configuracion/CreatePlanEstudiosUseCase.js';
import { UpdatePlanEstudiosUseCase } from '../../../../application/use-cases/configuracion/UpdatePlanEstudiosUseCase.js';
import { MarcarPlanEstudiosVigenteUseCase } from '../../../../application/use-cases/configuracion/MarcarPlanEstudiosVigenteUseCase.js';
import { ListPeriodosByPlanUseCase } from '../../../../application/use-cases/configuracion/ListPeriodosByPlanUseCase.js';
import { CreatePeriodoUseCase } from '../../../../application/use-cases/configuracion/CreatePeriodoUseCase.js';
import { UpdatePeriodoUseCase } from '../../../../application/use-cases/configuracion/UpdatePeriodoUseCase.js';
import { DeletePeriodoUseCase } from '../../../../application/use-cases/configuracion/DeletePeriodoUseCase.js';
import { ListAsignaturasPlanByPlanUseCase } from '../../../../application/use-cases/configuracion/ListAsignaturasPlanByPlanUseCase.js';
import { ListAsignaturasPlanByPeriodoUseCase } from '../../../../application/use-cases/configuracion/ListAsignaturasPlanByPeriodoUseCase.js';
import { CreateAsignaturaPlanUseCase } from '../../../../application/use-cases/configuracion/CreateAsignaturaPlanUseCase.js';
import { UpdateAsignaturaPlanUseCase } from '../../../../application/use-cases/configuracion/UpdateAsignaturaPlanUseCase.js';
import { DeleteAsignaturaPlanUseCase } from '../../../../application/use-cases/configuracion/DeleteAsignaturaPlanUseCase.js';
import { ListPrerrequisitosByAsignaturaUseCase } from '../../../../application/use-cases/configuracion/ListPrerrequisitosByAsignaturaUseCase.js';
import { ListEsPrerrequisitoDeUseCase } from '../../../../application/use-cases/configuracion/ListEsPrerrequisitoDeUseCase.js';
import { CreatePrerrequisitoUseCase } from '../../../../application/use-cases/configuracion/CreatePrerrequisitoUseCase.js';
import { DeletePrerrequisitoUseCase } from '../../../../application/use-cases/configuracion/DeletePrerrequisitoUseCase.js';

import {
  ListPlanesEstudiosController,
  GetPlanEstudiosByIdController,
  GetPlanEstudiosMatrizController,
  ValidarPlanEstudiosController,
  CreatePlanEstudiosController,
  UpdatePlanEstudiosController,
  MarcarPlanEstudiosVigenteController,
  ListPeriodosByPlanController,
  CreatePeriodoController,
  UpdatePeriodoController,
  DeletePeriodoController,
  ListAsignaturasPlanByPlanController,
  ListAsignaturasPlanByPeriodoController,
  CreateAsignaturaPlanController,
  UpdateAsignaturaPlanController,
  DeleteAsignaturaPlanController,
  ListPrerrequisitosByAsignaturaController,
  ListEsPrerrequisitoDeController,
  CreatePrerrequisitoController,
  DeletePrerrequisitoController,
} from '../../../../presentation/controllers/configuracion/index.js';

export function registerPlanesEstudiosResource(container) {
  // Use cases
  registerComponent(container, CONFIGURACION_TOKENS.listPlanesEstudiosUseCase, (c) => new ListPlanesEstudiosUseCase({
    studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.getPlanEstudiosByIdUseCase, (c) => new GetPlanEstudiosByIdUseCase({
    studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
    periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    prerequisiteRepository: c.resolve(REPOSITORIOS_TOKENS.prerequisiteRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.getPlanEstudiosMatrizUseCase, (c) => new GetPlanEstudiosMatrizUseCase({
    studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
    careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
    periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.validarPlanEstudiosUseCase, (c) => new ValidarPlanEstudiosUseCase({
    studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
    periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.createPlanEstudiosUseCase, (c) => new CreatePlanEstudiosUseCase({
    studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.updatePlanEstudiosUseCase, (c) => new UpdatePlanEstudiosUseCase({
    studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.marcarPlanEstudiosVigenteUseCase, (c) => new MarcarPlanEstudiosVigenteUseCase({
    studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listPeriodosByPlanUseCase, (c) => new ListPeriodosByPlanUseCase({
    periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.createPeriodoUseCase, (c) => new CreatePeriodoUseCase({
    periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.updatePeriodoUseCase, (c) => new UpdatePeriodoUseCase({
    periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.deletePeriodoUseCase, (c) => new DeletePeriodoUseCase({
    periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listAsignaturasPlanByPlanUseCase, (c) => new ListAsignaturasPlanByPlanUseCase({
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listAsignaturasPlanByPeriodoUseCase, (c) => new ListAsignaturasPlanByPeriodoUseCase({
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.createAsignaturaPlanUseCase, (c) => new CreateAsignaturaPlanUseCase({
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.updateAsignaturaPlanUseCase, (c) => new UpdateAsignaturaPlanUseCase({
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.deleteAsignaturaPlanUseCase, (c) => new DeleteAsignaturaPlanUseCase({
    planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listPrerrequisitosByAsignaturaUseCase, (c) => new ListPrerrequisitosByAsignaturaUseCase({
    prerequisiteRepository: c.resolve(REPOSITORIOS_TOKENS.prerequisiteRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listEsPrerrequisitoDeUseCase, (c) => new ListEsPrerrequisitoDeUseCase({
    prerequisiteRepository: c.resolve(REPOSITORIOS_TOKENS.prerequisiteRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.createPrerrequisitoUseCase, (c) => new CreatePrerrequisitoUseCase({
    prerequisiteRepository: c.resolve(REPOSITORIOS_TOKENS.prerequisiteRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.deletePrerrequisitoUseCase, (c) => new DeletePrerrequisitoUseCase({
    prerequisiteRepository: c.resolve(REPOSITORIOS_TOKENS.prerequisiteRepository),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
  }));

  // Controllers
  registerComponent(container, CONFIGURACION_TOKENS.listPlanesEstudiosController, (c) => new ListPlanesEstudiosController({
    listPlanesEstudiosUseCase: c.resolve(CONFIGURACION_TOKENS.listPlanesEstudiosUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.getPlanEstudiosByIdController, (c) => new GetPlanEstudiosByIdController({
    getPlanEstudiosByIdUseCase: c.resolve(CONFIGURACION_TOKENS.getPlanEstudiosByIdUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.getPlanEstudiosMatrizController, (c) => new GetPlanEstudiosMatrizController({
    getPlanEstudiosMatrizUseCase: c.resolve(CONFIGURACION_TOKENS.getPlanEstudiosMatrizUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.validarPlanEstudiosController, (c) => new ValidarPlanEstudiosController({
    validarPlanEstudiosUseCase: c.resolve(CONFIGURACION_TOKENS.validarPlanEstudiosUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.createPlanEstudiosController, (c) => new CreatePlanEstudiosController({
    createPlanEstudiosUseCase: c.resolve(CONFIGURACION_TOKENS.createPlanEstudiosUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.updatePlanEstudiosController, (c) => new UpdatePlanEstudiosController({
    updatePlanEstudiosUseCase: c.resolve(CONFIGURACION_TOKENS.updatePlanEstudiosUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.marcarPlanEstudiosVigenteController, (c) => new MarcarPlanEstudiosVigenteController({
    marcarPlanEstudiosVigenteUseCase: c.resolve(CONFIGURACION_TOKENS.marcarPlanEstudiosVigenteUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listPeriodosByPlanController, (c) => new ListPeriodosByPlanController({
    listPeriodosByPlanUseCase: c.resolve(CONFIGURACION_TOKENS.listPeriodosByPlanUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.createPeriodoController, (c) => new CreatePeriodoController({
    createPeriodoUseCase: c.resolve(CONFIGURACION_TOKENS.createPeriodoUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.updatePeriodoController, (c) => new UpdatePeriodoController({
    updatePeriodoUseCase: c.resolve(CONFIGURACION_TOKENS.updatePeriodoUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.deletePeriodoController, (c) => new DeletePeriodoController({
    deletePeriodoUseCase: c.resolve(CONFIGURACION_TOKENS.deletePeriodoUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listAsignaturasPlanByPlanController, (c) => new ListAsignaturasPlanByPlanController({
    listAsignaturasPlanByPlanUseCase: c.resolve(CONFIGURACION_TOKENS.listAsignaturasPlanByPlanUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.listAsignaturasPlanByPeriodoController, (c) => new ListAsignaturasPlanByPeriodoController({
    listAsignaturasPlanByPeriodoUseCase: c.resolve(CONFIGURACION_TOKENS.listAsignaturasPlanByPeriodoUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.createAsignaturaPlanController, (c) => new CreateAsignaturaPlanController({
    createAsignaturaPlanUseCase: c.resolve(CONFIGURACION_TOKENS.createAsignaturaPlanUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.updateAsignaturaPlanController, (c) => new UpdateAsignaturaPlanController({
    updateAsignaturaPlanUseCase: c.resolve(CONFIGURACION_TOKENS.updateAsignaturaPlanUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.deleteAsignaturaPlanController, (c) => new DeleteAsignaturaPlanController({
    deleteAsignaturaPlanUseCase: c.resolve(CONFIGURACION_TOKENS.deleteAsignaturaPlanUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  registerComponent(container, CONFIGURACION_TOKENS.listPrerrequisitosByAsignaturaController, (c) => new ListPrerrequisitosByAsignaturaController({
    listPrerrequisitosByAsignaturaUseCase: c.resolve(CONFIGURACION_TOKENS.listPrerrequisitosByAsignaturaUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.listEsPrerrequisitoDeController, (c) => new ListEsPrerrequisitoDeController({
    listEsPrerrequisitoDeUseCase: c.resolve(CONFIGURACION_TOKENS.listEsPrerrequisitoDeUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.createPrerrequisitoController, (c) => new CreatePrerrequisitoController({
    createPrerrequisitoUseCase: c.resolve(CONFIGURACION_TOKENS.createPrerrequisitoUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));
  registerComponent(container, CONFIGURACION_TOKENS.deletePrerrequisitoController, (c) => new DeletePrerrequisitoController({
    deletePrerrequisitoUseCase: c.resolve(CONFIGURACION_TOKENS.deletePrerrequisitoUseCase),
    logger: c.resolve(SERVICIOS_TOKENS.logger),
    responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
  }));

  // Router
  registerComponent(container, CONFIGURACION_TOKENS.planesEstudiosRouter, (c) => {
    const controllers = {
      listPlanesEstudiosController: c.resolve(CONFIGURACION_TOKENS.listPlanesEstudiosController),
      getPlanEstudiosByIdController: c.resolve(CONFIGURACION_TOKENS.getPlanEstudiosByIdController),
      getPlanEstudiosMatrizController: c.resolve(CONFIGURACION_TOKENS.getPlanEstudiosMatrizController),
      validarPlanEstudiosController: c.resolve(CONFIGURACION_TOKENS.validarPlanEstudiosController),
      createPlanEstudiosController: c.resolve(CONFIGURACION_TOKENS.createPlanEstudiosController),
      updatePlanEstudiosController: c.resolve(CONFIGURACION_TOKENS.updatePlanEstudiosController),
      marcarPlanEstudiosVigenteController: c.resolve(CONFIGURACION_TOKENS.marcarPlanEstudiosVigenteController),
      listPeriodosByPlanController: c.resolve(CONFIGURACION_TOKENS.listPeriodosByPlanController),
      createPeriodoController: c.resolve(CONFIGURACION_TOKENS.createPeriodoController),
      updatePeriodoController: c.resolve(CONFIGURACION_TOKENS.updatePeriodoController),
      deletePeriodoController: c.resolve(CONFIGURACION_TOKENS.deletePeriodoController),
      listAsignaturasPlanByPlanController: c.resolve(CONFIGURACION_TOKENS.listAsignaturasPlanByPlanController),
      listAsignaturasPlanByPeriodoController: c.resolve(CONFIGURACION_TOKENS.listAsignaturasPlanByPeriodoController),
      createAsignaturaPlanController: c.resolve(CONFIGURACION_TOKENS.createAsignaturaPlanController),
      updateAsignaturaPlanController: c.resolve(CONFIGURACION_TOKENS.updateAsignaturaPlanController),
      deleteAsignaturaPlanController: c.resolve(CONFIGURACION_TOKENS.deleteAsignaturaPlanController),
      listPrerrequisitosByAsignaturaController: c.resolve(CONFIGURACION_TOKENS.listPrerrequisitosByAsignaturaController),
      listEsPrerrequisitoDeController: c.resolve(CONFIGURACION_TOKENS.listEsPrerrequisitoDeController),
      createPrerrequisitoController: c.resolve(CONFIGURACION_TOKENS.createPrerrequisitoController),
      deletePrerrequisitoController: c.resolve(CONFIGURACION_TOKENS.deletePrerrequisitoController),
    };

    const middlewares = { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) };
    return buildPlanesEstudiosRouter({ controllers, middlewares });
  });

  registerComponent(container, CONFIGURACION_TOKENS.periodosRouter, (c) => {
    const controllers = {
      updatePeriodoController: c.resolve(CONFIGURACION_TOKENS.updatePeriodoController),
      deletePeriodoController: c.resolve(CONFIGURACION_TOKENS.deletePeriodoController),
      listAsignaturasPlanByPeriodoController: c.resolve(CONFIGURACION_TOKENS.listAsignaturasPlanByPeriodoController),
    };
    const middlewares = { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) };
    return buildPeriodosRouter({ controllers, middlewares });
  });

  registerComponent(container, CONFIGURACION_TOKENS.asignaturasPlanRouter, (c) => {
    const controllers = {
      createAsignaturaPlanController: c.resolve(CONFIGURACION_TOKENS.createAsignaturaPlanController),
      updateAsignaturaPlanController: c.resolve(CONFIGURACION_TOKENS.updateAsignaturaPlanController),
      deleteAsignaturaPlanController: c.resolve(CONFIGURACION_TOKENS.deleteAsignaturaPlanController),
      listPrerrequisitosByAsignaturaController: c.resolve(CONFIGURACION_TOKENS.listPrerrequisitosByAsignaturaController),
      listEsPrerrequisitoDeController: c.resolve(CONFIGURACION_TOKENS.listEsPrerrequisitoDeController),
    };
    const middlewares = { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) };
    return buildAsignaturasPlanRouter({ controllers, middlewares });
  });

  registerComponent(container, CONFIGURACION_TOKENS.prerrequisitosRouter, (c) => {
    const controllers = {
      createPrerrequisitoController: c.resolve(CONFIGURACION_TOKENS.createPrerrequisitoController),
      deletePrerrequisitoController: c.resolve(CONFIGURACION_TOKENS.deletePrerrequisitoController),
    };
    const middlewares = { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) };
    return buildPrerrequisitosRouter({ controllers, middlewares });
  });

  return container;
}

