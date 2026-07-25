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
import { ListSesionesReforzamientoUseCase } from '../../../../application/use-cases/tutorias/ListSesionesReforzamientoUseCase.js';
import { GetSesionReforzamientoByIdUseCase } from '../../../../application/use-cases/tutorias/GetSesionReforzamientoByIdUseCase.js';
import { CreateSesionReforzamientoUseCase } from '../../../../application/use-cases/tutorias/CreateSesionReforzamientoUseCase.js';
import { UpdateSesionReforzamientoUseCase } from '../../../../application/use-cases/tutorias/UpdateSesionReforzamientoUseCase.js';
import { DeleteSesionReforzamientoUseCase } from '../../../../application/use-cases/tutorias/DeleteSesionReforzamientoUseCase.js';
import { RegisterAsistenciaSesionUseCase } from '../../../../application/use-cases/tutorias/RegisterAsistenciaSesionUseCase.js';
import { GetPanelAcompanamientoUseCase } from '../../../../application/use-cases/tutorias/GetPanelAcompanamientoUseCase.js';
import { ExportPanelAcompanamientoPdfUseCase } from '../../../../application/use-cases/tutorias/ExportPanelAcompanamientoPdfUseCase.js';
import {
  ListAlertasRiesgoController,
  ListMisAlertasRiesgoDocenteController,
  GetAlertaRiesgoEstudianteController,
  ListSesionesReforzamientoController,
  GetSesionReforzamientoByIdController,
  CreateSesionReforzamientoController,
  UpdateSesionReforzamientoController,
  DeleteSesionReforzamientoController,
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
    TUTORIAS_TOKENS.listSesionesReforzamientoUseCase,
    (c) =>
      new ListSesionesReforzamientoUseCase({
        acompanamientoSesionViewRepository: c.resolve(
          TUTORIAS_TOKENS.acompanamientoSesionViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.getSesionReforzamientoByIdUseCase,
    (c) =>
      new GetSesionReforzamientoByIdUseCase({
        acompanamientoSesionViewRepository: c.resolve(
          TUTORIAS_TOKENS.acompanamientoSesionViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.createSesionReforzamientoUseCase,
    (c) =>
      new CreateSesionReforzamientoUseCase({
        sesionReforzamientoRepository: c.resolve(TUTORIAS_TOKENS.sesionReforzamientoRepository),
        sesionReforzamientoParticipanteRepository: c.resolve(
          TUTORIAS_TOKENS.sesionReforzamientoParticipanteRepository
        ),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.updateSesionReforzamientoUseCase,
    (c) =>
      new UpdateSesionReforzamientoUseCase({
        sesionReforzamientoRepository: c.resolve(TUTORIAS_TOKENS.sesionReforzamientoRepository),
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.deleteSesionReforzamientoUseCase,
    (c) =>
      new DeleteSesionReforzamientoUseCase({
        sesionReforzamientoRepository: c.resolve(TUTORIAS_TOKENS.sesionReforzamientoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.registerAsistenciaSesionUseCase,
    (c) =>
      new RegisterAsistenciaSesionUseCase({
        sesionReforzamientoRepository: c.resolve(TUTORIAS_TOKENS.sesionReforzamientoRepository),
        sesionReforzamientoParticipanteRepository: c.resolve(
          TUTORIAS_TOKENS.sesionReforzamientoParticipanteRepository
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
      TUTORIAS_TOKENS.listSesionesReforzamientoController,
      (c) =>
        new ListSesionesReforzamientoController({
          listSesionesReforzamientoUseCase: c.resolve(
            TUTORIAS_TOKENS.listSesionesReforzamientoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.getSesionReforzamientoByIdController,
      (c) =>
        new GetSesionReforzamientoByIdController({
          getSesionReforzamientoByIdUseCase: c.resolve(
            TUTORIAS_TOKENS.getSesionReforzamientoByIdUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.createSesionReforzamientoController,
      (c) =>
        new CreateSesionReforzamientoController({
          createSesionReforzamientoUseCase: c.resolve(
            TUTORIAS_TOKENS.createSesionReforzamientoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.updateSesionReforzamientoController,
      (c) =>
        new UpdateSesionReforzamientoController({
          updateSesionReforzamientoUseCase: c.resolve(
            TUTORIAS_TOKENS.updateSesionReforzamientoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.deleteSesionReforzamientoController,
      (c) =>
        new DeleteSesionReforzamientoController({
          deleteSesionReforzamientoUseCase: c.resolve(
            TUTORIAS_TOKENS.deleteSesionReforzamientoUseCase
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
      listSesionesReforzamientoController: c.resolve(
        TUTORIAS_TOKENS.listSesionesReforzamientoController
      ),
      getSesionReforzamientoByIdController: c.resolve(
        TUTORIAS_TOKENS.getSesionReforzamientoByIdController
      ),
      createSesionReforzamientoController: c.resolve(
        TUTORIAS_TOKENS.createSesionReforzamientoController
      ),
      updateSesionReforzamientoController: c.resolve(
        TUTORIAS_TOKENS.updateSesionReforzamientoController
      ),
      deleteSesionReforzamientoController: c.resolve(
        TUTORIAS_TOKENS.deleteSesionReforzamientoController
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
