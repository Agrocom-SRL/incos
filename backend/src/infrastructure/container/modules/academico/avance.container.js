/**
 * Registro de dependencias de Avance académico + Deserción (Académico · ítem
 * ACA `/academico/avance`, con pestaña Deserción). Nacen con la disolución del
 * módulo REP (2026-07-29).
 * Cadena: viewRepo (arquetipo B) → use-case → controller → router → token.
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { GetAvanceAcademicoUseCase } from '../../../../application/use-cases/academico/GetAvanceAcademicoUseCase.js';
import { ExportAvanceAcademicoExcelUseCase } from '../../../../application/use-cases/academico/ExportAvanceAcademicoExcelUseCase.js';
import { GetDesercionUseCase } from '../../../../application/use-cases/academico/GetDesercionUseCase.js';
import { ExportDesercionExcelUseCase } from '../../../../application/use-cases/academico/ExportDesercionExcelUseCase.js';
import { GetAvanceAcademicoController } from '../../../../presentation/controllers/academico/avance/get-avance-academico.controller.js';
import { ExportAvanceAcademicoController } from '../../../../presentation/controllers/academico/avance/export-avance-academico.controller.js';
import { GetDesercionController } from '../../../../presentation/controllers/academico/desercion/get-desercion.controller.js';
import { ExportDesercionController } from '../../../../presentation/controllers/academico/desercion/export-desercion.controller.js';
import { buildAvanceAcademicoRouter } from '../../../../presentation/routes/avance-academico.routes.js';
import { buildDesercionRouter } from '../../../../presentation/routes/desercion.routes.js';

export function registerAvanceResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.getAvanceAcademicoUseCase,
    (c) =>
      new GetAvanceAcademicoUseCase({
        avanceAcademicoViewRepository: c.resolve(
          REPOSITORIOS_TOKENS.avanceAcademicoViewRepository
        ),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportAvanceAcademicoExcelUseCase,
    (c) =>
      new ExportAvanceAcademicoExcelUseCase({
        getAvanceAcademicoUseCase: c.resolve(ACADEMICO_TOKENS.getAvanceAcademicoUseCase),
        avanceAcademicoExcelGenerator: c.resolve(SERVICIOS_TOKENS.avanceAcademicoExcelGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getDesercionUseCase,
    (c) =>
      new GetDesercionUseCase({
        desercionViewRepository: c.resolve(REPOSITORIOS_TOKENS.desercionViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportDesercionExcelUseCase,
    (c) =>
      new ExportDesercionExcelUseCase({
        getDesercionUseCase: c.resolve(ACADEMICO_TOKENS.getDesercionUseCase),
        desercionExcelGenerator: c.resolve(SERVICIOS_TOKENS.desercionExcelGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.getAvanceAcademicoController,
    (c) =>
      new GetAvanceAcademicoController({
        getAvanceAcademicoUseCase: c.resolve(ACADEMICO_TOKENS.getAvanceAcademicoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportAvanceAcademicoController,
    (c) =>
      new ExportAvanceAcademicoController({
        exportAvanceAcademicoExcelUseCase: c.resolve(
          ACADEMICO_TOKENS.exportAvanceAcademicoExcelUseCase
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getDesercionController,
    (c) =>
      new GetDesercionController({
        getDesercionUseCase: c.resolve(ACADEMICO_TOKENS.getDesercionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter)
      })
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportDesercionController,
    (c) =>
      new ExportDesercionController({
        exportDesercionExcelUseCase: c.resolve(ACADEMICO_TOKENS.exportDesercionExcelUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger)
      })
  );

  // ============================================
  // ROUTERS
  // ============================================
  registerComponent(container, ACADEMICO_TOKENS.avanceAcademicoRouter, (c) =>
    buildAvanceAcademicoRouter({
      controllers: {
        getAvanceAcademicoController: c.resolve(ACADEMICO_TOKENS.getAvanceAcademicoController),
        exportAvanceAcademicoController: c.resolve(
          ACADEMICO_TOKENS.exportAvanceAcademicoController
        )
      }
    })
  );

  registerComponent(container, ACADEMICO_TOKENS.desercionRouter, (c) =>
    buildDesercionRouter({
      controllers: {
        getDesercionController: c.resolve(ACADEMICO_TOKENS.getDesercionController),
        exportDesercionController: c.resolve(ACADEMICO_TOKENS.exportDesercionController)
      }
    })
  );

  return container;
}
