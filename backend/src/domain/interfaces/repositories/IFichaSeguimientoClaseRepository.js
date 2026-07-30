import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IFichaSeguimientoClaseRepository
 *
 * Fichas de seguimiento en la clase presencial (tabla raíz
 * `fichas_seguimiento_clase`, módulo DOC · supervisión docente). Las lecturas
 * ricas del listado viven en IFichaSeguimientoListadoViewRepository (vista
 * 174); aquí solo CRUD del agregado raíz (incluye los TEXT de observaciones).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IFichaSeguimientoClaseRepository extends IRepository {}
