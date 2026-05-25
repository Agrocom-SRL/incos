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
import { GetGestionBimestresUseCase } from '../../../../application/use-cases/academico/GetGestionBimestresUseCase.js';
import { IniciarGestionAcademicaUseCase } from '../../../../application/use-cases/academico/IniciarGestionAcademicaUseCase.js';
import { ValidarCierreBimestreUseCase } from '../../../../application/use-cases/academico/ValidarCierreBimestreUseCase.js';
import { CerrarBimestreGestionUseCase } from '../../../../application/use-cases/academico/CerrarBimestreGestionUseCase.js';
import { ListCoordinacionCalificacionesDocentesController } from '../../../../presentation/controllers/academico/calificaciones/list-coordinacion-docentes.controller.js';
import { ListCursosCalificacionesController } from '../../../../presentation/controllers/academico/calificaciones/list-cursos-calificaciones.controller.js';
import { GetPoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/get-politica-institucional.controller.js';
import { GetPoliticaCatalogoController } from '../../../../presentation/controllers/academico/calificaciones/get-politica-catalogo.controller.js';
import { ListTiposEvaluacionController } from '../../../../presentation/controllers/academico/calificaciones/list-tipos-evaluacion.controller.js';
import { SavePoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/save-politica-institucional.controller.js';
import { GetGestionBimestresController } from '../../../../presentation/controllers/academico/calificaciones/get-gestion-bimestres.controller.js';
import { IniciarGestionAcademicaController } from '../../../../presentation/controllers/academico/calificaciones/iniciar-gestion-academica.controller.js';
import { ValidarCierreBimestreController } from '../../../../presentation/controllers/academico/calificaciones/validar-cierre-bimestre.controller.js';
import { CerrarBimestreGestionController } from '../../../../presentation/controllers/academico/calificaciones/cerrar-bimestre-gestion.controller.js';
import { GetRegistroNotasCursoUseCase } from '../../../../application/use-cases/academico/GetRegistroNotasCursoUseCase.js';
import { GetRegistroNotasCursoController } from '../../../../presentation/controllers/academico/calificaciones/get-registro-notas-curso.controller.js';
import { GetCuadernoBimestreUseCase } from '../../../../application/use-cases/academico/GetCuadernoBimestreUseCase.js';
import { CreateEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/CreateEvaluacionCuadernoUseCase.js';
import { UpdateEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/UpdateEvaluacionCuadernoUseCase.js';
import { DeleteEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/DeleteEvaluacionCuadernoUseCase.js';
import { UpsertNotaCuadernoUseCase } from '../../../../application/use-cases/academico/UpsertNotaCuadernoUseCase.js';
import { ResetNotasEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/ResetNotasEvaluacionCuadernoUseCase.js';
import { GuardarNotasCuadernoBimestreUseCase } from '../../../../application/use-cases/academico/GuardarNotasCuadernoBimestreUseCase.js';
import { GetCuadernoBimestreController } from '../../../../presentation/controllers/academico/calificaciones/get-cuaderno-bimestre.controller.js';
import { CreateEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/create-evaluacion-cuaderno.controller.js';
import { UpdateEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/update-evaluacion-cuaderno.controller.js';
import { DeleteEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/delete-evaluacion-cuaderno.controller.js';
import { UpsertNotaCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/upsert-nota-cuaderno.controller.js';
import { ResetNotasEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/reset-notas-evaluacion-cuaderno.controller.js';
import { GuardarNotasCuadernoBimestreController } from '../../../../presentation/controllers/academico/calificaciones/guardar-notas-cuaderno-bimestre.controller.js';
import { buildCalificacionesRouter } from '../../../../presentation/routes/calificaciones.routes.js';

export function registerCalificacionesResource(container) {
  registerComponent(
    container,
    ACADEMICO_TOKENS.listCursosCalificacionesUseCase,
    (c) =>
      new ListCursosCalificacionesUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
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
    ACADEMICO_TOKENS.getGestionBimestresUseCase,
    (c) =>
      new GetGestionBimestresUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.iniciarGestionAcademicaUseCase,
    (c) =>
      new IniciarGestionAcademicaUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.validarCierreBimestreUseCase,
    (c) =>
      new ValidarCierreBimestreUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        calificacionContextoRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionContextoRepository),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cerrarBimestreGestionUseCase,
    (c) =>
      new CerrarBimestreGestionUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getRegistroNotasCursoUseCase,
    (c) =>
      new GetRegistroNotasCursoUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getGestionBimestresController,
    (c) =>
      new GetGestionBimestresController({
        getGestionBimestresUseCase: c.resolve(ACADEMICO_TOKENS.getGestionBimestresUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.iniciarGestionAcademicaController,
    (c) =>
      new IniciarGestionAcademicaController({
        iniciarGestionAcademicaUseCase: c.resolve(ACADEMICO_TOKENS.iniciarGestionAcademicaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.validarCierreBimestreController,
    (c) =>
      new ValidarCierreBimestreController({
        validarCierreBimestreUseCase: c.resolve(ACADEMICO_TOKENS.validarCierreBimestreUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cerrarBimestreGestionController,
    (c) =>
      new CerrarBimestreGestionController({
        cerrarBimestreGestionUseCase: c.resolve(ACADEMICO_TOKENS.cerrarBimestreGestionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getRegistroNotasCursoController,
    (c) =>
      new GetRegistroNotasCursoController({
        getRegistroNotasCursoUseCase: c.resolve(ACADEMICO_TOKENS.getRegistroNotasCursoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCuadernoBimestreUseCase,
    (c) =>
      new GetCuadernoBimestreUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createEvaluacionCuadernoUseCase,
    (c) =>
      new CreateEvaluacionCuadernoUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        bimesterEvaluationRepository: c.resolve(REPOSITORIOS_TOKENS.bimesterEvaluationRepository),
        evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateEvaluacionCuadernoUseCase,
    (c) =>
      new UpdateEvaluacionCuadernoUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        bimesterEvaluationRepository: c.resolve(REPOSITORIOS_TOKENS.bimesterEvaluationRepository),
        evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteEvaluacionCuadernoUseCase,
    (c) =>
      new DeleteEvaluacionCuadernoUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        bimesterEvaluationRepository: c.resolve(REPOSITORIOS_TOKENS.bimesterEvaluationRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoUseCase,
    (c) =>
      new ResetNotasEvaluacionCuadernoUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.guardarNotasCuadernoBimestreUseCase,
    (c) =>
      new GuardarNotasCuadernoBimestreUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.upsertNotaCuadernoUseCase,
    (c) =>
      new UpsertNotaCuadernoUseCase({
        calificacionRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionRepository),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCuadernoBimestreController,
    (c) =>
      new GetCuadernoBimestreController({
        getCuadernoBimestreUseCase: c.resolve(ACADEMICO_TOKENS.getCuadernoBimestreUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createEvaluacionCuadernoController,
    (c) =>
      new CreateEvaluacionCuadernoController({
        createEvaluacionCuadernoUseCase: c.resolve(ACADEMICO_TOKENS.createEvaluacionCuadernoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateEvaluacionCuadernoController,
    (c) =>
      new UpdateEvaluacionCuadernoController({
        updateEvaluacionCuadernoUseCase: c.resolve(ACADEMICO_TOKENS.updateEvaluacionCuadernoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteEvaluacionCuadernoController,
    (c) =>
      new DeleteEvaluacionCuadernoController({
        deleteEvaluacionCuadernoUseCase: c.resolve(ACADEMICO_TOKENS.deleteEvaluacionCuadernoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.upsertNotaCuadernoController,
    (c) =>
      new UpsertNotaCuadernoController({
        upsertNotaCuadernoUseCase: c.resolve(ACADEMICO_TOKENS.upsertNotaCuadernoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoController,
    (c) =>
      new ResetNotasEvaluacionCuadernoController({
        resetNotasEvaluacionCuadernoUseCase: c.resolve(
          ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.guardarNotasCuadernoBimestreController,
    (c) =>
      new GuardarNotasCuadernoBimestreController({
        guardarNotasCuadernoBimestreUseCase: c.resolve(
          ACADEMICO_TOKENS.guardarNotasCuadernoBimestreUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
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
      getGestionBimestresController: c.resolve(ACADEMICO_TOKENS.getGestionBimestresController),
      iniciarGestionAcademicaController: c.resolve(
        ACADEMICO_TOKENS.iniciarGestionAcademicaController
      ),
      validarCierreBimestreController: c.resolve(ACADEMICO_TOKENS.validarCierreBimestreController),
      cerrarBimestreGestionController: c.resolve(ACADEMICO_TOKENS.cerrarBimestreGestionController),
      getRegistroNotasCursoController: c.resolve(ACADEMICO_TOKENS.getRegistroNotasCursoController),
      getCuadernoBimestreController: c.resolve(ACADEMICO_TOKENS.getCuadernoBimestreController),
      createEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.createEvaluacionCuadernoController,
      ),
      updateEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.updateEvaluacionCuadernoController,
      ),
      deleteEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.deleteEvaluacionCuadernoController,
      ),
      upsertNotaCuadernoController: c.resolve(ACADEMICO_TOKENS.upsertNotaCuadernoController),
      resetNotasEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoController,
      ),
      guardarNotasCuadernoBimestreController: c.resolve(
        ACADEMICO_TOKENS.guardarNotasCuadernoBimestreController,
      ),
    };
    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };
    return buildCalificacionesRouter({ controllers, middlewares });
  });

  return container;
}
