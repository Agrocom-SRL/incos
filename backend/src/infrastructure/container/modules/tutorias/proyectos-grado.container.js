/**
 * Registro de dependencias del recurso Proyectos de Grado (módulo TUT)
 *
 * Responsabilidades:
 * - Registrar Use Cases del sub-módulo de titulación (T1-T23)
 * - Registrar Controllers correspondientes
 * - Construir y registrar el router /proyectos-grado
 *
 * Principio SRP: cada container maneja solo UN recurso. Los repositorios del
 * módulo (TUTORIAS_TOKENS.*Repository) se registran en ./index.js; los
 * catálogos reutilizados (docentes, estudiantes, gestiones) se consumen de
 * REPOSITORIOS_TOKENS y los PDF de SERVICIOS_TOKENS.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { TUTORIAS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListProyectosGradoUseCase } from '../../../../application/use-cases/tutorias/ListProyectosGradoUseCase.js';
import { ListModalidadesGradoUseCase } from '../../../../application/use-cases/tutorias/ListModalidadesGradoUseCase.js';
import { ListMisTutoradosUseCase } from '../../../../application/use-cases/tutorias/ListMisTutoradosUseCase.js';
import { GetMiProyectoGradoUseCase } from '../../../../application/use-cases/tutorias/GetMiProyectoGradoUseCase.js';
import { ExportBitacoraMensualTutorPdfUseCase } from '../../../../application/use-cases/tutorias/ExportBitacoraMensualTutorPdfUseCase.js';
import { GetProyectoGradoByIdUseCase } from '../../../../application/use-cases/tutorias/GetProyectoGradoByIdUseCase.js';
import { CreateProyectoGradoUseCase } from '../../../../application/use-cases/tutorias/CreateProyectoGradoUseCase.js';
import { UpdateProyectoGradoUseCase } from '../../../../application/use-cases/tutorias/UpdateProyectoGradoUseCase.js';
import { DeleteProyectoGradoUseCase } from '../../../../application/use-cases/tutorias/DeleteProyectoGradoUseCase.js';
import { AsignarTutorProyectoUseCase } from '../../../../application/use-cases/tutorias/AsignarTutorProyectoUseCase.js';
import { AprobarEtapaProyectoUseCase } from '../../../../application/use-cases/tutorias/AprobarEtapaProyectoUseCase.js';
import { AddIntegranteProyectoUseCase } from '../../../../application/use-cases/tutorias/AddIntegranteProyectoUseCase.js';
import { UpdateIntegranteProyectoUseCase } from '../../../../application/use-cases/tutorias/UpdateIntegranteProyectoUseCase.js';
import { ListBitacoraProyectoUseCase } from '../../../../application/use-cases/tutorias/ListBitacoraProyectoUseCase.js';
import { CreateBitacoraEntradaUseCase } from '../../../../application/use-cases/tutorias/CreateBitacoraEntradaUseCase.js';
import { UpdateBitacoraEntradaUseCase } from '../../../../application/use-cases/tutorias/UpdateBitacoraEntradaUseCase.js';
import { ConfirmarBitacoraEstudianteUseCase } from '../../../../application/use-cases/tutorias/ConfirmarBitacoraEstudianteUseCase.js';
import { ListAvancesProyectoUseCase } from '../../../../application/use-cases/tutorias/ListAvancesProyectoUseCase.js';
import { GetAvanceByIdUseCase } from '../../../../application/use-cases/tutorias/GetAvanceByIdUseCase.js';
import { CreateAvanceProyectoUseCase } from '../../../../application/use-cases/tutorias/CreateAvanceProyectoUseCase.js';
import { DownloadAvanceArchivoUseCase } from '../../../../application/use-cases/tutorias/DownloadAvanceArchivoUseCase.js';
import { ListDictamenesProyectoUseCase } from '../../../../application/use-cases/tutorias/ListDictamenesProyectoUseCase.js';
import { ExportDictamenPdfUseCase } from '../../../../application/use-cases/tutorias/ExportDictamenPdfUseCase.js';
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
} from '../../../../presentation/controllers/tutorias/index.js';
import { buildProyectosGradoRouter } from '../../../../presentation/routes/proyectos-grado.routes.js';

export function registerProyectosGradoResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    TUTORIAS_TOKENS.listProyectosGradoUseCase,
    (c) =>
      new ListProyectosGradoUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TUTORIAS_TOKENS.proyectoGradoListadoViewRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.listModalidadesGradoUseCase,
    (c) =>
      new ListModalidadesGradoUseCase({
        modalidadGradoRepository: c.resolve(TUTORIAS_TOKENS.modalidadGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.listMisTutoradosUseCase,
    (c) =>
      new ListMisTutoradosUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TUTORIAS_TOKENS.proyectoGradoListadoViewRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.getProyectoGradoByIdUseCase,
    (c) =>
      new GetProyectoGradoByIdUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TUTORIAS_TOKENS.proyectoGradoListadoViewRepository
        ),
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.getMiProyectoGradoUseCase,
    (c) =>
      new GetMiProyectoGradoUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TUTORIAS_TOKENS.proyectoGradoListadoViewRepository
        ),
        getProyectoGradoByIdUseCase: c.resolve(TUTORIAS_TOKENS.getProyectoGradoByIdUseCase),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.exportBitacoraMensualTutorPdfUseCase,
    (c) =>
      new ExportBitacoraMensualTutorPdfUseCase({
        proyectoGradoListadoViewRepository: c.resolve(
          TUTORIAS_TOKENS.proyectoGradoListadoViewRepository
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
    TUTORIAS_TOKENS.createProyectoGradoUseCase,
    (c) =>
      new CreateProyectoGradoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaIntegranteRepository: c.resolve(TUTORIAS_TOKENS.tutoriaIntegranteRepository),
        modalidadGradoRepository: c.resolve(TUTORIAS_TOKENS.modalidadGradoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.updateProyectoGradoUseCase,
    (c) =>
      new UpdateProyectoGradoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.deleteProyectoGradoUseCase,
    (c) =>
      new DeleteProyectoGradoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.asignarTutorProyectoUseCase,
    (c) =>
      new AsignarTutorProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        proyectoGradoListadoViewRepository: c.resolve(
          TUTORIAS_TOKENS.proyectoGradoListadoViewRepository
        ),
        tutoriaDictamenRepository: c.resolve(TUTORIAS_TOKENS.tutoriaDictamenRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        designacionTutorPdfGenerator: c.resolve(SERVICIOS_TOKENS.designacionTutorPdfGenerator),
        uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.aprobarEtapaProyectoUseCase,
    (c) =>
      new AprobarEtapaProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        proyectoGradoListadoViewRepository: c.resolve(
          TUTORIAS_TOKENS.proyectoGradoListadoViewRepository
        ),
        tutoriaDictamenRepository: c.resolve(TUTORIAS_TOKENS.tutoriaDictamenRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        viabilidadProyectoPdfGenerator: c.resolve(SERVICIOS_TOKENS.viabilidadProyectoPdfGenerator),
        uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.addIntegranteProyectoUseCase,
    (c) =>
      new AddIntegranteProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaIntegranteRepository: c.resolve(TUTORIAS_TOKENS.tutoriaIntegranteRepository),
        modalidadGradoRepository: c.resolve(TUTORIAS_TOKENS.modalidadGradoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.updateIntegranteProyectoUseCase,
    (c) =>
      new UpdateIntegranteProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaIntegranteRepository: c.resolve(TUTORIAS_TOKENS.tutoriaIntegranteRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.listBitacoraProyectoUseCase,
    (c) =>
      new ListBitacoraProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaBitacoraRepository: c.resolve(TUTORIAS_TOKENS.tutoriaBitacoraRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.createBitacoraEntradaUseCase,
    (c) =>
      new CreateBitacoraEntradaUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaBitacoraRepository: c.resolve(TUTORIAS_TOKENS.tutoriaBitacoraRepository),
        tutoriaAvanceRepository: c.resolve(TUTORIAS_TOKENS.tutoriaAvanceRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.updateBitacoraEntradaUseCase,
    (c) =>
      new UpdateBitacoraEntradaUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaBitacoraRepository: c.resolve(TUTORIAS_TOKENS.tutoriaBitacoraRepository),
        tutoriaAvanceRepository: c.resolve(TUTORIAS_TOKENS.tutoriaAvanceRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.confirmarBitacoraEstudianteUseCase,
    (c) =>
      new ConfirmarBitacoraEstudianteUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaBitacoraRepository: c.resolve(TUTORIAS_TOKENS.tutoriaBitacoraRepository),
        tutoriaIntegranteRepository: c.resolve(TUTORIAS_TOKENS.tutoriaIntegranteRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.listAvancesProyectoUseCase,
    (c) =>
      new ListAvancesProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaAvanceRepository: c.resolve(TUTORIAS_TOKENS.tutoriaAvanceRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.getAvanceByIdUseCase,
    (c) =>
      new GetAvanceByIdUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaAvanceRepository: c.resolve(TUTORIAS_TOKENS.tutoriaAvanceRepository),
        tutoriaBitacoraRepository: c.resolve(TUTORIAS_TOKENS.tutoriaBitacoraRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.createAvanceProyectoUseCase,
    (c) =>
      new CreateAvanceProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaAvanceRepository: c.resolve(TUTORIAS_TOKENS.tutoriaAvanceRepository),
        tutoriaIntegranteRepository: c.resolve(TUTORIAS_TOKENS.tutoriaIntegranteRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.downloadAvanceArchivoUseCase,
    (c) =>
      new DownloadAvanceArchivoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaAvanceRepository: c.resolve(TUTORIAS_TOKENS.tutoriaAvanceRepository),
        tutoriaIntegranteRepository: c.resolve(TUTORIAS_TOKENS.tutoriaIntegranteRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.listDictamenesProyectoUseCase,
    (c) =>
      new ListDictamenesProyectoUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaDictamenRepository: c.resolve(TUTORIAS_TOKENS.tutoriaDictamenRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TUTORIAS_TOKENS.exportDictamenPdfUseCase,
    (c) =>
      new ExportDictamenPdfUseCase({
        proyectoGradoRepository: c.resolve(TUTORIAS_TOKENS.proyectoGradoRepository),
        tutoriaDictamenRepository: c.resolve(TUTORIAS_TOKENS.tutoriaDictamenRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  const controllerFactories = [
    [
      TUTORIAS_TOKENS.listProyectosGradoController,
      (c) =>
        new ListProyectosGradoController({
          listProyectosGradoUseCase: c.resolve(TUTORIAS_TOKENS.listProyectosGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.listModalidadesGradoController,
      (c) =>
        new ListModalidadesGradoController({
          listModalidadesGradoUseCase: c.resolve(TUTORIAS_TOKENS.listModalidadesGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.listMisTutoradosController,
      (c) =>
        new ListMisTutoradosController({
          listMisTutoradosUseCase: c.resolve(TUTORIAS_TOKENS.listMisTutoradosUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.getMiProyectoGradoController,
      (c) =>
        new GetMiProyectoGradoController({
          getMiProyectoGradoUseCase: c.resolve(TUTORIAS_TOKENS.getMiProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.exportBitacoraMensualTutorController,
      (c) =>
        new ExportBitacoraMensualTutorController({
          exportBitacoraMensualTutorPdfUseCase: c.resolve(
            TUTORIAS_TOKENS.exportBitacoraMensualTutorPdfUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    [
      TUTORIAS_TOKENS.getProyectoGradoByIdController,
      (c) =>
        new GetProyectoGradoByIdController({
          getProyectoGradoByIdUseCase: c.resolve(TUTORIAS_TOKENS.getProyectoGradoByIdUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.createProyectoGradoController,
      (c) =>
        new CreateProyectoGradoController({
          createProyectoGradoUseCase: c.resolve(TUTORIAS_TOKENS.createProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.updateProyectoGradoController,
      (c) =>
        new UpdateProyectoGradoController({
          updateProyectoGradoUseCase: c.resolve(TUTORIAS_TOKENS.updateProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.deleteProyectoGradoController,
      (c) =>
        new DeleteProyectoGradoController({
          deleteProyectoGradoUseCase: c.resolve(TUTORIAS_TOKENS.deleteProyectoGradoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.asignarTutorProyectoController,
      (c) =>
        new AsignarTutorProyectoController({
          asignarTutorProyectoUseCase: c.resolve(TUTORIAS_TOKENS.asignarTutorProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.aprobarEtapaProyectoController,
      (c) =>
        new AprobarEtapaProyectoController({
          aprobarEtapaProyectoUseCase: c.resolve(TUTORIAS_TOKENS.aprobarEtapaProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.addIntegranteProyectoController,
      (c) =>
        new AddIntegranteProyectoController({
          addIntegranteProyectoUseCase: c.resolve(TUTORIAS_TOKENS.addIntegranteProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.updateIntegranteProyectoController,
      (c) =>
        new UpdateIntegranteProyectoController({
          updateIntegranteProyectoUseCase: c.resolve(
            TUTORIAS_TOKENS.updateIntegranteProyectoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.listBitacoraProyectoController,
      (c) =>
        new ListBitacoraProyectoController({
          listBitacoraProyectoUseCase: c.resolve(TUTORIAS_TOKENS.listBitacoraProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.createBitacoraEntradaController,
      (c) =>
        new CreateBitacoraEntradaController({
          createBitacoraEntradaUseCase: c.resolve(TUTORIAS_TOKENS.createBitacoraEntradaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.updateBitacoraEntradaController,
      (c) =>
        new UpdateBitacoraEntradaController({
          updateBitacoraEntradaUseCase: c.resolve(TUTORIAS_TOKENS.updateBitacoraEntradaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.confirmarBitacoraEstudianteController,
      (c) =>
        new ConfirmarBitacoraEstudianteController({
          confirmarBitacoraEstudianteUseCase: c.resolve(
            TUTORIAS_TOKENS.confirmarBitacoraEstudianteUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.listAvancesProyectoController,
      (c) =>
        new ListAvancesProyectoController({
          listAvancesProyectoUseCase: c.resolve(TUTORIAS_TOKENS.listAvancesProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.getAvanceByIdController,
      (c) =>
        new GetAvanceByIdController({
          getAvanceByIdUseCase: c.resolve(TUTORIAS_TOKENS.getAvanceByIdUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.createAvanceProyectoController,
      (c) =>
        new CreateAvanceProyectoController({
          createAvanceProyectoUseCase: c.resolve(TUTORIAS_TOKENS.createAvanceProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.downloadAvanceArchivoController,
      (c) =>
        new DownloadAvanceArchivoController({
          downloadAvanceArchivoUseCase: c.resolve(TUTORIAS_TOKENS.downloadAvanceArchivoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    [
      TUTORIAS_TOKENS.listDictamenesProyectoController,
      (c) =>
        new ListDictamenesProyectoController({
          listDictamenesProyectoUseCase: c.resolve(TUTORIAS_TOKENS.listDictamenesProyectoUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TUTORIAS_TOKENS.exportDictamenPdfController,
      (c) =>
        new ExportDictamenPdfController({
          exportDictamenPdfUseCase: c.resolve(TUTORIAS_TOKENS.exportDictamenPdfUseCase),
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
  registerComponent(container, TUTORIAS_TOKENS.proyectosGradoRouter, (c) => {
    const controllers = {
      listProyectosGradoController: c.resolve(TUTORIAS_TOKENS.listProyectosGradoController),
      listModalidadesGradoController: c.resolve(TUTORIAS_TOKENS.listModalidadesGradoController),
      listMisTutoradosController: c.resolve(TUTORIAS_TOKENS.listMisTutoradosController),
      getMiProyectoGradoController: c.resolve(TUTORIAS_TOKENS.getMiProyectoGradoController),
      exportBitacoraMensualTutorController: c.resolve(
        TUTORIAS_TOKENS.exportBitacoraMensualTutorController
      ),
      getProyectoGradoByIdController: c.resolve(TUTORIAS_TOKENS.getProyectoGradoByIdController),
      createProyectoGradoController: c.resolve(TUTORIAS_TOKENS.createProyectoGradoController),
      updateProyectoGradoController: c.resolve(TUTORIAS_TOKENS.updateProyectoGradoController),
      deleteProyectoGradoController: c.resolve(TUTORIAS_TOKENS.deleteProyectoGradoController),
      asignarTutorProyectoController: c.resolve(TUTORIAS_TOKENS.asignarTutorProyectoController),
      aprobarEtapaProyectoController: c.resolve(TUTORIAS_TOKENS.aprobarEtapaProyectoController),
      addIntegranteProyectoController: c.resolve(TUTORIAS_TOKENS.addIntegranteProyectoController),
      updateIntegranteProyectoController: c.resolve(
        TUTORIAS_TOKENS.updateIntegranteProyectoController
      ),
      listBitacoraProyectoController: c.resolve(TUTORIAS_TOKENS.listBitacoraProyectoController),
      createBitacoraEntradaController: c.resolve(TUTORIAS_TOKENS.createBitacoraEntradaController),
      updateBitacoraEntradaController: c.resolve(TUTORIAS_TOKENS.updateBitacoraEntradaController),
      confirmarBitacoraEstudianteController: c.resolve(
        TUTORIAS_TOKENS.confirmarBitacoraEstudianteController
      ),
      listAvancesProyectoController: c.resolve(TUTORIAS_TOKENS.listAvancesProyectoController),
      getAvanceByIdController: c.resolve(TUTORIAS_TOKENS.getAvanceByIdController),
      createAvanceProyectoController: c.resolve(TUTORIAS_TOKENS.createAvanceProyectoController),
      downloadAvanceArchivoController: c.resolve(TUTORIAS_TOKENS.downloadAvanceArchivoController),
      listDictamenesProyectoController: c.resolve(TUTORIAS_TOKENS.listDictamenesProyectoController),
      exportDictamenPdfController: c.resolve(TUTORIAS_TOKENS.exportDictamenPdfController),
    };

    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };

    return buildProyectosGradoRouter({ controllers, middlewares });
  });

  return container;
}
