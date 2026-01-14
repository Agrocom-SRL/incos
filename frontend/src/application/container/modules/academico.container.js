/**
 * Módulo: Académico
 * Registra todos los Use Cases relacionados con el módulo académico
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo académico
 * 
 * Ubicación: application/container/modules
 * - Parte del módulo Académico
 * - Features: Paralelos
 */

import { GetTodosParalelosUseCase, GetParaleloHorariosUseCase } from '@useCases/academico/paralelos';
import ParaleloRepository from '@infrastructure/repositories/ParaleloRepository';

/**
 * Registra los Use Cases del módulo académico
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerAcademicoModule(factory) {
  // Repositorio singleton (stateless)
  const paraleloRepository = ParaleloRepository;

  // Registrar Use Cases de Paralelos
  factory.obtenerTodosParalelos = () => {
    return new GetTodosParalelosUseCase(paraleloRepository);
  };

  factory.obtenerParaleloHorarios = () => {
    return new GetParaleloHorariosUseCase(paraleloRepository);
  };

  return factory;
}
