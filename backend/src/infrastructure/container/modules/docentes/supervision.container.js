/**
 * Registro de dependencias del recurso Supervisión docente (módulo DOC ·
 * fichas_seguimiento_clase, schema 27).
 *
 * Responsabilidades:
 * - Registrar repositorios propios (arquetipo A + view repo B) con tokens
 *   scoped DOCENTES_TOKENS.* (patrón Pasantías: diff mínimo, no se tocan los
 *   índices compartidos de repositorios).
 * - Registrar Use Cases del recurso (S1-S6).
 * - Registrar Controllers correspondientes.
 * - Construir y registrar el router /supervision-docente.
 *
 * Principio SRP: este container maneja solo UN recurso; el generador PDF vive
 * en services.container.js (SERVICIOS_TOKENS.fichaSeguimientoClasePdfGenerator)
 * y los catálogos reutilizados (asignaciones, docentes, usuarios) se consumen
 * de REPOSITORIOS_TOKENS.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { DOCENTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent, registerRepository } from '../../utils/container.helpers.js';
import { FichaSeguimientoClaseRepository } from '../../../repositories/FichaSeguimientoClaseRepository.js';
import { FichaSeguimientoListadoViewRepository } from '../../../repositories/views/FichaSeguimientoListadoViewRepository.js';
import { ListFichasSeguimientoUseCase } from '../../../../application/use-cases/docentes/supervision/ListFichasSeguimientoUseCase.js';
import { GetFichaSeguimientoByIdUseCase } from '../../../../application/use-cases/docentes/supervision/GetFichaSeguimientoByIdUseCase.js';
import { CreateFichaSeguimientoUseCase } from '../../../../application/use-cases/docentes/supervision/CreateFichaSeguimientoUseCase.js';
import { UpdateFichaSeguimientoUseCase } from '../../../../application/use-cases/docentes/supervision/UpdateFichaSeguimientoUseCase.js';
import { ListMisFichasSeguimientoDocenteUseCase } from '../../../../application/use-cases/docentes/supervision/ListMisFichasSeguimientoDocenteUseCase.js';
import { ExportFichaSeguimientoPdfUseCase } from '../../../../application/use-cases/docentes/supervision/ExportFichaSeguimientoPdfUseCase.js';
import {
  ListFichasSeguimientoController,
  GetFichaSeguimientoByIdController,
  CreateFichaSeguimientoController,
  UpdateFichaSeguimientoController,
  ListMisFichasSeguimientoController,
  ExportFichaSeguimientoPdfController,
} from '../../../../presentation/controllers/docentes/supervision/index.js';
import { buildSupervisionDocenteRouter } from '../../../../presentation/routes/supervision-docente.routes.js';

export function registerSupervisionDocenteResource(container) {
  // ============================================
  // REPOSITORIOS (singletons del recurso)
  // ============================================
  registerRepository(
    container,
    DOCENTES_TOKENS.fichaSeguimientoClaseRepository,
    FichaSeguimientoClaseRepository
  );
  registerRepository(
    container,
    DOCENTES_TOKENS.fichaSeguimientoListadoViewRepository,
    FichaSeguimientoListadoViewRepository
  );

  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    DOCENTES_TOKENS.listFichasSeguimientoUseCase,
    (c) =>
      new ListFichasSeguimientoUseCase({
        fichaSeguimientoListadoViewRepository: c.resolve(
          DOCENTES_TOKENS.fichaSeguimientoListadoViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.getFichaSeguimientoByIdUseCase,
    (c) =>
      new GetFichaSeguimientoByIdUseCase({
        fichaSeguimientoClaseRepository: c.resolve(DOCENTES_TOKENS.fichaSeguimientoClaseRepository),
        fichaSeguimientoListadoViewRepository: c.resolve(
          DOCENTES_TOKENS.fichaSeguimientoListadoViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.createFichaSeguimientoUseCase,
    (c) =>
      new CreateFichaSeguimientoUseCase({
        fichaSeguimientoClaseRepository: c.resolve(DOCENTES_TOKENS.fichaSeguimientoClaseRepository),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.updateFichaSeguimientoUseCase,
    (c) =>
      new UpdateFichaSeguimientoUseCase({
        fichaSeguimientoClaseRepository: c.resolve(DOCENTES_TOKENS.fichaSeguimientoClaseRepository),
        teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.listMisFichasSeguimientoDocenteUseCase,
    (c) =>
      new ListMisFichasSeguimientoDocenteUseCase({
        fichaSeguimientoListadoViewRepository: c.resolve(
          DOCENTES_TOKENS.fichaSeguimientoListadoViewRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DOCENTES_TOKENS.exportFichaSeguimientoPdfUseCase,
    (c) =>
      new ExportFichaSeguimientoPdfUseCase({
        fichaSeguimientoClaseRepository: c.resolve(DOCENTES_TOKENS.fichaSeguimientoClaseRepository),
        fichaSeguimientoListadoViewRepository: c.resolve(
          DOCENTES_TOKENS.fichaSeguimientoListadoViewRepository
        ),
        fichaSeguimientoClasePdfGenerator: c.resolve(
          SERVICIOS_TOKENS.fichaSeguimientoClasePdfGenerator
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  const controllerFactories = [
    [
      DOCENTES_TOKENS.listFichasSeguimientoController,
      (c) =>
        new ListFichasSeguimientoController({
          listFichasSeguimientoUseCase: c.resolve(DOCENTES_TOKENS.listFichasSeguimientoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      DOCENTES_TOKENS.getFichaSeguimientoByIdController,
      (c) =>
        new GetFichaSeguimientoByIdController({
          getFichaSeguimientoByIdUseCase: c.resolve(DOCENTES_TOKENS.getFichaSeguimientoByIdUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      DOCENTES_TOKENS.createFichaSeguimientoController,
      (c) =>
        new CreateFichaSeguimientoController({
          createFichaSeguimientoUseCase: c.resolve(DOCENTES_TOKENS.createFichaSeguimientoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      DOCENTES_TOKENS.updateFichaSeguimientoController,
      (c) =>
        new UpdateFichaSeguimientoController({
          updateFichaSeguimientoUseCase: c.resolve(DOCENTES_TOKENS.updateFichaSeguimientoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      DOCENTES_TOKENS.listMisFichasSeguimientoController,
      (c) =>
        new ListMisFichasSeguimientoController({
          listMisFichasSeguimientoDocenteUseCase: c.resolve(
            DOCENTES_TOKENS.listMisFichasSeguimientoDocenteUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      DOCENTES_TOKENS.exportFichaSeguimientoPdfController,
      (c) =>
        new ExportFichaSeguimientoPdfController({
          exportFichaSeguimientoPdfUseCase: c.resolve(
            DOCENTES_TOKENS.exportFichaSeguimientoPdfUseCase
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
  registerComponent(container, DOCENTES_TOKENS.supervisionDocenteRouter, (c) => {
    const controllers = {
      listFichasSeguimientoController: c.resolve(DOCENTES_TOKENS.listFichasSeguimientoController),
      getFichaSeguimientoByIdController: c.resolve(
        DOCENTES_TOKENS.getFichaSeguimientoByIdController
      ),
      createFichaSeguimientoController: c.resolve(DOCENTES_TOKENS.createFichaSeguimientoController),
      updateFichaSeguimientoController: c.resolve(DOCENTES_TOKENS.updateFichaSeguimientoController),
      listMisFichasSeguimientoController: c.resolve(
        DOCENTES_TOKENS.listMisFichasSeguimientoController
      ),
      exportFichaSeguimientoPdfController: c.resolve(
        DOCENTES_TOKENS.exportFichaSeguimientoPdfController
      ),
    };

    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };

    return buildSupervisionDocenteRouter({ controllers, middlewares });
  });

  return container;
}
