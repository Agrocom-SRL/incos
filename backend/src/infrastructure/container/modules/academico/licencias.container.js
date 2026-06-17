/**
 * Registro de dependencias del recurso Licencias estudiantiles
 * (Académico · ítem ACA-ASI, página dentro de Asistencia · Fase 4).
 * Cadena: repo → use-case → controller → router → token.
 * @see docs/plan/MODULO-ASISTENCIA.md §6.2-§6.3.
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListarLicenciasUseCase } from '../../../../application/use-cases/academico/licencias/ListarLicenciasUseCase.js';
import { GetLicenciaByIdUseCase } from '../../../../application/use-cases/academico/licencias/GetLicenciaByIdUseCase.js';
import { GetInscripcionVigenteUseCase } from '../../../../application/use-cases/academico/licencias/GetInscripcionVigenteUseCase.js';
import { CrearLicenciaUseCase } from '../../../../application/use-cases/academico/licencias/CrearLicenciaUseCase.js';
import { DecidirLicenciaUseCase } from '../../../../application/use-cases/academico/licencias/DecidirLicenciaUseCase.js';
import { ListarLicenciasController } from '../../../../presentation/controllers/academico/licencias/listar-licencias.controller.js';
import { GetLicenciaByIdController } from '../../../../presentation/controllers/academico/licencias/get-licencia-by-id.controller.js';
import { GetInscripcionVigenteController } from '../../../../presentation/controllers/academico/licencias/get-inscripcion-vigente.controller.js';
import { CrearLicenciaController } from '../../../../presentation/controllers/academico/licencias/crear-licencia.controller.js';
import { DecidirLicenciaController } from '../../../../presentation/controllers/academico/licencias/decidir-licencia.controller.js';
import { buildLicenciasRouter } from '../../../../presentation/routes/licencias.routes.js';

export function registerLicenciasResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.listarLicenciasUseCase,
    (c) =>
      new ListarLicenciasUseCase({
        licenseRepository: c.resolve(REPOSITORIOS_TOKENS.licenseRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getLicenciaByIdUseCase,
    (c) =>
      new GetLicenciaByIdUseCase({
        licenseRepository: c.resolve(REPOSITORIOS_TOKENS.licenseRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getInscripcionVigenteUseCase,
    (c) =>
      new GetInscripcionVigenteUseCase({
        licenseRepository: c.resolve(REPOSITORIOS_TOKENS.licenseRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.crearLicenciaUseCase,
    (c) =>
      new CrearLicenciaUseCase({
        licenseRepository: c.resolve(REPOSITORIOS_TOKENS.licenseRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.decidirLicenciaUseCase,
    (c) =>
      new DecidirLicenciaUseCase({
        licenseRepository: c.resolve(REPOSITORIOS_TOKENS.licenseRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.listarLicenciasController,
    (c) =>
      new ListarLicenciasController({
        listarLicenciasUseCase: c.resolve(ACADEMICO_TOKENS.listarLicenciasUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getLicenciaByIdController,
    (c) =>
      new GetLicenciaByIdController({
        getLicenciaByIdUseCase: c.resolve(ACADEMICO_TOKENS.getLicenciaByIdUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getInscripcionVigenteController,
    (c) =>
      new GetInscripcionVigenteController({
        getInscripcionVigenteUseCase: c.resolve(ACADEMICO_TOKENS.getInscripcionVigenteUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.crearLicenciaController,
    (c) =>
      new CrearLicenciaController({
        crearLicenciaUseCase: c.resolve(ACADEMICO_TOKENS.crearLicenciaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.decidirLicenciaController,
    (c) =>
      new DecidirLicenciaController({
        decidirLicenciaUseCase: c.resolve(ACADEMICO_TOKENS.decidirLicenciaUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  // ============================================
  // ROUTER
  // ============================================
  registerComponent(container, ACADEMICO_TOKENS.licenciasRouter, (c) =>
    buildLicenciasRouter({
      controllers: {
        listarLicenciasController: c.resolve(ACADEMICO_TOKENS.listarLicenciasController),
        getInscripcionVigenteController: c.resolve(
          ACADEMICO_TOKENS.getInscripcionVigenteController,
        ),
        getLicenciaByIdController: c.resolve(ACADEMICO_TOKENS.getLicenciaByIdController),
        crearLicenciaController: c.resolve(ACADEMICO_TOKENS.crearLicenciaController),
        decidirLicenciaController: c.resolve(ACADEMICO_TOKENS.decidirLicenciaController),
      },
      middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) },
    }),
  );

  return container;
}

export default registerLicenciasResource;
