/**
 * Módulo: Carreras
 * Registra todos los Use Cases relacionados con carreras
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo de carreras
 */

import { GetCarrerasUseCase } from '@/domain/useCases/carreras/GetCarrerasUseCase';
import CarreraRepository from '@repo-impl/CarreraRepository';

/**
 * Registra los Use Cases del módulo de carreras
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerCarrerasModule(factory) {
  // Repositorio singleton (stateless)
  const carreraRepository = CarreraRepository;

  // Registrar Use Cases
  factory.getCarreras = () => {
    return new GetCarrerasUseCase(carreraRepository);
  };

  // Futuro: otros use cases de carreras
  // factory.getCarreraById = () => new GetCarreraByIdUseCase(carreraRepository);
  // factory.createCarrera = () => new CreateCarreraUseCase(carreraRepository);
  // factory.updateCarrera = () => new UpdateCarreraUseCase(carreraRepository);
  // factory.deleteCarrera = () => new DeleteCarreraUseCase(carreraRepository);

  return factory;
}

