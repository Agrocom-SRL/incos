/**
 * Registro de dependencias del recurso Asistencia (Académico · ítem ACA-ASI).
 * Fase 2 (lectura): mis cursos del docente. Reutiliza los view repos de Calificaciones.
 * Toma de asistencia (modelo sesiones_clase): calendario, planilla, registro masivo,
 * cierre/reapertura por bimestre y sesiones especiales.
 * Cadena: repo/viewRepo → use-case → controller → router → token.
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { GetMisCursosAsistenciaUseCase } from '../../../../application/use-cases/academico/asistencia/GetMisCursosAsistenciaUseCase.js';
import { GetCalendarioAsistenciaUseCase } from '../../../../application/use-cases/academico/asistencia/GetCalendarioAsistenciaUseCase.js';
import { GetPlanillaAsistenciaSemanalUseCase } from '../../../../application/use-cases/academico/asistencia/GetPlanillaAsistenciaSemanalUseCase.js';
import { BulkRegistrarAsistenciaUseCase } from '../../../../application/use-cases/academico/asistencia/BulkRegistrarAsistenciaUseCase.js';
import { CerrarRegistroAsistenciaUseCase } from '../../../../application/use-cases/academico/asistencia/CerrarRegistroAsistenciaUseCase.js';
import { ReabrirRegistroAsistenciaUseCase } from '../../../../application/use-cases/academico/asistencia/ReabrirRegistroAsistenciaUseCase.js';
import { CrearSesionEspecialUseCase } from '../../../../application/use-cases/academico/asistencia/CrearSesionEspecialUseCase.js';
import { EliminarSesionEspecialUseCase } from '../../../../application/use-cases/academico/asistencia/EliminarSesionEspecialUseCase.js';
import { GetMisCursosAsistenciaController } from '../../../../presentation/controllers/academico/asistencia/get-mis-cursos-asistencia.controller.js';
import { GetCalendarioAsistenciaController } from '../../../../presentation/controllers/academico/asistencia/get-calendario-asistencia.controller.js';
import { GetPlanillaAsistenciaController } from '../../../../presentation/controllers/academico/asistencia/get-planilla-asistencia.controller.js';
import { BulkRegistrarAsistenciaController } from '../../../../presentation/controllers/academico/asistencia/bulk-registrar-asistencia.controller.js';
import { CerrarRegistroAsistenciaController } from '../../../../presentation/controllers/academico/asistencia/cerrar-registro-asistencia.controller.js';
import { ReabrirRegistroAsistenciaController } from '../../../../presentation/controllers/academico/asistencia/reabrir-registro-asistencia.controller.js';
import { CrearSesionEspecialController } from '../../../../presentation/controllers/academico/asistencia/crear-sesion-especial.controller.js';
import { EliminarSesionEspecialController } from '../../../../presentation/controllers/academico/asistencia/eliminar-sesion-especial.controller.js';
import { buildAsistenciaRouter } from '../../../../presentation/routes/asistencia.routes.js';

export function registerAsistenciaResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.getMisCursosAsistenciaUseCase,
    (c) =>
      new GetMisCursosAsistenciaUseCase({
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCalendarioAsistenciaUseCase,
    (c) =>
      new GetCalendarioAsistenciaUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        asistenciaSesionViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaSesionViewRepository
        ),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
        asistenciaRegistroEstadoViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaRegistroEstadoViewRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPlanillaAsistenciaSemanalUseCase,
    (c) =>
      new GetPlanillaAsistenciaSemanalUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        asistenciaSesionViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaSesionViewRepository
        ),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
        asistenciaRegistroEstadoViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaRegistroEstadoViewRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.bulkRegistrarAsistenciaUseCase,
    (c) =>
      new BulkRegistrarAsistenciaUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        sesionClaseRepository: c.resolve(REPOSITORIOS_TOKENS.sesionClaseRepository),
        attendanceRepository: c.resolve(REPOSITORIOS_TOKENS.attendanceRepository),
        asistenciaSesionViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaSesionViewRepository
        ),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
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
    ACADEMICO_TOKENS.cerrarRegistroAsistenciaUseCase,
    (c) =>
      new CerrarRegistroAsistenciaUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        sesionClaseRepository: c.resolve(REPOSITORIOS_TOKENS.sesionClaseRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.reabrirRegistroAsistenciaUseCase,
    (c) =>
      new ReabrirRegistroAsistenciaUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        sesionClaseRepository: c.resolve(REPOSITORIOS_TOKENS.sesionClaseRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.crearSesionEspecialUseCase,
    (c) =>
      new CrearSesionEspecialUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        cuadernoRepository: c.resolve(REPOSITORIOS_TOKENS.cuadernoRepository),
        sesionClaseRepository: c.resolve(REPOSITORIOS_TOKENS.sesionClaseRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.eliminarSesionEspecialUseCase,
    (c) =>
      new EliminarSesionEspecialUseCase({
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        sesionClaseRepository: c.resolve(REPOSITORIOS_TOKENS.sesionClaseRepository),
        asistenciaPlanillaViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.getMisCursosAsistenciaController,
    (c) =>
      new GetMisCursosAsistenciaController({
        getMisCursosAsistenciaUseCase: c.resolve(ACADEMICO_TOKENS.getMisCursosAsistenciaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getCalendarioAsistenciaController,
    (c) =>
      new GetCalendarioAsistenciaController({
        getCalendarioAsistenciaUseCase: c.resolve(ACADEMICO_TOKENS.getCalendarioAsistenciaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getPlanillaAsistenciaController,
    (c) =>
      new GetPlanillaAsistenciaController({
        getPlanillaAsistenciaSemanalUseCase: c.resolve(
          ACADEMICO_TOKENS.getPlanillaAsistenciaSemanalUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.bulkRegistrarAsistenciaController,
    (c) =>
      new BulkRegistrarAsistenciaController({
        bulkRegistrarAsistenciaUseCase: c.resolve(ACADEMICO_TOKENS.bulkRegistrarAsistenciaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cerrarRegistroAsistenciaController,
    (c) =>
      new CerrarRegistroAsistenciaController({
        cerrarRegistroAsistenciaUseCase: c.resolve(
          ACADEMICO_TOKENS.cerrarRegistroAsistenciaUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.reabrirRegistroAsistenciaController,
    (c) =>
      new ReabrirRegistroAsistenciaController({
        reabrirRegistroAsistenciaUseCase: c.resolve(
          ACADEMICO_TOKENS.reabrirRegistroAsistenciaUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.crearSesionEspecialController,
    (c) =>
      new CrearSesionEspecialController({
        crearSesionEspecialUseCase: c.resolve(ACADEMICO_TOKENS.crearSesionEspecialUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.eliminarSesionEspecialController,
    (c) =>
      new EliminarSesionEspecialController({
        eliminarSesionEspecialUseCase: c.resolve(ACADEMICO_TOKENS.eliminarSesionEspecialUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  // ============================================
  // ROUTER — reutiliza el controller de coordinación-docentes de Calificaciones
  // ============================================
  registerComponent(container, ACADEMICO_TOKENS.asistenciaRouter, (c) =>
    buildAsistenciaRouter({
      controllers: {
        getMisCursosAsistenciaController: c.resolve(
          ACADEMICO_TOKENS.getMisCursosAsistenciaController
        ),
        coordinacionDocentesController: c.resolve(
          ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesController
        ),
        getCalendarioAsistenciaController: c.resolve(
          ACADEMICO_TOKENS.getCalendarioAsistenciaController
        ),
        getPlanillaAsistenciaController: c.resolve(
          ACADEMICO_TOKENS.getPlanillaAsistenciaController
        ),
        bulkRegistrarAsistenciaController: c.resolve(
          ACADEMICO_TOKENS.bulkRegistrarAsistenciaController
        ),
        cerrarRegistroAsistenciaController: c.resolve(
          ACADEMICO_TOKENS.cerrarRegistroAsistenciaController
        ),
        reabrirRegistroAsistenciaController: c.resolve(
          ACADEMICO_TOKENS.reabrirRegistroAsistenciaController
        ),
        crearSesionEspecialController: c.resolve(ACADEMICO_TOKENS.crearSesionEspecialController),
        eliminarSesionEspecialController: c.resolve(
          ACADEMICO_TOKENS.eliminarSesionEspecialController
        )
      },
      middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) }
    })
  );

  return container;
}
