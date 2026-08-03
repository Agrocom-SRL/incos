import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ISesionRefuerzoRepository
 *
 * Sesiones de refuerzo pedagógico (tabla `sesiones_refuerzo`, TUT).
 * Las lecturas ricas del listado/ficha viven en
 * IAcompanamientoSesionViewRepository (vistas 161/162); aquí solo CRUD.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ISesionRefuerzoRepository extends IRepository {}
