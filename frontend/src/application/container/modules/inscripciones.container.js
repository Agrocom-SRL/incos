/**
 * Módulo: Inscripciones
 * Registra todos los Use Cases relacionados con inscripciones
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo de inscripciones
 */

import { 
  CrearInscripcionUseCase,
  ObtenerInscripcionPorIdUseCase,
  ObtenerTodasInscripcionesUseCase,
  EliminarInscripcionUseCase,
} from '@useCases/inscripciones';

// Repositorio principal
import InscripcionRepository from '@infrastructure/repositories/InscripcionRepository';

/**
 * Registra los Use Cases del módulo de inscripciones
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerInscripcionesModule(factory) {
  // Repositorio singleton (stateless)
  const inscripcionRepository = InscripcionRepository;

  // Registrar Use Cases
  factory.crearInscripcion = () => {
    return new CrearInscripcionUseCase(inscripcionRepository);
  };

  factory.obtenerInscripcionPorId = () => {
    return new ObtenerInscripcionPorIdUseCase(inscripcionRepository);
  };

  factory.obtenerTodasInscripciones = () => {
    return new ObtenerTodasInscripcionesUseCase(inscripcionRepository);
  };

  factory.eliminarInscripcion = () => {
    return new EliminarInscripcionUseCase({ inscripcionRepository });
  };

  return factory;
}
