/**
 * Registro de dependencias del recurso Libros de registro
 * (ACA · schema 25 — Fase 4). Cadena: repo/viewRepo → use-case → controller →
 * router → token. Los repositorios viven en repositories.container.js
 * (REPOSITORIOS_TOKENS.libroRegistroRepository / libroRegistroViewRepository)
 * y el generador Excel en services.container.js
 * (SERVICIOS_TOKENS.libroRegistroExcelGenerator).
 *
 * @see docs/plan/libros-registro-plan-desarrollo.md (bloque C).
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListLibrosUseCase } from '../../../../application/use-cases/academico/libros/ListLibrosUseCase.js';
import { AbrirLibroUseCase } from '../../../../application/use-cases/academico/libros/AbrirLibroUseCase.js';
import { GetLibroByIdUseCase } from '../../../../application/use-cases/academico/libros/GetLibroByIdUseCase.js';
import { EditarLibroUseCase } from '../../../../application/use-cases/academico/libros/EditarLibroUseCase.js';
import { ListParalelosLibroUseCase } from '../../../../application/use-cases/academico/libros/ListParalelosLibroUseCase.js';
import { GenerarFoliosParaleloUseCase } from '../../../../application/use-cases/academico/libros/GenerarFoliosParaleloUseCase.js';
import { GenerarFoliosGestionUseCase } from '../../../../application/use-cases/academico/libros/GenerarFoliosGestionUseCase.js';
import { GetFolioByIdUseCase } from '../../../../application/use-cases/academico/libros/GetFolioByIdUseCase.js';
import { CambiarEstadoFolioUseCase } from '../../../../application/use-cases/academico/libros/CambiarEstadoFolioUseCase.js';
import { EditarFolioEstudianteUseCase } from '../../../../application/use-cases/academico/libros/EditarFolioEstudianteUseCase.js';
import { ExportLibroExcelUseCase } from '../../../../application/use-cases/academico/libros/ExportLibroExcelUseCase.js';
import { ListLibrosController } from '../../../../presentation/controllers/academico/libros/list-libros.controller.js';
import { AbrirLibroController } from '../../../../presentation/controllers/academico/libros/abrir-libro.controller.js';
import { GetLibroByIdController } from '../../../../presentation/controllers/academico/libros/get-libro-by-id.controller.js';
import { EditarLibroController } from '../../../../presentation/controllers/academico/libros/editar-libro.controller.js';
import { ListParalelosLibroController } from '../../../../presentation/controllers/academico/libros/list-paralelos-libro.controller.js';
import { GenerarFoliosParaleloController } from '../../../../presentation/controllers/academico/libros/generar-folios-paralelo.controller.js';
import { GenerarFoliosGestionController } from '../../../../presentation/controllers/academico/libros/generar-folios-gestion.controller.js';
import { GetFolioByIdController } from '../../../../presentation/controllers/academico/libros/get-folio-by-id.controller.js';
import { CambiarEstadoFolioController } from '../../../../presentation/controllers/academico/libros/cambiar-estado-folio.controller.js';
import { EditarFolioEstudianteController } from '../../../../presentation/controllers/academico/libros/editar-folio-estudiante.controller.js';
import { ExportLibroExcelController } from '../../../../presentation/controllers/academico/libros/export-libro-excel.controller.js';
import { buildLibrosRouter } from '../../../../presentation/routes/libros.routes.js';

export function registerLibrosResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.listLibrosUseCase,
    (c) =>
      new ListLibrosUseCase({
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.abrirLibroUseCase,
    (c) =>
      new AbrirLibroUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getLibroByIdUseCase,
    (c) =>
      new GetLibroByIdUseCase({
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.editarLibroUseCase,
    (c) =>
      new EditarLibroUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        // Cierre con pendientes: notas vivas (135) + política de nota mínima.
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository,
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository,
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listParalelosLibroUseCase,
    (c) =>
      new ListParalelosLibroUseCase({
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.generarFoliosParaleloUseCase,
    (c) =>
      new GenerarFoliosParaleloUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository,
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository,
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.generarFoliosGestionUseCase,
    (c) =>
      new GenerarFoliosGestionUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository,
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository,
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getFolioByIdUseCase,
    (c) =>
      new GetFolioByIdUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository,
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cambiarEstadoFolioUseCase,
    (c) =>
      new CambiarEstadoFolioUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.editarFolioEstudianteUseCase,
    (c) =>
      new EditarFolioEstudianteUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportLibroExcelUseCase,
    (c) =>
      new ExportLibroExcelUseCase({
        libroRegistroRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroRepository),
        libroRegistroViewRepository: c.resolve(REPOSITORIOS_TOKENS.libroRegistroViewRepository),
        calificacionCentralizadorRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionCentralizadorRepository,
        ),
        libroRegistroExcelGenerator: c.resolve(SERVICIOS_TOKENS.libroRegistroExcelGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  registerComponent(
    container,
    ACADEMICO_TOKENS.listLibrosController,
    (c) =>
      new ListLibrosController({
        listLibrosUseCase: c.resolve(ACADEMICO_TOKENS.listLibrosUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.abrirLibroController,
    (c) =>
      new AbrirLibroController({
        abrirLibroUseCase: c.resolve(ACADEMICO_TOKENS.abrirLibroUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getLibroByIdController,
    (c) =>
      new GetLibroByIdController({
        getLibroByIdUseCase: c.resolve(ACADEMICO_TOKENS.getLibroByIdUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.editarLibroController,
    (c) =>
      new EditarLibroController({
        editarLibroUseCase: c.resolve(ACADEMICO_TOKENS.editarLibroUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.listParalelosLibroController,
    (c) =>
      new ListParalelosLibroController({
        listParalelosLibroUseCase: c.resolve(ACADEMICO_TOKENS.listParalelosLibroUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.generarFoliosParaleloController,
    (c) =>
      new GenerarFoliosParaleloController({
        generarFoliosParaleloUseCase: c.resolve(ACADEMICO_TOKENS.generarFoliosParaleloUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.generarFoliosGestionController,
    (c) =>
      new GenerarFoliosGestionController({
        generarFoliosGestionUseCase: c.resolve(ACADEMICO_TOKENS.generarFoliosGestionUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.getFolioByIdController,
    (c) =>
      new GetFolioByIdController({
        getFolioByIdUseCase: c.resolve(ACADEMICO_TOKENS.getFolioByIdUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.cambiarEstadoFolioController,
    (c) =>
      new CambiarEstadoFolioController({
        cambiarEstadoFolioUseCase: c.resolve(ACADEMICO_TOKENS.cambiarEstadoFolioUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.editarFolioEstudianteController,
    (c) =>
      new EditarFolioEstudianteController({
        editarFolioEstudianteUseCase: c.resolve(ACADEMICO_TOKENS.editarFolioEstudianteUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      }),
  );

  registerComponent(
    container,
    ACADEMICO_TOKENS.exportLibroExcelController,
    (c) =>
      new ExportLibroExcelController({
        exportLibroExcelUseCase: c.resolve(ACADEMICO_TOKENS.exportLibroExcelUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      }),
  );

  // ============================================
  // ROUTER
  // ============================================
  registerComponent(container, ACADEMICO_TOKENS.librosRouter, (c) =>
    buildLibrosRouter({
      controllers: {
        listLibrosController: c.resolve(ACADEMICO_TOKENS.listLibrosController),
        abrirLibroController: c.resolve(ACADEMICO_TOKENS.abrirLibroController),
        getLibroByIdController: c.resolve(ACADEMICO_TOKENS.getLibroByIdController),
        editarLibroController: c.resolve(ACADEMICO_TOKENS.editarLibroController),
        listParalelosLibroController: c.resolve(ACADEMICO_TOKENS.listParalelosLibroController),
        generarFoliosParaleloController: c.resolve(
          ACADEMICO_TOKENS.generarFoliosParaleloController,
        ),
        generarFoliosGestionController: c.resolve(ACADEMICO_TOKENS.generarFoliosGestionController),
        getFolioByIdController: c.resolve(ACADEMICO_TOKENS.getFolioByIdController),
        cambiarEstadoFolioController: c.resolve(ACADEMICO_TOKENS.cambiarEstadoFolioController),
        editarFolioEstudianteController: c.resolve(
          ACADEMICO_TOKENS.editarFolioEstudianteController,
        ),
        exportLibroExcelController: c.resolve(ACADEMICO_TOKENS.exportLibroExcelController),
      },
      middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) },
    }),
  );

  return container;
}

export default registerLibrosResource;
