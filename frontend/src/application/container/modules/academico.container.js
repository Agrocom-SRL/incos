/**
 * Módulo: Académico
 * Registra todos los Use Cases relacionados con el módulo académico
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo académico
 * 
 * Ubicación: application/container/modules
 * - Parte del módulo Académico
 * - Features: Paralelos, Gestiones
 */

import { GetTodosParalelosUseCase, GetParaleloHorariosUseCase } from '@useCases/academico/paralelos';
import { GetTodasGestionesUseCase } from '@useCases/academico/gestiones';
import ParaleloRepository from '@infrastructure/repositories/ParaleloRepository';
import GestionRepository from '@infrastructure/repositories/GestionRepository';

/**
 * Registra los Use Cases del módulo académico
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerAcademicoModule(factory) {
  // Repositorios singleton (stateless)
  const paraleloRepository = ParaleloRepository;
  const gestionRepository = GestionRepository;

  // Registrar Use Cases de Paralelos
  factory.obtenerTodosParalelos = () => {
    return new GetTodosParalelosUseCase(paraleloRepository);
  };

  factory.obtenerParaleloHorarios = () => {
    return new GetParaleloHorariosUseCase(paraleloRepository);
  };

  // Registrar Use Cases de Gestiones
  factory.obtenerTodasGestiones = () => {
    return new GetTodasGestionesUseCase(gestionRepository);
  };

  return factory;
}
