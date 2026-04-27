/**
 * Registro de casos de uso — módulo Docentes
 */

import { ObtenerTodosDocentesUseCase, ObtenerDocentePorIdUseCase } from '@domain/useCases/docentes';
import DocenteRepository from '@implementations/DocenteRepository';

export function registerDocentesModule(factory) {
  factory.obtenerTodosDocentes = () => new ObtenerTodosDocentesUseCase(DocenteRepository);
  factory.obtenerDocentePorId = () => new ObtenerDocentePorIdUseCase(DocenteRepository);
}
