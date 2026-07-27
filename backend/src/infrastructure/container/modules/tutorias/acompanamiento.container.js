/**
 * Registro de dependencias del recurso Acompañamiento Pedagógico (módulo TUT)
 *
 * Responsabilidades:
 * - Registrar Use Cases del sub-módulo de acompañamiento (A1-A11)
 * - Registrar Controllers correspondientes
 * - Construir y registrar el router /acompanamiento
 *
 * Principio SRP: cada container maneja solo UN recurso. Los repositorios del
 * módulo (TUTORIAS_TOKENS.*Repository) se registran en ./index.js; catálogos
 * reutilizados de REPOSITORIOS_TOKENS y PDF de SERVICIOS_TOKENS.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { TUTORIAS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListAlertasRiesgoUseCase } from '../../../../application/use-cases/tutorias/ListAlertasRiesgoUseCase.js';
import { ListMisAlertasRiesgoDocenteUseCase } from '../../../../application/use-cases/tutorias/ListMisAlertasRiesgoDocenteUseCase.js';
import { GetAlertaRiesgoEstudianteUseCase } from '../../../../application/use-cases/tutorias/GetAlertaRiesgoEstudianteUseCase.js';
import { ListSesionesRefuerzoUseCase } from '../../../../application/use-cases/tutorias/ListSesionesRefuerzoUseCase.js';
import { GetSesionRefuerzoByIdUseCase } from '../../../../application/use-cases/tutorias/GetSesionRefuerzoByIdUseCase.js';
import { CreateSesionRefuerzoUseCase } from '../../../../application/use-cases/tutorias/CreateSesionRefuerzoUseCase.js';
import { UpdateSesionRefuerzoUseCase } from '../../../../application/use-cases/tutorias/UpdateSesionRefuerzoUseCase.js';
import { DeleteSesionRefuerzoUseCase } from '../../../../application/use-cases/tutorias/DeleteSesionRefuerzoUseCase.js';
import { RegisterAsistenciaSesionUseCase } from '../../../../application/use-cases/tutorias/RegisterAsistenciaSesionUseCase.js';
import { GetPanelAcompanamientoUseCase } from '../../../../application/use-cases/tutorias/GetPanelAcompanamientoUseCase.js';
import { ExportPanelAcompanamientoPdfUseCase } from '../../../../application/use-cases/tutorias/ExportPanelAcompanamientoPdfUseCase.js';
import {
  ListAlertasRiesgoController,
  ListMisAlertasRiesgoDocenteController,
  GetAlertaRiesgoEstudianteController,
  ListSesionesRefuerzoController,
  GetSesionRefuerzoByIdController,
  CreateSesionRefuerzoController,
  UpdateSesionRefuerzoController,
  DeleteSesionRefuerzoController,
  RegisterAsistenciaSesionController,
  GetPanelAcompanamientoController,
  ExportPanelAcompanamientoController,
} from '../../../../presentation/controllers/tutorias/index.js';
import { buildAcompanamientoRouter } from '../../../../presentation/routes/acompanamiento.routes.js';

export function registerAcompanamientoResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    TUTORIAS_TOKENS.listAlertasRiesgoUseCase,
    (c) =>
      new ListAlertasRiesgoUseCase({
        riesgoAcademicoViewRepository: c.resolve(TUTORIAS_TOKENS.riesgoAcademicoViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.listMisAlertasRiesgoDocenteUseCase,
    (c) =>
      new ListMisAlertasRiesgoDocenteUseCase({
        riesgoAcademicoViewRepository: c.resolve(TUTORIAS_TOKENS.riesgoAcademicoViewRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.getAlertaRiesgoEstudianteUseCase,
    (c) =>
      new GetAlertaRiesgoEstudianteUseCase({
        riesgoAcademicoViewRepository: c.resolve(TUTORIAS_TOKENS.riesgoAcademicoViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.listSesionesRefuerzoUseCase,
    (c) =>
      new ListSesionesRefuerzoUseCase({
        acompanamientoSesionViewRepository: c.resolve(
          TUTORIAS_TOKENS.acompanamientoSesionViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.getSesionRefuerzoByIdUseCase,
    (c) =>
      new GetSesionRefuerzoByIdUseCase({
        acompanamientoSesionViewRepository: c.resolve(
          TUTORIAS_TOKENS.acompanamientoSesionViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.createSesionRefuerzoUseCase,
    (c) =>
      new CreateSesionRefuerzoUseCase({
        sesionRefuerzoRepository: c.resolve(TUTORIAS_TOKENS.sesionRefuerzoRepository),
        sesionRefuerzoEstudianteRepository: c.resolve(
          TUTORIAS_TOKENS.sesionRefuerzoEstudianteRepository
        ),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.updateSesionRefuerzoUseCase,
    (c) =>
      new UpdateSesionRefuerzoUseCase({
        sesionRefuerzoRepository: c.resolve(TUTORIAS_TOKENS.sesionRefuerzoRepository),
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.deleteSesionRefuerzoUseCase,
    (c) =>
      new DeleteSesionRefuerzoUseCase({
        sesionRefuerzoRepository: c.resolve(TUTORIAS_TOKENS.sesionRefuerzoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.registerAsistenciaSesionUseCase,
    (c) =>
      new RegisterAsistenciaSesionUseCase({
        sesionRefuerzoRepository: c.resolve(TUTORIAS_TOKENS.sesionRefuerzoRepository),
        sesionRefuerzoEstudianteRepository: c.resolve(
          TUTORIAS_TOKENS.sesionRefuerzoEstudianteRepository
        ),
        acompanamientoSesionViewRepository: c.resolve(
          TUTORIAS_TOKENS.acompanamientoSesionViewRepository
        ),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.getPanelAcompanamientoUseCase,
    (c) =>
      new GetPanelAcompanamientoUseCase({
        riesgoAcademicoViewRepository: c.resolve(TUTORIAS_TOKENS.riesgoAcademicoViewRepository),
        acompanamientoSesionViewRepository: c.resolve(
          TUTORIAS_TOKENS.acompanamientoSesionViewRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.exportPanelAcompanamientoPdfUseCase,
    (c) =>
      new ExportPanelAcompanamientoPdfUseCase({
        getPanelAcompanamientoUseCase: c.resolve(TUTORIAS_TOKENS.getPanelAcompanamientoUseCase),
        panelAcompanamientoPdfGenerator: c.resolve(
          SERVICIOS_TOKENS.panelAcompanamientoPdfGenerator
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  const controllerFactories = [
    [
      TUTORIAS_TOKENS.listAlertasRiesgoController,
      (c) =>
        new ListAlertasRiesgoController({
          listAlertasRiesgoUseCase: c.resolve(TUTORIAS_TOKENS.listAlertasRiesgoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.listMisAlertasRiesgoDocenteController,
      (c) =>
        new ListMisAlertasRiesgoDocenteController({
          listMisAlertasRiesgoDocenteUseCase: c.resolve(
            TUTORIAS_TOKENS.listMisAlertasRiesgoDocenteUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.getAlertaRiesgoEstudianteController,
      (c) =>
        new GetAlertaRiesgoEstudianteController({
          getAlertaRiesgoEstudianteUseCase: c.resolve(
            TUTORIAS_TOKENS.getAlertaRiesgoEstudianteUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.listSesionesRefuerzoController,
      (c) =>
        new ListSesionesRefuerzoController({
          listSesionesRefuerzoUseCase: c.resolve(
            TUTORIAS_TOKENS.listSesionesRefuerzoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.getSesionRefuerzoByIdController,
      (c) =>
        new GetSesionRefuerzoByIdController({
          getSesionRefuerzoByIdUseCase: c.resolve(
            TUTORIAS_TOKENS.getSesionRefuerzoByIdUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.createSesionRefuerzoController,
      (c) =>
        new CreateSesionRefuerzoController({
          createSesionRefuerzoUseCase: c.resolve(
            TUTORIAS_TOKENS.createSesionRefuerzoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.updateSesionRefuerzoController,
      (c) =>
        new UpdateSesionRefuerzoController({
          updateSesionRefuerzoUseCase: c.resolve(
            TUTORIAS_TOKENS.updateSesionRefuerzoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.deleteSesionRefuerzoController,
      (c) =>
        new DeleteSesionRefuerzoController({
          deleteSesionRefuerzoUseCase: c.resolve(
            TUTORIAS_TOKENS.deleteSesionRefuerzoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.registerAsistenciaSesionController,
      (c) =>
        new RegisterAsistenciaSesionController({
          registerAsistenciaSesionUseCase: c.resolve(
            TUTORIAS_TOKENS.registerAsistenciaSesionUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.getPanelAcompanamientoController,
      (c) =>
        new GetPanelAcompanamientoController({
          getPanelAcompanamientoUseCase: c.resolve(TUTORIAS_TOKENS.getPanelAcompanamientoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.exportPanelAcompanamientoController,
      (c) =>
        new ExportPanelAcompanamientoController({
          exportPanelAcompanamientoPdfUseCase: c.resolve(
            TUTORIAS_TOKENS.exportPanelAcompanamientoPdfUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
  ];

  for (const [token, factory] of controllerFactories) {
    registerComponent(container, token, factory);
  }

  // ============================================
  // ROUTER
  // ============================================
  registerComponent(container, TUTORIAS_TOKENS.acompanamientoRouter, (c) => {
    const controllers = {
      listAlertasRiesgoController: c.resolve(TUTORIAS_TOKENS.listAlertasRiesgoController),
      listMisAlertasRiesgoDocenteController: c.resolve(
        TUTORIAS_TOKENS.listMisAlertasRiesgoDocenteController
      ),
      getAlertaRiesgoEstudianteController: c.resolve(
        TUTORIAS_TOKENS.getAlertaRiesgoEstudianteController
      ),
      listSesionesRefuerzoController: c.resolve(
        TUTORIAS_TOKENS.listSesionesRefuerzoController
      ),
      getSesionRefuerzoByIdController: c.resolve(
        TUTORIAS_TOKENS.getSesionRefuerzoByIdController
      ),
      createSesionRefuerzoController: c.resolve(
        TUTORIAS_TOKENS.createSesionRefuerzoController
      ),
      updateSesionRefuerzoController: c.resolve(
        TUTORIAS_TOKENS.updateSesionRefuerzoController
      ),
      deleteSesionRefuerzoController: c.resolve(
        TUTORIAS_TOKENS.deleteSesionRefuerzoController
      ),
      registerAsistenciaSesionController: c.resolve(
        TUTORIAS_TOKENS.registerAsistenciaSesionController
      ),
      getPanelAcompanamientoController: c.resolve(TUTORIAS_TOKENS.getPanelAcompanamientoController),
      exportPanelAcompanamientoController: c.resolve(
        TUTORIAS_TOKENS.exportPanelAcompanamientoController
      ),
    };

    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };

    return buildAcompanamientoRouter({ controllers, middlewares });
  });

  return container;
}
