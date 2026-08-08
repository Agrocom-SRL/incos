/**
 * Registro de dependencias del recurso Nivelaciones (ACA · schema 16 — Fase
 * D). Cadena: repo/viewRepo → use-case → controller → router → token. Los
 * repositorios viven en repositories.container.js (REPOSITORIOS_TOKENS.
 * subjectEnrollmentHistoryRepository / levelingRepository /
 * subjectEnrollmentRepository / nivelacionParaleloViewRepository).
 *
 * @see docs/plan/calificaciones-centralizador-nivelacion-rediseno.md (Fase D).
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListHistorialMatriculaParaleloUseCase } from '../../../../application/use-cases/academico/nivelaciones/ListHistorialMatriculaParaleloUseCase.js';
import { ListPendientesNivelacionParaleloUseCase } from '../../../../application/use-cases/academico/nivelaciones/ListPendientesNivelacionParaleloUseCase.js';
import { ListNivelacionesPendientesUseCase } from '../../../../application/use-cases/academico/nivelaciones/ListNivelacionesPendientesUseCase.js';
import { RegistrarEventoHistorialMatriculaUseCase } from '../../../../application/use-cases/academico/nivelaciones/RegistrarEventoHistorialMatriculaUseCase.js';
import { RegistrarDecisionAdministrativaUseCase } from '../../../../application/use-cases/academico/nivelaciones/RegistrarDecisionAdministrativaUseCase.js';
import { ProgramarNivelacionUseCase } from '../../../../application/use-cases/academico/nivelaciones/ProgramarNivelacionUseCase.js';
import { RegistrarResultadoNivelacionUseCase } from '../../../../application/use-cases/academico/nivelaciones/RegistrarResultadoNivelacionUseCase.js';
import { ListMateriasPendientesEstudianteUseCase } from '../../../../application/use-cases/academico/nivelaciones/ListMateriasPendientesEstudianteUseCase.js';
import { ListHistorialMatriculaParaleloController } from '../../../../presentation/controllers/academico/nivelaciones/list-historial-matricula-paralelo.controller.js';
import { ListPendientesNivelacionParaleloController } from '../../../../presentation/controllers/academico/nivelaciones/list-pendientes-nivelacion-paralelo.controller.js';
import { ListNivelacionesPendientesController } from '../../../../presentation/controllers/academico/nivelaciones/list-nivelaciones-pendientes.controller.js';
import { RegistrarEventoHistorialMatriculaController } from '../../../../presentation/controllers/academico/nivelaciones/registrar-evento-historial-matricula.controller.js';
import { RegistrarDecisionAdministrativaController } from '../../../../presentation/controllers/academico/nivelaciones/registrar-decision-administrativa.controller.js';
import { ProgramarNivelacionController } from '../../../../presentation/controllers/academico/nivelaciones/programar-nivelacion.controller.js';
import { RegistrarResultadoNivelacionController } from '../../../../presentation/controllers/academico/nivelaciones/registrar-resultado-nivelacion.controller.js';
import { ListMateriasPendientesEstudianteController } from '../../../../presentation/controllers/academico/nivelaciones/list-materias-pendientes-estudiante.controller.js';
import { buildNivelacionesRouter } from '../../../../presentation/routes/nivelaciones.routes.js';

export function registerNivelacionesResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.listHistorialMatriculaParaleloUseCase,
    (c) =>
      new ListHistorialMatriculaParaleloUseCase({
        nivelacionParaleloViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.nivelacionParaleloViewRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listPendientesNivelacionParaleloUseCase,
    (c) =>
      new ListPendientesNivelacionParaleloUseCase({
        nivelacionParaleloViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.nivelacionParaleloViewRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listNivelacionesPendientesUseCase,
    (c) =>
      new ListNivelacionesPendientesUseCase({
        nivelacionParaleloViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.nivelacionParaleloViewRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.registrarEventoHistorialMatriculaUseCase,
    (c) =>
      new RegistrarEventoHistorialMatriculaUseCase({
        subjectEnrollmentHistoryRepository: c.resolve(
          REPOSITORIOS_TOKENS.subjectEnrollmentHistoryRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.registrarDecisionAdministrativaUseCase,
    (c) =>
      new RegistrarDecisionAdministrativaUseCase({
        registrarEventoHistorialMatriculaUseCase: c.resolve(
          ACADEMICO_TOKENS.registrarEventoHistorialMatriculaUseCase,
        ),
        subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.programarNivelacionUseCase,
    (c) =>
      new ProgramarNivelacionUseCase({
        registrarEventoHistorialMatriculaUseCase: c.resolve(
          ACADEMICO_TOKENS.registrarEventoHistorialMatriculaUseCase,
        ),
        levelingRepository: c.resolve(REPOSITORIOS_TOKENS.levelingRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.registrarResultadoNivelacionUseCase,
    (c) =>
      new RegistrarResultadoNivelacionUseCase({
        levelingRepository: c.resolve(REPOSITORIOS_TOKENS.levelingRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listMateriasPendientesEstudianteUseCase,
    (c) =>
      new ListMateriasPendientesEstudianteUseCase({
        nivelacionParaleloViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.nivelacionParaleloViewRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.listHistorialMatriculaParaleloController,
    (c) =>
      new ListHistorialMatriculaParaleloController({
        listHistorialMatriculaParaleloUseCase: c.resolve(
          ACADEMICO_TOKENS.listHistorialMatriculaParaleloUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listPendientesNivelacionParaleloController,
    (c) =>
      new ListPendientesNivelacionParaleloController({
        listPendientesNivelacionParaleloUseCase: c.resolve(
          ACADEMICO_TOKENS.listPendientesNivelacionParaleloUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listNivelacionesPendientesController,
    (c) =>
      new ListNivelacionesPendientesController({
        listNivelacionesPendientesUseCase: c.resolve(
          ACADEMICO_TOKENS.listNivelacionesPendientesUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.registrarEventoHistorialMatriculaController,
    (c) =>
      new RegistrarEventoHistorialMatriculaController({
        registrarEventoHistorialMatriculaUseCase: c.resolve(
          ACADEMICO_TOKENS.registrarEventoHistorialMatriculaUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.registrarDecisionAdministrativaController,
    (c) =>
      new RegistrarDecisionAdministrativaController({
        registrarDecisionAdministrativaUseCase: c.resolve(
          ACADEMICO_TOKENS.registrarDecisionAdministrativaUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.programarNivelacionController,
    (c) =>
      new ProgramarNivelacionController({
        programarNivelacionUseCase: c.resolve(ACADEMICO_TOKENS.programarNivelacionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.registrarResultadoNivelacionController,
    (c) =>
      new RegistrarResultadoNivelacionController({
        registrarResultadoNivelacionUseCase: c.resolve(
          ACADEMICO_TOKENS.registrarResultadoNivelacionUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listMateriasPendientesEstudianteController,
    (c) =>
      new ListMateriasPendientesEstudianteController({
        listMateriasPendientesEstudianteUseCase: c.resolve(
          ACADEMICO_TOKENS.listMateriasPendientesEstudianteUseCase,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  // ============================================
  // ROUTER
  // ============================================
  registerComponent(container, ACADEMICO_TOKENS.nivelacionesRouter, (c) =>
    buildNivelacionesRouter({
      controllers: {
        listHistorialMatriculaParaleloController: c.resolve(
          ACADEMICO_TOKENS.listHistorialMatriculaParaleloController,
        ),
        listPendientesNivelacionParaleloController: c.resolve(
          ACADEMICO_TOKENS.listPendientesNivelacionParaleloController,
        ),
        listNivelacionesPendientesController: c.resolve(
          ACADEMICO_TOKENS.listNivelacionesPendientesController,
        ),
        registrarEventoHistorialMatriculaController: c.resolve(
          ACADEMICO_TOKENS.registrarEventoHistorialMatriculaController,
        ),
        registrarDecisionAdministrativaController: c.resolve(
          ACADEMICO_TOKENS.registrarDecisionAdministrativaController,
        ),
        programarNivelacionController: c.resolve(ACADEMICO_TOKENS.programarNivelacionController),
        registrarResultadoNivelacionController: c.resolve(
          ACADEMICO_TOKENS.registrarResultadoNivelacionController,
        ),
        listMateriasPendientesEstudianteController: c.resolve(
          ACADEMICO_TOKENS.listMateriasPendientesEstudianteController,
        ),
      },
      middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) },
    }),
  );

  return container;
}

export default registerNivelacionesResource;
