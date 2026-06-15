/**
 * Registro de dependencias del recurso Asistencia (Académico · ítem ACA-ASI).
 * Fase 2 (lectura): mis cursos del docente. Reutiliza los view repos de Calificaciones.
 * Cadena: repo/viewRepo → use-case → controller → router → token.
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { GetMisCursosAsistenciaUseCase } from '../../../../application/use-cases/academico/asistencia/GetMisCursosAsistenciaUseCase.js';
import { GetMisCursosAsistenciaController } from '../../../../presentation/controllers/academico/asistencia/get-mis-cursos-asistencia.controller.js';
import { buildAsistenciaRouter } from '../../../../presentation/routes/asistencia.routes.js';

export function registerAsistenciaResource(container) {
  // Use case
  registerComponent(
    container,
    ACADEMICO_TOKENS.getMisCursosAsistenciaUseCase,
    (c) =>
      new GetMisCursosAsistenciaUseCase({
        calificacionContextoRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionContextoRepository),
        calificacionCoordinacionRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCoordinacionRepository,
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  // Controller
  registerComponent(
    container,
    ACADEMICO_TOKENS.getMisCursosAsistenciaController,
    (c) =>
      new GetMisCursosAsistenciaController({
        getMisCursosAsistenciaUseCase: c.resolve(ACADEMICO_TOKENS.getMisCursosAsistenciaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  // Router — reutiliza el controller de coordinación-docentes de Calificaciones
  registerComponent(container, ACADEMICO_TOKENS.asistenciaRouter, (c) =>
    buildAsistenciaRouter({
      controllers: {
        getMisCursosAsistenciaController: c.resolve(
          ACADEMICO_TOKENS.getMisCursosAsistenciaController,
        ),
        coordinacionDocentesController: c.resolve(
          ACADEMICO_TOKENS.listCoordinacionCalificacionesDocentesController,
        ),
      },
      middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) },
    }),
  );

  return container;
}
