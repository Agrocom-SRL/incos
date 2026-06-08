/**
 * Sprint 5 — bloques, conflictos, publicación (paralelo_gestion).
 */
import { ACADEMICO_TOKENS, DOCENTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { HorarioConflictosService } from '../../../../application/services/horarios/HorarioConflictosService.js';
import { CreateAsignacionHorarioUseCase } from '../../../../application/use-cases/horarios/CreateAsignacionHorarioUseCase.js';
import { UpdateAsignacionHorarioUseCase } from '../../../../application/use-cases/horarios/UpdateAsignacionHorarioUseCase.js';
import { DeleteAsignacionHorarioUseCase } from '../../../../application/use-cases/horarios/DeleteAsignacionHorarioUseCase.js';
import { BulkAsignacionHorariosUseCase } from '../../../../application/use-cases/horarios/BulkAsignacionHorariosUseCase.js';
import { ValidarConflictoHorarioUseCase } from '../../../../application/use-cases/horarios/ValidarConflictoHorarioUseCase.js';
import { GetParaleloGestionConflictosUseCase } from '../../../../application/use-cases/horarios/GetParaleloGestionConflictosUseCase.js';
import { GetGestionConflictosUseCase } from '../../../../application/use-cases/horarios/GetGestionConflictosUseCase.js';
import { PublicarParaleloGestionUseCase } from '../../../../application/use-cases/horarios/PublicarParaleloGestionUseCase.js';
import { PublicarTodosParalelosGestionUseCase } from '../../../../application/use-cases/horarios/PublicarTodosParalelosGestionUseCase.js';
import { CambiarTurnoParaleloGestionConBloquesUseCase } from '../../../../application/use-cases/horarios/CambiarTurnoParaleloGestionConBloquesUseCase.js';
import {
  CreateAsignacionHorarioController,
  UpdateAsignacionHorarioController,
  DeleteAsignacionHorarioController,
  BulkAsignacionHorariosController,
  ValidarConflictoHorarioController,
  GetParaleloGestionConflictosController,
  GetGestionConflictosController,
  PublicarParaleloGestionController,
  PublicarTodosParalelosGestionController,
  CambiarTurnoParaleloGestionConBloquesController,
} from '../../../../presentation/controllers/horarios/horarios.controllers.js';
import { buildAsignacionHorariosRouter } from '../../../../presentation/routes/asignacion-horarios.routes.js';
import { buildConflictosRouter } from '../../../../presentation/routes/conflictos.routes.js';
import { buildHorariosDocenteRouter } from '../../../../presentation/routes/horarios-docente.routes.js';
import { GetDocenteGrillaConflictosUseCase } from '../../../../application/use-cases/horarios/GetDocenteGrillaConflictosUseCase.js';
import { GetDocenteGrillaConflictosController } from '../../../../presentation/controllers/horarios/get-docente-grilla-conflictos.controller.js';

function horarioConflictosServiceFactory(c) {
  return new HorarioConflictosService({
    grillaBloqueViewRepository: c.resolve(
      REPOSITORIOS_TOKENS.paraleloGestionGrillaBloqueViewRepository
    ),
    conflictoParaleloBloqueViewRepository: c.resolve(
      REPOSITORIOS_TOKENS.paraleloGestionConflictoParaleloBloqueViewRepository
    ),
    conflictoAulaBloqueViewRepository: c.resolve(
      REPOSITORIOS_TOKENS.paraleloGestionConflictoAulaBloqueViewRepository
    ),
    conflictoDocenteBloqueViewRepository: c.resolve(
      REPOSITORIOS_TOKENS.paraleloGestionConflictoDocenteBloqueViewRepository
    ),
    teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
    parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
  });
}

export function registerHorariosResource(container) {
  const rf = (c) => c.resolve(SERVICIOS_TOKENS.responseFormatter);
  const log = (c) => c.resolve(SERVICIOS_TOKENS.logger);

  registerComponent(container, ACADEMICO_TOKENS.horarioConflictosService, horarioConflictosServiceFactory);

  registerComponent(
    container,
    ACADEMICO_TOKENS.createAsignacionHorarioUseCase,
    (c) =>
      new CreateAsignacionHorarioUseCase({
        asignacionHorarioRepository: c.resolve(REPOSITORIOS_TOKENS.asignacionHorarioRepository),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
        horarioConflictosService: c.resolve(ACADEMICO_TOKENS.horarioConflictosService),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateAsignacionHorarioUseCase,
    (c) =>
      new UpdateAsignacionHorarioUseCase({
        asignacionHorarioRepository: c.resolve(REPOSITORIOS_TOKENS.asignacionHorarioRepository),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
        horarioConflictosService: c.resolve(ACADEMICO_TOKENS.horarioConflictosService),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteAsignacionHorarioUseCase,
    (c) =>
      new DeleteAsignacionHorarioUseCase({
        asignacionHorarioRepository: c.resolve(REPOSITORIOS_TOKENS.asignacionHorarioRepository),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.bulkAsignacionHorariosUseCase,
    (c) =>
      new BulkAsignacionHorariosUseCase({
        createAsignacionHorarioUseCase: c.resolve(ACADEMICO_TOKENS.createAsignacionHorarioUseCase),
        updateAsignacionHorarioUseCase: c.resolve(ACADEMICO_TOKENS.updateAsignacionHorarioUseCase),
        deleteAsignacionHorarioUseCase: c.resolve(ACADEMICO_TOKENS.deleteAsignacionHorarioUseCase),
        asignacionHorarioRepository: c.resolve(REPOSITORIOS_TOKENS.asignacionHorarioRepository),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.validarConflictoHorarioUseCase,
    (c) =>
      new ValidarConflictoHorarioUseCase({
        horarioConflictosService: c.resolve(ACADEMICO_TOKENS.horarioConflictosService),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getParaleloGestionConflictosUseCase,
    (c) =>
      new GetParaleloGestionConflictosUseCase({
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        horarioConflictosService: c.resolve(ACADEMICO_TOKENS.horarioConflictosService),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getGestionConflictosUseCase,
    (c) =>
      new GetGestionConflictosUseCase({
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        horarioConflictosService: c.resolve(ACADEMICO_TOKENS.horarioConflictosService),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.publicarParaleloGestionUseCase,
    (c) =>
      new PublicarParaleloGestionUseCase({
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        getParaleloGestionGrillaHorarioUseCase: c.resolve(
          ACADEMICO_TOKENS.getParaleloGestionGrillaHorarioUseCase
        ),
        getParaleloGestionCoberturaDocenteUseCase: c.resolve(
          ACADEMICO_TOKENS.getParaleloGestionCoberturaDocenteUseCase
        ),
        getDocenteCargaGestionUseCase: c.resolve(DOCENTES_TOKENS.getDocenteCargaGestionUseCase),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.publicarTodosParalelosGestionUseCase,
    (c) =>
      new PublicarTodosParalelosGestionUseCase({
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        publicarParaleloGestionUseCase: c.resolve(ACADEMICO_TOKENS.publicarParaleloGestionUseCase),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cambiarTurnoParaleloGestionConBloquesUseCase,
    (c) =>
      new CambiarTurnoParaleloGestionConBloquesUseCase({
        parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
        grillaBloqueViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.paraleloGestionGrillaBloqueViewRepository
        ),
        scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
        logger: log(c),
      })
  );

  const ctrl = (c) => ({
    createAsignacionHorarioController: new CreateAsignacionHorarioController({
      useCase: c.resolve(ACADEMICO_TOKENS.createAsignacionHorarioUseCase),
      responseFormatter: rf(c),
    }),
    updateAsignacionHorarioController: new UpdateAsignacionHorarioController({
      useCase: c.resolve(ACADEMICO_TOKENS.updateAsignacionHorarioUseCase),
      responseFormatter: rf(c),
    }),
    deleteAsignacionHorarioController: new DeleteAsignacionHorarioController({
      useCase: c.resolve(ACADEMICO_TOKENS.deleteAsignacionHorarioUseCase),
      responseFormatter: rf(c),
    }),
    bulkAsignacionHorariosController: new BulkAsignacionHorariosController({
      useCase: c.resolve(ACADEMICO_TOKENS.bulkAsignacionHorariosUseCase),
      responseFormatter: rf(c),
    }),
    validarConflictoHorarioController: new ValidarConflictoHorarioController({
      useCase: c.resolve(ACADEMICO_TOKENS.validarConflictoHorarioUseCase),
      responseFormatter: rf(c),
    }),
    getParaleloGestionConflictosController: new GetParaleloGestionConflictosController({
      useCase: c.resolve(ACADEMICO_TOKENS.getParaleloGestionConflictosUseCase),
      responseFormatter: rf(c),
    }),
    getGestionConflictosController: new GetGestionConflictosController({
      useCase: c.resolve(ACADEMICO_TOKENS.getGestionConflictosUseCase),
      responseFormatter: rf(c),
    }),
    publicarParaleloGestionController: new PublicarParaleloGestionController({
      useCase: c.resolve(ACADEMICO_TOKENS.publicarParaleloGestionUseCase),
      responseFormatter: rf(c),
    }),
    publicarTodosParalelosGestionController: new PublicarTodosParalelosGestionController({
      useCase: c.resolve(ACADEMICO_TOKENS.publicarTodosParalelosGestionUseCase),
      responseFormatter: rf(c),
    }),
    cambiarTurnoParaleloGestionConBloquesController:
      new CambiarTurnoParaleloGestionConBloquesController({
        useCase: c.resolve(ACADEMICO_TOKENS.cambiarTurnoParaleloGestionConBloquesUseCase),
        responseFormatter: rf(c),
      }),
  });

  registerComponent(
    container,
    ACADEMICO_TOKENS.createAsignacionHorarioController,
    (c) => ctrl(c).createAsignacionHorarioController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.updateAsignacionHorarioController,
    (c) => ctrl(c).updateAsignacionHorarioController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteAsignacionHorarioController,
    (c) => ctrl(c).deleteAsignacionHorarioController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.bulkAsignacionHorariosController,
    (c) => ctrl(c).bulkAsignacionHorariosController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.validarConflictoHorarioController,
    (c) => ctrl(c).validarConflictoHorarioController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.getParaleloGestionConflictosController,
    (c) => ctrl(c).getParaleloGestionConflictosController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.getGestionConflictosController,
    (c) => ctrl(c).getGestionConflictosController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.publicarParaleloGestionController,
    (c) => ctrl(c).publicarParaleloGestionController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.publicarTodosParalelosGestionController,
    (c) => ctrl(c).publicarTodosParalelosGestionController
  );
  registerComponent(
    container,
    ACADEMICO_TOKENS.cambiarTurnoParaleloGestionConBloquesController,
    (c) => ctrl(c).cambiarTurnoParaleloGestionConBloquesController
  );

  registerComponent(container, ACADEMICO_TOKENS.asignacionHorariosRouter, (c) =>
    buildAsignacionHorariosRouter({
      controllers: {
        createAsignacionHorarioController: c.resolve(
          ACADEMICO_TOKENS.createAsignacionHorarioController
        ),
        updateAsignacionHorarioController: c.resolve(
          ACADEMICO_TOKENS.updateAsignacionHorarioController
        ),
        deleteAsignacionHorarioController: c.resolve(
          ACADEMICO_TOKENS.deleteAsignacionHorarioController
        ),
        bulkAsignacionHorariosController: c.resolve(
          ACADEMICO_TOKENS.bulkAsignacionHorariosController
        ),
      },
      middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) },
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.conflictosRouter, (c) =>
    buildConflictosRouter({
      controllers: {
        validarConflictoHorarioController: c.resolve(
          ACADEMICO_TOKENS.validarConflictoHorarioController
        ),
      },
      middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) },
    })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getDocenteGrillaConflictosUseCase,
    (c) =>
      new GetDocenteGrillaConflictosUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
        scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
        logger: log(c),
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getDocenteGrillaConflictosController,
    (c) =>
      new GetDocenteGrillaConflictosController({
        useCase: c.resolve(ACADEMICO_TOKENS.getDocenteGrillaConflictosUseCase),
        responseFormatter: rf(c),
      })
  );

  registerComponent(container, ACADEMICO_TOKENS.horariosDocenteRouter, (c) =>
    buildHorariosDocenteRouter({
      controllers: {
        getDocenteGrillaConflictosController: c.resolve(
          ACADEMICO_TOKENS.getDocenteGrillaConflictosController
        ),
      },
    })
  );

  return container;
}

export function getHorariosParalelosGestionControllers(container) {
  return {
    getParaleloGestionConflictosController: container.resolve(
      ACADEMICO_TOKENS.getParaleloGestionConflictosController
    ),
    publicarParaleloGestionController: container.resolve(
      ACADEMICO_TOKENS.publicarParaleloGestionController
    ),
    cambiarTurnoParaleloGestionConBloquesController: container.resolve(
      ACADEMICO_TOKENS.cambiarTurnoParaleloGestionConBloquesController
    ),
  };
}

export function getHorariosGestionesControllers(container) {
  return {
    getGestionConflictosController: container.resolve(
      ACADEMICO_TOKENS.getGestionConflictosController
    ),
    publicarTodosParalelosGestionController: container.resolve(
      ACADEMICO_TOKENS.publicarTodosParalelosGestionController
    ),
  };
}
