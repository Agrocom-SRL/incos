/**
 * Módulo: Configuración
 * Registra todos los Use Cases relacionados con configuración (académico, datos complementarios)
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo de configuración
 * 
 * Ubicación: application/container/modules
 * - Parte del módulo de Configuración
 * - Submódulos: Académico, Datos Complementarios
 */

import { GetTodasCarrerasUseCase } from '@useCases/configuracion/academico/carreras';
import { GetTodasMateriasUseCase } from '@useCases/configuracion/academico/materias';
import { GetTodasDiscapacidadesUseCase } from '@useCases/configuracion/complementario/discapacidad';
import CarreraRepository from '@infrastructure/repositories/CarreraRepository';
import MateriaRepository from '@infrastructure/repositories/MateriaRepository';
import DiscapacidadRepository from '@infrastructure/repositories/DiscapacidadRepository';

/**
 * Registra los Use Cases del módulo de configuración académica
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerConfiguracionModule(factory) {
  // Repositorios singleton (stateless)
  const carreraRepository = CarreraRepository;
  const materiaRepository = MateriaRepository;
  const discapacidadRepository = DiscapacidadRepository;

  // Registrar Use Cases de Carreras
  factory.obtenerTodasCarreras = () => {
    return new GetTodasCarrerasUseCase(carreraRepository);
  };

  // Registrar Use Cases de Materias
  factory.obtenerTodasMaterias = () => {
    return new GetTodasMateriasUseCase(materiaRepository);
  };

  // Registrar Use Cases de Discapacidad
  factory.obtenerTodasDiscapacidades = () => {
    return new GetTodasDiscapacidadesUseCase(discapacidadRepository);
  };

  return factory;
}

