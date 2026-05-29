/**
 * Módulo: Configuración
 * Registra todos los Use Cases relacionados con configuración (académico, datos complementarios)
 */

import {
  GetTodasCarrerasUseCase,
  GetCarreraPorIdUseCase,
  CrearCarreraUseCase,
  ActualizarCarreraUseCase,
  EliminarCarreraUseCase,
  SubirCarreraImagenUseCase,
} from '@useCases/configuracion/academico/carreras';
import {
  GetTodasMateriasUseCase,
  GetMateriaPorIdUseCase,
  CrearMateriaUseCase,
  ActualizarMateriaUseCase,
  EliminarMateriaUseCase,
} from '@useCases/configuracion/academico/materias';
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
  const carreraRepository = CarreraRepository;
  const materiaRepository = MateriaRepository;
  const discapacidadRepository = DiscapacidadRepository;

  factory.obtenerTodasCarreras = () => new GetTodasCarrerasUseCase(carreraRepository);
  factory.obtenerCarreraPorId = () => new GetCarreraPorIdUseCase(carreraRepository);
  factory.crearCarrera = () => new CrearCarreraUseCase(carreraRepository);
  factory.actualizarCarrera = () => new ActualizarCarreraUseCase(carreraRepository);
  factory.eliminarCarrera = () => new EliminarCarreraUseCase(carreraRepository);
  factory.subirCarreraImagen = () => new SubirCarreraImagenUseCase(carreraRepository);

  factory.obtenerTodasMaterias = () => new GetTodasMateriasUseCase(materiaRepository);
  factory.obtenerMateriaPorId = () => new GetMateriaPorIdUseCase(materiaRepository);
  factory.crearMateria = () => new CrearMateriaUseCase(materiaRepository);
  factory.actualizarMateria = () => new ActualizarMateriaUseCase(materiaRepository);
  factory.eliminarMateria = () => new EliminarMateriaUseCase(materiaRepository);

  factory.obtenerTodasDiscapacidades = () => new GetTodasDiscapacidadesUseCase(discapacidadRepository);

  return factory;
}
