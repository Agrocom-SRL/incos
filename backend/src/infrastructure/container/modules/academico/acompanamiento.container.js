/**
 * Registro de dependencias del recurso Acompañamiento Pedagógico (módulo ACA)
 *
 * Responsabilidades:
 * - Registrar repositorios propios del recurso (arquetipo A + view repos B)
 *   con tokens scoped ACADEMICO_TOKENS.* — no se toca repositories.container.js
 *   ni repositorios.tokens.js compartidos.
 * - Registrar Use Cases del sub-módulo de acompañamiento (A1-A11)
 * - Registrar Controllers correspondientes
 * - Construir y registrar el router /acompanamiento
 *
 * Principio SRP: cada container maneja solo UN recurso.
 *
 * Nota (2026-07-31): este recurso vivía en `container/modules/tutorias/`
 * (módulo TUT, TUTORIAS_TOKENS). Se reclasificó al dominio Académico porque
 * sus datos (alertas de riesgo, sesiones de refuerzo, panel) se derivan de
 * `asignaciones_docentes`/vistas del centralizador, sin FK a
 * `proyectos_grado`/`modalidades_grado`.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent, registerRepository } from '../../utils/container.helpers.js';
import { SesionRefuerzoRepository } from '../../../repositories/SesionRefuerzoRepository.js';
import { SesionRefuerzoEstudianteRepository } from '../../../repositories/SesionRefuerzoEstudianteRepository.js';
import { RiesgoAcademicoViewRepository } from '../../../repositories/views/RiesgoAcademicoViewRepository.js';
import { AcompanamientoSesionViewRepository } from '../../../repositories/views/AcompanamientoSesionViewRepository.js';
import { ListAlertasRiesgoUseCase } from '../../../../application/use-cases/academico/acompanamiento/ListAlertasRiesgoUseCase.js';
import { ListMisAlertasRiesgoDocenteUseCase } from '../../../../application/use-cases/academico/acompanamiento/ListMisAlertasRiesgoDocenteUseCase.js';
import { GetAlertaRiesgoEstudianteUseCase } from '../../../../application/use-cases/academico/acompanamiento/GetAlertaRiesgoEstudianteUseCase.js';
import { ListSesionesRefuerzoUseCase } from '../../../../application/use-cases/academico/acompanamiento/ListSesionesRefuerzoUseCase.js';
import { GetSesionRefuerzoByIdUseCase } from '../../../../application/use-cases/academico/acompanamiento/GetSesionRefuerzoByIdUseCase.js';
import { CreateSesionRefuerzoUseCase } from '../../../../application/use-cases/academico/acompanamiento/CreateSesionRefuerzoUseCase.js';
import { UpdateSesionRefuerzoUseCase } from '../../../../application/use-cases/academico/acompanamiento/UpdateSesionRefuerzoUseCase.js';
import { DeleteSesionRefuerzoUseCase } from '../../../../application/use-cases/academico/acompanamiento/DeleteSesionRefuerzoUseCase.js';
import { RegisterAsistenciaSesionUseCase } from '../../../../application/use-cases/academico/acompanamiento/RegisterAsistenciaSesionUseCase.js';
import { GetPanelAcompanamientoUseCase } from '../../../../application/use-cases/academico/acompanamiento/GetPanelAcompanamientoUseCase.js';
import { ExportPanelAcompanamientoPdfUseCase } from '../../../../application/use-cases/academico/acompanamiento/ExportPanelAcompanamientoPdfUseCase.js';
import { ListAlertasRiesgoController } from '../../../../presentation/controllers/academico/acompanamiento/list-alertas-riesgo.controller.js';
import { ListMisAlertasRiesgoDocenteController } from '../../../../presentation/controllers/academico/acompanamiento/list-mis-alertas-riesgo-docente.controller.js';
import { GetAlertaRiesgoEstudianteController } from '../../../../presentation/controllers/academico/acompanamiento/get-alerta-riesgo-estudiante.controller.js';
import { ListSesionesRefuerzoController } from '../../../../presentation/controllers/academico/acompanamiento/list-sesiones-refuerzo.controller.js';
import { GetSesionRefuerzoByIdController } from '../../../../presentation/controllers/academico/acompanamiento/get-sesion-refuerzo-by-id.controller.js';
import { CreateSesionRefuerzoController } from '../../../../presentation/controllers/academico/acompanamiento/create-sesion-refuerzo.controller.js';
import { UpdateSesionRefuerzoController } from '../../../../presentation/controllers/academico/acompanamiento/update-sesion-refuerzo.controller.js';
import { DeleteSesionRefuerzoController } from '../../../../presentation/controllers/academico/acompanamiento/delete-sesion-refuerzo.controller.js';
import { RegisterAsistenciaSesionController } from '../../../../presentation/controllers/academico/acompanamiento/register-asistencia-sesion.controller.js';
import { GetPanelAcompanamientoController } from '../../../../presentation/controllers/academico/acompanamiento/get-panel-acompanamiento.controller.js';
import { ExportPanelAcompanamientoController } from '../../../../presentation/controllers/academico/acompanamiento/export-panel-acompanamiento.controller.js';
import { buildAcompanamientoRouter } from '../../../../presentation/routes/acompanamiento.routes.js';

export function registerAcompanamientoResource(container) {
  // ============================================
  // REPOSITORIOS (singletons del recurso)
  // ============================================
  registerRepository(
    container,
    ACADEMICO_TOKENS.sesionRefuerzoRepository,
    SesionRefuerzoRepository
  );
  registerRepository(
    container,
    ACADEMICO_TOKENS.sesionRefuerzoEstudianteRepository,
    SesionRefuerzoEstudianteRepository
  );
  registerRepository(
    container,
    ACADEMICO_TOKENS.riesgoAcademicoViewRepository,
    RiesgoAcademicoViewRepository
  );
  registerRepository(
    container,
    ACADEMICO_TOKENS.acompanamientoSesionViewRepository,
    AcompanamientoSesionViewRepository
  );

  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.listAlertasRiesgoUseCase,
    (c) =>
      new ListAlertasRiesgoUseCase({
        riesgoAcademicoViewRepository: c.resolve(ACADEMICO_TOKENS.riesgoAcademicoViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listMisAlertasRiesgoDocenteUseCase,
    (c) =>
      new ListMisAlertasRiesgoDocenteUseCase({
        riesgoAcademicoViewRepository: c.resolve(ACADEMICO_TOKENS.riesgoAcademicoViewRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getAlertaRiesgoEstudianteUseCase,
    (c) =>
      new GetAlertaRiesgoEstudianteUseCase({
        riesgoAcademicoViewRepository: c.resolve(ACADEMICO_TOKENS.riesgoAcademicoViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listSesionesRefuerzoUseCase,
    (c) =>
      new ListSesionesRefuerzoUseCase({
        acompanamientoSesionViewRepository: c.resolve(
          ACADEMICO_TOKENS.acompanamientoSesionViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getSesionRefuerzoByIdUseCase,
    (c) =>
      new GetSesionRefuerzoByIdUseCase({
        acompanamientoSesionViewRepository: c.resolve(
          ACADEMICO_TOKENS.acompanamientoSesionViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createSesionRefuerzoUseCase,
    (c) =>
      new CreateSesionRefuerzoUseCase({
        sesionRefuerzoRepository: c.resolve(ACADEMICO_TOKENS.sesionRefuerzoRepository),
        sesionRefuerzoEstudianteRepository: c.resolve(
          ACADEMICO_TOKENS.sesionRefuerzoEstudianteRepository
        ),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateSesionRefuerzoUseCase,
    (c) =>
      new UpdateSesionRefuerzoUseCase({
        sesionRefuerzoRepository: c.resolve(ACADEMICO_TOKENS.sesionRefuerzoRepository),
        classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteSesionRefuerzoUseCase,
    (c) =>
      new DeleteSesionRefuerzoUseCase({
        sesionRefuerzoRepository: c.resolve(ACADEMICO_TOKENS.sesionRefuerzoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.registerAsistenciaSesionUseCase,
    (c) =>
      new RegisterAsistenciaSesionUseCase({
        sesionRefuerzoRepository: c.resolve(ACADEMICO_TOKENS.sesionRefuerzoRepository),
        sesionRefuerzoEstudianteRepository: c.resolve(
          ACADEMICO_TOKENS.sesionRefuerzoEstudianteRepository
        ),
        acompanamientoSesionViewRepository: c.resolve(
          ACADEMICO_TOKENS.acompanamientoSesionViewRepository
        ),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPanelAcompanamientoUseCase,
    (c) =>
      new GetPanelAcompanamientoUseCase({
        riesgoAcademicoViewRepository: c.resolve(ACADEMICO_TOKENS.riesgoAcademicoViewRepository),
        acompanamientoSesionViewRepository: c.resolve(
          ACADEMICO_TOKENS.acompanamientoSesionViewRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportPanelAcompanamientoPdfUseCase,
    (c) =>
      new ExportPanelAcompanamientoPdfUseCase({
        getPanelAcompanamientoUseCase: c.resolve(ACADEMICO_TOKENS.getPanelAcompanamientoUseCase),
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
      ACADEMICO_TOKENS.listAlertasRiesgoController,
      (c) =>
        new ListAlertasRiesgoController({
          listAlertasRiesgoUseCase: c.resolve(ACADEMICO_TOKENS.listAlertasRiesgoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.listMisAlertasRiesgoDocenteController,
      (c) =>
        new ListMisAlertasRiesgoDocenteController({
          listMisAlertasRiesgoDocenteUseCase: c.resolve(
            ACADEMICO_TOKENS.listMisAlertasRiesgoDocenteUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.getAlertaRiesgoEstudianteController,
      (c) =>
        new GetAlertaRiesgoEstudianteController({
          getAlertaRiesgoEstudianteUseCase: c.resolve(
            ACADEMICO_TOKENS.getAlertaRiesgoEstudianteUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.listSesionesRefuerzoController,
      (c) =>
        new ListSesionesRefuerzoController({
          listSesionesRefuerzoUseCase: c.resolve(ACADEMICO_TOKENS.listSesionesRefuerzoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.getSesionRefuerzoByIdController,
      (c) =>
        new GetSesionRefuerzoByIdController({
          getSesionRefuerzoByIdUseCase: c.resolve(ACADEMICO_TOKENS.getSesionRefuerzoByIdUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.createSesionRefuerzoController,
      (c) =>
        new CreateSesionRefuerzoController({
          createSesionRefuerzoUseCase: c.resolve(ACADEMICO_TOKENS.createSesionRefuerzoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.updateSesionRefuerzoController,
      (c) =>
        new UpdateSesionRefuerzoController({
          updateSesionRefuerzoUseCase: c.resolve(ACADEMICO_TOKENS.updateSesionRefuerzoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.deleteSesionRefuerzoController,
      (c) =>
        new DeleteSesionRefuerzoController({
          deleteSesionRefuerzoUseCase: c.resolve(ACADEMICO_TOKENS.deleteSesionRefuerzoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.registerAsistenciaSesionController,
      (c) =>
        new RegisterAsistenciaSesionController({
          registerAsistenciaSesionUseCase: c.resolve(
            ACADEMICO_TOKENS.registerAsistenciaSesionUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.getPanelAcompanamientoController,
      (c) =>
        new GetPanelAcompanamientoController({
          getPanelAcompanamientoUseCase: c.resolve(ACADEMICO_TOKENS.getPanelAcompanamientoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      ACADEMICO_TOKENS.exportPanelAcompanamientoController,
      (c) =>
        new ExportPanelAcompanamientoController({
          exportPanelAcompanamientoPdfUseCase: c.resolve(
            ACADEMICO_TOKENS.exportPanelAcompanamientoPdfUseCase
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
  registerComponent(container, ACADEMICO_TOKENS.acompanamientoRouter, (c) => {
    const controllers = {
      listAlertasRiesgoController: c.resolve(ACADEMICO_TOKENS.listAlertasRiesgoController),
      listMisAlertasRiesgoDocenteController: c.resolve(
        ACADEMICO_TOKENS.listMisAlertasRiesgoDocenteController
      ),
      getAlertaRiesgoEstudianteController: c.resolve(
        ACADEMICO_TOKENS.getAlertaRiesgoEstudianteController
      ),
      listSesionesRefuerzoController: c.resolve(ACADEMICO_TOKENS.listSesionesRefuerzoController),
      getSesionRefuerzoByIdController: c.resolve(ACADEMICO_TOKENS.getSesionRefuerzoByIdController),
      createSesionRefuerzoController: c.resolve(ACADEMICO_TOKENS.createSesionRefuerzoController),
      updateSesionRefuerzoController: c.resolve(ACADEMICO_TOKENS.updateSesionRefuerzoController),
      deleteSesionRefuerzoController: c.resolve(ACADEMICO_TOKENS.deleteSesionRefuerzoController),
      registerAsistenciaSesionController: c.resolve(
        ACADEMICO_TOKENS.registerAsistenciaSesionController
      ),
      getPanelAcompanamientoController: c.resolve(
        ACADEMICO_TOKENS.getPanelAcompanamientoController
      ),
      exportPanelAcompanamientoController: c.resolve(
        ACADEMICO_TOKENS.exportPanelAcompanamientoController
      ),
    };

    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };

    return buildAcompanamientoRouter({ controllers, middlewares });
  });

  return container;
}
