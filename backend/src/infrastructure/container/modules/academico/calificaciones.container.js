/**
 * Registro de dependencias del recurso Calificaciones (Académico)
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListCoordinacionCalificacionesDocentesUseCase } from '../../../../application/use-cases/academico/ListCoordinacionCalificacionesDocentesUseCase.js';
import { ListCursosCalificacionesUseCase } from '../../../../application/use-cases/academico/ListCursosCalificacionesUseCase.js';
import { GetCentralizadorParaleloUseCase } from '../../../../application/use-cases/academico/GetCentralizadorParaleloUseCase.js';
import { SaveObservacionCentralizadorBimestreUseCase } from '../../../../application/use-cases/academico/SaveObservacionCentralizadorBimestreUseCase.js';
import { ExportCentralizadorParaleloBimestreExcelUseCase } from '../../../../application/use-cases/academico/ExportCentralizadorParaleloBimestreExcelUseCase.js';
import { ExportCentralizadorCarreraBimestreExcelUseCase } from '../../../../application/use-cases/academico/ExportCentralizadorCarreraBimestreExcelUseCase.js';
import { ExportCentralizadorAnualParaleloExcelUseCase } from '../../../../application/use-cases/academico/ExportCentralizadorAnualParaleloExcelUseCase.js';
import { ExportBoletinEstudiantePdfUseCase } from '../../../../application/use-cases/academico/ExportBoletinEstudiantePdfUseCase.js';
import { GetMiBoletinEstudianteUseCase } from '../../../../application/use-cases/academico/GetMiBoletinEstudianteUseCase.js';
import { ExportMiBoletinEstudiantePdfUseCase } from '../../../../application/use-cases/academico/ExportMiBoletinEstudiantePdfUseCase.js';
import { GetPoliticaInstitucionalUseCase } from '../../../../application/use-cases/academico/GetPoliticaInstitucionalUseCase.js';
import { GetPoliticaCatalogoUseCase } from '../../../../application/use-cases/academico/GetPoliticaCatalogoUseCase.js';
import { ListTiposEvaluacionUseCase } from '../../../../application/use-cases/academico/ListTiposEvaluacionUseCase.js';
import { SavePoliticaInstitucionalUseCase } from '../../../../application/use-cases/academico/SavePoliticaInstitucionalUseCase.js';
import { GetGestionBimestresUseCase } from '../../../../application/use-cases/academico/GetGestionBimestresUseCase.js';
import { GetCronogramaGestionUseCase } from '../../../../application/use-cases/academico/GetCronogramaGestionUseCase.js';
import { ListCronogramaAdminUseCase } from '../../../../application/use-cases/academico/ListCronogramaAdminUseCase.js';
import { GetActividadCronogramaUseCase } from '../../../../application/use-cases/academico/GetActividadCronogramaUseCase.js';
import { CreateActividadCronogramaUseCase } from '../../../../application/use-cases/academico/CreateActividadCronogramaUseCase.js';
import { UpdateActividadCronogramaUseCase } from '../../../../application/use-cases/academico/UpdateActividadCronogramaUseCase.js';
import { DeleteActividadCronogramaUseCase } from '../../../../application/use-cases/academico/DeleteActividadCronogramaUseCase.js';
import { GetPeriodosGestionUseCase } from '../../../../application/use-cases/academico/GetPeriodosGestionUseCase.js';
import { UpdatePeriodoFechasUseCase } from '../../../../application/use-cases/academico/UpdatePeriodoFechasUseCase.js';
import { CreatePeriodoEtapaUseCase } from '../../../../application/use-cases/academico/CreatePeriodoEtapaUseCase.js';
import { DeletePeriodoEtapaUseCase } from '../../../../application/use-cases/academico/DeletePeriodoEtapaUseCase.js';
import { IniciarGestionAcademicaUseCase } from '../../../../application/use-cases/academico/IniciarGestionAcademicaUseCase.js';
import { ValidarCierreBimestreUseCase } from '../../../../application/use-cases/academico/ValidarCierreBimestreUseCase.js';
import { CerrarBimestreGestionUseCase } from '../../../../application/use-cases/academico/CerrarBimestreGestionUseCase.js';
import { AbrirBimestreGestionUseCase } from '../../../../application/use-cases/academico/AbrirBimestreGestionUseCase.js';
import { ListCoordinacionCalificacionesDocentesController } from '../../../../presentation/controllers/academico/calificaciones/list-coordinacion-docentes.controller.js';
import { ListCursosCalificacionesController } from '../../../../presentation/controllers/academico/calificaciones/list-cursos-calificaciones.controller.js';
import { GetCentralizadorParaleloController } from '../../../../presentation/controllers/academico/calificaciones/get-centralizador-paralelo.controller.js';
import { SaveObservacionCentralizadorBimestreController } from '../../../../presentation/controllers/academico/calificaciones/save-observacion-centralizador-bimestre.controller.js';
import { ExportCentralizadorParaleloBimestreController } from '../../../../presentation/controllers/academico/calificaciones/export-centralizador-paralelo-bimestre.controller.js';
import { ExportCentralizadorCarreraBimestreController } from '../../../../presentation/controllers/academico/calificaciones/export-centralizador-carrera-bimestre.controller.js';
import { ExportCentralizadorAnualParaleloController } from '../../../../presentation/controllers/academico/calificaciones/export-centralizador-anual-paralelo.controller.js';
import { ExportBoletinEstudianteController } from '../../../../presentation/controllers/academico/calificaciones/export-boletin-estudiante.controller.js';
import { GetMiBoletinEstudianteController } from '../../../../presentation/controllers/academico/calificaciones/get-mi-boletin.controller.js';
import { ExportMiBoletinEstudianteController } from '../../../../presentation/controllers/academico/calificaciones/export-mi-boletin.controller.js';
import { GetPoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/get-politica-institucional.controller.js';
import { GetPoliticaCatalogoController } from '../../../../presentation/controllers/academico/calificaciones/get-politica-catalogo.controller.js';
import { ListTiposEvaluacionController } from '../../../../presentation/controllers/academico/calificaciones/list-tipos-evaluacion.controller.js';
import { SavePoliticaInstitucionalController } from '../../../../presentation/controllers/academico/calificaciones/save-politica-institucional.controller.js';
import { GetGestionBimestresController } from '../../../../presentation/controllers/academico/calificaciones/get-gestion-bimestres.controller.js';
import { GetCronogramaGestionController } from '../../../../presentation/controllers/academico/calificaciones/get-cronograma-gestion.controller.js';
import { ListCronogramaAdminController } from '../../../../presentation/controllers/academico/calificaciones/list-cronograma-admin.controller.js';
import { GetActividadCronogramaController } from '../../../../presentation/controllers/academico/calificaciones/get-actividad-cronograma.controller.js';
import { CreateActividadCronogramaController } from '../../../../presentation/controllers/academico/calificaciones/create-actividad-cronograma.controller.js';
import { UpdateActividadCronogramaController } from '../../../../presentation/controllers/academico/calificaciones/update-actividad-cronograma.controller.js';
import { DeleteActividadCronogramaController } from '../../../../presentation/controllers/academico/calificaciones/delete-actividad-cronograma.controller.js';
import { GetPeriodosGestionController } from '../../../../presentation/controllers/academico/calificaciones/get-periodos-gestion.controller.js';
import { UpdatePeriodoFechasController } from '../../../../presentation/controllers/academico/calificaciones/update-periodo-fechas.controller.js';
import { CreatePeriodoEtapaController } from '../../../../presentation/controllers/academico/calificaciones/create-periodo-etapa.controller.js';
import { DeletePeriodoEtapaController } from '../../../../presentation/controllers/academico/calificaciones/delete-periodo-etapa.controller.js';
import { IniciarGestionAcademicaController } from '../../../../presentation/controllers/academico/calificaciones/iniciar-gestion-academica.controller.js';
import { ValidarCierreBimestreController } from '../../../../presentation/controllers/academico/calificaciones/validar-cierre-bimestre.controller.js';
import { CerrarBimestreGestionController } from '../../../../presentation/controllers/academico/calificaciones/cerrar-bimestre-gestion.controller.js';
import { AbrirBimestreGestionController } from '../../../../presentation/controllers/academico/calificaciones/abrir-bimestre-gestion.controller.js';
import { GetRegistroNotasCursoUseCase } from '../../../../application/use-cases/academico/GetRegistroNotasCursoUseCase.js';
import { GetRegistroNotasCursoController } from '../../../../presentation/controllers/academico/calificaciones/get-registro-notas-curso.controller.js';
import { GetCuadernoBimestreUseCase } from '../../../../application/use-cases/academico/GetCuadernoBimestreUseCase.js';
import { CreateEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/CreateEvaluacionCuadernoUseCase.js';
import { UpdateEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/UpdateEvaluacionCuadernoUseCase.js';
import { DeleteEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/DeleteEvaluacionCuadernoUseCase.js';
import { UpsertNotaCuadernoUseCase } from '../../../../application/use-cases/academico/UpsertNotaCuadernoUseCase.js';
import { ResetNotasEvaluacionCuadernoUseCase } from '../../../../application/use-cases/academico/ResetNotasEvaluacionCuadernoUseCase.js';
import { GuardarNotasCuadernoBimestreUseCase } from '../../../../application/use-cases/academico/GuardarNotasCuadernoBimestreUseCase.js';
import { GetBimestreConsolidadoUseCase } from '../../../../application/use-cases/academico/GetBimestreConsolidadoUseCase.js';
import { ReabrirBimestreCursoUseCase } from '../../../../application/use-cases/academico/ReabrirBimestreCursoUseCase.js';
import { CerrarBimestreCursoUseCase } from '../../../../application/use-cases/academico/CerrarBimestreCursoUseCase.js';
import { GetCuadernoBimestreController } from '../../../../presentation/controllers/academico/calificaciones/get-cuaderno-bimestre.controller.js';
import { CreateEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/create-evaluacion-cuaderno.controller.js';
import { UpdateEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/update-evaluacion-cuaderno.controller.js';
import { DeleteEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/delete-evaluacion-cuaderno.controller.js';
import { UpsertNotaCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/upsert-nota-cuaderno.controller.js';
import { ResetNotasEvaluacionCuadernoController } from '../../../../presentation/controllers/academico/calificaciones/reset-notas-evaluacion-cuaderno.controller.js';
import { GuardarNotasCuadernoBimestreController } from '../../../../presentation/controllers/academico/calificaciones/guardar-notas-cuaderno-bimestre.controller.js';
import { GetBimestreConsolidadoController } from '../../../../presentation/controllers/academico/calificaciones/get-bimestre-consolidado.controller.js';
import { ReabrirBimestreCursoController } from '../../../../presentation/controllers/academico/calificaciones/reabrir-bimestre-curso.controller.js';
import { CerrarBimestreCursoController } from '../../../../presentation/controllers/academico/calificaciones/cerrar-bimestre-curso.controller.js';
import { ExportRegistroPedagogicoBimestreUseCase } from '../../../../application/use-cases/academico/ExportRegistroPedagogicoBimestreUseCase.js';
import { ExportRegistroPedagogicoBimestreController } from '../../../../presentation/controllers/academico/calificaciones/export-registro-pedagogico-bimestre.controller.js';
import { buildCalificacionesRouter } from '../../../../presentation/routes/calificaciones.routes.js';

export function registerCalificacionesResource(container) {
  registerComponent(
    container,
    ACADEMICO_TOKENS.listCursosCalificacionesUseCase,
    (c) =>
      new ListCursosCalificacionesUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesUseCase,
    (c) =>
      new ListCoordinacionCalificacionesDocentesUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCentralizadorParaleloUseCase,
    (c) =>
      new GetCentralizadorParaleloUseCase({
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        // Cruce de dominio con Libros de registro (mismo dominio ACA, schema 25):
        // solo lectura, opcional (agrega el bloque `libro`/folioNumero al DTO).
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.saveObservacionCentralizadorBimestreUseCase,
    (c) =>
      new SaveObservacionCentralizadorBimestreUseCase({
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCentralizadorParaleloController,
    (c) =>
      new GetCentralizadorParaleloController({
        getCentralizadorParaleloUseCase: c.resolve(
          ACADEMICO_TOKENS.getCentralizadorParaleloUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.saveObservacionCentralizadorBimestreController,
    (c) =>
      new SaveObservacionCentralizadorBimestreController({
        saveObservacionCentralizadorBimestreUseCase: c.resolve(
          ACADEMICO_TOKENS.saveObservacionCentralizadorBimestreUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportCentralizadorParaleloBimestreExcelUseCase,
    (c) =>
      new ExportCentralizadorParaleloBimestreExcelUseCase({
        getCentralizadorParaleloUseCase: c.resolve(
          ACADEMICO_TOKENS.getCentralizadorParaleloUseCase
        ),
        parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
        centralizadorExcelGenerator: c.resolve(SERVICIOS_TOKENS.centralizadorExcelGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportCentralizadorParaleloBimestreController,
    (c) =>
      new ExportCentralizadorParaleloBimestreController({
        exportCentralizadorParaleloBimestreExcelUseCase: c.resolve(
          ACADEMICO_TOKENS.exportCentralizadorParaleloBimestreExcelUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportCentralizadorCarreraBimestreExcelUseCase,
    (c) =>
      new ExportCentralizadorCarreraBimestreExcelUseCase({
        getCentralizadorParaleloUseCase: c.resolve(
          ACADEMICO_TOKENS.getCentralizadorParaleloUseCase
        ),
        parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
        centralizadorExcelGenerator: c.resolve(SERVICIOS_TOKENS.centralizadorExcelGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportCentralizadorCarreraBimestreController,
    (c) =>
      new ExportCentralizadorCarreraBimestreController({
        exportCentralizadorCarreraBimestreExcelUseCase: c.resolve(
          ACADEMICO_TOKENS.exportCentralizadorCarreraBimestreExcelUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportCentralizadorAnualParaleloExcelUseCase,
    (c) =>
      new ExportCentralizadorAnualParaleloExcelUseCase({
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository
        ),
        libroRegistroExcelGenerator: c.resolve(SERVICIOS_TOKENS.libroRegistroExcelGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportCentralizadorAnualParaleloController,
    (c) =>
      new ExportCentralizadorAnualParaleloController({
        exportCentralizadorAnualParaleloExcelUseCase: c.resolve(
          ACADEMICO_TOKENS.exportCentralizadorAnualParaleloExcelUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportBoletinEstudiantePdfUseCase,
    (c) =>
      new ExportBoletinEstudiantePdfUseCase({
        getCentralizadorParaleloUseCase: c.resolve(
          ACADEMICO_TOKENS.getCentralizadorParaleloUseCase
        ),
        parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
        boletinPdfGenerator: c.resolve(SERVICIOS_TOKENS.boletinPdfGenerator),
        // Desglose teórico/práctico del bimestre (boletín bimestral, vistas 135+119).
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportBoletinEstudianteController,
    (c) =>
      new ExportBoletinEstudianteController({
        exportBoletinEstudiantePdfUseCase: c.resolve(
          ACADEMICO_TOKENS.exportBoletinEstudiantePdfUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getMiBoletinEstudianteUseCase,
    (c) =>
      new GetMiBoletinEstudianteUseCase({
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository
        ),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportMiBoletinEstudiantePdfUseCase,
    (c) =>
      new ExportMiBoletinEstudiantePdfUseCase({
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository
        ),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        exportBoletinEstudiantePdfUseCase: c.resolve(
          ACADEMICO_TOKENS.exportBoletinEstudiantePdfUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getMiBoletinEstudianteController,
    (c) =>
      new GetMiBoletinEstudianteController({
        getMiBoletinEstudianteUseCase: c.resolve(ACADEMICO_TOKENS.getMiBoletinEstudianteUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportMiBoletinEstudianteController,
    (c) =>
      new ExportMiBoletinEstudianteController({
        exportMiBoletinEstudiantePdfUseCase: c.resolve(
          ACADEMICO_TOKENS.exportMiBoletinEstudiantePdfUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPoliticaInstitucionalUseCase,
    (c) =>
      new GetPoliticaInstitucionalUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPoliticaCatalogoUseCase,
    (c) =>
      new GetPoliticaCatalogoUseCase({
        careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
        periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listTiposEvaluacionUseCase,
    (c) =>
      new ListTiposEvaluacionUseCase({
        evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.savePoliticaInstitucionalUseCase,
    (c) =>
      new SavePoliticaInstitucionalUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPoliticaInstitucionalController,
    (c) =>
      new GetPoliticaInstitucionalController({
        getPoliticaInstitucionalUseCase: c.resolve(
          ACADEMICO_TOKENS.getPoliticaInstitucionalUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPoliticaCatalogoController,
    (c) =>
      new GetPoliticaCatalogoController({
        getPoliticaCatalogoUseCase: c.resolve(ACADEMICO_TOKENS.getPoliticaCatalogoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listTiposEvaluacionController,
    (c) =>
      new ListTiposEvaluacionController({
        listTiposEvaluacionUseCase: c.resolve(ACADEMICO_TOKENS.listTiposEvaluacionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.savePoliticaInstitucionalController,
    (c) =>
      new SavePoliticaInstitucionalController({
        savePoliticaInstitucionalUseCase: c.resolve(
          ACADEMICO_TOKENS.savePoliticaInstitucionalUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listCursosCalificacionesController,
    (c) =>
      new ListCursosCalificacionesController({
        listCursosCalificacionesUseCase: c.resolve(
          ACADEMICO_TOKENS.listCursosCalificacionesUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getGestionBimestresUseCase,
    (c) =>
      new GetGestionBimestresUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCronogramaGestionUseCase,
    (c) =>
      new GetCronogramaGestionUseCase({
        cronogramaGestionRepository: c.resolve(REPOSITORIOS_TOKENS.cronogramaGestionRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listCronogramaAdminUseCase,
    (c) =>
      new ListCronogramaAdminUseCase({
        cronogramaGestionRepository: c.resolve(REPOSITORIOS_TOKENS.cronogramaGestionRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getActividadCronogramaUseCase,
    (c) =>
      new GetActividadCronogramaUseCase({
        cronogramaGestionRepository: c.resolve(REPOSITORIOS_TOKENS.cronogramaGestionRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createActividadCronogramaUseCase,
    (c) =>
      new CreateActividadCronogramaUseCase({
        calendarActivityRepository: c.resolve(REPOSITORIOS_TOKENS.calendarActivityRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateActividadCronogramaUseCase,
    (c) =>
      new UpdateActividadCronogramaUseCase({
        calendarActivityRepository: c.resolve(REPOSITORIOS_TOKENS.calendarActivityRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteActividadCronogramaUseCase,
    (c) =>
      new DeleteActividadCronogramaUseCase({
        calendarActivityRepository: c.resolve(REPOSITORIOS_TOKENS.calendarActivityRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPeriodosGestionUseCase,
    (c) =>
      new GetPeriodosGestionUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cronogramaGestionRepository: c.resolve(REPOSITORIOS_TOKENS.cronogramaGestionRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updatePeriodoFechasUseCase,
    (c) =>
      new UpdatePeriodoFechasUseCase({
        academicPeriodRepository: c.resolve(REPOSITORIOS_TOKENS.academicPeriodRepository),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createPeriodoEtapaUseCase,
    (c) =>
      new CreatePeriodoEtapaUseCase({
        academicPeriodRepository: c.resolve(REPOSITORIOS_TOKENS.academicPeriodRepository),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deletePeriodoEtapaUseCase,
    (c) =>
      new DeletePeriodoEtapaUseCase({
        academicPeriodRepository: c.resolve(REPOSITORIOS_TOKENS.academicPeriodRepository),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.iniciarGestionAcademicaUseCase,
    (c) =>
      new IniciarGestionAcademicaUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        configuracionSistemaRepository: c.resolve(
          REPOSITORIOS_TOKENS.systemConfigurationRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.validarCierreBimestreUseCase,
    (c) =>
      new ValidarCierreBimestreUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        )
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cerrarBimestreGestionUseCase,
    (c) =>
      new CerrarBimestreGestionUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.abrirBimestreGestionUseCase,
    (c) =>
      new AbrirBimestreGestionUseCase({
        gestionBimestresRepository: c.resolve(REPOSITORIOS_TOKENS.gestionBimestresRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getRegistroNotasCursoUseCase,
    (c) =>
      new GetRegistroNotasCursoUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        bimesterEvaluationGradeRepository: c.resolve(
          REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository
        ),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getGestionBimestresController,
    (c) =>
      new GetGestionBimestresController({
        getGestionBimestresUseCase: c.resolve(ACADEMICO_TOKENS.getGestionBimestresUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCronogramaGestionController,
    (c) =>
      new GetCronogramaGestionController({
        getCronogramaGestionUseCase: c.resolve(ACADEMICO_TOKENS.getCronogramaGestionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listCronogramaAdminController,
    (c) =>
      new ListCronogramaAdminController({
        listCronogramaAdminUseCase: c.resolve(ACADEMICO_TOKENS.listCronogramaAdminUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getActividadCronogramaController,
    (c) =>
      new GetActividadCronogramaController({
        getActividadCronogramaUseCase: c.resolve(ACADEMICO_TOKENS.getActividadCronogramaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createActividadCronogramaController,
    (c) =>
      new CreateActividadCronogramaController({
        createActividadCronogramaUseCase: c.resolve(
          ACADEMICO_TOKENS.createActividadCronogramaUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateActividadCronogramaController,
    (c) =>
      new UpdateActividadCronogramaController({
        updateActividadCronogramaUseCase: c.resolve(
          ACADEMICO_TOKENS.updateActividadCronogramaUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteActividadCronogramaController,
    (c) =>
      new DeleteActividadCronogramaController({
        deleteActividadCronogramaUseCase: c.resolve(
          ACADEMICO_TOKENS.deleteActividadCronogramaUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPeriodosGestionController,
    (c) =>
      new GetPeriodosGestionController({
        getPeriodosGestionUseCase: c.resolve(ACADEMICO_TOKENS.getPeriodosGestionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updatePeriodoFechasController,
    (c) =>
      new UpdatePeriodoFechasController({
        updatePeriodoFechasUseCase: c.resolve(ACADEMICO_TOKENS.updatePeriodoFechasUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createPeriodoEtapaController,
    (c) =>
      new CreatePeriodoEtapaController({
        createPeriodoEtapaUseCase: c.resolve(ACADEMICO_TOKENS.createPeriodoEtapaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deletePeriodoEtapaController,
    (c) =>
      new DeletePeriodoEtapaController({
        deletePeriodoEtapaUseCase: c.resolve(ACADEMICO_TOKENS.deletePeriodoEtapaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.iniciarGestionAcademicaController,
    (c) =>
      new IniciarGestionAcademicaController({
        iniciarGestionAcademicaUseCase: c.resolve(ACADEMICO_TOKENS.iniciarGestionAcademicaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.validarCierreBimestreController,
    (c) =>
      new ValidarCierreBimestreController({
        validarCierreBimestreUseCase: c.resolve(ACADEMICO_TOKENS.validarCierreBimestreUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cerrarBimestreGestionController,
    (c) =>
      new CerrarBimestreGestionController({
        cerrarBimestreGestionUseCase: c.resolve(ACADEMICO_TOKENS.cerrarBimestreGestionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.abrirBimestreGestionController,
    (c) =>
      new AbrirBimestreGestionController({
        abrirBimestreGestionUseCase: c.resolve(ACADEMICO_TOKENS.abrirBimestreGestionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getRegistroNotasCursoController,
    (c) =>
      new GetRegistroNotasCursoController({
        getRegistroNotasCursoUseCase: c.resolve(ACADEMICO_TOKENS.getRegistroNotasCursoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCuadernoBimestreUseCase,
    (c) =>
      new GetCuadernoBimestreUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
        bimesterEvaluationGradeRepository: c.resolve(
          REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createEvaluacionCuadernoUseCase,
    (c) =>
      new CreateEvaluacionCuadernoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        bimesterEvaluationRepository: c.resolve(REPOSITORIOS_TOKENS.bimesterEvaluationRepository),
        evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateEvaluacionCuadernoUseCase,
    (c) =>
      new UpdateEvaluacionCuadernoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        bimesterEvaluationRepository: c.resolve(REPOSITORIOS_TOKENS.bimesterEvaluationRepository),
        evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteEvaluacionCuadernoUseCase,
    (c) =>
      new DeleteEvaluacionCuadernoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        bimesterEvaluationGradeRepository: c.resolve(
          REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        bimesterEvaluationRepository: c.resolve(REPOSITORIOS_TOKENS.bimesterEvaluationRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoUseCase,
    (c) =>
      new ResetNotasEvaluacionCuadernoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        bimesterEvaluationGradeRepository: c.resolve(
          REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.guardarNotasCuadernoBimestreUseCase,
    (c) =>
      new GuardarNotasCuadernoBimestreUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        bimesterEvaluationGradeRepository: c.resolve(
          REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository
        ),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getBimestreConsolidadoUseCase,
    (c) =>
      new GetBimestreConsolidadoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.reabrirBimestreCursoUseCase,
    (c) =>
      new ReabrirBimestreCursoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cerrarBimestreCursoUseCase,
    (c) =>
      new CerrarBimestreCursoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        bimesterEvaluationGradeRepository: c.resolve(
          REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository
        ),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.upsertNotaCuadernoUseCase,
    (c) =>
      new UpsertNotaCuadernoUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        subjectEnrollmentBimesterRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository
        ),
        bimesterEvaluationGradeRepository: c.resolve(
          REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCuadernoBimestreController,
    (c) =>
      new GetCuadernoBimestreController({
        getCuadernoBimestreUseCase: c.resolve(ACADEMICO_TOKENS.getCuadernoBimestreUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.createEvaluacionCuadernoController,
    (c) =>
      new CreateEvaluacionCuadernoController({
        createEvaluacionCuadernoUseCase: c.resolve(
          ACADEMICO_TOKENS.createEvaluacionCuadernoUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.updateEvaluacionCuadernoController,
    (c) =>
      new UpdateEvaluacionCuadernoController({
        updateEvaluacionCuadernoUseCase: c.resolve(
          ACADEMICO_TOKENS.updateEvaluacionCuadernoUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.deleteEvaluacionCuadernoController,
    (c) =>
      new DeleteEvaluacionCuadernoController({
        deleteEvaluacionCuadernoUseCase: c.resolve(
          ACADEMICO_TOKENS.deleteEvaluacionCuadernoUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.upsertNotaCuadernoController,
    (c) =>
      new UpsertNotaCuadernoController({
        upsertNotaCuadernoUseCase: c.resolve(ACADEMICO_TOKENS.upsertNotaCuadernoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoController,
    (c) =>
      new ResetNotasEvaluacionCuadernoController({
        resetNotasEvaluacionCuadernoUseCase: c.resolve(
          ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.guardarNotasCuadernoBimestreController,
    (c) =>
      new GuardarNotasCuadernoBimestreController({
        guardarNotasCuadernoBimestreUseCase: c.resolve(
          ACADEMICO_TOKENS.guardarNotasCuadernoBimestreUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getBimestreConsolidadoController,
    (c) =>
      new GetBimestreConsolidadoController({
        getBimestreConsolidadoUseCase: c.resolve(ACADEMICO_TOKENS.getBimestreConsolidadoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.reabrirBimestreCursoController,
    (c) =>
      new ReabrirBimestreCursoController({
        reabrirBimestreCursoUseCase: c.resolve(ACADEMICO_TOKENS.reabrirBimestreCursoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cerrarBimestreCursoController,
    (c) =>
      new CerrarBimestreCursoController({
        cerrarBimestreCursoUseCase: c.resolve(ACADEMICO_TOKENS.cerrarBimestreCursoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportRegistroPedagogicoBimestreUseCase,
    (c) =>
      new ExportRegistroPedagogicoBimestreUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        registroPedagogicoExcelGenerator: c.resolve(
          SERVICIOS_TOKENS.registroPedagogicoExcelGenerator
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportRegistroPedagogicoBimestreController,
    (c) =>
      new ExportRegistroPedagogicoBimestreController({
        exportRegistroPedagogicoBimestreUseCase: c.resolve(
          ACADEMICO_TOKENS.exportRegistroPedagogicoBimestreUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
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
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
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
      getCentralizadorParaleloController: c.resolve(
        ACADEMICO_TOKENS.getCentralizadorParaleloController
      ),
      saveObservacionCentralizadorBimestreController: c.resolve(
        ACADEMICO_TOKENS.saveObservacionCentralizadorBimestreController
      ),
      exportCentralizadorParaleloBimestreController: c.resolve(
        ACADEMICO_TOKENS.exportCentralizadorParaleloBimestreController
      ),
      exportCentralizadorCarreraBimestreController: c.resolve(
        ACADEMICO_TOKENS.exportCentralizadorCarreraBimestreController
      ),
      exportCentralizadorAnualParaleloController: c.resolve(
        ACADEMICO_TOKENS.exportCentralizadorAnualParaleloController
      ),
      exportBoletinEstudianteController: c.resolve(
        ACADEMICO_TOKENS.exportBoletinEstudianteController
      ),
      getMiBoletinEstudianteController: c.resolve(
        ACADEMICO_TOKENS.getMiBoletinEstudianteController
      ),
      exportMiBoletinEstudianteController: c.resolve(
        ACADEMICO_TOKENS.exportMiBoletinEstudianteController
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
      getCronogramaGestionController: c.resolve(ACADEMICO_TOKENS.getCronogramaGestionController),
      listCronogramaAdminController: c.resolve(ACADEMICO_TOKENS.listCronogramaAdminController),
      getActividadCronogramaController: c.resolve(
        ACADEMICO_TOKENS.getActividadCronogramaController
      ),
      createActividadCronogramaController: c.resolve(
        ACADEMICO_TOKENS.createActividadCronogramaController
      ),
      updateActividadCronogramaController: c.resolve(
        ACADEMICO_TOKENS.updateActividadCronogramaController
      ),
      deleteActividadCronogramaController: c.resolve(
        ACADEMICO_TOKENS.deleteActividadCronogramaController
      ),
      getPeriodosGestionController: c.resolve(ACADEMICO_TOKENS.getPeriodosGestionController),
      updatePeriodoFechasController: c.resolve(ACADEMICO_TOKENS.updatePeriodoFechasController),
      createPeriodoEtapaController: c.resolve(ACADEMICO_TOKENS.createPeriodoEtapaController),
      deletePeriodoEtapaController: c.resolve(ACADEMICO_TOKENS.deletePeriodoEtapaController),
      iniciarGestionAcademicaController: c.resolve(
        ACADEMICO_TOKENS.iniciarGestionAcademicaController
      ),
      validarCierreBimestreController: c.resolve(ACADEMICO_TOKENS.validarCierreBimestreController),
      cerrarBimestreGestionController: c.resolve(ACADEMICO_TOKENS.cerrarBimestreGestionController),
      abrirBimestreGestionController: c.resolve(ACADEMICO_TOKENS.abrirBimestreGestionController),
      getRegistroNotasCursoController: c.resolve(ACADEMICO_TOKENS.getRegistroNotasCursoController),
      getCuadernoBimestreController: c.resolve(ACADEMICO_TOKENS.getCuadernoBimestreController),
      createEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.createEvaluacionCuadernoController
      ),
      updateEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.updateEvaluacionCuadernoController
      ),
      deleteEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.deleteEvaluacionCuadernoController
      ),
      upsertNotaCuadernoController: c.resolve(ACADEMICO_TOKENS.upsertNotaCuadernoController),
      resetNotasEvaluacionCuadernoController: c.resolve(
        ACADEMICO_TOKENS.resetNotasEvaluacionCuadernoController
      ),
      guardarNotasCuadernoBimestreController: c.resolve(
        ACADEMICO_TOKENS.guardarNotasCuadernoBimestreController
      ),
      getBimestreConsolidadoController: c.resolve(
        ACADEMICO_TOKENS.getBimestreConsolidadoController
      ),
      reabrirBimestreCursoController: c.resolve(ACADEMICO_TOKENS.reabrirBimestreCursoController),
      cerrarBimestreCursoController: c.resolve(ACADEMICO_TOKENS.cerrarBimestreCursoController),
      exportRegistroPedagogicoBimestreController: c.resolve(
        ACADEMICO_TOKENS.exportRegistroPedagogicoBimestreController
      )
    };
    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest)
    };
    return buildCalificacionesRouter({ controllers, middlewares });
  });

  return container;
}
