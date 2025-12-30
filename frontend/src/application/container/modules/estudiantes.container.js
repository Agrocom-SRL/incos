/**
 * Módulo: Estudiantes
 * Registra todos los Use Cases relacionados con estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo de estudiantes
 */

import { GetEstudiantesUseCase } from '@useCases/estudiantes/GetEstudiantesUseCase';
import EstudianteRepository from '@implementations/EstudianteRepository';

/**
 * Registra los Use Cases del módulo de estudiantes
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerEstudiantesModule(factory) {
  // Repositorio singleton (stateless)
  const estudianteRepository = EstudianteRepository;

  // Registrar Use Cases
  factory.obtenerEstudiantes = () => {
    return new GetEstudiantesUseCase(estudianteRepository);
  };

  return factory;
}

