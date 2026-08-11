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
import { RegistrarActaDefensaUseCase } from '../../../../application/use-cases/titulacion/RegistrarActaDefensaUseCase.js';
import { ListActasDefensaProyectoUseCase } from '../../../../application/use-cases/titulacion/ListActasDefensaProyectoUseCase.js';
import { ExportActaDefensaPdfUseCase } from '../../../../application/use-cases/titulacion/ExportActaDefensaPdfUseCase.js';
import { AnularActaDefensaUseCase } from '../../../../application/use-cases/titulacion/AnularActaDefensaUseCase.js';
import { ListEstudiantesElegiblesModalidadGradoUseCase } from '../../../../application/use-cases/titulacion/ListEstudiantesElegiblesModalidadGradoUseCase.js';
import { ExportFormularioModalidadGradoPdfUseCase } from '../../../../application/use-cases/titulacion/ExportFormularioModalidadGradoPdfUseCase.js';
import { GetAvanceTutoriaCarreraUseCase } from '../../../../application/use-cases/titulacion/GetAvanceTutoriaCarreraUseCase.js';
import { ExportAvanceTutoriaCarreraPdfUseCase } from '../../../../application/use-cases/titulacion/ExportAvanceTutoriaCarreraPdfUseCase.js';
import { GetSeguimientoTutoriaDocentesUseCase } from '../../../../application/use-cases/titulacion/GetSeguimientoTutoriaDocentesUseCase.js';
import { GetSeguimientoTutoriaDocentesPorCarreraUseCase } from '../../../../application/use-cases/titulacion/GetSeguimientoTutoriaDocentesPorCarreraUseCase.js';
import { ExportSeguimientoTutoriaDocentesExcelUseCase } from '../../../../application/use-cases/titulacion/ExportSeguimientoTutoriaDocentesExcelUseCase.js';
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
  RegistrarActaDefensaController,
  ListActasDefensaController,
  ExportActaDefensaPdfController,
  AnularActaDefensaController,
  ListEstudiantesElegiblesModalidadGradoController,
  ExportFormularioModalidadGradoPdfController,
  GetAvanceTutoriaCarreraController,
  ExportAvanceTutoriaCarreraPdfController,
  GetSeguimientoTutoriaDocentesController,
  ExportSeguimientoTutoriaDocentesExcelController,
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
        enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
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
        bitacoraProyectoRepository: c.resolve(TITULACION_TOKENS.bitacoraProyectoRepository),
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
        bitacoraProyectoRepository: c.resolve(TITULACION_TOKENS.bitacoraProyectoRepository),
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
  // USE CASES — acta de defensa de grado (extensión 2026-08-01)
  // ============================================
  registerComponent(
    container,
    TITULACION_TOKENS.registrarActaDefensaUseCase,
    (c) =>
      new RegistrarActaDefensaUseCase({
        actaDefensaRepository: c.resolve(TITULACION_TOKENS.actaDefensaRepository),
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        evaluationConfigurationRepository: c.resolve(
          REPOSITORIOS_TOKENS.evaluationConfigurationRepository
        ),
        aprobarEtapaProyectoUseCase: c.resolve(TITULACION_TOKENS.aprobarEtapaProyectoUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.listActasDefensaProyectoUseCase,
    (c) =>
      new ListActasDefensaProyectoUseCase({
        proyectoGradoRepository: c.resolve(TITULACION_TOKENS.proyectoGradoRepository),
        actaDefensaRepository: c.resolve(TITULACION_TOKENS.actaDefensaRepository),
        integranteProyectoRepository: c.resolve(TITULACION_TOKENS.integranteProyectoRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.exportActaDefensaPdfUseCase,
    (c) =>
      new ExportActaDefensaPdfUseCase({
        actaDefensaRepository: c.resolve(TITULACION_TOKENS.actaDefensaRepository),
        getProyectoGradoByIdUseCase: c.resolve(TITULACION_TOKENS.getProyectoGradoByIdUseCase),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        actaDefensaPdfGenerator: c.resolve(SERVICIOS_TOKENS.actaDefensaPdfGenerator),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.anularActaDefensaUseCase,
    (c) =>
      new AnularActaDefensaUseCase({
        actaDefensaRepository: c.resolve(TITULACION_TOKENS.actaDefensaRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  // ============================================
  // USE CASES — extensión 2026-07-31 (formulario de modalidad de graduación,
  // reporte de avance por carrera, planilla de avance "10 en 10")
  // ============================================
  registerComponent(
    container,
    TITULACION_TOKENS.listEstudiantesElegiblesModalidadGradoUseCase,
    (c) =>
      new ListEstudiantesElegiblesModalidadGradoUseCase({
        tutoriaAvanceViewRepository: c.resolve(TITULACION_TOKENS.tutoriaAvanceViewRepository),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.exportFormularioModalidadGradoPdfUseCase,
    (c) =>
      new ExportFormularioModalidadGradoPdfUseCase({
        getProyectoGradoByIdUseCase: c.resolve(TITULACION_TOKENS.getProyectoGradoByIdUseCase),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        formularioModalidadGradoPdfGenerator: c.resolve(
          SERVICIOS_TOKENS.formularioModalidadGradoPdfGenerator
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.getAvanceTutoriaCarreraUseCase,
    (c) =>
      new GetAvanceTutoriaCarreraUseCase({
        tutoriaAvanceViewRepository: c.resolve(TITULACION_TOKENS.tutoriaAvanceViewRepository),
        proyectoGradoListadoViewRepository: c.resolve(
          TITULACION_TOKENS.proyectoGradoListadoViewRepository
        ),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.exportAvanceTutoriaCarreraPdfUseCase,
    (c) =>
      new ExportAvanceTutoriaCarreraPdfUseCase({
        getAvanceTutoriaCarreraUseCase: c.resolve(TITULACION_TOKENS.getAvanceTutoriaCarreraUseCase),
        managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
        avanceTutoriaCarreraPdfGenerator: c.resolve(
          SERVICIOS_TOKENS.avanceTutoriaCarreraPdfGenerator
        ),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  // ============================================
  // USE CASES — extensión 2026-08-10: Seguimiento de tutorías a docentes
  // (reemplaza la planilla de avance "10 en 10" de 3er año)
  // ============================================
  registerComponent(
    container,
    TITULACION_TOKENS.getSeguimientoTutoriaDocentesUseCase,
    (c) =>
      new GetSeguimientoTutoriaDocentesUseCase({
        tutoriaAvanceViewRepository: c.resolve(TITULACION_TOKENS.tutoriaAvanceViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.getSeguimientoTutoriaDocentesPorCarreraUseCase,
    (c) =>
      new GetSeguimientoTutoriaDocentesPorCarreraUseCase({
        tutoriaAvanceViewRepository: c.resolve(TITULACION_TOKENS.tutoriaAvanceViewRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    TITULACION_TOKENS.exportSeguimientoTutoriaDocentesExcelUseCase,
    (c) =>
      new ExportSeguimientoTutoriaDocentesExcelUseCase({
        getSeguimientoTutoriaDocentesPorCarreraUseCase: c.resolve(
          TITULACION_TOKENS.getSeguimientoTutoriaDocentesPorCarreraUseCase
        ),
        seguimientoTutoriaDocentesExcelGenerator: c.resolve(
          SERVICIOS_TOKENS.seguimientoTutoriaDocentesExcelGenerator
        ),
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
    // Acta de defensa de grado (extensión 2026-08-01)
    [
      TITULACION_TOKENS.registrarActaDefensaController,
      (c) =>
        new RegistrarActaDefensaController({
          registrarActaDefensaUseCase: c.resolve(TITULACION_TOKENS.registrarActaDefensaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.listActasDefensaController,
      (c) =>
        new ListActasDefensaController({
          listActasDefensaProyectoUseCase: c.resolve(
            TITULACION_TOKENS.listActasDefensaProyectoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.exportActaDefensaPdfController,
      (c) =>
        new ExportActaDefensaPdfController({
          exportActaDefensaPdfUseCase: c.resolve(TITULACION_TOKENS.exportActaDefensaPdfUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    [
      TITULACION_TOKENS.anularActaDefensaController,
      (c) =>
        new AnularActaDefensaController({
          anularActaDefensaUseCase: c.resolve(TITULACION_TOKENS.anularActaDefensaUseCase),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    // Extensión 2026-07-31 (formulario de modalidad de graduación, reporte de
    // avance por carrera, planilla de avance "10 en 10")
    [
      TITULACION_TOKENS.listEstudiantesElegiblesModalidadGradoController,
      (c) =>
        new ListEstudiantesElegiblesModalidadGradoController({
          listEstudiantesElegiblesModalidadGradoUseCase: c.resolve(
            TITULACION_TOKENS.listEstudiantesElegiblesModalidadGradoUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.exportFormularioModalidadGradoPdfController,
      (c) =>
        new ExportFormularioModalidadGradoPdfController({
          exportFormularioModalidadGradoPdfUseCase: c.resolve(
            TITULACION_TOKENS.exportFormularioModalidadGradoPdfUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    [
      TITULACION_TOKENS.getAvanceTutoriaCarreraController,
      (c) =>
        new GetAvanceTutoriaCarreraController({
          getAvanceTutoriaCarreraUseCase: c.resolve(
            TITULACION_TOKENS.getAvanceTutoriaCarreraUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.exportAvanceTutoriaCarreraPdfController,
      (c) =>
        new ExportAvanceTutoriaCarreraPdfController({
          exportAvanceTutoriaCarreraPdfUseCase: c.resolve(
            TITULACION_TOKENS.exportAvanceTutoriaCarreraPdfUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
        }),
    ],
    // Extensión 2026-08-10: Seguimiento de tutorías a docentes
    [
      TITULACION_TOKENS.getSeguimientoTutoriaDocentesController,
      (c) =>
        new GetSeguimientoTutoriaDocentesController({
          getSeguimientoTutoriaDocentesUseCase: c.resolve(
            TITULACION_TOKENS.getSeguimientoTutoriaDocentesUseCase
          ),
          logger: c.resolve(SERVICIOS_TOKENS.logger),
          responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
        }),
    ],
    [
      TITULACION_TOKENS.exportSeguimientoTutoriaDocentesExcelController,
      (c) =>
        new ExportSeguimientoTutoriaDocentesExcelController({
          exportSeguimientoTutoriaDocentesExcelUseCase: c.resolve(
            TITULACION_TOKENS.exportSeguimientoTutoriaDocentesExcelUseCase
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
      // Acta de defensa de grado (extensión 2026-08-01)
      registrarActaDefensaController: c.resolve(TITULACION_TOKENS.registrarActaDefensaController),
      listActasDefensaController: c.resolve(TITULACION_TOKENS.listActasDefensaController),
      exportActaDefensaPdfController: c.resolve(TITULACION_TOKENS.exportActaDefensaPdfController),
      anularActaDefensaController: c.resolve(TITULACION_TOKENS.anularActaDefensaController),
      // Extensión 2026-07-31
      listEstudiantesElegiblesModalidadGradoController: c.resolve(
        TITULACION_TOKENS.listEstudiantesElegiblesModalidadGradoController
      ),
      exportFormularioModalidadGradoPdfController: c.resolve(
        TITULACION_TOKENS.exportFormularioModalidadGradoPdfController
      ),
      getAvanceTutoriaCarreraController: c.resolve(
        TITULACION_TOKENS.getAvanceTutoriaCarreraController
      ),
      exportAvanceTutoriaCarreraPdfController: c.resolve(
        TITULACION_TOKENS.exportAvanceTutoriaCarreraPdfController
      ),
      getSeguimientoTutoriaDocentesController: c.resolve(
        TITULACION_TOKENS.getSeguimientoTutoriaDocentesController
      ),
      exportSeguimientoTutoriaDocentesExcelController: c.resolve(
        TITULACION_TOKENS.exportSeguimientoTutoriaDocentesExcelController
      ),
    };

    const middlewares = {
      validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
    };

    return buildProyectosGradoRouter({ controllers, middlewares });
  });

  return container;
}
