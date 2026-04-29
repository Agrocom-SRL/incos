/**
 * Registro de casos de uso — módulo Docentes
 */

import {
  ObtenerTodosDocentesUseCase,
  ObtenerDocentePorIdUseCase,
  CrearDocenteUseCase,
  ActualizarDocenteUseCase,
} from '@domain/useCases/docentes';
import DocenteRepository from '@implementations/DocenteRepository';

export function registerDocentesModule(factory) {
  factory.obtenerTodosDocentes = () => new ObtenerTodosDocentesUseCase(DocenteRepository);
  factory.obtenerDocentePorId = () => new ObtenerDocentePorIdUseCase(DocenteRepository);
  factory.crearDocente = () => new CrearDocenteUseCase(DocenteRepository);
  factory.actualizarDocente = () => new ActualizarDocenteUseCase(DocenteRepository);
}
