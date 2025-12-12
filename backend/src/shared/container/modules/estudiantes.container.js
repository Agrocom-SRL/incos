/**
 * Registrador de dependencias del módulo de Estudiantes (EST)
 * Centraliza la configuración de repositories, use cases y controllers
 *
 * Estructura del módulo:
 * - Repositories: Acceso a datos (estudiantes, carreras, gestiones, becas)
 * - Use Cases: Lógica de negocio (register, list, update, etc.)
 * - Controllers: Manejo de peticiones HTTP
 */

// Repositories
import { StudentRepository } from '../../../infrastructure/repositories/StudentRepository.js';
import { GestionRepository } from '../../../infrastructure/repositories/GestionRepository.js';
import { CarreraRepository } from '../../../infrastructure/repositories/CarreraRepository.js';
import { BecaDescuentoRepository } from '../../../infrastructure/repositories/BecaDescuentoRepository.js';
import { StudentBecaRepository } from '../../../infrastructure/repositories/StudentBecaRepository.js';
import { StudentAcademicDataRepository } from '../../../infrastructure/repositories/StudentAcademicDataRepository.js';

// Use Cases
import { RegisterStudentUseCase } from '../../../application/use-cases/estudiantes/RegisterStudentUseCase.js';

// Controllers
import {
  CreateStudentController,
  ListStudentsController,
  GetStudentByIdController,
  UpdateStudentController,
  ChangeStudentStatusController,
  AssignBecaController,
  RequestLicenciaController,
} from '../../../presentation/controllers/estudiantes/index.js';

/**
 * Registra todas las dependencias del módulo de Estudiantes
 * @param {Container} container - Contenedor de DI
 */
export function registerEstudiantesModule(container) {
  // Repositories (singletons - se comparten entre módulos)
  if (!container.has('studentRepository')) {
    container.register('studentRepository', () => new StudentRepository(), true);
  }
  if (!container.has('gestionRepository')) {
    container.register('gestionRepository', () => new GestionRepository(), true);
  }
  if (!container.has('carreraRepository')) {
    container.register('carreraRepository', () => new CarreraRepository(), true);
  }
  if (!container.has('becaDescuentoRepository')) {
    container.register(
      'becaDescuentoRepository',
      () => new BecaDescuentoRepository(),
      true
    );
  }
  if (!container.has('studentBecaRepository')) {
    container.register(
      'studentBecaRepository',
      () => new StudentBecaRepository(),
      true
    );
  }
  if (!container.has('academicDataRepository')) {
    container.register(
      'academicDataRepository',
      () => new StudentAcademicDataRepository(),
      true
    );
  }

  // Use Cases específicos del módulo
  container.register(
    'estudiantes.registerStudentUseCase',
    (c) =>
      new RegisterStudentUseCase({
        studentRepository: c.resolve('studentRepository'),
        gestionRepository: c.resolve('gestionRepository'),
        carreraRepository: c.resolve('carreraRepository'),
        becaDescuentoRepository: c.resolve('becaDescuentoRepository'),
        studentBecaRepository: c.resolve('studentBecaRepository'),
        academicDataRepository: c.resolve('academicDataRepository'),
        logger: c.resolve('logger'),
      }),
    true
  );

  // TODO: Registrar otros use cases cuando se implementen:
  // - estudiantes.listStudentsUseCase
  // - estudiantes.getStudentByIdUseCase
  // - estudiantes.updateStudentUseCase
  // - estudiantes.changeStudentStatusUseCase
  // - estudiantes.assignBecaUseCase
  // - estudiantes.requestLicenciaUseCase

  // Controllers específicos del módulo
  container.register(
    'estudiantes.createStudentController',
    (c) =>
      new CreateStudentController({
        registerStudentUseCase: c.resolve('estudiantes.registerStudentUseCase'),
      }),
    true
  );

  container.register(
    'estudiantes.listStudentsController',
    (c) =>
      new ListStudentsController({
        listStudentsUseCase: null, // TODO: Implementar use case
      }),
    true
  );

  container.register(
    'estudiantes.getStudentByIdController',
    (c) =>
      new GetStudentByIdController({
        getStudentByIdUseCase: null, // TODO: Implementar use case
      }),
    true
  );

  container.register(
    'estudiantes.updateStudentController',
    (c) =>
      new UpdateStudentController({
        updateStudentUseCase: null, // TODO: Implementar use case
      }),
    true
  );

  container.register(
    'estudiantes.changeStudentStatusController',
    (c) =>
      new ChangeStudentStatusController({
        changeStudentStatusUseCase: null, // TODO: Implementar use case
      }),
    true
  );

  container.register(
    'estudiantes.assignBecaController',
    (c) =>
      new AssignBecaController({
        assignBecaUseCase: null, // TODO: Implementar use case
      }),
    true
  );

  container.register(
    'estudiantes.requestLicenciaController',
    (c) =>
      new RequestLicenciaController({
        requestLicenciaUseCase: null, // TODO: Implementar use case
      }),
    true
  );

  return container;
}
