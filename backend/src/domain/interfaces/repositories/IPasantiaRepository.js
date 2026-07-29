import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IPasantiaRepository
 *
 * Trámites de práctica laboral (tabla raíz `pasantias`, módulo TUT ·
 * pasantías). Las lecturas ricas del listado/ficha viven en
 * IPasantiaViewRepository (vistas 166/167/168); aquí solo CRUD.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IPasantiaRepository extends IRepository {}
