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

import {
  GetAsignaturasSinCursoUseCase,
  GetCapacidadTurnoUseCase,
  GetParaleloCursosOfertaUseCase,
  CrearParaleloCursoOfertaUseCase,
  GetParaleloHorariosUseCase,
  GetParalelosEstadoDashboardUseCase,
  GetTodosParalelosUseCase,
  PutParaleloHorariosUseCase,
} from '@useCases/academico/paralelos';
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

  factory.obtenerParaleloCursosOferta = () => {
    return new GetParaleloCursosOfertaUseCase(paraleloRepository);
  };

  factory.crearParaleloCursoOferta = () => {
    return new CrearParaleloCursoOfertaUseCase(paraleloRepository);
  };

  factory.persistirParaleloHorarios = () => {
    return new PutParaleloHorariosUseCase(paraleloRepository);
  };

  factory.obtenerParalelosEstadoDashboard = () => {
    return new GetParalelosEstadoDashboardUseCase(paraleloRepository);
  };

  factory.obtenerAsignaturasSinCurso = () => {
    return new GetAsignaturasSinCursoUseCase(paraleloRepository);
  };

  factory.obtenerCapacidadTurno = () => {
    return new GetCapacidadTurnoUseCase(paraleloRepository);
  };

  // Registrar Use Cases de Gestiones
  factory.obtenerTodasGestiones = () => {
    return new GetTodasGestionesUseCase(gestionRepository);
  };

  return factory;
}
