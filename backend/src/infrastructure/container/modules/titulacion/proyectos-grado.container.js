/**
 * Registro de dependencias del recurso Proyectos de Grado (módulo TIT)
 *
 * Responsabilidades:
 * - Registrar Use Cases del sub-módulo de titulación (T1-T23)
 * - Registrar Controllers correspondientes
 * - Construir y registrar el router /proyectos-grado
 *
 * Principio SRP: cada container maneja solo UN recurso. Los repositorios del
 * módulo (TITULACION_TOKENS.*Repository) se registran en ./index.js; los
 * catálogos reutilizados (docentes, estudiantes, gestiones) se consumen de
 * REPOSITORIOS_TOKENS y los PDF de SERVICIOS_TOKENS.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { TITULACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListProyectosGradoUseCase } from '../../../../application/use-cases/titulacion/ListProyectosGradoUseCase.js';
import { ListModalidadesGradoUseCase } from '../../../../application/use-cases/titulacion/ListModalidadesGradoUseCase.js';
import { ListMisTutoradosUseCase } from '../../../../application/use-cases/titulacion/ListMisTutoradosUseCase.js';
import { GetMiProyectoGradoUseCase } from '../../../../application/use-cases/titulacion/GetMiProyectoGradoUseCase.js';
import { ExportBitacoraMensualTutorPdfUseCase } from '../../../../application/use-cases/titulacion/ExportBitacoraMensualTutorPdfUseCase.js';
import { GetProyectoGradoByIdUseCase } from '../../../../application/use-cases/titulacion/GetProyectoGradoByIdUseCase.js';
import { CreateProyectoGradoUseCase } from '../../../../application/use-cases/titulacion/CreateProyectoGradoUseCase.js';
import { UpdateProyectoGradoUseCase } from '../../../../application/use-cases/titulacion/UpdateProyectoGradoUseCase.js';
import { DeleteProyectoGradoUseCase } from '../../../../application/use-cases/titulacion/DeleteProyectoGradoUseCase.js';
import { AsignarTutorProyectoUseCase } from '../../../../application/use-cases/titulacion/AsignarTutorProyectoUseCase.js';
import { AprobarEtapaProyectoUseCase } from '../../../../application/use-cases/titulacion/AprobarEtapaProyectoUseCase.js';
import { AddIntegranteProyectoUseCase } from '../../../../application/use-cases/titulacion/AddIntegranteProyectoUseCase.js';
import { UpdateIntegranteProyectoUseCase } from '../../../../application/use-cases/titulacion/UpdateIntegranteProyectoUseCase.js';
import { ListBitacoraProyectoUseCase } from '../../../../application/use-cases/titulacion/ListBitacoraProyectoUseCase.js';
import { CreateBitacoraEntradaUseCase } from '../../../../application/use-cases/titulacion/CreateBitacoraEntradaUseCase.js';
import { UpdateBitacoraEntradaUseCase } from '../../../../application/use-cases/titulacion/UpdateBitacoraEntradaUseCase.js';
import { ConfirmarBitacoraEstudianteUseCase } from '../../../../application/use-cases/titulacion/ConfirmarBitacoraEstudianteUseCase.js';
import { ListAvancesProyectoUseCase } from '../../../../application/use-cases/titulacion/ListAvancesProyectoUseCase.js';
import { GetAvanceByIdUseCase } from '../../../../application/use-cases/titulacion/GetAvanceByIdUseCase.js';
import { CreateAvanceProyectoUseCase } from '../../../../application/use-cases/titulacion/CreateAvanceProyectoUseCase.js';
import { DownloadAvanceArchivoUseCase } from '../../../../application/use-cases/titulacion/DownloadAvanceArchivoUseCase.js';
import { ListDictamenesProyectoUseCase } from '../../../../application/use-cases/titulacion/ListDictamenesProyectoUseCase.js';
import { ExportDictamenPdfUseCase } from '../../../../application/use-cases/titulacion/ExportDictamenPdfUseCase.js';
import {
  ListProyectosGradoController,
  ListModalidadesGradoController,
  ListMisTutoradosController,
  GetMiProyectoGradoController,
  ExportBitacoraMensualTutorController,
  GetProyectoGradoByIdController,
  CreateProyectoGradoController,
  UpdateProyectoGradoController,
  DeleteProyectoGradoController,
  AsignarTutorProyectoController,
  AprobarEtapaProyectoController,
  AddIntegranteProyectoController,
  UpdateIntegranteProyectoController,
  ListBitacoraProyectoController,
  CreateBitacoraEntradaController,
  UpdateBitacoraEntradaController,
  ConfirmarBitacoraEstudianteController,
  ListAvancesProyectoController,
  GetAvanceByIdController,
  CreateAvanceProyectoController,
  DownloadAvanceArchivoController,
  ListDictamenesProyectoController,
  ExportDictamenPdfController,
} from '../../../../presentation/controllers/titulacion/index.js';
import { buildProyectosGradoRouter } from '../../../../presentation/routes/proyectos-grado.routes.js';

export function registerProyectosGradoResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    TITULACION_TOKENS.listProyectosGradoUseCase,
    (c) =>
      new ListProyectosGradoUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.listModalidadesGradoUseCase,
    (c) =>
      new ListModalidadesGradoUseCase({
        modalidadGradoRepository: c.resolve(TITULACION_TOKENS.modalidadGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.listMisTutoradosUseCase,
    (c) =>
      new ListMisTutoradosUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.getProyectoGradoByIdUseCase,
    (c) =>
      new GetProyectoGradoByIdUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.getMiProyectoGradoUseCase,
    (c) =>
      new GetMiProyectoGradoUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        getProyectoGradoByIdUseCase: c.resolve(TITULACION_TOKENS.getProyectoGradoByIdUseCase),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.exportBitacoraMensualTutorPdfUseCase,
    (c) =>
      new ExportBitacoraMensualTutorPdfUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        bitacoraMensualTutorPdfGenerator: c.resolve(
          SERVICIOS_TOKENS.bitacoraMensualTutorPdfGenerator
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.createProyectoGradoUseCase,
    (c) =>
      new CreateProyectoGradoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        modalidadGradoRepository: c.resolve(TITULACION_TOKENS.modalidadGradoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.updateProyectoGradoUseCase,
    (c) =>
      new UpdateProyectoGradoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.deleteProyectoGradoUseCase,
    (c) =>
      new DeleteProyectoGradoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.asignarTutorProyectoUseCase,
    (c) =>
      new AsignarTutorProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        dictamenProyectoRepository: c.resolve(TITULACION_TOKENS.dictamenProyectoRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        designacionTutorPdfGenerator: c.resolve(SERVICIOS_TOKENS.designacionTutorPdfGenerator),
        uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.aprobarEtapaProyectoUseCase,
    (c) =>
      new AprobarEtapaProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        dictamenProyectoRepository: c.resolve(TITULACION_TOKENS.dictamenProyectoRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        viabilidadProyectoPdfGenerator: c.resolve(SERVICIOS_TOKENS.viabilidadProyectoPdfGenerator),
        uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.addIntegranteProyectoUseCase,
    (c) =>
      new AddIntegranteProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        modalidadGradoRepository: c.resolve(TITULACION_TOKENS.modalidadGradoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.updateIntegranteProyectoUseCase,
    (c) =>
      new UpdateIntegranteProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.listBitacoraProyectoUseCase,
    (c) =>
      new ListBitacoraProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        bitacoraProyectoRepository: c.resolve(TITULACION_TOKENS.bitacoraProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.createBitacoraEntradaUseCase,
    (c) =>
      new CreateBitacoraEntradaUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        bitacoraProyectoRepository: c.resolve(TITULACION_TOKENS.bitacoraProyectoRepository),
        avanceProyectoRepository: c.resolve(TITULACION_TOKENS.avanceProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.updateBitacoraEntradaUseCase,
    (c) =>
      new UpdateBitacoraEntradaUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        bitacoraProyectoRepository: c.resolve(TITULACION_TOKENS.bitacoraProyectoRepository),
        avanceProyectoRepository: c.resolve(TITULACION_TOKENS.avanceProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.confirmarBitacoraEstudianteUseCase,
    (c) =>
      new ConfirmarBitacoraEstudianteUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        bitacoraProyectoRepository: c.resolve(TITULACION_TOKENS.bitacoraProyectoRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.listAvancesProyectoUseCase,
    (c) =>
      new ListAvancesProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        avanceProyectoRepository: c.resolve(TITULACION_TOKENS.avanceProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.getAvanceByIdUseCase,
    (c) =>
      new GetAvanceByIdUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        avanceProyectoRepository: c.resolve(TITULACION_TOKENS.avanceProyectoRepository),
        bitacoraProyectoRepository: c.resolve(TITULACION_TOKENS.bitacoraProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.createAvanceProyectoUseCase,
    (c) =>
      new CreateAvanceProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        avanceProyectoRepository: c.resolve(TITULACION_TOKENS.avanceProyectoRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.downloadAvanceArchivoUseCase,
    (c) =>
      new DownloadAvanceArchivoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        avanceProyectoRepository: c.resolve(TITULACION_TOKENS.avanceProyectoRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.listDictamenesProyectoUseCase,
    (c) =>
      new ListDictamenesProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        dictamenProyectoRepository: c.resolve(TITULACION_TOKENS.dictamenProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.exportDictamenPdfUseCase,
    (c) =>
      new ExportDictamenPdfUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        dictamenProyectoRepository: c.resolve(TITULACION_TOKENS.dictamenProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  const controllerFactories = [
    [
      TITULACION_TOKENS.listProyectosGradoController,
      (c) =>
        new ListProyectosGradoController({
          listProyectosGradoUseCase: c.resolve(TITULACION_TOKENS.listProyectosGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.listModalidadesGradoController,
      (c) =>
        new ListModalidadesGradoController({
          listModalidadesGradoUseCase: c.resolve(TITULACION_TOKENS.listModalidadesGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.listMisTutoradosController,
      (c) =>
        new ListMisTutoradosController({
          listMisTutoradosUseCase: c.resolve(TITULACION_TOKENS.listMisTutoradosUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.getMiProyectoGradoController,
      (c) =>
        new GetMiProyectoGradoController({
          getMiProyectoGradoUseCase: c.resolve(TITULACION_TOKENS.getMiProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.exportBitacoraMensualTutorController,
      (c) =>
        new ExportBitacoraMensualTutorController({
          exportBitacoraMensualTutorPdfUseCase: c.resolve(
            TITULACION_TOKENS.exportBitacoraMensualTutorPdfUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    [
      TITULACION_TOKENS.getProyectoGradoByIdController,
      (c) =>
        new GetProyectoGradoByIdController({
          getProyectoGradoByIdUseCase: c.resolve(TITULACION_TOKENS.getProyectoGradoByIdUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.createProyectoGradoController,
      (c) =>
        new CreateProyectoGradoController({
          createProyectoGradoUseCase: c.resolve(TITULACION_TOKENS.createProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.updateProyectoGradoController,
      (c) =>
        new UpdateProyectoGradoController({
          updateProyectoGradoUseCase: c.resolve(TITULACION_TOKENS.updateProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.deleteProyectoGradoController,
      (c) =>
        new DeleteProyectoGradoController({
          deleteProyectoGradoUseCase: c.resolve(TITULACION_TOKENS.deleteProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.asignarTutorProyectoController,
      (c) =>
        new AsignarTutorProyectoController({
          asignarTutorProyectoUseCase: c.resolve(TITULACION_TOKENS.asignarTutorProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.aprobarEtapaProyectoController,
      (c) =>
        new AprobarEtapaProyectoController({
          aprobarEtapaProyectoUseCase: c.resolve(TITULACION_TOKENS.aprobarEtapaProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.addIntegranteProyectoController,
      (c) =>
        new AddIntegranteProyectoController({
          addIntegranteProyectoUseCase: c.resolve(TITULACION_TOKENS.addIntegranteProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.updateIntegranteProyectoController,
      (c) =>
        new UpdateIntegranteProyectoController({
          updateIntegranteProyectoUseCase: c.resolve(
            TITULACION_TOKENS.updateIntegranteProyectoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.listBitacoraProyectoController,
      (c) =>
        new ListBitacoraProyectoController({
          listBitacoraProyectoUseCase: c.resolve(TITULACION_TOKENS.listBitacoraProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.createBitacoraEntradaController,
      (c) =>
        new CreateBitacoraEntradaController({
          createBitacoraEntradaUseCase: c.resolve(TITULACION_TOKENS.createBitacoraEntradaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.updateBitacoraEntradaController,
      (c) =>
        new UpdateBitacoraEntradaController({
          updateBitacoraEntradaUseCase: c.resolve(TITULACION_TOKENS.updateBitacoraEntradaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.confirmarBitacoraEstudianteController,
      (c) =>
        new ConfirmarBitacoraEstudianteController({
          confirmarBitacoraEstudianteUseCase: c.resolve(
            TITULACION_TOKENS.confirmarBitacoraEstudianteUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.listAvancesProyectoController,
      (c) =>
        new ListAvancesProyectoController({
          listAvancesProyectoUseCase: c.resolve(TITULACION_TOKENS.listAvancesProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.getAvanceByIdController,
      (c) =>
        new GetAvanceByIdController({
          getAvanceByIdUseCase: c.resolve(TITULACION_TOKENS.getAvanceByIdUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.createAvanceProyectoController,
      (c) =>
        new CreateAvanceProyectoController({
          createAvanceProyectoUseCase: c.resolve(TITULACION_TOKENS.createAvanceProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.downloadAvanceArchivoController,
      (c) =>
        new DownloadAvanceArchivoController({
          downloadAvanceArchivoUseCase: c.resolve(TITULACION_TOKENS.downloadAvanceArchivoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    [
      TITULACION_TOKENS.listDictamenesProyectoController,
      (c) =>
        new ListDictamenesProyectoController({
          listDictamenesProyectoUseCase: c.resolve(TITULACION_TOKENS.listDictamenesProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.exportDictamenPdfController,
      (c) =>
        new ExportDictamenPdfController({
          exportDictamenPdfUseCase: c.resolve(TITULACION_TOKENS.exportDictamenPdfUseCase),
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
  registerComponent(container, TITULACION_TOKENS.proyectosGradoRouter, (c) => {
    const controllers = {
      listProyectosGradoController: c.resolve(TITULACION_TOKENS.listProyectosGradoController),
      listModalidadesGradoController: c.resolve(TITULACION_TOKENS.listModalidadesGradoController),
      listMisTutoradosController: c.resolve(TITULACION_TOKENS.listMisTutoradosController),
      getMiProyectoGradoController: c.resolve(TITULACION_TOKENS.getMiProyectoGradoController),
      exportBitacoraMensualTutorController: c.resolve(
        TITULACION_TOKENS.exportBitacoraMensualTutorController
      ),
      getProyectoGradoByIdController: c.resolve(TITULACION_TOKENS.getProyectoGradoByIdController),
      createProyectoGradoController: c.resolve(TITULACION_TOKENS.createProyectoGradoController),
      updateProyectoGradoController: c.resolve(TITULACION_TOKENS.updateProyectoGradoController),
      deleteProyectoGradoController: c.resolve(TITULACION_TOKENS.deleteProyectoGradoController),
      asignarTutorProyectoController: c.resolve(TITULACION_TOKENS.asignarTutorProyectoController),
      aprobarEtapaProyectoController: c.resolve(TITULACION_TOKENS.aprobarEtapaProyectoController),
      addIntegranteProyectoController: c.resolve(TITULACION_TOKENS.addIntegranteProyectoController),
      updateIntegranteProyectoController: c.resolve(
        TITULACION_TOKENS.updateIntegranteProyectoController
      ),
      listBitacoraProyectoController: c.resolve(TITULACION_TOKENS.listBitacoraProyectoController),
      createBitacoraEntradaController: c.resolve(TITULACION_TOKENS.createBitacoraEntradaController),
      updateBitacoraEntradaController: c.resolve(TITULACION_TOKENS.updateBitacoraEntradaController),
      confirmarBitacoraEstudianteController: c.resolve(
        TITULACION_TOKENS.confirmarBitacoraEstudianteController
      ),
      listAvancesProyectoController: c.resolve(TITULACION_TOKENS.listAvancesProyectoController),
      getAvanceByIdController: c.resolve(TITULACION_TOKENS.getAvanceByIdController),
      createAvanceProyectoController: c.resolve(TITULACION_TOKENS.createAvanceProyectoController),
      downloadAvanceArchivoController: c.resolve(TITULACION_TOKENS.downloadAvanceArchivoController),
      listDictamenesProyectoController: c.resolve(
        TITULACION_TOKENS.listDictamenesProyectoController
      ),
      exportDictamenPdfController: c.resolve(TITULACION_TOKENS.exportDictamenPdfController),
    };

    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };

    return buildProyectosGradoRouter({ controllers, middlewares });
  });

  return container;
}
