/**
 * Recurso Oferta Académica (Sprint 3)
 */
import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';

import { MarcarGestionVigenteUseCase } from '../../../../application/use-cases/oferta/MarcarGestionVigenteUseCase.js';
import { ListPlanesHabilitadosByGestionUseCase } from '../../../../application/use-cases/oferta/ListPlanesHabilitadosByGestionUseCase.js';
import { CreateGestionPlanUseCase } from '../../../../application/use-cases/oferta/CreateGestionPlanUseCase.js';
import { UpdateGestionPlanEstadoUseCase } from '../../../../application/use-cases/oferta/UpdateGestionPlanEstadoUseCase.js';
import { ListParalelosGestionByGestionPlanUseCase } from '../../../../application/use-cases/oferta/ListParalelosGestionByGestionPlanUseCase.js';
import { GenerarParalelosGestionUseCase } from '../../../../application/use-cases/oferta/GenerarParalelosGestionUseCase.js';
import { GetParaleloGestionByIdUseCase } from '../../../../application/use-cases/oferta/GetParaleloGestionByIdUseCase.js';
import { UpdateParaleloGestionUseCase } from '../../../../application/use-cases/oferta/UpdateParaleloGestionUseCase.js';
import { CambiarTurnoParaleloGestionUseCase } from '../../../../application/use-cases/oferta/CambiarTurnoParaleloGestionUseCase.js';
import { ValidarOfertaParaleloGestionUseCase } from '../../../../application/use-cases/oferta/ValidarOfertaParaleloGestionUseCase.js';
import { UpdateParaleloGestionEstadoUseCase } from '../../../../application/use-cases/oferta/UpdateParaleloGestionEstadoUseCase.js';
import { ListOfertaCursosByParaleloGestionUseCase } from '../../../../application/use-cases/oferta/ListOfertaCursosByParaleloGestionUseCase.js';
import { GenerarOfertaCursosUseCase } from '../../../../application/use-cases/oferta/GenerarOfertaCursosUseCase.js';
import { CreateOfertaCursoUseCase } from '../../../../application/use-cases/oferta/CreateOfertaCursoUseCase.js';
import { UpdateOfertaCursoEstadoUseCase } from '../../../../application/use-cases/oferta/UpdateOfertaCursoEstadoUseCase.js';
import { DeleteOfertaCursoUseCase } from '../../../../application/use-cases/oferta/DeleteOfertaCursoUseCase.js';

import {
  MarcarGestionVigenteController,
  ListPlanesHabilitadosByGestionController,
  CreateGestionPlanController,
  UpdateGestionPlanEstadoController,
  ListParalelosGestionByGestionPlanController,
  GenerarParalelosGestionController,
  GetParaleloGestionByIdController,
  UpdateParaleloGestionController,
  CambiarTurnoParaleloGestionController,
  UpdateParaleloGestionEstadoController,
  ValidarOfertaParaleloGestionController,
  ListOfertaCursosByParaleloGestionController,
  GenerarOfertaCursosController,
  CreateOfertaCursoController,
  UpdateOfertaCursoEstadoController,
  DeleteOfertaCursoController,
} from '../../../../presentation/controllers/oferta/oferta-academica.controllers.js';

import { buildGestionesPlanesRouter } from '../../../../presentation/routes/gestiones-planes.routes.js';
import { buildParalelosGestionRouter } from '../../../../presentation/routes/paralelos-gestion.routes.js';
import { buildOfertaCursosRouter } from '../../../../presentation/routes/oferta-cursos.routes.js';

function registerOfertaUseCases(container) {
  registerComponent(container, ACADEMICO_TOKENS.marcarGestionVigenteUseCase, (c) =>
    new MarcarGestionVigenteUseCase({
      managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.listPlanesHabilitadosByGestionUseCase, (c) =>
    new ListPlanesHabilitadosByGestionUseCase({
      managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
      managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.createGestionPlanUseCase, (c) =>
    new CreateGestionPlanUseCase({
      managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
      managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
      studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.updateGestionPlanEstadoUseCase, (c) =>
    new UpdateGestionPlanEstadoUseCase({
      managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.listParalelosGestionByGestionPlanUseCase, (c) =>
    new ListParalelosGestionByGestionPlanUseCase({
      managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.generarParalelosGestionUseCase, (c) =>
    new GenerarParalelosGestionUseCase({
      managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
      studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
      parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.getParaleloGestionByIdUseCase, (c) =>
    new GetParaleloGestionByIdUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.updateParaleloGestionUseCase, (c) =>
    new UpdateParaleloGestionUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.cambiarTurnoParaleloGestionUseCase, (c) =>
    new CambiarTurnoParaleloGestionUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.validarOfertaParaleloGestionUseCase, (c) =>
    new ValidarOfertaParaleloGestionUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.updateParaleloGestionEstadoUseCase, (c) =>
    new UpdateParaleloGestionEstadoUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      validarOfertaParaleloGestionUseCase: c.resolve(
        ACADEMICO_TOKENS.validarOfertaParaleloGestionUseCase
      ),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.listOfertaCursosByParaleloGestionUseCase, (c) =>
    new ListOfertaCursosByParaleloGestionUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.generarOfertaCursosUseCase, (c) =>
    new GenerarOfertaCursosUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
      courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.createOfertaCursoUseCase, (c) =>
    new CreateOfertaCursoUseCase({
      parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
      planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
      courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.updateOfertaCursoEstadoUseCase, (c) =>
    new UpdateOfertaCursoEstadoUseCase({
      courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.deleteOfertaCursoUseCase, (c) =>
    new DeleteOfertaCursoUseCase({
      courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    })
  );
}

function registerOfertaControllers(container) {
  const rf = (c) => c.resolve(SERVICIOS_TOKENS.responseFormatter);

  registerComponent(
    container,
    ACADEMICO_TOKENS.marcarGestionVigenteController,
    (c) =>
      new MarcarGestionVigenteController({
        useCase: c.resolve(ACADEMICO_TOKENS.marcarGestionVigenteUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listPlanesHabilitadosByGestionController,
    (c) =>
      new ListPlanesHabilitadosByGestionController({
        useCase: c.resolve(ACADEMICO_TOKENS.listPlanesHabilitadosByGestionUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createGestionPlanController,
    (c) =>
      new CreateGestionPlanController({
        useCase: c.resolve(ACADEMICO_TOKENS.createGestionPlanUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateGestionPlanEstadoController,
    (c) =>
      new UpdateGestionPlanEstadoController({
        useCase: c.resolve(ACADEMICO_TOKENS.updateGestionPlanEstadoUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listParalelosGestionByGestionPlanController,
    (c) =>
      new ListParalelosGestionByGestionPlanController({
        useCase: c.resolve(ACADEMICO_TOKENS.listParalelosGestionByGestionPlanUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.generarParalelosGestionController,
    (c) =>
      new GenerarParalelosGestionController({
        useCase: c.resolve(ACADEMICO_TOKENS.generarParalelosGestionUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getParaleloGestionByIdController,
    (c) =>
      new GetParaleloGestionByIdController({
        useCase: c.resolve(ACADEMICO_TOKENS.getParaleloGestionByIdUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateParaleloGestionController,
    (c) =>
      new UpdateParaleloGestionController({
        useCase: c.resolve(ACADEMICO_TOKENS.updateParaleloGestionUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cambiarTurnoParaleloGestionController,
    (c) =>
      new CambiarTurnoParaleloGestionController({
        useCase: c.resolve(ACADEMICO_TOKENS.cambiarTurnoParaleloGestionUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateParaleloGestionEstadoController,
    (c) =>
      new UpdateParaleloGestionEstadoController({
        useCase: c.resolve(ACADEMICO_TOKENS.updateParaleloGestionEstadoUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.validarOfertaParaleloGestionController,
    (c) =>
      new ValidarOfertaParaleloGestionController({
        useCase: c.resolve(ACADEMICO_TOKENS.validarOfertaParaleloGestionUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listOfertaCursosByParaleloGestionController,
    (c) =>
      new ListOfertaCursosByParaleloGestionController({
        useCase: c.resolve(ACADEMICO_TOKENS.listOfertaCursosByParaleloGestionUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.generarOfertaCursosController,
    (c) =>
      new GenerarOfertaCursosController({
        useCase: c.resolve(ACADEMICO_TOKENS.generarOfertaCursosUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createOfertaCursoController,
    (c) =>
      new CreateOfertaCursoController({
        useCase: c.resolve(ACADEMICO_TOKENS.createOfertaCursoUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateOfertaCursoEstadoController,
    (c) =>
      new UpdateOfertaCursoEstadoController({
        useCase: c.resolve(ACADEMICO_TOKENS.updateOfertaCursoEstadoUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteOfertaCursoController,
    (c) =>
      new DeleteOfertaCursoController({
        useCase: c.resolve(ACADEMICO_TOKENS.deleteOfertaCursoUseCase),
        responseFormatter: rf(c),
      })
  );
}

export function registerOfertaAcademicaResource(container) {
  registerOfertaUseCases(container);
  registerOfertaControllers(container);

  const ofertaControllers = (c) => ({
    marcarGestionVigenteController: c.resolve(ACADEMICO_TOKENS.marcarGestionVigenteController),
    listPlanesHabilitadosByGestionController: c.resolve(
      ACADEMICO_TOKENS.listPlanesHabilitadosByGestionController
    ),
    createGestionPlanController: c.resolve(ACADEMICO_TOKENS.createGestionPlanController),
    updateGestionPlanEstadoController: c.resolve(
      ACADEMICO_TOKENS.updateGestionPlanEstadoController
    ),
    listParalelosGestionByGestionPlanController: c.resolve(
      ACADEMICO_TOKENS.listParalelosGestionByGestionPlanController
    ),
    generarParalelosGestionController: c.resolve(ACADEMICO_TOKENS.generarParalelosGestionController),
    getParaleloGestionByIdController: c.resolve(ACADEMICO_TOKENS.getParaleloGestionByIdController),
    updateParaleloGestionController: c.resolve(ACADEMICO_TOKENS.updateParaleloGestionController),
    cambiarTurnoParaleloGestionController: c.resolve(
      ACADEMICO_TOKENS.cambiarTurnoParaleloGestionController
    ),
    updateParaleloGestionEstadoController: c.resolve(
      ACADEMICO_TOKENS.updateParaleloGestionEstadoController
    ),
    validarOfertaParaleloGestionController: c.resolve(
      ACADEMICO_TOKENS.validarOfertaParaleloGestionController
    ),
    listOfertaCursosByParaleloGestionController: c.resolve(
      ACADEMICO_TOKENS.listOfertaCursosByParaleloGestionController
    ),
    generarOfertaCursosController: c.resolve(ACADEMICO_TOKENS.generarOfertaCursosController),
    createOfertaCursoController: c.resolve(ACADEMICO_TOKENS.createOfertaCursoController),
    updateOfertaCursoEstadoController: c.resolve(ACADEMICO_TOKENS.updateOfertaCursoEstadoController),
    deleteOfertaCursoController: c.resolve(ACADEMICO_TOKENS.deleteOfertaCursoController),
  });

  const middlewares = (c) => ({
    validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
  });

  registerComponent(container, ACADEMICO_TOKENS.gestionesPlanesRouter, (c) =>
    buildGestionesPlanesRouter({
      controllers: ofertaControllers(c),
      middlewares: middlewares(c),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.paralelosGestionRouter, (c) =>
    buildParalelosGestionRouter({
      controllers: ofertaControllers(c),
      middlewares: middlewares(c),
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.ofertaCursosRouter, (c) =>
    buildOfertaCursosRouter({
      controllers: ofertaControllers(c),
      middlewares: middlewares(c),
    })
  );

  return container;
}

/** Controllers de oferta usados también en gestiones.routes */
export function getOfertaGestionesControllers(container) {
  return {
    marcarGestionVigenteController: container.resolve(
      ACADEMICO_TOKENS.marcarGestionVigenteController
    ),
    listPlanesHabilitadosByGestionController: container.resolve(
      ACADEMICO_TOKENS.listPlanesHabilitadosByGestionController
    ),
  };
}
