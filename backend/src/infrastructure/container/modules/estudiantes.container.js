/**
 * Registrador de dependencias del módulo de Estudiantes (EST)
 * Centraliza la configuración de use cases y controllers
 *
 * Estructura del módulo:
 * - Repositories: Ya están registrados en repositories.container.js
 * - Use Cases: Lógica de negocio (register, list, update, etc.)
 * - Controllers: Manejo de peticiones HTTP
 *
 * NOTA: Los repositorios se registran en repositories.container.js y se resuelven
 * usando container.resolve() con los siguientes nombres:
 * - studentRepository
 * - managementRepository
 * - careerRepository
 * - scholarshipRepository
 * - studentScholarshipRepository
 * - studentAcademicDataRepository
 */

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
export function RegisterEstudiantesModule(container) {
  // NOTA: Los repositorios ya están registrados en repositories.container.js
  // No es necesario registrarlos aquí. Se resuelven usando container.resolve()
  // con los nombres definidos en repositories.container.js

  // Use Cases específicos del módulo
  container.register(
    'estudiantes.registerStudentUseCase',
    (c) =>
      new RegisterStudentUseCase({
        studentRepository: c.resolve('studentRepository'),
        studentAcademicDataRepository: c.resolve('studentAcademicDataRepository'),
        studentDocumentRepository: c.resolve('studentDocumentRepository'),
        documentacionRepository: c.resolve('documentacionRepository'),
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
