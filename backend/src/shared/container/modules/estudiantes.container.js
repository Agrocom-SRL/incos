/**
 * Container específico para el módulo de Estudiantes
 * Centraliza la configuración de dependencias de este módulo
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
import { StudentController } from '../../../presentation/controllers/StudentController.js';

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

  // Controllers específicos del módulo
  container.register(
    'estudiantes.studentController',
    (c) =>
      new StudentController({
        registerStudentUseCase: c.resolve('estudiantes.registerStudentUseCase'),
      }),
    true
  );

  return container;
}
