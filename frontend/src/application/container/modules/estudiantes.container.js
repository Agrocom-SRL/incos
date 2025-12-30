/**
 * Módulo: Estudiantes
 * Registra todos los Use Cases relacionados con estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo de estudiantes
 * 
 * NOTA: Empezamos desde cero. Los Use Cases y Repositorios se crearán según se necesiten.
 */

/**
 * Registra los Use Cases del módulo de estudiantes
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerEstudiantesModule(factory) {
  // NOTA: Se agregarán nuevos Use Cases según se necesiten (principio YAGNI)
  // Ejemplo cuando se necesite:
  // import { GetStudentsUseCase } from '@/domain/useCases/estudiantes/GetStudentsUseCase';
  // import StudentRepository from '@repo-impl/StudentRepository';
  // const studentRepository = StudentRepository;
  // factory.getStudents = () => new GetStudentsUseCase(studentRepository);

  return factory;
}

