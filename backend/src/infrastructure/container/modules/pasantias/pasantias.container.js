/**
 * Registro de dependencias del recurso Pasantías (módulo TUT · práctica laboral)
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso (P1-P19)
 * - Registrar Controllers correspondientes
 * - Construir y registrar el router /pasantias
 *
 * Principio SRP: cada container maneja solo UN recurso. Los repositorios del
 * módulo (PASANTIAS_TOKENS.*Repository) y el generador PDF se registran en
 * ./index.js; los catálogos reutilizados (docentes, estudiantes, usuarios) se
 * consumen de REPOSITORIOS_TOKENS y los servicios de SERVICIOS_TOKENS.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { PASANTIAS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListPasantiasUseCase } from '../../../../application/use-cases/pasantias/ListPasantiasUseCase.js';
import { GetPasantiaUseCase } from '../../../../application/use-cases/pasantias/GetPasantiaUseCase.js';
import { CreatePasantiaUseCase } from '../../../../application/use-cases/pasantias/CreatePasantiaUseCase.js';
import { UpdatePasantiaUseCase } from '../../../../application/use-cases/pasantias/UpdatePasantiaUseCase.js';
import { DeletePasantiaUseCase } from '../../../../application/use-cases/pasantias/DeletePasantiaUseCase.js';
import { TransicionarPasantiaUseCase } from '../../../../application/use-cases/pasantias/TransicionarPasantiaUseCase.js';
import { ListPasantiasEmpresasUseCase } from '../../../../application/use-cases/pasantias/ListPasantiasEmpresasUseCase.js';
import { GetPasantiaEmpresaUseCase } from '../../../../application/use-cases/pasantias/GetPasantiaEmpresaUseCase.js';
import { CreatePasantiaEmpresaUseCase } from '../../../../application/use-cases/pasantias/CreatePasantiaEmpresaUseCase.js';
import { UpdatePasantiaEmpresaUseCase } from '../../../../application/use-cases/pasantias/UpdatePasantiaEmpresaUseCase.js';
import { SetEstadoPasantiaEmpresaUseCase } from '../../../../application/use-cases/pasantias/SetEstadoPasantiaEmpresaUseCase.js';
import { DeletePasantiaEmpresaUseCase } from '../../../../application/use-cases/pasantias/DeletePasantiaEmpresaUseCase.js';
import { ListMisPasantiasSupervisadasUseCase } from '../../../../application/use-cases/pasantias/ListMisPasantiasSupervisadasUseCase.js';
import { GetMiPasantiaUseCase } from '../../../../application/use-cases/pasantias/GetMiPasantiaUseCase.js';
import { ListInformesPasantiaUseCase } from '../../../../application/use-cases/pasantias/ListInformesPasantiaUseCase.js';
import { CreateInformePasantiaUseCase } from '../../../../application/use-cases/pasantias/CreateInformePasantiaUseCase.js';
import { UpdateInformePasantiaUseCase } from '../../../../application/use-cases/pasantias/UpdateInformePasantiaUseCase.js';
import { ExportInformePasantiaPdfUseCase } from '../../../../application/use-cases/pasantias/ExportInformePasantiaPdfUseCase.js';
import { ListSeguimientosPasantiaUseCase } from '../../../../application/use-cases/pasantias/ListSeguimientosPasantiaUseCase.js';
import { CreateSeguimientoPasantiaUseCase } from '../../../../application/use-cases/pasantias/CreateSeguimientoPasantiaUseCase.js';
import { UpdateSeguimientoPasantiaUseCase } from '../../../../application/use-cases/pasantias/UpdateSeguimientoPasantiaUseCase.js';
import { ExportSeguimientoPasantiaPdfUseCase } from '../../../../application/use-cases/pasantias/ExportSeguimientoPasantiaPdfUseCase.js';
import {
  ListPasantiasController,
  GetPasantiaByIdController,
  CreatePasantiaController,
  UpdatePasantiaController,
  DeletePasantiaController,
  TransicionarPasantiaController,
  ListPasantiasEmpresasController,
  GetPasantiaEmpresaController,
  CreatePasantiaEmpresaController,
  UpdatePasantiaEmpresaController,
  SetEstadoPasantiaEmpresaController,
  DeletePasantiaEmpresaController,
  ListMisPasantiasSupervisadasController,
  GetMiPasantiaController,
  ListInformesPasantiaController,
  CreateInformePasantiaController,
  UpdateInformePasantiaController,
  ExportInformePasantiaPdfController,
  ListSeguimientosPasantiaController,
  CreateSeguimientoPasantiaController,
  UpdateSeguimientoPasantiaController,
  ExportSeguimientoPasantiaPdfController,
} from '../../../../presentation/controllers/pasantias/index.js';
import { buildPasantiasRouter } from '../../../../presentation/routes/pasantias.routes.js';

export function registerPasantiasResource(container) {
  // ============================================
  // USE CASES
  // ============================================
  registerComponent(
    container,
    PASANTIAS_TOKENS.listPasantiasUseCase,
    (c) =>
      new ListPasantiasUseCase({
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.getPasantiaUseCase,
    (c) =>
      new GetPasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.createPasantiaUseCase,
    (c) =>
      new CreatePasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.updatePasantiaUseCase,
    (c) =>
      new UpdatePasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.deletePasantiaUseCase,
    (c) =>
      new DeletePasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.transicionarPasantiaUseCase,
    (c) =>
      new TransicionarPasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaInformeRepository: c.resolve(PASANTIAS_TOKENS.pasantiaInformeRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.listPasantiasEmpresasUseCase,
    (c) =>
      new ListPasantiasEmpresasUseCase({
        pasantiaEmpresaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaEmpresaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.createPasantiaEmpresaUseCase,
    (c) =>
      new CreatePasantiaEmpresaUseCase({
        pasantiaEmpresaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaEmpresaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.updatePasantiaEmpresaUseCase,
    (c) =>
      new UpdatePasantiaEmpresaUseCase({
        pasantiaEmpresaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaEmpresaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.getPasantiaEmpresaUseCase,
    (c) =>
      new GetPasantiaEmpresaUseCase({
        pasantiaEmpresaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaEmpresaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.setEstadoPasantiaEmpresaUseCase,
    (c) =>
      new SetEstadoPasantiaEmpresaUseCase({
        pasantiaEmpresaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaEmpresaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.deletePasantiaEmpresaUseCase,
    (c) =>
      new DeletePasantiaEmpresaUseCase({
        pasantiaEmpresaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaEmpresaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.listMisPasantiasSupervisadasUseCase,
    (c) =>
      new ListMisPasantiasSupervisadasUseCase({
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.getMiPasantiaUseCase,
    (c) =>
      new GetMiPasantiaUseCase({
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        pasantiaInformeRepository: c.resolve(PASANTIAS_TOKENS.pasantiaInformeRepository),
        pasantiaSeguimientoRepository: c.resolve(PASANTIAS_TOKENS.pasantiaSeguimientoRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.listInformesPasantiaUseCase,
    (c) =>
      new ListInformesPasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaInformeRepository: c.resolve(PASANTIAS_TOKENS.pasantiaInformeRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.createInformePasantiaUseCase,
    (c) =>
      new CreateInformePasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaInformeRepository: c.resolve(PASANTIAS_TOKENS.pasantiaInformeRepository),
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        pasantiaInformePdfGenerator: c.resolve(PASANTIAS_TOKENS.pasantiaInformePdfGenerator),
        uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.updateInformePasantiaUseCase,
    (c) =>
      new UpdateInformePasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaInformeRepository: c.resolve(PASANTIAS_TOKENS.pasantiaInformeRepository),
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        pasantiaInformePdfGenerator: c.resolve(PASANTIAS_TOKENS.pasantiaInformePdfGenerator),
        uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.exportInformePasantiaPdfUseCase,
    (c) =>
      new ExportInformePasantiaPdfUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaInformeRepository: c.resolve(PASANTIAS_TOKENS.pasantiaInformeRepository),
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        pasantiaInformePdfGenerator: c.resolve(PASANTIAS_TOKENS.pasantiaInformePdfGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.listSeguimientosPasantiaUseCase,
    (c) =>
      new ListSeguimientosPasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaSeguimientoRepository: c.resolve(PASANTIAS_TOKENS.pasantiaSeguimientoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.createSeguimientoPasantiaUseCase,
    (c) =>
      new CreateSeguimientoPasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaSeguimientoRepository: c.resolve(PASANTIAS_TOKENS.pasantiaSeguimientoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.updateSeguimientoPasantiaUseCase,
    (c) =>
      new UpdateSeguimientoPasantiaUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaSeguimientoRepository: c.resolve(PASANTIAS_TOKENS.pasantiaSeguimientoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    PASANTIAS_TOKENS.exportSeguimientoPasantiaPdfUseCase,
    (c) =>
      new ExportSeguimientoPasantiaPdfUseCase({
        pasantiaRepository: c.resolve(PASANTIAS_TOKENS.pasantiaRepository),
        pasantiaSeguimientoRepository: c.resolve(PASANTIAS_TOKENS.pasantiaSeguimientoRepository),
        pasantiaViewRepository: c.resolve(PASANTIAS_TOKENS.pasantiaViewRepository),
        pasantiaSeguimientoPdfGenerator: c.resolve(
          PASANTIAS_TOKENS.pasantiaSeguimientoPdfGenerator
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  const controllerFactories = [
    [
      PASANTIAS_TOKENS.listPasantiasController,
      (c) =>
        new ListPasantiasController({
          listPasantiasUseCase: c.resolve(PASANTIAS_TOKENS.listPasantiasUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.getPasantiaByIdController,
      (c) =>
        new GetPasantiaByIdController({
          getPasantiaUseCase: c.resolve(PASANTIAS_TOKENS.getPasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.createPasantiaController,
      (c) =>
        new CreatePasantiaController({
          createPasantiaUseCase: c.resolve(PASANTIAS_TOKENS.createPasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.updatePasantiaController,
      (c) =>
        new UpdatePasantiaController({
          updatePasantiaUseCase: c.resolve(PASANTIAS_TOKENS.updatePasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.deletePasantiaController,
      (c) =>
        new DeletePasantiaController({
          deletePasantiaUseCase: c.resolve(PASANTIAS_TOKENS.deletePasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.transicionarPasantiaController,
      (c) =>
        new TransicionarPasantiaController({
          transicionarPasantiaUseCase: c.resolve(PASANTIAS_TOKENS.transicionarPasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.listPasantiasEmpresasController,
      (c) =>
        new ListPasantiasEmpresasController({
          listPasantiasEmpresasUseCase: c.resolve(PASANTIAS_TOKENS.listPasantiasEmpresasUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.createPasantiaEmpresaController,
      (c) =>
        new CreatePasantiaEmpresaController({
          createPasantiaEmpresaUseCase: c.resolve(PASANTIAS_TOKENS.createPasantiaEmpresaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.updatePasantiaEmpresaController,
      (c) =>
        new UpdatePasantiaEmpresaController({
          updatePasantiaEmpresaUseCase: c.resolve(PASANTIAS_TOKENS.updatePasantiaEmpresaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.getPasantiaEmpresaController,
      (c) =>
        new GetPasantiaEmpresaController({
          getPasantiaEmpresaUseCase: c.resolve(PASANTIAS_TOKENS.getPasantiaEmpresaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.setEstadoPasantiaEmpresaController,
      (c) =>
        new SetEstadoPasantiaEmpresaController({
          setEstadoPasantiaEmpresaUseCase: c.resolve(
            PASANTIAS_TOKENS.setEstadoPasantiaEmpresaUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.deletePasantiaEmpresaController,
      (c) =>
        new DeletePasantiaEmpresaController({
          deletePasantiaEmpresaUseCase: c.resolve(PASANTIAS_TOKENS.deletePasantiaEmpresaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.listMisPasantiasSupervisadasController,
      (c) =>
        new ListMisPasantiasSupervisadasController({
          listMisPasantiasSupervisadasUseCase: c.resolve(
            PASANTIAS_TOKENS.listMisPasantiasSupervisadasUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.getMiPasantiaController,
      (c) =>
        new GetMiPasantiaController({
          getMiPasantiaUseCase: c.resolve(PASANTIAS_TOKENS.getMiPasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.listInformesPasantiaController,
      (c) =>
        new ListInformesPasantiaController({
          listInformesPasantiaUseCase: c.resolve(PASANTIAS_TOKENS.listInformesPasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.createInformePasantiaController,
      (c) =>
        new CreateInformePasantiaController({
          createInformePasantiaUseCase: c.resolve(PASANTIAS_TOKENS.createInformePasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.updateInformePasantiaController,
      (c) =>
        new UpdateInformePasantiaController({
          updateInformePasantiaUseCase: c.resolve(PASANTIAS_TOKENS.updateInformePasantiaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.exportInformePasantiaPdfController,
      (c) =>
        new ExportInformePasantiaPdfController({
          exportInformePasantiaPdfUseCase: c.resolve(
            PASANTIAS_TOKENS.exportInformePasantiaPdfUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    [
      PASANTIAS_TOKENS.listSeguimientosPasantiaController,
      (c) =>
        new ListSeguimientosPasantiaController({
          listSeguimientosPasantiaUseCase: c.resolve(
            PASANTIAS_TOKENS.listSeguimientosPasantiaUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.createSeguimientoPasantiaController,
      (c) =>
        new CreateSeguimientoPasantiaController({
          createSeguimientoPasantiaUseCase: c.resolve(
            PASANTIAS_TOKENS.createSeguimientoPasantiaUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.updateSeguimientoPasantiaController,
      (c) =>
        new UpdateSeguimientoPasantiaController({
          updateSeguimientoPasantiaUseCase: c.resolve(
            PASANTIAS_TOKENS.updateSeguimientoPasantiaUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      PASANTIAS_TOKENS.exportSeguimientoPasantiaPdfController,
      (c) =>
        new ExportSeguimientoPasantiaPdfController({
          exportSeguimientoPasantiaPdfUseCase: c.resolve(
            PASANTIAS_TOKENS.exportSeguimientoPasantiaPdfUseCase
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
  registerComponent(container, PASANTIAS_TOKENS.pasantiasRouter, (c) => {
    const controllers = {
      listPasantiasController: c.resolve(PASANTIAS_TOKENS.listPasantiasController),
      getPasantiaByIdController: c.resolve(PASANTIAS_TOKENS.getPasantiaByIdController),
      createPasantiaController: c.resolve(PASANTIAS_TOKENS.createPasantiaController),
      updatePasantiaController: c.resolve(PASANTIAS_TOKENS.updatePasantiaController),
      deletePasantiaController: c.resolve(PASANTIAS_TOKENS.deletePasantiaController),
      transicionarPasantiaController: c.resolve(PASANTIAS_TOKENS.transicionarPasantiaController),
      listPasantiasEmpresasController: c.resolve(PASANTIAS_TOKENS.listPasantiasEmpresasController),
      getPasantiaEmpresaController: c.resolve(PASANTIAS_TOKENS.getPasantiaEmpresaController),
      createPasantiaEmpresaController: c.resolve(PASANTIAS_TOKENS.createPasantiaEmpresaController),
      updatePasantiaEmpresaController: c.resolve(PASANTIAS_TOKENS.updatePasantiaEmpresaController),
      setEstadoPasantiaEmpresaController: c.resolve(
        PASANTIAS_TOKENS.setEstadoPasantiaEmpresaController
      ),
      deletePasantiaEmpresaController: c.resolve(PASANTIAS_TOKENS.deletePasantiaEmpresaController),
      listMisPasantiasSupervisadasController: c.resolve(
        PASANTIAS_TOKENS.listMisPasantiasSupervisadasController
      ),
      getMiPasantiaController: c.resolve(PASANTIAS_TOKENS.getMiPasantiaController),
      listInformesPasantiaController: c.resolve(PASANTIAS_TOKENS.listInformesPasantiaController),
      createInformePasantiaController: c.resolve(PASANTIAS_TOKENS.createInformePasantiaController),
      updateInformePasantiaController: c.resolve(PASANTIAS_TOKENS.updateInformePasantiaController),
      exportInformePasantiaPdfController: c.resolve(
        PASANTIAS_TOKENS.exportInformePasantiaPdfController
      ),
      listSeguimientosPasantiaController: c.resolve(
        PASANTIAS_TOKENS.listSeguimientosPasantiaController
      ),
      createSeguimientoPasantiaController: c.resolve(
        PASANTIAS_TOKENS.createSeguimientoPasantiaController
      ),
      updateSeguimientoPasantiaController: c.resolve(
        PASANTIAS_TOKENS.updateSeguimientoPasantiaController
      ),
      exportSeguimientoPasantiaPdfController: c.resolve(
        PASANTIAS_TOKENS.exportSeguimientoPasantiaPdfController
      ),
    };

    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };

    return buildPasantiasRouter({ controllers, middlewares });
  });

  return container;
}
