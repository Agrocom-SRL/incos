import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ISesionReforzamientoRepository
 *
 * Sesiones de reforzamiento pedagógico (tabla `sesiones_reforzamiento`, TUT).
 * Las lecturas ricas del listado/ficha viven en
 * IAcompanamientoSesionViewRepository (vistas 161/162); aquí solo CRUD.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ISesionReforzamientoRepository extends IRepository {}
