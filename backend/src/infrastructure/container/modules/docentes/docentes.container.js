/**
 * Registro del módulo Docentes (listado inicial).
 */

import { DOCENTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListTeachersUseCase } from '../../../../application/use-cases/docentes/ListTeachersUseCase.js';
import { GetTeacherDetailUseCase } from '../../../../application/use-cases/docentes/GetTeacherDetailUseCase.js';
import { CreateTeacherUseCase } from '../../../../application/use-cases/docentes/CreateTeacherUseCase.js';
import { UpdateTeacherUseCase } from '../../../../application/use-cases/docentes/UpdateTeacherUseCase.js';
import { DeleteTeacherUseCase } from '../../../../application/use-cases/docentes/DeleteTeacherUseCase.js';
import {
  ListTeachersController,
  GetTeacherByIdController,
  CreateTeacherController,
  UpdateTeacherController,
  DeleteTeacherController,
  ListTeacherAssignmentsController,
  CreateTeacherAssignmentController,
  AssignTeacherToCourseController,
  UpdateTeacherAssignmentController,
  DeleteTeacherAssignmentController,
  ListPlanesHabilitadosDocenteController,
  ListCursosDisponiblesDocenteController,
  GetCursoHorariosDocenteController,
  ListPeriodosDocenteAsignacionController,
  ListParalelosDocenteAsignacionController,
  ListCursosPorParaleloDocenteController,
  GetDocentesConflictoBloquesController,
} from '../../../../presentation/controllers/docentes/index.js';
import { GetDocentesConflictoBloquesCursoUseCase } from '../../../../application/use-cases/docentes/GetDocentesConflictoBloquesCursoUseCase.js';
import { ListTeacherAssignmentsUseCase } from '../../../../application/use-cases/docentes/ListTeacherAssignmentsUseCase.js';
import { CreateTeacherAssignmentUseCase } from '../../../../application/use-cases/docentes/CreateTeacherAssignmentUseCase.js';
import { AssignTeacherToCourseUseCase } from '../../../../application/use-cases/docentes/AssignTeacherToCourseUseCase.js';
import { UpdateTeacherAssignmentUseCase } from '../../../../application/use-cases/docentes/UpdateTeacherAssignmentUseCase.js';
import { DeleteTeacherAssignmentUseCase } from '../../../../application/use-cases/docentes/DeleteTeacherAssignmentUseCase.js';
import { SyncMatriculasTeacherAssignmentUseCase } from '../../../../application/use-cases/docentes/SyncMatriculasTeacherAssignmentUseCase.js';
import { ListPlanesHabilitadosDocenteUseCase } from '../../../../application/use-cases/docentes/ListPlanesHabilitadosDocenteUseCase.js';
import { ListCursosDisponiblesDocenteUseCase } from '../../../../application/use-cases/docentes/ListCursosDisponiblesDocenteUseCase.js';
import { GetCursoHorariosDocenteUseCase } from '../../../../application/use-cases/docentes/GetCursoHorariosDocenteUseCase.js';
import { ListPeriodosDocenteAsignacionUseCase } from '../../../../application/use-cases/docentes/ListPeriodosDocenteAsignacionUseCase.js';
import { ListParalelosDocenteAsignacionUseCase } from '../../../../application/use-cases/docentes/ListParalelosDocenteAsignacionUseCase.js';
import { ListCursosPorParaleloDocenteUseCase } from '../../../../application/use-cases/docentes/ListCursosPorParaleloDocenteUseCase.js';
import { buildDocentesRouter } from '../../../../presentation/routes/docentes.routes.js';

export function registerDocentesModule(container) {
  registerComponent(
    container,
    DOCENTES_TOKENS.listTeachersUseCase,
    (c) =>
      new ListTeachersUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getTeacherDetailUseCase,
    (c) =>
      new GetTeacherDetailUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listTeachersController,
    (c) =>
      new ListTeachersController({
        listTeachersUseCase: c.resolve(DOCENTES_TOKENS.listTeachersUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getTeacherByIdController,
    (c) =>
      new GetTeacherByIdController({
        getTeacherDetailUseCase: c.resolve(DOCENTES_TOKENS.getTeacherDetailUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.createTeacherUseCase,
    (c) =>
      new CreateTeacherUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.updateTeacherUseCase,
    (c) =>
      new UpdateTeacherUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.deleteTeacherUseCase,
    (c) =>
      new DeleteTeacherUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.createTeacherController,
    (c) =>
      new CreateTeacherController({
        createTeacherUseCase: c.resolve(DOCENTES_TOKENS.createTeacherUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.updateTeacherController,
    (c) =>
      new UpdateTeacherController({
        updateTeacherUseCase: c.resolve(DOCENTES_TOKENS.updateTeacherUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.deleteTeacherController,
    (c) =>
      new DeleteTeacherController({
        deleteTeacherUseCase: c.resolve(DOCENTES_TOKENS.deleteTeacherUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listTeacherAssignmentsUseCase,
    (c) =>
      new ListTeacherAssignmentsUseCase({
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.syncMatriculasTeacherAssignmentUseCase,
    (c) =>
      new SyncMatriculasTeacherAssignmentUseCase({
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.createTeacherAssignmentUseCase,
    (c) =>
      new CreateTeacherAssignmentUseCase({
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
        syncMatriculasTeacherAssignmentUseCase: c.resolve(
          DOCENTES_TOKENS.syncMatriculasTeacherAssignmentUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.assignTeacherToCourseUseCase,
    (c) =>
      new AssignTeacherToCourseUseCase({
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        courseScheduleRepository: c.resolve(REPOSITORIOS_TOKENS.courseScheduleRepository),
        planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        syncMatriculasTeacherAssignmentUseCase: c.resolve(
          DOCENTES_TOKENS.syncMatriculasTeacherAssignmentUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.updateTeacherAssignmentUseCase,
    (c) =>
      new UpdateTeacherAssignmentUseCase({
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.deleteTeacherAssignmentUseCase,
    (c) =>
      new DeleteTeacherAssignmentUseCase({
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        syncMatriculasTeacherAssignmentUseCase: c.resolve(
          DOCENTES_TOKENS.syncMatriculasTeacherAssignmentUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listTeacherAssignmentsController,
    (c) =>
      new ListTeacherAssignmentsController({
        listTeacherAssignmentsUseCase: c.resolve(DOCENTES_TOKENS.listTeacherAssignmentsUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.createTeacherAssignmentController,
    (c) =>
      new CreateTeacherAssignmentController({
        createTeacherAssignmentUseCase: c.resolve(DOCENTES_TOKENS.createTeacherAssignmentUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.assignTeacherToCourseController,
    (c) =>
      new AssignTeacherToCourseController({
        assignTeacherToCourseUseCase: c.resolve(DOCENTES_TOKENS.assignTeacherToCourseUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.updateTeacherAssignmentController,
    (c) =>
      new UpdateTeacherAssignmentController({
        updateTeacherAssignmentUseCase: c.resolve(DOCENTES_TOKENS.updateTeacherAssignmentUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.deleteTeacherAssignmentController,
    (c) =>
      new DeleteTeacherAssignmentController({
        deleteTeacherAssignmentUseCase: c.resolve(DOCENTES_TOKENS.deleteTeacherAssignmentUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listPlanesHabilitadosDocenteUseCase,
    (c) =>
      new ListPlanesHabilitadosDocenteUseCase({
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listPlanesHabilitadosDocenteController,
    (c) =>
      new ListPlanesHabilitadosDocenteController({
        listPlanesHabilitadosDocenteUseCase: c.resolve(DOCENTES_TOKENS.listPlanesHabilitadosDocenteUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listCursosDisponiblesDocenteUseCase,
    (c) =>
      new ListCursosDisponiblesDocenteUseCase({
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listCursosDisponiblesDocenteController,
    (c) =>
      new ListCursosDisponiblesDocenteController({
        listCursosDisponiblesDocenteUseCase: c.resolve(DOCENTES_TOKENS.listCursosDisponiblesDocenteUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getCursoHorariosDocenteUseCase,
    (c) =>
      new GetCursoHorariosDocenteUseCase({
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        courseScheduleRepository: c.resolve(REPOSITORIOS_TOKENS.courseScheduleRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getCursoHorariosDocenteController,
    (c) =>
      new GetCursoHorariosDocenteController({
        getCursoHorariosDocenteUseCase: c.resolve(DOCENTES_TOKENS.getCursoHorariosDocenteUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listPeriodosDocenteAsignacionUseCase,
    (c) =>
      new ListPeriodosDocenteAsignacionUseCase({
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listPeriodosDocenteAsignacionController,
    (c) =>
      new ListPeriodosDocenteAsignacionController({
        listPeriodosDocenteAsignacionUseCase: c.resolve(DOCENTES_TOKENS.listPeriodosDocenteAsignacionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listParalelosDocenteAsignacionUseCase,
    (c) =>
      new ListParalelosDocenteAsignacionUseCase({
        managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
        studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
        periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
        parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listParalelosDocenteAsignacionController,
    (c) =>
      new ListParalelosDocenteAsignacionController({
        listParalelosDocenteAsignacionUseCase: c.resolve(DOCENTES_TOKENS.listParalelosDocenteAsignacionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listCursosPorParaleloDocenteUseCase,
    (c) =>
      new ListCursosPorParaleloDocenteUseCase({
        parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
        courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listCursosPorParaleloDocenteController,
    (c) =>
      new ListCursosPorParaleloDocenteController({
        listCursosPorParaleloDocenteUseCase: c.resolve(DOCENTES_TOKENS.listCursosPorParaleloDocenteUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getDocentesConflictoBloquesUseCase,
    (c) =>
      new GetDocentesConflictoBloquesCursoUseCase({
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getDocentesConflictoBloquesController,
    (c) =>
      new GetDocentesConflictoBloquesController({
        getDocentesConflictoBloquesCursoUseCase: c.resolve(DOCENTES_TOKENS.getDocentesConflictoBloquesUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.docentesRouter,
    (c) => {
      const controllers = {
        listTeachersController: c.resolve(DOCENTES_TOKENS.listTeachersController),
        getTeacherByIdController: c.resolve(DOCENTES_TOKENS.getTeacherByIdController),
        createTeacherController: c.resolve(DOCENTES_TOKENS.createTeacherController),
        updateTeacherController: c.resolve(DOCENTES_TOKENS.updateTeacherController),
        deleteTeacherController: c.resolve(DOCENTES_TOKENS.deleteTeacherController),
        listTeacherAssignmentsController: c.resolve(DOCENTES_TOKENS.listTeacherAssignmentsController),
        createTeacherAssignmentController: c.resolve(DOCENTES_TOKENS.createTeacherAssignmentController),
        assignTeacherToCourseController: c.resolve(DOCENTES_TOKENS.assignTeacherToCourseController),
        updateTeacherAssignmentController: c.resolve(DOCENTES_TOKENS.updateTeacherAssignmentController),
        deleteTeacherAssignmentController: c.resolve(DOCENTES_TOKENS.deleteTeacherAssignmentController),
        listPlanesHabilitadosDocenteController: c.resolve(DOCENTES_TOKENS.listPlanesHabilitadosDocenteController),
        listPeriodosDocenteAsignacionController: c.resolve(DOCENTES_TOKENS.listPeriodosDocenteAsignacionController),
        listParalelosDocenteAsignacionController: c.resolve(DOCENTES_TOKENS.listParalelosDocenteAsignacionController),
        listCursosPorParaleloDocenteController: c.resolve(DOCENTES_TOKENS.listCursosPorParaleloDocenteController),
        listCursosDisponiblesDocenteController: c.resolve(DOCENTES_TOKENS.listCursosDisponiblesDocenteController),
        getCursoHorariosDocenteController: c.resolve(DOCENTES_TOKENS.getCursoHorariosDocenteController),
        getDocentesConflictoBloquesController: c.resolve(DOCENTES_TOKENS.getDocentesConflictoBloquesController),
      };
      const middlewares = {
        validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
      };
      return buildDocentesRouter({ controllers, middlewares });
    }
  );

  return container;
}
